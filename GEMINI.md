# Project: 3D Fishing Game

## Overview

This project is a 3D fishing game built with React Three Fiber and Vite. The game involves catching fish with a lure to score points. The main technologies used are:

*   **React Three Fiber:** A React renderer for Three.js, used for creating the 3D scene and managing 3D objects.
*   **Vite:** A fast build tool for modern web projects.
*   **Three.js:** A 3D graphics library.
*   **React:** A JavaScript library for building user interfaces.

## Building and Running

To get the project up and running, follow these steps:

1.  **Install dependencies:**
    ```bash
    yarn
    ```

2.  **Start the development server:**
    ```bash
    yarn dev
    ```
    This will start a local development server and open the game in your browser.

3.  **Build for production:**
    ```bash
    yarn build
    ```
    This will create a `dist` directory with the optimized production build of the game.

4.  **Preview the production build:**
    ```bash
    yarn preview
    ```
    This will start a local server to preview the production build.

## Development Conventions

*   **Component-based architecture:** The project follows a component-based architecture, with different parts of the game encapsulated in their own React components.
*   **State management:** The main application state (e.g., score) is managed in the `App.jsx` component and passed down to child components as props.
*   **Game logic:** The core game logic is implemented in the `Experience.jsx` component, which handles fish spawning, lure control, and collision detection.
*   **3D models:** The game uses 3D models in the `.glb` format, which are loaded using the `@react-three/drei` library.
*   **Styling:** Basic styling is provided in the `index.css` file.
