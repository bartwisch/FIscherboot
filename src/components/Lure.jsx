import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Gltf } from '@react-three/drei';
import * as THREE from 'three';

const Lure = forwardRef(({ initialPosition = [0, 5, -15], speed = 60, resetDepth = -200, onCatch = () => {}, fishConfigs = [] }, ref) => {
  const lureRef = useRef();
  const [isFiring, setIsFiring] = useState(false);
  const [caughtFish, setCaughtFish] = useState(null);
  const [isReeling, setIsReeling] = useState(false);
  const [fishProcessed, setFishProcessed] = useState(false); // Prevent duplicate onCatch calls

  // Memoize the starting position to avoid re-calculations
  const startPosition = useMemo(() => new THREE.Vector3(...initialPosition), [initialPosition]);

  // Expose a 'fire' method to the parent component
  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!isFiring && !caughtFish && !isReeling) {
        lureRef.current.position.copy(startPosition);
        setIsFiring(true);
        setFishProcessed(false); // Reset the flag when firing
      }
    },
    // Explicit state checks for parent logic
    isFiring: () => isFiring,
    isMoving: () => isFiring || !!caughtFish || isReeling,
    getPosition: () => lureRef.current?.position || new THREE.Vector3(0, 0, 0),
    // Start reeling due to a caught fish
    startReeling: (fish) => {
      setIsFiring(false);
      setCaughtFish(fish);
      setIsReeling(true);
      setFishProcessed(false); // Reset flag when catching a fish
    },
    // Manual reel-in (e.g., second press of Space)
    reel: () => {
      if ((isFiring || caughtFish) && !isReeling) {
        setIsFiring(false);
        setIsReeling(true);
      }
    },
  }));

  useFrame((state, delta) => {
    // Handle reeling (with or without a caught fish)
    if (isReeling) {
      const boatPosition = startPosition;
      lureRef.current.position.lerp(boatPosition, 0.08);
      // Only update the caught fish position if it still exists in fishConfigs
      if (caughtFish && fishConfigs.some(fish => fish.id === caughtFish.id)) {
        if (caughtFish.ref?.current) {
          // Check if the fish component is still mounted by trying to access its position
          try {
            // This will throw an error if the component is unmounted
            const fishPosition = caughtFish.ref.current.position;
            // If we get here, the component is still mounted, so update its position
            fishPosition.copy(lureRef.current.position);
          } catch (error) {
            console.log("Caught fish component appears to be unmounted:", error);
            // If there's an error, the component is unmounted, so we'll stop tracking it
          }
        }
      } else if (caughtFish) {
        console.log(`Caught fish ${caughtFish.id} no longer exists in fishConfigs`);
      }

      // When it reaches the boat, reset everything
      if (lureRef.current.position.distanceTo(boatPosition) < 1) {
        console.log("Lure reached boat, resetting");
        if (caughtFish && !fishProcessed) {
          console.log(`Calling onCatch for fish ${caughtFish.id}`);
          onCatch(caughtFish.id); // Notify parent to remove the fish
          setFishProcessed(true); // Mark fish as processed to prevent duplicate calls
        }
        setCaughtFish(null);
        setIsReeling(false);
        setFishProcessed(false); // Reset flag for next catch
        lureRef.current.position.copy(startPosition);
      }
      return;
    }

    // Handle the lure firing downwards
    if (!isFiring) return;
    lureRef.current.position.y -= speed * delta;

    // Reset if it goes off-screen without a catch
    if (lureRef.current.position.y < resetDepth) {
      setIsFiring(false);
      // Begin auto-retrieval when reaching max depth
      setIsReeling(true);
    }
  });

  return (
    <group ref={lureRef} position={startPosition}>
      <Gltf
        src="/models/lure1.glb"
        scale={10}
        rotation={[0, 0, -Math.PI / 2]}
        castShadow
        receiveShadow
      />
      {/* Add a light source to the lure */}
      <pointLight 
        color="aqua" 
        intensity={isFiring || caughtFish || isReeling ? 15 : 0} 
        distance={20} 
        decay={2} 
      />
    </group>
  );
});

export default Lure;
