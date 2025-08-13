import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

export default function Fish({ speed = 3, screenWidth = 40, spawnDelay = 0, ...props }) {
  const fishRef = useRef();
  // Store the starting position to maintain altitude
  const startPosition = useMemo(() => ({
    x: props.position?.[0] || 0,
    y: props.position?.[1] || 0,
    z: props.position?.[2] || 0
  }), [props.position]);

    useFrame(({ clock }) => {
    if (!fishRef.current) return;

    const elapsedTime = clock.getElapsedTime();

    // Wait for the spawn delay before starting the animation
    if (elapsedTime < spawnDelay) {
      fishRef.current.visible = false; // Keep fish hidden until it's time to spawn
      return;
    }
    fishRef.current.visible = true;

    // The effective time for animation, starting from zero after the delay
    const animationTime = elapsedTime - spawnDelay;

    // Define the total travel distance, including an off-screen buffer
    const travelDistance = screenWidth + 50; // 50 is a buffer to ensure it's fully off-screen
    
    // Start position is just off-screen to the right
    const startX = screenWidth / 2 + 25;

    // Calculate the new X position, moving from right to left
    const currentX = startX - (animationTime * speed) % travelDistance;

    // Update the fish's position while maintaining its altitude and depth
    fishRef.current.position.x = currentX;
    fishRef.current.position.y = startPosition.y;
    fishRef.current.position.z = startPosition.z;

    // Ensure the fish is always facing left
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