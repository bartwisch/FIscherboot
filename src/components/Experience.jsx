import { Gltf, OrbitControls, Text } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo, createRef } from "react";
import * as THREE from 'three';

import FishSpawner from "./FishSpawner";
import YellowfishSpawner from "./YellowfishSpawner";
import Lure from "./Lure";


export const Experience = ({ onScoreUpdate }) => {
  const { camera, viewport } = useThree();
  const orbitRef = useRef();
  const lureRef = useRef();
  const [fishConfigs, setFishConfigs] = useState([]);
  const [yellowfishConfigs, setYellowfishConfigs] = useState([]);
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

  // Generate yellowfish configurations (swimming under the boat)
  useMemo(() => {
    const yellowConfigs = [];
    const yellowfishCount = 5;
    const baseSpeed = 40;
    const altitudeRange = { min: -25, max: -5 }; // Just under the boat
    const spawnArea = { x: 80, z: 0 };

    for (let i = 0; i < yellowfishCount; i++) {
      const altitude = altitudeRange.min + Math.random() * (altitudeRange.max - altitudeRange.min);
      const speedVariation = 0.6 + Math.random() * 0.8;
      const sizeVariation = 0.15 + Math.random() * 0.1;
      const spawnDelay = Math.random() * 4;

      yellowConfigs.push({
        id: `yellowfish_${i}_${Date.now()}`,
        ref: createRef(),
        position: [spawnArea.x, altitude, spawnArea.z],
        speed: baseSpeed * speedVariation,
        size: sizeVariation,
        spawnDelay,
      });
    }
    setYellowfishConfigs(yellowConfigs);
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

    // Check collisions with yellowfish
    for (const yellowfish of yellowfishConfigs) {
      // Check if yellowfish ref is valid
      if (!yellowfish.ref?.current) {
        continue;
      }
      
      const fishPosition = yellowfish.ref.current.position;
      
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
        console.log(`Yellowfish ${yellowfish.id} caught! Distance from boat: ${distanceFromBoat.toFixed(2)}`);
        
        // Create a fish object to pass to the lure
        const caughtFishObj = {
          id: yellowfish.id,
          ref: yellowfish.ref,
          type: 'yellowfish'
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
    
    // Check if it's a goldfish or yellowfish
    const isGoldfish = fishConfigs.some(fish => fish.id === caughtFishId);
    const isYellowfish = yellowfishConfigs.some(fish => fish.id === caughtFishId);
    
    // Scoring: Different points for different fish types
    const maxDistance = 250;
    let baseScore = 10;
    if (isYellowfish) {
      baseScore = 20; // Yellowfish are worth more points
    }
    const score = baseScore + (distance / maxDistance) * 15;
    const finalScore = Math.max(baseScore, Math.min(baseScore + 15, Math.round(score)));
    console.log(`Awarding ${finalScore} points for ${isYellowfish ? 'yellowfish' : 'goldfish'}.`);
    onScoreUpdate(finalScore);
    
    if (isGoldfish) {
      console.log(`Goldfish configs before removal: ${fishConfigs.length}`);
      setFishConfigs((prevConfigs) => {
        const newConfigs = prevConfigs.filter((fish) => fish.id !== caughtFishId);
        console.log(`Goldfish configs after removal: ${newConfigs.length}`);
        return newConfigs;
      });
    } else if (isYellowfish) {
      console.log(`Yellowfish configs before removal: ${yellowfishConfigs.length}`);
      setYellowfishConfigs((prevConfigs) => {
        const newConfigs = prevConfigs.filter((fish) => fish.id !== caughtFishId);
        console.log(`Yellowfish configs after removal: ${newConfigs.length}`);
        return newConfigs;
      });
    }
    console.log(`================================`);
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
      <Gltf src="/models/boat1.glb" position={[0, 10, 0]} scale={0.1} castShadow receiveShadow animations={[]} />
      <FishSpawner fishConfigs={fishConfigs} screenWidth={viewport.width} />
      <YellowfishSpawner yellowfishConfigs={yellowfishConfigs} screenWidth={viewport.width} />
      <Lure ref={lureRef} initialPosition={[0, 5, -15]} onCatch={handleCatch} fishConfigs={fishConfigs} yellowfishConfigs={yellowfishConfigs} />
    </>
  );
};
