import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

export default function Fish({ speed = 3, screenWidth = 400, ...props }) {
  const fishRef = useRef();
  // Store the starting position to maintain altitude
  const startPosition = useMemo(() => ({
    x: props.position?.[0] || 0,
    y: props.position?.[1] || 0,
    z: props.position?.[2] || 0
  }), [props.position]);

  useFrame(({ clock }) => {
    if (!fishRef.current) return;
    
    // Calculate continuous left movement (right to left)
    const time = clock.getElapsedTime();
    const rightEdge = startPosition.x + screenWidth / 2;
    const leftEdge = startPosition.x - screenWidth / 2;
    
    // Move from right to left, reset when off-screen
    const currentX = rightEdge - (time * speed * 10) % (screenWidth + 50);
    
    // Update position - maintain original y (altitude) and z (depth)
    fishRef.current.position.x = currentX;
    fishRef.current.position.y = startPosition.y;
    fishRef.current.position.z = startPosition.z;
    
    // Make fish face left (swimming direction)
    fishRef.current.rotation.y = -Math.PI / 2;
  });

  return (
    <group ref={fishRef} position={[startPosition.x, startPosition.y, startPosition.z]}>
      <Gltf 
        src="/models/fish1.glb" 
        scale={6}
        castShadow 
        receiveShadow
      />
    </group>
  );
}