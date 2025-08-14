import { Gltf, OrbitControls, Text } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo, createRef } from "react";

import FishSpawner from "./FishSpawner";
import Lure from "./Lure";


export const Experience = ({ onScoreUpdate }) => {
  const { camera, viewport } = useThree();
  const orbitRef = useRef();
  const lureRef = useRef();
  const [fishConfigs, setFishConfigs] = useState([]);

  // Generate initial fish configurations
  useMemo(() => {
    const configs = [];
    const fishCount = 5;
    const baseSpeed = 55;
    const altitudeRange = { min: -150, max: -30 };
    const spawnArea = { x: 100, z: 0 };

    for (let i = 0; i < fishCount; i++) {
      const altitude = altitudeRange.min + Math.random() * (altitudeRange.max - altitudeRange.min);
      const speedVariation = 0.5 + Math.random();
      const sizeVariation = 0.8 + Math.random() * 0.4;
      const depthVariation = (Math.random() - 0.5) * 10;
      const spawnDelay = Math.random() * 5;

      configs.push({
        id: `fish_${i}_${Date.now()}`,
        ref: createRef(),
        position: [spawnArea.x, altitude, spawnArea.z + depthVariation],
        speed: baseSpeed * speedVariation,
        size: sizeVariation,
        spawnDelay,
        points: Math.floor(sizeVariation * 100),
      });
    }
    setFishConfigs(configs);
  }, []);

  // Set up the spacebar event listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        if (!lureRef.current) return;
        // Toggle: if descending, reel; if idle, fire; ignore while reeling/caught
        if (lureRef.current.isFiring()) {
          lureRef.current.reel();
        } else if (!lureRef.current.isMoving()) {
          lureRef.current.fire();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Collision detection and catching logic
  useFrame((state, delta) => {
    console.log(`useFrame running, delta: ${delta}`);
    // Only process when the lure is firing (descending)
    if (!lureRef.current?.isFiring()) {
      // console.log('Lure is not firing, returning.');
      return;
    }
    console.log('Lure is firing, proceeding with collision check.');

    const lurePosition = lureRef.current.getPosition();
    if (!lurePosition) {
      console.log('Lure position is null, returning.');
      return;
    }
    console.log(`Lure position: ${lurePosition.x.toFixed(2)}, ${lurePosition.y.toFixed(2)}, ${lurePosition.z.toFixed(2)}`);

    // Check each fish for collision
    for (let i = fishConfigs.length - 1; i >= 0; i--) {
      const fish = fishConfigs[i];
      if (fish.ref.current) {
        const fishPosition = fish.ref.current.position;
        
        // Simple 3D distance check
        const distance = lurePosition.distanceTo(fishPosition);
        
        // Collision threshold
        if (distance < 10) {
          console.log(`COLLISION! Fish ${fish.id} caught at distance ${distance}`);
          
          // Immediately handle the catch (no timeout)
          handleCatch(fish.id);
          
          // Stop the lure
          lureRef.current.reel();
          
          return; // Exit early to prevent multiple catches in one frame
        }
      }
    }
  });

  const handleCatch = (caughtFishId) => {
    console.log('Catching fish:', caughtFishId);
    
    // Find and score the caught fish
    const caughtFish = fishConfigs.find(fish => fish.id === caughtFishId);
    if (caughtFish) {
      onScoreUpdate(caughtFish.points);
    }
    
    // Update fish configs: remove caught fish and add new one
    setFishConfigs(prevConfigs => {
      // Remove the caught fish
      const filteredConfigs = prevConfigs.filter(fish => fish.id !== caughtFishId);
      
      // Create a new fish to maintain count
      const altitudeRange = { min: -150, max: -30 };
      const spawnArea = { x: 100, z: 0 };
      const baseSpeed = 55;
      
      const newFish = {
        id: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ref: createRef(),
        position: [
          spawnArea.x, 
          altitudeRange.min + Math.random() * (altitudeRange.max - altitudeRange.min),
          spawnArea.z + (Math.random() - 0.5) * 10
        ],
        speed: baseSpeed * (0.5 + Math.random()),
        size: 0.8 + Math.random() * 0.4,
        spawnDelay: 0,
        points: Math.floor((0.8 + Math.random() * 0.4) * 100),
      };
      
      console.log(`Removed fish ${caughtFishId}, added fish ${newFish.id}`);
      return [...filteredConfigs, newFish];
    });
  };

  return (
    <>
      <OrbitControls 
        ref={orbitRef}
        target={[20.42, -90.13, -14.11]}
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
      />
      <axesHelper args={[10]} />


      
      
      {/* Axis labels */}
      <Text position={[12, 0, 0]} fontSize={3} color="red" anchorX="center" anchorY="middle">X</Text>
      <Text position={[0, 12, 0]} fontSize={3} color="green" anchorX="center" anchorY="middle">Y</Text>
      <Text position={[0, 0, 12]} fontSize={3} color="blue" anchorX="center" anchorY="middle">Z</Text>
    
      
      {/* Add some lighting for the standard material */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[0, 25, 0]} 
        intensity={3.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      {/* Bright light above the boat */}
      <pointLight 
        position={[0, 20, 0]} 
        intensity={5} 
        distance={50} 
        decay={1}
        color="white"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Water surface to receive shadows */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#006994" transparent opacity={0.8} />
      </mesh>
      
      <Gltf src="/models/underwater_skybox.glb" scale={2.5}   />
      <Gltf src="/models/boat1.glb" position={[0, 10, 0]} scale={0.1} castShadow receiveShadow />
      <FishSpawner fishConfigs={fishConfigs} screenWidth={viewport.width} />
      <Lure ref={lureRef} initialPosition={[0, 5, -15]} onCatch={handleCatch} />
    </>
  );
};
