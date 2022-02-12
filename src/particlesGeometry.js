import { 
  useRef, 
  useEffect,
} from "react";

import * as THREE from "three";

import { extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";

import particlesVertexShader from "./shader/particles/particles.vert";
import particlesFragmentShader from "./shader/particles/particles.frag";

const ParticlesPosition = (props) => {
  useEffect(() => {    
    console.log("ParticlesGeometry: ParticlesPositions init is finished"); 
  }, []);

  return (
    <bufferGeometry attach="geometry">
        <bufferAttribute
          attachObject={["attributes", 'position']} 
          count={props.particlesAttributes.positions.length / 3} 
          array={props.particlesAttributes.positions} 
          itemSize={3} 
        />
        <bufferAttribute
          attachObject={["attributes", 'reference']} 
          count={props.particlesAttributes.references.length / 2} 
          array={props.particlesAttributes.references} 
          itemSize={2} 
        />
    </bufferGeometry>
  );
}

const ParticlesMaterial = (props) => {
  const materialsRef = useRef();

  useEffect(() => {    
    materialsRef.current.transparent = true;
    materialsRef.current.depthTest = false;
    materialsRef.current.side = THREE.DoubleSide;
    materialsRef.current.blending = THREE.MultiplyBlending;
    materialsRef.current.extensions.derivatives = true;

    console.log("ParticlesGeometry: ParticlesMaterial init is finished"); 
  }, []);

  const ParticlesMaterial = shaderMaterial(
    {
      u_texturePosition: null,
      u_resolution: new THREE.Vector2(),
      u_clicked: true,
      u_mouse: new THREE.Vector2(),
      u_noise: props.textureAttributes.texture,
      u_time: 1.0,
    },
    particlesVertexShader.shader,
    particlesFragmentShader.shader,
  );
    
  extend({ParticlesMaterial});

  const onRenderHandler = (pTexturePosition, pTime ) => {
    materialsRef.current.uniforms['u_texturePosition'].value = pTexturePosition;
    materialsRef.current.uniforms['u_time'].value = materialsRef.current.uniforms.u_time.value + pTime;
  };

  return (
    <>
      <particlesMaterial ref={materialsRef} attach="material"/>
      {props.onInitHandler(onRenderHandler)}
    </>
  );
}

/**
 *  [in] textureAttributes - texture object and its properties
 *  [in] particlesAttributes - initial position and references of particles
 *  [in] onRenderHandler - callback to nofity that the component's init has been done. It accepts onRender callback to notify on re-render loop
 *
 */
const ParticlesGeometry = (props) => {
  
  const particlesRef = useRef();

  useEffect(() => {  
    particlesRef.current.material.blending = THREE.AdditiveBlending;  
  }, []);

  return (
    <points ref={particlesRef}>
      <ParticlesPosition
        particlesAttributes={props.particlesAttributes}
      />
      <ParticlesMaterial 
        textureAttributes={props.textureAttributes} 
        onInitHandler={props.onInitHandler}
      />
    </points>
  );
}

export default ParticlesGeometry;