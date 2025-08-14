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
  fishConfigs = [], 
  screenWidth, 
  ...props 
}) {
  
  return (
    <group {...props}>
      {fishConfigs.map((config) => (
        <Fish
          ref={config.ref} // Pass the ref to the Fish component
          key={config.id}
          position={config.position}
          speed={config.speed}
          screenWidth={screenWidth}
          spawnDelay={config.spawnDelay}
          scale={config.size * 6}
          userData={{
            fishId: config.id,
            points: config.points,
            fishType: config.fishType,
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
