# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the frontend website for Six Degrees of Wikipedia, a React/TypeScript application that finds the shortest path between any two Wikipedia pages through their hyperlinks. The website uses Vite as the build tool and connects to a Python Flask backend API.

## Common Development Commands

### Development Server
```bash
# Start development server (runs on port 3000)
npm start

# Start with explicit port
npm run start -- --port 3000
```

### Building and Testing
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Type checking (TypeScript compilation)
npx tsc --noEmit
```

### Code Quality
```bash
# Run linting (Prettier + ESLint)
npm run lint

# Auto-format code
npm run format

# Analyze bundle size
npm run analyze
```

### Dependency Management
```bash
# Update dependencies (excludes react-router-dom)
npm run update-deps

# Install dependencies
npm install
```

## Architecture Overview

### Core Application Structure
- **Single Page Application**: Uses React Router for client-side routing
- **Component-based**: Organized into logical component groups under `src/components/`
- **TypeScript**: Strict type checking with comprehensive type definitions
- **Styled Components**: CSS-in-JS styling with theme-based design system

### Key Architectural Patterns

#### API Integration
- **Centralized API**: Single `api.ts` file handles all backend communication
- **Environment-aware**: Automatically switches between dev (localhost:5000) and production APIs
- **Error Handling**: Comprehensive error handling with user-friendly messages

#### State Management
- **React Hooks**: Uses `useState` and `useCallback` for local component state
- **URL State**: Search parameters synchronized with browser URL for shareability
- **No Global State**: Simple prop drilling for the relatively small application

#### Component Organization
```
src/components/
├── common/          # Reusable components (Button, Logo, etc.)
├── charts/          # Data visualization components
├── blog/            # Blog-related components and posts
└── [feature]        # Feature-specific components (Results, PageInput, etc.)
```

### Data Flow
1. User inputs source and target Wikipedia page titles
2. Frontend calls `/paths` API endpoint with POST request
3. Backend performs breadth-first search on Wikipedia link graph
4. Results displayed as both list and interactive D3.js graph visualization
5. URL updates to reflect search for shareability

### Performance Considerations
- **Code Splitting**: Blog components are lazy-loaded
- **Bundle Analysis**: Built-in bundle analyzer for optimization
- **Responsive Design**: Mobile-first responsive layout

## Development Environment

### Local Backend Dependency
The frontend expects a Flask backend running on `localhost:5000` in development mode. To start the full local environment:

1. **Backend Setup** (from repo root):
```bash
source env/bin/activate
cd sdow/
export FLASK_APP=server.py FLASK_DEBUG=1
flask run
```

2. **Frontend Setup** (from website directory):
```bash
npm start
```

### Environment Configuration
- **Development**: API calls go to `http://127.0.0.1:5000`
- **Production**: API calls go to `https://api.sixdegreesofwikipedia.com`
- Environment determined by `process.env.NODE_ENV`

## Key Files and Patterns

### Type Definitions (`src/types.ts`)
Central location for all TypeScript interfaces, particularly:
- `WikipediaPage`: Core page data structure
- `ShortestPathsApiResponse`: API response format
- Component prop types

### API Layer (`src/api.ts`)
- Single source for all backend communication
- Handles error cases and response transformation
- Type-safe API calls with proper error handling

### Theme System (`src/resources/theme.json`)
- Centralized design tokens for colors, fonts, spacing
- Used throughout styled-components for consistent theming
- Responsive breakpoints defined at 600px and 1200px

### Component Patterns
- **Functional Components**: All components use React hooks
- **Styled Components**: CSS-in-JS with theme integration
- **TypeScript Interfaces**: Strict typing for all component props
- **Error Boundaries**: Graceful error handling with user-friendly messages

## Firebase Deployment

The project uses Firebase Hosting with two environments:
- **Production**: `sdow-prod`
- **Staging**: `sdow-staging`

Firebase configuration managed through `.firebaserc`.
