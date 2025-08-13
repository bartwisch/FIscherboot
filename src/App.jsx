import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
  return (
    <Canvas
      shadows
      camera={{ position: [7.12, -75.11, 213.04], fov: 75, near: 0.1, far: 1000 }}
      onCreated={({ camera }) => {
        camera.lookAt(20.42, -90.13, -14.11);
      }}
    >
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas>
  );
}

export default App;
