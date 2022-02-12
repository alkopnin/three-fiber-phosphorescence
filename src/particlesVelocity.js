import { 
  useRef, 
  useState,
  useEffect,
} from "react";

import {
  useThree,
  useFrame,
  extend,
} from "@react-three/fiber";

import * as THREE from "three";

import positionFragmentShader from "./shader/particles/position.frag";
import velocityFragmentShader from "./shader/particles/velocity.frag";

import { GPUComputationRenderer } from 'three-stdlib';
extend({ GPUComputationRenderer });

function initTextures( 
  pTextureArraySize,
  pDataPositionOrig,
  pDataPosition,
  pDataVelocity
) {

  for (let i = 0; i < pTextureArraySize; i += 4) {
    let radius = 2.;
    let phi = Math.random() * Math.PI * 2.;
    let costheta = Math.random() * 2. - 1.;
    let u = Math.random();

    let theta = Math.acos( costheta );
    let r = radius * Math.cbrt( u );
    
    let x = r * Math.sin( theta) * Math.cos( phi );
    let y = r * Math.sin( theta) * Math.sin( phi );
    let z = r * Math.cos( theta );

    pDataPosition.image.data[i] = x;
    pDataPosition.image.data[i + 1] = y;
    pDataPosition.image.data[i + 2] = z;
    pDataPosition.image.data[i + 3] = 1;
    
    pDataPositionOrig.image.data[i] = x;
    pDataPositionOrig.image.data[i + 1] = y;
    pDataPositionOrig.image.data[i + 2] = z;
    pDataPositionOrig.image.data[i + 3] = 1;

    pDataVelocity.image.data[i] = x * 3.;
    pDataVelocity.image.data[i + 1] = y * 3.;
    pDataVelocity.image.data[i + 2] = z * 3.;
    pDataVelocity.image.data[i + 3] = 1;
  }
}

/**
 *  [in] textureAttributes - texture object and its properties
 *  [in] particlesAttributes - initial position and references of particles
 *  [in] onInitHandler - callback to nofity that the component has been re-rendered
 */
const ParticlesVelocity = (props) => {
  const gpuComputeRef = useRef();

  const onRenderHandler = props.onRenderHandler;
 
  const [textureVelocity, setTextureVelocity] = useState();
  const [texturePosition, setTexturePosition] = useState();

  const updateTextures = (pPositionDelta, pVelocityDelta) => {
    let _textureVelocity = Object.assign({}, textureVelocity);
    let _texturePosition = Object.assign({}, texturePosition);

    _textureVelocity.material.uniforms['u_mousex'].value = _textureVelocity.material.uniforms.u_mousex;
    _textureVelocity.material.uniforms['u_time'].value = _textureVelocity.material.uniforms.u_time.value + pVelocityDelta;

    _texturePosition.material.uniforms['u_time'].value = _texturePosition.material.uniforms.u_time.value + pPositionDelta;
    _texturePosition.material.uniforms['delta'].value = Math.min(pPositionDelta, 0.5);

    setTexturePosition(_texturePosition);
    setTextureVelocity(_textureVelocity);
  }

  const [isComponentReady, setIsComponentReady] = useState(false);

  useEffect(() => {
    let _dataVelocity = gpuComputeRef.current.createTexture();
    let _dataPosition = gpuComputeRef.current.createTexture();
    let _dataPositionOrig = gpuComputeRef.current.createTexture();

    initTextures(props.textureAttributes.size, _dataPositionOrig, _dataPosition, _dataVelocity);

    let _textureVelocity = gpuComputeRef.current.addVariable( "v_samplerVelocity", velocityFragmentShader.shader, _dataVelocity );
    _textureVelocity.wrapS = THREE.RepeatWrapping;
    _textureVelocity.wrapT = THREE.RepeatWrapping;

    _textureVelocity.material.uniforms['u_time']   = {value: -1000};
    _textureVelocity.material.uniforms['u_mousex'] = {value: 0};


    let _texturePosition = gpuComputeRef.current.addVariable( "v_samplerPosition", positionFragmentShader.shader, _dataPosition );
    _texturePosition.wrapS = THREE.RepeatWrapping;
    _texturePosition.wrapT = THREE.RepeatWrapping;

    _texturePosition.material.uniforms['delta']   = {value: 0};
    _texturePosition.material.uniforms['u_time']  = {value: 0};
    _texturePosition.material.uniforms['u_noise'] = {value: props.textureAttributes.texture};
    _texturePosition.material.uniforms['v_samplerPosition_orig'] = {value: _dataPositionOrig};

    gpuComputeRef.current.setVariableDependencies( _textureVelocity, [ _textureVelocity, _texturePosition ] );
    gpuComputeRef.current.setVariableDependencies( _texturePosition, [ _textureVelocity, _texturePosition ] );

    setTextureVelocity(_textureVelocity);
    setTexturePosition(_texturePosition);

    const error = gpuComputeRef.current.init();
    if ( error !== null ) {
      console.error( error );
    }

    setIsComponentReady(true);
    console.log("ParticlesVelocity: init is finished");

  }, [props.textureAttributes]);

  const [then, setThen] = useState(0);
  
  useFrame(({ gl, scene, camera }) => {
    if(!isComponentReady) 
      return;

    let now = Date.now() / 1000;
    let _delta = now - then;
    setThen(now);

    gpuComputeRef.current.compute();
    
    updateTextures(_delta, .0005);
    const _texture = gpuComputeRef.current.getCurrentRenderTarget( texturePosition ).texture;
    window.pos = _texture;

    onRenderHandler(_texture, _delta);
  
    gl.render(scene, camera)
  });

  const webGLState = useThree();

  return (
    <gPUComputationRenderer
      ref={gpuComputeRef} 
      args={[props.textureAttributes.x, props.textureAttributes.y, webGLState.gl]} 
    />
  );
}

export default ParticlesVelocity;