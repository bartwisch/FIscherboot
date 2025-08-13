import { Gltf, OrbitControls, Text } from "@react-three/drei";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      <axesHelper args={[10]} />
      
      {/* Axis labels */}
      <Text position={[12, 0, 0]} fontSize={3} color="red" anchorX="center" anchorY="middle">X</Text>
      <Text position={[0, 12, 0]} fontSize={3} color="green" anchorX="center" anchorY="middle">Y</Text>
      <Text position={[0, 0, 12]} fontSize={3} color="blue" anchorX="center" anchorY="middle">Z</Text>
      
      {/* 
      First cube
      <mesh position={[-2, 0, 0]}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
      
      Second cube
      <mesh position={[2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      */}
      
      {/* Add some lighting for the standard material */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
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
      <Gltf src="/models/boat1.glb" position={[0, 100, 0]} scale={0.1} castShadow receiveShadow />
      <Gltf src="/models/fish1.glb" castShadow receiveShadow />
      <Gltf src="/models/lure1.glb" position={[0, 50, 0]} scale={10} rotation={[90, 0, 0]} castShadow receiveShadow />
    </>
  );
};
