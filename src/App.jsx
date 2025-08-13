import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";

function App() {
  return (
    <Canvas shadows camera={{ position: [0, 3, 10], fov: 75 }}>
      <color attach="background" args={["#ececec"]} />
      <Experience />
    </Canvas>
  );
}

export default App;
