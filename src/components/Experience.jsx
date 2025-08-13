import { Gltf, OrbitControls, Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useRef } from "react";

export const Experience = () => {
  const { camera } = useThree();
  const orbitRef = useRef();
  
  return (
    <>
      <OrbitControls 
        ref={orbitRef}
        target={[0, 10, 0]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
      />
      <axesHelper args={[10]} />
      
      {/* Comprehensive Camera Info Display */}
      <Text position={[-15, 18, 0]} fontSize={1.5} color="yellow" anchorX="left" anchorY="top">
        {`Camera X: ${camera.position.x.toFixed(2)}`}
      </Text>
      <Text position={[-15, 16, 0]} fontSize={1.5} color="yellow" anchorX="left" anchorY="top">
        {`Camera Y: ${camera.position.y.toFixed(2)}`}
      </Text>
      <Text position={[-15, 14, 0]} fontSize={1.5} color="yellow" anchorX="left" anchorY="top">
        {`Camera Z: ${camera.position.z.toFixed(2)}`}
      </Text>
      <Text position={[-15, 12, 0]} fontSize={1.5} color="cyan" anchorX="left" anchorY="top">
        {`Rotation X: ${(camera.rotation.x * 180 / Math.PI).toFixed(1)}°`}
      </Text>
      <Text position={[-15, 10, 0]} fontSize={1.5} color="cyan" anchorX="left" anchorY="top">
        {`Rotation Y: ${(camera.rotation.y * 180 / Math.PI).toFixed(1)}°`}
      </Text>
      <Text position={[-15, 8, 0]} fontSize={1.5} color="cyan" anchorX="left" anchorY="top">
        {`Rotation Z: ${(camera.rotation.z * 180 / Math.PI).toFixed(1)}°`}
      </Text>
      <Text position={[-15, 6, 0]} fontSize={1.5} color="white" anchorX="left" anchorY="top">
        {`FOV: ${camera.fov.toFixed(1)}°`}
      </Text>
      <Text position={[-15, 4, 0]} fontSize={1.5} color="white" anchorX="left" anchorY="top">
        {`Near: ${camera.near.toFixed(3)}`}
      </Text>
      <Text position={[-15, 2, 0]} fontSize={1.5} color="white" anchorX="left" anchorY="top">
        {`Far: ${camera.far.toFixed(1)}`}
      </Text>
      <Text position={[-15, 0, 0]} fontSize={1.5} color="magenta" anchorX="left" anchorY="top">
        {`Distance: ${camera.position.distanceTo({ x: 0, y: 10, z: 0 }).toFixed(2)}`}
      </Text>
      
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
      <Gltf src="/models/fish1.glb" rotation={[0, Math.PI/2, 0]} scale={6} castShadow receiveShadow />
      <Gltf src="/models/lure1.glb" position={[0, 5, 0]} scale={10} rotation={[0, 0, -Math.PI/2]} castShadow receiveShadow />
    </>
  );
};
