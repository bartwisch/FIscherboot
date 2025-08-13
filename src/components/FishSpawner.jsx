import { useMemo } from "react";
import Fish from "./Fish";

/**
 * FishSpawner - Manages multiple fish for a fishing game
 * 
 * Features:
 * - Spawns fish at different altitudes
 * - All fish swim right-to-left only
 * - Configurable speed, count, and spawn parameters
 * - Easy to extend for game mechanics (catching, scoring, etc.)
 */
export default function FishSpawner({ 
  fishCount = 5,
  baseSpeed = 10, // 5x faster than original (3 * 5 = 15)
  altitudeRange = { min: -150, max: -30 }, // Well below boat (y=10) to bottom of screen
  spawnArea = { x: 0, z: 0 },
  screenWidth = 400,
  fishTypes = ["fish1"], // Can be extended for different fish models
  ...props 
}) {
  
  // Generate fish configurations
  const fishConfigs = useMemo(() => {
    const configs = [];
    
    for (let i = 0; i < fishCount; i++) {
      // Distribute fish across different altitudes
      const altitudeStep = (altitudeRange.max - altitudeRange.min) / (fishCount - 1);
      const altitude = altitudeRange.min + (altitudeStep * i);
      
      // Add some randomness to spawn timing and positioning
      const spawnDelay = Math.random() * 5; // 0-5 second delay
      const speedVariation = 0.8 + Math.random() * 0.4; // 80%-120% of base speed
      const zOffset = (Math.random() - 0.5) * 20; // Random depth variation
      
      configs.push({
        id: `fish-${i}`,
        position: [spawnArea.x, altitude, spawnArea.z + zOffset],
        speed: baseSpeed * speedVariation,
        spawnDelay,
        fishType: fishTypes[i % fishTypes.length],
        // Add fish-specific properties for game mechanics
        size: 0.8 + Math.random() * 0.4, // Random size variation
        points: Math.floor(Math.random() * 50) + 10, // Point value for catching
      });
    }
    
    return configs;
  }, [fishCount, baseSpeed, altitudeRange, spawnArea, fishTypes]);

  return (
    <group name="fish-spawner" {...props}>
      {fishConfigs.map((config) => (
        <Fish
          key={config.id}
          position={config.position}
          speed={config.speed}
          screenWidth={screenWidth}
          spawnDelay={config.spawnDelay}
          scale={config.size * 6} // Apply size variation to the base scale
          userData={{
            // Store game-related data that can be accessed for catching mechanics
            fishId: config.id,
            points: config.points,
            fishType: config.fishType,
            spawnTime: Date.now() + (config.spawnDelay * 1000),
          }}
        />
      ))}
    </group>
  );
}

/**
 * Preset configurations for different game scenarios
 */
export const FishSpawnerPresets = {
  // Easy mode - fewer, slower fish
  easy: {
    fishCount: 3,
    baseSpeed: 10,
    altitudeRange: { min: -30, max: 10 },
  },
  
  // Normal mode - balanced
  normal: {
    fishCount: 5,
    baseSpeed: 15,
    altitudeRange: { min: -50, max: 20 },
  },
  
  // Hard mode - many fast fish
  hard: {
    fishCount: 8,
    baseSpeed: 20,
    altitudeRange: { min: -70, max: 30 },
  },
  
  // School of fish - many fish at similar altitude
  school: {
    fishCount: 10,
    baseSpeed: 12,
    altitudeRange: { min: -20, max: -10 },
  },
};
