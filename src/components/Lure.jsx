import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Gltf } from '@react-three/drei';
import * as THREE from 'three';

const Lure = forwardRef(({ initialPosition = [0, 5, 0], speed = 60, resetDepth = -200 }, ref) => {
  const lureRef = useRef();
  const [isFiring, setIsFiring] = useState(false);

  // Memoize the starting position to avoid re-calculations
  const startPosition = useMemo(() => new THREE.Vector3(...initialPosition), [initialPosition]);

  // Expose a 'fire' method to the parent component
  useImperativeHandle(ref, () => ({
    fire: () => {
      if (!isFiring) {
        lureRef.current.position.copy(startPosition);
        setIsFiring(true);
      }
    },
  }));

  useFrame((state, delta) => {
    if (!isFiring) return;

    // Animate the lure downwards
    lureRef.current.position.y -= speed * delta;

    // Reset when it goes below the screen
    if (lureRef.current.position.y < resetDepth) {
      setIsFiring(false);
      lureRef.current.position.copy(startPosition);
    }
  });

  return (
    <Gltf
      ref={lureRef}
      src="/models/lure1.glb"
      position={startPosition}
      scale={10}
      rotation={[0, 0, -Math.PI / 2]}
      castShadow
      receiveShadow
    />
  );
});

export default Lure;
