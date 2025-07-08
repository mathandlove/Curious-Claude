# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite project using modern ESM modules. The project follows the standard Vite React template structure with TypeScript support.

## Development Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

## Project Structure

- `src/` - Source code directory
  - `main.tsx` - Application entry point with React.StrictMode
  - `App.tsx` - Main App component
  - `assets/` - Static assets (images, etc.)
  - `*.css` - Component and global styles
- `public/` - Public assets served directly
- `index.html` - HTML template with root div

## Build Configuration

- **Vite**: Uses `@vitejs/plugin-react` for Fast Refresh
- **TypeScript**: Configured with strict mode, bundler module resolution, and React JSX transform
- **ESLint**: Uses TypeScript ESLint with React hooks and React refresh plugins
- **Target**: ES2022 with DOM libraries

## Architecture Notes

- Uses React 19 with TypeScript 5.8
- ESM modules with `"type": "module"` in package.json
- Strict TypeScript configuration with unused variable checking
- Component-based architecture with CSS modules support
- Vite handles bundling and development server