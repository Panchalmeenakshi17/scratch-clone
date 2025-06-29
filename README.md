# Scratch Clone Pro

**Assignment Submission for Juspay Candidature**

A modern, responsive, interactive visual programming environment inspired by MIT Scratch, built with Next.js and featuring advanced collision detection with automatic action sequence swapping.

> **Note:** This project was developed as part of the technical assessment for Juspay's recruitment process, demonstrating proficiency in React, Next.js, and interactive web application development.

## Assignment Requirements & Compliance

This project fulfills all requirements specified in the Juspay technical assessment:

### Mandatory Features Implemented
- **Visual Programming Interface:** Complete drag-and-drop block-based programming environment
- **Motion Animations:** All required movement blocks (Move, Turn, Go to coordinates)
- **Looks Animations:** Speech and thought bubbles with customizable text and duration
- **Multiple Sprites Support:** Full functionality for creating and managing multiple animated characters
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices

### Bonus Feature: Collision Detection
- **Advanced Implementation:** Dynamic collision detection with automatic action sequence swapping
- **Real-time Feedback:** Visual and audio indicators for collision events
- **Performance Optimized:** Efficient collision detection using spatial partitioning

### Code Quality Standards
- **Clean Architecture:** Well-organized component structure with separation of concerns
- **Modern React Patterns:** Hooks, functional components, and state management
- **Performance Optimization:** Efficient rendering and animation handling
- **Cross-browser Compatibility:** Tested across modern browsers and devices

## Live Demo

