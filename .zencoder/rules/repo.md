---
description: Repository Information Overview
alwaysApply: true
---

# StudyMaster Pro Information

## Summary
StudyMaster Pro is a React-based web application for study management with features including flashcards with spaced repetition, a Pomodoro timer, study logging, and brain blurts (quick notes). The application uses local storage for data persistence and includes a celebration system for achievements.

## Structure
- **src/**: Contains React application source code including components and Firebase configuration
- **public/**: Static assets and HTML template
- **node_modules/**: External dependencies (not tracked in repository)

## Language & Runtime
**Language**: JavaScript (React)
**Version**: React 19.1.0
**Build System**: Create React App (react-scripts 5.0.1)
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- react: ^19.1.0
- react-dom: ^19.1.0
- react-router-dom: ^7.7.0
- firebase: ^12.0.0
- lucide-react: ^0.525.0
- @testing-library/react: ^16.3.0
- @testing-library/jest-dom: ^6.6.3

**Development Dependencies**:
- tailwindcss: ^3.4.1
- postcss: ^8.4.38
- autoprefixer: ^10.4.19

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: No specific test files found, but testing libraries are configured
**Configuration**: Default Create React App test configuration
**Run Command**:
```bash
npm test
```

## Firebase Integration
The application is configured to use Firebase for potential backend services:
- Firebase Firestore for database
- Firebase Analytics for usage tracking
- Currently using localStorage as a fallback/offline storage mechanism

## UI Framework
**CSS Framework**: Tailwind CSS
**Configuration**: Standard configuration targeting all JS/JSX/TS/TSX files in src directory