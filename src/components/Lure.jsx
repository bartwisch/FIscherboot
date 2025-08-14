import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Gltf } from '@react-three/drei';
import * as THREE from 'three';

const Lure = forwardRef(({ initialPosition = [0, 5, 0], speed = 60, resetDepth = -200, onCatch = () => {} }, ref) => {
  const lureRef = useRef();
  const [isFiring, setIsFiring] = useState(false);
  const [caughtFish, setCaughtFish] = useState(null);
  const [isReeling, setIsReeling] = useState(false);

  // Memoize the starting position to avoid re-calculations
  const startPosition = useMemo(() => new THREE.Vector3(...initialPosition), [initialPosition]);

  // Expose a 'fire' method to the parent component
  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!isFiring && !caughtFish && !isReeling) {
        lureRef.current.position.copy(startPosition);
        setIsFiring(true);
      }
    },
    // Explicit state checks for parent logic
    isFiring: () => isFiring,
    isMoving: () => isFiring || !!caughtFish || isReeling,
    getPosition: () => lureRef.current.position,
    // Start reeling due to a caught fish
    startReeling: (fish) => {
      setIsFiring(false);
      setCaughtFish(fish);
      setIsReeling(true);
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
      if (caughtFish?.ref?.current) {
        caughtFish.ref.current.position.copy(lureRef.current.position);
      }

      // When it reaches the boat, reset everything
      if (lureRef.current.position.distanceTo(boatPosition) < 1) {
        if (caughtFish) {
          onCatch(caughtFish.id); // Notify parent to remove the fish
        }
        setCaughtFish(null);
        setIsReeling(false);
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