- **Deployment:** [https://mit-scratchclone.vercel.app/](https://mit-scratchclone.vercel.app/)
- **GitHub Repository:** [https://github.com/Panchalmeenakshi17/scratch-clone](https://github.com/Panchalmeenakshi17/scratch-clone)
- **Screen Recording:** [View Demo](https://drive.google.com/file/d/1-jSatVd9RJBLDGzcQ0rBrv2fbqLY3P_D/view?usp=sharing)
- **Video Showcase:** [Watch Videos](https://drive.google.com/drive/folders/1D0bppNdXaGx3lLrbiZZYVoI8YY2jlGvs?usp=sharing)

## Overview

Scratch Clone Pro is an educational programming platform that allows users to create interactive animations using visual programming blocks. The application features a unique collision detection system where characters automatically swap their entire action sequences when they collide, creating dynamic and unpredictable animations. The project successfully implements all four challenge requirements outlined below, ensuring a robust and engaging user experience.

## Tech Stack

- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Drag & Drop:** React DnD
- **Deployment:** Vercel

## Key Features

### Core Functionality
- Visual programming interface with drag-and-drop blocks
- Real-time sprite animation and movement
- Pixel-perfect movement system (1 step = 1 pixel)
- Responsive design supporting mobile, tablet, and desktop
- Multiple animal characters with emoji representation

### Hero Feature: Collision Swapping
- Advanced collision detection system
- Automatic action sequence swapping when sprites collide
- Real-time collision feedback with visual indicators
- Cooldown system to prevent rapid repeated swaps

### Programming Blocks

**Movement Blocks:**
- Move __ steps
- Turn __ degrees
- Go to x: __ y: __
- Repeat animation (under Controls category)

**Speech Blocks:**
- Say __ for __ seconds
- Think __ for __ seconds

**Key Features:**
- **Customizable Parameters:** All blocks support user-defined values
- **Drag-and-Drop Functionality:** Fully implemented with Scratch-like behavior

### User Experience
- Instant execution mode for immediate feedback
- Batch execution for choreographed sequences
- Visual feedback with speech bubbles and animations
- Activity logging for debugging and learning
- Character naming and customization
- Play button to animate all sprites simultaneously

### Multiple Sprites Support
- Functionality to create and manage multiple sprites
- Each sprite supports all motion and looks animations
- Coordinated animation playback for all sprites via a play button

## Implemented Challenge Features

The following challenge requirements have been fully implemented in Scratch Clone Pro:

### 1. Motion Animations
**Implemented motion blocks:**
- **Move __ steps:** Moves the sprite by a specified number of steps (1 step = 1 pixel)
- **Turn __ degrees:** Rotates the sprite by a specified angle
- **Go to x: __ y: __:** Positions the sprite at specified coordinates
- **Repeat animation:** Loops the last two actions in the sequence, implemented under the Controls category

All animations are smoothly integrated with Framer Motion for fluid visuals.

### 2. Looks Animations
**Implemented looks blocks:**
- **Say __ for __ seconds:** Displays a speech bubble with customizable text for a specified duration
- **Think __ for __ seconds:** Displays a thought bubble with customizable text for a specified duration

Drag-and-drop functionality mirrors the Scratch app, ensuring intuitive block manipulation.

### 3. Multiple Sprites Support
- Users can create and manage multiple sprites within the playground
- All motion and looks animations are available for each sprite
- A play button triggers simultaneous animation of all sprites, ensuring synchronized playback

### 4. Hero Feature - Collision-Based Animation Swap
Implemented a dynamic collision detection system where sprites swap their entire action sequences upon collision.

**Example:**
- **Character 1:** [Move 10 steps, Repeat animation]
- **Character 2:** [Move -10 steps, Repeat animation]

**After collision:**
- **Character 1:** [Move -10 steps, Repeat animation]
- **Character 2:** [Move 10 steps, Repeat animation]

Includes visual and audio feedback with a cooldown mechanism to prevent rapid swaps.

## Installation & Setup

```bash
# Clone the repository
git clone https://github.com/Panchalmeenakshi17/scratch-clone.git

# Navigate to project directory
cd scratch-clone

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
src/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ActionQueue.js
│   ├── BlockPalette.js
│   ├── CodeArea.js
│   ├── LooksBlocks.js
│   ├── MotionBlocks.js
│   ├── PlaybackControls.js
│   ├── Sprite.js
│   ├── SpriteCanvas.js
│   ├── SpriteList.js
│   ├── SpriteManager.js
│   └── Stage.js
├── hooks/
│   └── useCollisionDetection.js
├── utils/
│   └── spriteActions.js
├── .gitignore
└── .eslintrc.json
```

## How It Works

### Action System
- Users drag programming blocks to create action sequences
- Each action has specific parameters (steps, degrees, text, duration)
- Actions execute sequentially with visual feedback
- Repeat blocks reference the last two actions in the sequence

### Collision Detection
- Continuous collision detection runs during animation
- When sprites collide, their complete action lists swap
- Visual and audio feedback indicates collision events
- Cooldown prevents rapid consecutive swaps

### Responsive Design
- **Mobile:** Stacked layout with touch-optimized controls
- **Tablet:** Hybrid layout with optimized spacing
- **Desktop:** Full three-column layout with maximum functionality

## Educational Value

- Introduces programming concepts (sequences, loops, conditionals)
- Teaches cause-and-effect relationships through the collision system
- Develops spatial reasoning and coordinate understanding
- Encourages experimentation and creative problem-solving

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile browsers on iOS and Android
- Touch and mouse input support

## Development Guidelines & Best Practices

### Code Standards
- **ESLint Configuration:** Strict linting rules enforced throughout the codebase
- **Component Architecture:** Modular, reusable components following React best practices
- **State Management:** Efficient state handling using React hooks and context
- **Error Handling:** Comprehensive error boundaries and graceful failure handling

### File Organization
- **Clear Structure:** Logical separation of components, hooks, and utilities
- **Naming Conventions:** Consistent and descriptive file and variable naming
- **Import Management:** Clean import statements and dependency organization

### Performance Considerations

- Optimized animation loops using requestAnimationFrame
- Efficient collision detection with spatial partitioning
- Memory management for sprite states and action queues
- Responsive image loading and caching
- Minimized re-renders through proper React optimization techniques

## Testing & Quality Assurance

### Manual Testing Performed
- **Functionality Testing:** All features tested across different scenarios
- **Responsive Testing:** Verified on multiple screen sizes and orientations
- **Browser Compatibility:** Tested on Chrome, Firefox, Safari, and Edge
- **Performance Testing:** Monitored for smooth animations and efficient resource usage

### Code Quality Measures
- **Clean Code Principles:** Readable, maintainable, and well-documented code
- **Component Reusability:** DRY principles applied throughout the application
- **Error Prevention:** Input validation and edge case handling

## Deployment & Production Readiness

### Vercel Deployment
- **Live Application:** Deployed and accessible via provided URL
- **Build Optimization:** Production-ready build with code splitting and optimization
- **Environment Configuration:** Proper setup for production environment

### Production Features
- **SEO Optimization:** Proper meta tags and semantic HTML structure
- **Performance Monitoring:** Optimized bundle size and loading times
- **Accessibility:** WCAG compliance for inclusive user experience

## Assignment Submission Details

### Technical Assessment Context
This project represents a comprehensive solution to the Juspay technical challenge, showcasing:
- **Full-stack Development Skills:** Modern React/Next.js development
- **Problem-solving Abilities:** Creative implementation of collision detection system
- **Code Quality:** Professional-grade code structure and organization
- **User Experience Design:** Intuitive and responsive interface design

### Key Differentiators
- **Unique Feature Implementation:** Collision-based animation swapping goes beyond basic requirements
- **Performance Focus:** Optimized for smooth user experience across devices
- **Educational Value:** Creates an engaging learning environment for programming concepts

## Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests through the GitHub repository.

**For Juspay Reviewers:** Please refer to the live demo and video showcase links for a comprehensive overview of the application's capabilities.

## Acknowledgments

Inspired by MIT Scratch and the visual programming education community. Built with modern web technologies to provide an accessible and engaging programming learning experience.