import { useRef, useMemo, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Gltf, Text } from "@react-three/drei";
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

  // Get fish ID for logging
  const fishId = props.userData?.fishId || 'unknown';

    useFrame(({ clock }) => {
    if (!fishRef.current) {
      console.log(`Fish ${fishId}: fishRef.current is null, skipping frame`);
      return;
    }

    const elapsedTime = clock.getElapsedTime();

    // Wait for the spawn delay before starting the animation
    if (elapsedTime < spawnDelay) {
      fishRef.current.visible = false; // Keep fish hidden until it's time to spawn
      return;
    }
    
    if (!fishRef.current.visible) {
      console.log(`Fish ${fishId}: Now visible, starting animation at time ${elapsedTime}`);
    }
    fishRef.current.visible = true;

    // The effective time for animation, starting from zero after the delay
    const animationTime = elapsedTime - spawnDelay;

    // Define the total travel distance, from one edge to the other plus buffer
    const travelDistance = screenWidth + 10;
    
    // Start position is just off the right side of the screen, relative to the spawn center
    const startX = startPosition.x + screenWidth / 2 + 5; // `+5` is a small buffer

    // Calculate the new X position, moving from right to left
    // Simple linear movement that loops smoothly
    const distanceTraveled = (animationTime * speed) % travelDistance;
    const currentX = startX - distanceTraveled;
    
    // Removed excessive logging - fish movement is working fine

    // Update the fish's position while maintaining its altitude and depth
    fishRef.current.position.set(currentX, startPosition.y, startPosition.z);

    // Ensure the fish is always facing left
    fishRef.current.rotation.y = -Math.PI / 2;
    
    // Force update the matrix to ensure rendering updates
    fishRef.current.updateMatrixWorld(true);
    
    // Debug logging every 60 frames (about once per second)
    if (Math.floor(animationTime * 60) % 60 === 0) {
      console.log(`Fish ${fishId}: position=(${currentX.toFixed(1)}, ${startPosition.y.toFixed(1)}, ${startPosition.z.toFixed(1)}), time=${animationTime.toFixed(1)}`);
    }
  });

  return (
    <group ref={fishRef} {...props}>
      <Gltf
        src="/models/goldfish.glb"
        scale={.1}
        castShadow
        receiveShadow
      />
      {/* Fish ID number label */}
      <Text
        position={[0, 8, 0]} // Above the fish
        fontSize={6}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        outlineWidth={1}
        outlineColor="black"
      >
        {fishId.replace('fish_', '').split('_')[0]}
      </Text>
    </group>
  );
});

export default Fish;