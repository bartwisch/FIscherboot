import { OrbitControls } from "@react-three/drei";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      
      {/* First cube */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry />
        <meshNormalMaterial />
      </mesh>
      
      {/* Second cube */}
      <mesh position={[2, 0, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      
      {/* Add some lighting for the standard material */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
};
