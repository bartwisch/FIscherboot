import { Gltf, OrbitControls, Text } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo, createRef } from "react";
import * as THREE from 'three';

import FishSpawner from "./FishSpawner";
import Lure from "./Lure";


export const Experience = ({ onScoreUpdate }) => {
  const { camera, viewport } = useThree();
  const orbitRef = useRef();
  const lureRef = useRef();
  const [fishConfigs, setFishConfigs] = useState([]);
  const boatPosition = useMemo(() => new THREE.Vector3(0, 10, 0), []);

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
      const spawnDelay = Math.random() * 5;

      configs.push({
        id: `fish_${i}_${Date.now()}`,
        ref: createRef(),
        position: [spawnArea.x, altitude, spawnArea.z], // All fish at same Z position
        speed: baseSpeed * speedVariation,
        size: sizeVariation,
        spawnDelay,
        points: Math.floor(sizeVariation * 100),
      });
    }
    setFishConfigs(configs);
  }, []);

  // Set up the spacebar and touch event listeners
  useEffect(() => {
    const handleInput = () => {
      if (!lureRef.current) return;
      // Toggle: if descending, reel; if idle, fire; ignore while reeling/caught
      if (lureRef.current.isFiring()) {
        lureRef.current.reel();
      } else if (!lureRef.current.isMoving()) {
        lureRef.current.fire();
      }
    };

    const handleKeyDown = (event) => {
      if (event.code === 'Space') {
        event.preventDefault(); // Prevent page scrolling
        handleInput();
      }
    };

    const handleTouch = (event) => {
      event.preventDefault(); // Prevent default touch behavior
      handleInput();
    };

    const handleClick = (event) => {
      event.preventDefault(); // Prevent default click behavior
      handleInput();
    };

    // Add all event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('click', handleClick);
    };
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
      if (distance < 25) {
        const distanceFromBoat = boatPosition.distanceTo(fishPosition);
        console.log(`Fish ${fish.id} caught! Distance from boat: ${distanceFromBoat.toFixed(2)}`);
        
        // Create a fish object to pass to the lure
        const caughtFishObj = {
          id: fish.id,
          ref: fish.ref
        };
        // Start reeling with the fish attached
        lureRef.current.startReeling(caughtFishObj, distanceFromBoat);
        break; // Catch one fish at a time
      }
    }
  });

  const handleCatch = (caughtFishId, distance) => {
    console.log(`========== FISH CAUGHT ==========`);
    console.log(`Caught fish ${caughtFishId} at distance ${distance.toFixed(2)}. Removing it.`);
    console.log(`Fish configs before removal: ${fishConfigs.length}`);
    console.log(`Fish configs IDs before:`, fishConfigs.map(f => f.id));
    
    // Scoring: 10-30 points based on distance.
    const maxDistance = 250; // Approximate max distance a fish can be caught at
    const score = 10 + (distance / maxDistance) * 20;
    const finalScore = Math.max(10, Math.min(30, Math.round(score)));
    console.log(`Awarding ${finalScore} points.`);
    onScoreUpdate(finalScore);
    
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
        enableRotate={false}
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
