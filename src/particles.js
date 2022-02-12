import { useState, useEffect } from "react";
import * as THREE from "three";

import ParticlesVelocity from "./particlesVelocity";
import ParticlesGeometry from "./particlesGeometry";

const TEXTURE_SIZE = 1024;
const TEXTURE_ARRAY_SIZE = TEXTURE_SIZE * TEXTURE_SIZE * 4.;
const PARTICLES_COUNT = TEXTURE_SIZE * TEXTURE_SIZE;

const getRandomPositions = (pParticlesCount) => {
  return new Float32Array(pParticlesCount * 3).fill(0);
}

const getRandomReferences = (pParticlesCount, pTexturesize) => {
  let references = new Float32Array(pParticlesCount * 2);

  for (let i = 0; i < references.length; i += 2) {
    let index = i / 2;
    
    references[i] = (index % pTexturesize) / pTexturesize;
    references[i + 1] = Math.floor(index / pTexturesize) / pTexturesize;
  }

  return references;
}

const Particles = () => {
  const [isTextureLoaded, setTextureLoaded] = useState(false);

  const [references] = useState(
    () => getRandomReferences(PARTICLES_COUNT, TEXTURE_SIZE));

  const [positions] = useState(
    () => getRandomPositions(PARTICLES_COUNT));

  const particlesAttributes = {
    positions: positions,
    references: references,
    count: PARTICLES_COUNT
  }

  const [textureAttributes, setTextureAttributes] = useState({
    x: TEXTURE_SIZE, 
    y: TEXTURE_SIZE,
    size: TEXTURE_ARRAY_SIZE,
    texture: null 
  })

  useEffect(() => {
    let loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/982762/noise.png',
      function do_something_with_texture(pTexture) {
        let _texture = pTexture;
        _texture.wrapS = THREE.RepeatWrapping;
        _texture.wrapT = THREE.RepeatWrapping;
        _texture.minFilter = THREE.LinearFilter;

        setTextureAttributes({
          ...textureAttributes,
          texture: _texture
        });

        setTextureLoaded(true);
        console.log("Particles: texture is loaded");
      }
    );
    console.log("Particles: init is finished");
  }, [])

  return (
    <>
      {
        isTextureLoaded &&
        <ParticlesGeometry
          textureAttributes={textureAttributes}
          particlesAttributes={particlesAttributes}
          onInitHandler={(onRenderHandler) =>
            <ParticlesVelocity
              textureAttributes={textureAttributes}
              particlesAttributes={particlesAttributes}
              onRenderHandler={onRenderHandler}
            />
          }
        />
      }
    </>
  );
}

export default Particles;