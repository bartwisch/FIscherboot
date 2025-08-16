import { useRef, useMemo, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Gltf } from "@react-three/drei";

const Yellowfish = forwardRef(({ speed = 3, screenWidth = 40, spawnDelay = 0, ...props }, ref) => {
  const fishRef = ref;
  const startPosition = useMemo(() => ({
    x: props.position?.[0] || 0,
    y: props.position?.[1] || 0,
    z: props.position?.[2] || 0
  }), [props.position]);

  const fishId = props.userData?.fishId || 'unknown';

  useFrame(({ clock }) => {
    if (!fishRef.current) {
      console.log(`Yellowfish ${fishId}: fishRef.current is null, skipping frame`);
      return;
    }

    const elapsedTime = clock.getElapsedTime();

    // Wait for the spawn delay before starting the animation
    if (elapsedTime < spawnDelay) {
      fishRef.current.visible = false;
      return;
    }
    
    if (!fishRef.current.visible) {
      console.log(`Yellowfish ${fishId}: Now visible, starting animation at time ${elapsedTime}`);
    }
    fishRef.current.visible = true;

    // The effective time for animation, starting from zero after the delay
    const animationTime = elapsedTime - spawnDelay;

    // Define the total travel distance, from one edge to the other plus buffer
    const travelDistance = screenWidth + 10;
    
    // Start position is just off the right side of the screen, relative to the spawn center
    const startX = startPosition.x + screenWidth / 2 + 5;

    // Calculate the new X position, moving from right to left
    const distanceTraveled = (animationTime * speed) % travelDistance;
    const currentX = startX - distanceTraveled;

    // Update the fish's position while maintaining its altitude and depth
    fishRef.current.position.set(currentX, startPosition.y, startPosition.z);

    // Ensure the fish is facing forward in swimming direction
    fishRef.current.rotation.y = 0;
    
    // Force update the matrix to ensure rendering updates
    fishRef.current.updateMatrixWorld(true);
  });

  return (
    <group ref={fishRef} {...props}>
      <Gltf
        src="/models/gelbfisch.glb"
        scale={props.scale || 1}
        castShadow
        receiveShadow
        animations={[]}
      />
      {/* Light source for yellowfish */}
      <pointLight 
        position={[0, 0, 0]}
        color="yellow" 
        intensity={2} 
        distance={12} 
        decay={2} 
      />
    </group>
  );
});

export default Yellowfish;