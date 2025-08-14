# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D fishing game built with React Three Fiber (R3F), Three.js, and Vite. The game features an underwater environment where players control a lure to catch fish swimming through the scene.

## Development Commands

- **Start development server**: `yarn dev` or `npm run dev`
- **Build for production**: `yarn build` or `npm run build`
- **Preview production build**: `yarn preview` or `npm run preview`
- **Install dependencies**: `yarn` or `npm install`

## Architecture

### Core Structure
- **App.jsx**: Main application component that sets up the Canvas and manages global score state
- **Experience.jsx**: Main 3D scene manager that handles lighting, camera controls, and game logic
- **FishSpawner.jsx**: Manages spawning and configuration of multiple fish entities
- **Fish.jsx**: Individual fish component with swimming behavior
- **Lure.jsx**: Player-controlled fishing lure with fire/reel mechanics
- **Score.jsx**: UI component for displaying game score

### Game Mechanics
- **Controls**: Spacebar to fire/reel the lure
- **Collision Detection**: Real-time distance-based collision checking between lure and fish
- **Fish System**: 25 fish with randomized speed, size, position, and spawn delays
- **Scoring**: Points awarded based on fish size when caught

### 3D Assets
- Models stored in `/public/models/`: boat1.glb, fish1.glb, lure1.glb, underwater_skybox.glb, fishtank.glb
- All models use .glb format for optimized loading

### Key Technical Details
- **Camera**: Fixed position at [7.12, -75.11, 213.04] looking at [20.42, -90.13, -14.11]
- **Lighting**: Ambient + directional + point lights with shadow mapping enabled
- **Physics**: Custom collision detection using Three.js Vector3.distanceTo()
- **State Management**: React useState for game state, refs for 3D object references
- **Performance**: Optimized with Vite deps bundling for Three.js libraries

### Component Communication
- Parent-child prop passing for score updates and fish configurations
- useImperativeHandle in Lure component for external control
- Ref forwarding pattern for 3D object manipulation

## Development Notes

- Fish spawn from right side and swim left across the scene
- Lure descends when fired, auto-reels at depth limit (-200 units)
- Collision threshold is 12 units between lure and fish
- Debug logging enabled for lure states and fish interactions
- OrbitControls configured for rotation only (no pan/zoom)