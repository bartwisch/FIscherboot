# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 3D fishing game built with React Three Fiber (R3F), Three.js, and Vite. The game features an underwater environment where players control a lure to catch fish swimming through the scene.

## Development Commands

- **Start development server**: `yarn dev` or `npm run dev`
- **Build for production**: `yarn build` or `npm run build`  
- **Preview production build**: `yarn preview` or `npm run preview`
- **Install dependencies**: `yarn` or `npm install`

### Technology Stack
- **Framework**: React 19 with React Three Fiber (R3F)
- **Build Tool**: Vite with React plugin
- **3D Library**: Three.js ^0.173.0
- **Utils**: @react-three/drei for 3D helpers
- **Input**: react-hotkeys-hook for keyboard handling

## Architecture

### Core Structure
- **App.jsx**: Main application component that sets up the Canvas, manages global score state, and handles WebGL configuration
- **Experience.jsx**: Main 3D scene manager that handles lighting, camera controls, game logic, collision detection, and input events
- **FishSpawner.jsx**: Manages spawning and configuration of multiple fish entities with randomized properties
- **Fish.jsx**: Individual fish component with swimming behavior and position updates
- **Lure.jsx**: Player-controlled fishing lure with pendulum physics, fire/reel mechanics, and useImperativeHandle for external control
- **Score.jsx**: UI component for displaying current game score
- **TouchInstructions.jsx**: Mobile-friendly UI instructions overlay
- **CameraHUD.jsx**: Additional HUD component for camera-related UI

### Game Mechanics
- **Controls**: Spacebar, touch, or click to fire/reel the lure
- **Collision Detection**: Real-time distance-based collision checking between lure and fish (25 unit threshold)
- **Fish System**: 10 fish with randomized speed, size, position, and spawn delays
- **Scoring**: Fixed 10 points awarded per fish caught
- **Lure Physics**: Pendulum motion when idle, directional firing based on pendulum angle at moment of firing

### 3D Assets
- Models stored in `/public/models/`: boat1.glb, goldfish.glb, lure1.glb, underwater_skybox.glb, fishtank.glb
- All models use .glb format for optimized loading

### Key Technical Details
- **Camera**: Fixed position at [7.12, -75.11, 213.04] looking at [20.42, -90.13, -14.11] with 75° FOV
- **WebGL Config**: High-performance mode, antialias enabled, alpha disabled, drawing buffer not preserved
- **Lighting**: Ambient (0.5 intensity) + directional (3.5 intensity) + point light (5 intensity) with shadow mapping
- **Shadows**: 2048x2048 shadow maps for directional light, 1024x1024 for point light
- **Physics**: Custom collision detection using Three.js Vector3.distanceTo() with rough distance pre-filtering
- **State Management**: React useState for game state, createRef() for fish references, useImperativeHandle for lure control
- **Performance**: Vite optimizeDeps for Three.js libraries, rough distance checking before expensive calculations
- **Input Events**: Global window event listeners for keydown, touchstart, and click with preventDefault()
- **Controls**: Multi-platform input handling with `touchAction: 'none'` to prevent scrolling

### Component Communication
- **Score Updates**: onScoreUpdate callback prop passed from App → Experience → handleCatch
- **Fish Management**: fishConfigs state array with createRef() for each fish, passed to FishSpawner and Lure
- **Lure Control**: useImperativeHandle in Lure component exposing isFiring(), isMoving(), fire(), reel(), getPosition(), startReeling()
- **Input Handling**: Global event listeners in Experience component control lure through ref methods
- **Collision Detection**: useFrame hook in Experience checks lure position against all fish positions

## Development Notes

### Game Logic Specifics
- **Fish Spawning**: 10 fish spawn from right side (x=100) with randomized altitude (-150 to -30), speed (0.5-1.5x base), size (0.8-1.2x), and spawn delays (0-5s)
- **Lure Physics**: Pendulum motion when idle, fires in current pendulum direction, auto-reels at depth (-200) or horizontal (100) boundaries
- **Collision System**: 25-unit threshold with rough distance pre-filtering (20-unit X/Y check before expensive distanceTo calculation)
- **Fish Removal**: Caught fish are filtered from fishConfigs array and removed from scene (no respawning currently)
- **Scoring**: Fixed 10 points per fish, passed through onScoreUpdate callback chain

### Technical Implementation Notes
- **OrbitControls**: Completely disabled (enableRotate, enablePan, enableZoom all false) for fixed camera view
- **Event Handling**: Single input handler for spacebar/touch/click with toggle logic (fire when idle, reel when firing)
- **Performance Optimizations**: Early exit collision checks, Vite dep bundling, high-performance WebGL context
- **Debug Logging**: Extensive console logging for fish catching, lure states, and config management
- **Water Surface**: Transparent blue plane at y=0 for shadow reception
- **Asset Loading**: All .glb models loaded via @react-three/drei Gltf component