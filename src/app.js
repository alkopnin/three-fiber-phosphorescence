import React from "react";

import { Canvas } from '@react-three/fiber';

import Particles from "./particles";

const cameraX = 0;
const cameraY = 0;
const cameraZ = 50.;

export default function App() {
  const cameraParams = {
    fov: 65, 
    aspect:  1,
    near: 0.001, 
    far: Math.pow(2, 16), 
    position: [cameraX, cameraY, cameraZ]
  }

  return (
    <div id="canvas-container">
      <Canvas
        camera={cameraParams}>
        <ambientLight intensity={0.1} />
        <Particles/>
      </Canvas>
    </div>
  )
}