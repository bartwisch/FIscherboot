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
    const fishCount = 10; // Reduced to test performance
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
  useFrame(() => {
    if (!lureRef.current) {
      return;
    }

    const isFiring = lureRef.current.isFiring();
    const isMoving = lureRef.current.isMoving();
    
    // Only check for collisions when the lure is firing (not when reeling)
    if (!isFiring) {
      return;
    }

    const lurePosition = lureRef.current.getPosition();

    for (const fish of fishConfigs) {
      // Check if fish ref is valid
      if (!fish.ref?.current) {
        continue;
      }
      
      const fishPosition = fish.ref.current.position;
      
      // Early exit if fish is too far away to avoid expensive distance calculations
      const roughDistanceX = Math.abs(lurePosition.x - fishPosition.x);
      const roughDistanceY = Math.abs(lurePosition.y - fishPosition.y);
      if (roughDistanceX > 20 || roughDistanceY > 20) {
        continue; // Skip expensive distance calculation if roughly too far
      }
      
      const distance = lurePosition.distanceTo(fishPosition);


      // Only check collision threshold
      if (distance < 20) {
        console.log(`Fish ${fish.id} caught! Distance: ${distance.toFixed(2)}`);
        // Create a fish object to pass to the lure
        const caughtFishObj = {
          id: fish.id,
          ref: fish.ref
        };
        // Start reeling with the fish attached
        lureRef.current.startReeling(caughtFishObj);
        break; // Catch one fish at a time
      }
    }
  });

  const handleCatch = (caughtFishId) => {
    console.log(`========== FISH CAUGHT ==========`);
    console.log(`Caught fish ${caughtFishId}. Removing it.`);
    console.log(`Fish configs before removal: ${fishConfigs.length}`);
    console.log(`Fish configs IDs before:`, fishConfigs.map(f => f.id));
    
    // Award 10 points for each goldfish caught
    onScoreUpdate(10);
    
    setFishConfigs((prevConfigs) => {
      const newConfigs = prevConfigs.filter((fish) => fish.id !== caughtFishId);
      console.log(`Fish configs after removal: ${newConfigs.length}`);
      console.log(`Fish configs IDs after:`, newConfigs.map(f => f.id));
      console.log(`================================`);
      return newConfigs;
    });
    // Note: We are not spawning a new fish here to simplify the logic for now.
    // We can add that back later if needed.
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
      <Lure ref={lureRef} initialPosition={[0, 5, -15]} onCatch={handleCatch} fishConfigs={fishConfigs} />
    </>
  );
};
