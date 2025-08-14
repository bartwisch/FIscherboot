import { useRef, useMemo, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Gltf } from "@react-three/drei";
import * as THREE from "three";

const Fish = forwardRef(({ speed = 3, screenWidth = 40, spawnDelay = 0, ...props }, ref) => {
  // Use the forwarded ref instead of a local one
  const fishRef = ref;
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

    // Define the total travel distance, from one edge to the other plus buffer
    const travelDistance = screenWidth + 10;
    
    // Start position is just off the right side of the screen, relative to the spawn center
    const startX = startPosition.x + screenWidth / 2 + 5; // `+5` is a small buffer

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
    <group ref={fishRef} {...props}>
      <Gltf
        src="/models/fish1.glb"
        scale={1}
        castShadow
        receiveShadow
      />
    </group>
  );
});

export default Fish;