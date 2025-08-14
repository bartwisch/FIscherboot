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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [firingDirection, setFiringDirection] = useState(null);
  const [currentPendulumAngle, setCurrentPendulumAngle] = useState(0);

  // Memoize the starting position to avoid re-calculations
  const startPosition = useMemo(() => new THREE.Vector3(...initialPosition), [initialPosition]);

  // Expose a 'fire' method to the parent component
  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!isFiring && !caughtFish && !isReeling) {
        lureRef.current.position.copy(startPosition);
        // Capture the current pendulum angle at the moment of firing
        // Apply the same rotation offset as the visual elements
        const firingAngle = -Math.PI / 2 + currentPendulumAngle;
        console.log(`Firing with pendulum angle: ${currentPendulumAngle.toFixed(2)} radians, firing angle: ${firingAngle.toFixed(2)}`);
        console.log(`X direction: ${Math.cos(firingAngle).toFixed(2)}`);
        const direction = new THREE.Vector3(
          Math.cos(firingAngle) * 50, // x component with correct rotation
          -80, // y component (downward)
          0  // z component - never change z position
        );
        setFiringDirection(direction);
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
    // Pendulum motion when idle
    if (!isFiring && !isReeling) {
      setRotationAngle(prev => prev + delta * 2); // Time for pendulum motion
      const pendulumAngle = Math.sin(rotationAngle) * Math.PI / 3; // Swing between -60 and +60 degrees
      setCurrentPendulumAngle(pendulumAngle); // Store current angle for firing
      // Don't rotate the group - the lure model will rotate individually
      
      // Debug: show angle in console occasionally
      if (Math.floor(rotationAngle * 10) % 20 === 0) {
        console.log(`Pendulum angle: ${pendulumAngle.toFixed(2)} rad (${(pendulumAngle * 180 / Math.PI).toFixed(1)}°), cos: ${Math.cos(pendulumAngle).toFixed(2)}`);
      }
    }

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
        setFiringDirection(null); // Reset firing direction
        lureRef.current.position.copy(startPosition);
        // Reset the pendulum angle but don't apply group rotation
        const pendulumAngle = Math.sin(rotationAngle) * Math.PI / 3; // Restore pendulum motion
        setCurrentPendulumAngle(pendulumAngle);
      }
      return;
    }

    // Handle the lure firing in direction
    if (!isFiring) return;
    
    if (firingDirection) {
      // Move in the firing direction (x10 speed) - no Z movement
      lureRef.current.position.x += (firingDirection.x * delta) / 1;
      lureRef.current.position.y += (firingDirection.y * delta) / 1;
      // Z position remains constant

      // Reset if it goes off-screen without a catch
      if (lureRef.current.position.y < resetDepth || 
          Math.abs(lureRef.current.position.x - startPosition.x) > 100) {
        setIsFiring(false);
        setFiringDirection(null);
        // Begin auto-retrieval when reaching boundaries
        setIsReeling(true);
      }
    }
  });

  return (
    <group ref={lureRef} position={startPosition}>
      {/* Pivot point (attachment point) */}
      <group rotation={[0, 0, currentPendulumAngle]}>
        {/* Lure hangs down from the pivot point */}
        <Gltf
          src="/models/lure1.glb"
          scale={10}
          position={[0, -8, 0]} // Offset downward from pivot
          rotation={[0, 0, -Math.PI / 2]}
          castShadow
          receiveShadow
        />
        {/* Light source attached to the lure */}
        <pointLight 
          position={[0, -8, 0]}
          color="aqua" 
          intensity={isFiring || caughtFish || isReeling ? 15 : 0} 
          distance={20} 
          decay={2} 
        />
      </group>
    </group>
  );
});

export default Lure;
