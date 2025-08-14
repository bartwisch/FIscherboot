import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { Experience } from "./components/Experience";
import Score from "./components/Score";

function App() {
  const [score, setScore] = useState(0);

  const handleScoreUpdate = (points) => {
    setScore(prevScore => prevScore + points);
  };

  return (
    <>
      <Score score={score} />
      <Canvas
        shadows
        camera={{ position: [7.12, -75.11, 213.04], fov: 75, near: 0.1, far: 1000 }}
        onCreated={({ camera }) => {
          camera.lookAt(20.42, -90.13, -14.11);
        }}
      >
        <color attach="background" args={["#ececec"]} />
        <Experience onScoreUpdate={handleScoreUpdate} />
      </Canvas>
    </>
  );
}

export default App;
