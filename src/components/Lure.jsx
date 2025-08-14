import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Gltf } from '@react-three/drei';
import * as THREE from 'three';

const Lure = forwardRef(({ initialPosition = [0, 5, 0], speed = 60, resetDepth = -200, onCatch = () => {} }, ref) => {
  const lureRef = useRef();
  const [isFiring, setIsFiring] = useState(false);
  const [caughtFish, setCaughtFish] = useState(null);

  // Memoize the starting position to avoid re-calculations
  const startPosition = useMemo(() => new THREE.Vector3(...initialPosition), [initialPosition]);

  // Expose a 'fire' method to the parent component
  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!isFiring && !caughtFish) {
        lureRef.current.position.copy(startPosition);
        setIsFiring(true);
      }
    },
    isMoving: () => isFiring || !!caughtFish,
    getPosition: () => lureRef.current.position,
    startReeling: (fish) => {
      setIsFiring(false);
      setCaughtFish(fish);
    },
  }));

  useFrame((state, delta) => {
    // Handle reeling in a caught fish
    if (caughtFish) {
      const boatPosition = startPosition;
      lureRef.current.position.lerp(boatPosition, 0.05);
      caughtFish.ref.current.position.copy(lureRef.current.position);

      // When it reaches the boat, reset everything
      if (lureRef.current.position.distanceTo(boatPosition) < 1) {
        onCatch(caughtFish.id); // Notify parent to remove the fish
        setCaughtFish(null);
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
      lureRef.current.position.copy(startPosition);
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
        intensity={isFiring || caughtFish ? 15 : 0} 
        distance={20} 
        decay={2} 
      />
    </group>
  );
});

export default Lure;
