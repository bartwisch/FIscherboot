import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [24.16, -38.08, 236.61], fov: 75, near: 0.1, far: 1000 }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 10, 0);
      }}
    >
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas>
  );
}

export default App;
