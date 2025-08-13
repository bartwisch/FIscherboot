import { Gltf, OrbitControls, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";
import CameraHUD from "./CameraHUD";
import FishSpawner from "./FishSpawner";

export const Experience = () => {
  const { camera, viewport } = useThree();
  const orbitRef = useRef();
  
  return (
    <>
      <OrbitControls 
        ref={orbitRef}
        target={[20.42, -90.13, -14.11]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      <axesHelper args={[10]} />

      {/* Camera HUD overlay (screen-space) */}
      <CameraHUD orbitRef={orbitRef} />
      
      {/* Axis labels */}
      <Text position={[12, 0, 0]} fontSize={3} color="red" anchorX="center" anchorY="middle">X</Text>
      <Text position={[0, 12, 0]} fontSize={3} color="green" anchorX="center" anchorY="middle">Y</Text>
      <Text position={[0, 0, 12]} fontSize={3} color="blue" anchorX="center" anchorY="middle">Z</Text>
    
      
      {/* Add some lighting for the standard material */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[0, 5, 0]} 
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <Gltf src="/models/underwater_skybox.glb" />
      <Gltf src="/models/boat1.glb" position={[0, 10, 0]} scale={0.1} castShadow receiveShadow />
      <FishSpawner 
        fishCount={5}
        baseSpeed={10}
        altitudeRange={{ min: -150, max: -30 }} // Deep underwater
        spawnArea={{ x: 0, z: 0 }} // Centered spawn area
        screenWidth={viewport.width} // Use full screen width
      />
      <Gltf src="/models/lure1.glb" position={[0, 5, 0]} scale={10} rotation={[0, 0, -Math.PI/2]} castShadow receiveShadow />
    </>
  );
};
