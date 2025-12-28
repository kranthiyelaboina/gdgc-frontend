# GDGC IARE Platform - Frontend Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Project Structure](#project-structure)
5. [Environment Configuration](#environment-configuration)
6. [Running the Application](#running-the-application)
7. [Building for Production](#building-for-production)
8. [Available Scripts](#available-scripts)
9. [Dependencies Overview](#dependencies-overview)
10. [Troubleshooting](#troubleshooting)
11. [API Integration](#api-integration)
12. [Development Guidelines](#development-guidelines)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher) or **yarn** (version 1.22.0 or higher)
- **Git** (for version control)
- A modern web browser (Chrome, Firefox, Safari, or Edge - latest version)
- A code editor (VS Code recommended)

### Checking Installed Versions

Open your terminal and run the following commands to verify installations:

```bash
node --version
npm --version
git --version
```

If any of these commands fail, you need to install the respective software.

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB minimum, 8 GB recommended
- **Disk Space**: 500 MB free space for node_modules
- **Internet Connection**: Required for initial setup and package installation

### Recommended Development Environment
- **RAM**: 8 GB or more
- **CPU**: Multi-core processor
- **Display**: 1920x1080 resolution or higher

---

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-organization/GDGCPlatformFrontend.git
cd GDGCPlatformFrontend/GDGC/client
```

### Step 2: Install Node.js Dependencies

Navigate to the client directory and install all required packages:

```bash
npm install
```

This command will:
- Read the `package.json` file
- Download and install all dependencies listed
- Create a `node_modules` directory
- Generate or update `package-lock.json`

**Installation Time**: Approximately 2-5 minutes depending on your internet speed.

### Step 3: Verify Installation

After installation completes, verify that all packages are installed correctly:

```bash
npm list --depth=0
```

You should see a list of all installed packages without errors.

---

## Project Structure

```
client/
├── public/                 # Static assets
│   ├── gdgc.json          # Lottie animation data
│   ├── gdgc.lottie        # Lottie animation file
│   └── vite.svg           # Favicon and public images
├── src/                   # Source code
│   ├── assets/           # Images, SVGs, and static files
│   │   ├── logo.png
│   │   ├── left.svg
│   │   ├── right.svg
│   │   ├── gdgc.json     # Lottie animation source
│   │   └── coreteam/     # Team member images
│   ├── components/       # Reusable React components
│   │   ├── common/      # Generic components (Button, Input, LottieIntro, etc.)
│   │   ├── layout/      # Layout components (Navbar, Footer)
│   │   └── sections/    # Page sections (Hero, CoreTeam, etc.)
│   ├── context/         # React Context API providers
│   ├── hooks/           # Custom React hooks
│   ├── mockData/        # Mock data for development
│   ├── pages/           # Page components
│   ├── services/        # API service layer
│   ├── styles/          # Global styles and themes
│   ├── utils/           # Utility functions and helpers
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global CSS
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── eslint.config.js     # ESLint configuration
├── index.html           # HTML template
├── package.json         # Project dependencies and scripts
├── postcss.config.cjs   # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── vite.config.js       # Vite build configuration
```

---

## Environment Configuration

### Step 1: Create Environment File

Create a `.env` file in the `client` directory:

```bash
touch .env
```

### Step 2: Configure Environment Variables

Add the following variables to your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Important Notes**:
- All Vite environment variables must be prefixed with `VITE_`
- Do not commit `.env` file to version control
- Create `.env.example` for team reference

### Available Environment Variables

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| VITE_API_BASE_URL | Backend API base URL | http://localhost:3000/api | Yes |

---

## Running the Application

### Development Mode

Start the development server with hot module replacement:

```bash
npm run dev
```

**What happens**:
1. Vite starts the development server
2. Application becomes available at `http://localhost:5173`
3. Hot Module Replacement (HMR) is enabled
4. Browser automatically opens (optional)

**Console Output**:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Accessing the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

### Stopping the Server

Press `Ctrl + C` in the terminal to stop the development server.

---

## Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

**Build Process**:
1. Vite compiles and optimizes all source files
2. Creates minified JavaScript and CSS bundles
3. Generates optimized assets
4. Outputs to `dist/` directory

**Build Time**: Approximately 30-60 seconds

### Step 2: Preview Production Build

Test the production build locally:

```bash
npm run preview
```

The preview server will start at `http://localhost:4173`

### Build Output

The `dist/` directory will contain:
```
dist/
├── assets/          # Compiled JS, CSS, and media files
├── index.html       # Entry HTML file
└── vite.svg         # Static assets
```

---

## Available Scripts

### Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality checks |

### Running Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Lint
npm run lint
```

---

## Dependencies Overview

### Core Dependencies

#### React Ecosystem
- **react** (^19.1.1): Core React library
- **react-dom** (^19.1.1): React DOM rendering
- **react-router-dom** (^7.9.3): Client-side routing

#### HTTP Client
- **axios** (^1.12.2): Promise-based HTTP client for API calls

#### UI & Animation
- **framer-motion** (^12.23.22): Animation library for React
- **gsap** (^3.13.0): Professional-grade animation library for Easter egg feature
- **lottie-react** (^2.4.1): Lottie animation player for React
- **react-icons** (^5.5.0): Popular icon library
- **react-confetti** (^6.4.0): Confetti animation for celebrations

#### Utilities
- **date-fns** (^4.1.0): Modern date utility library
- **react-helmet** (^6.1.0): Document head manager for React

#### Image Processing & Export
- **html2canvas** (^1.4.1): Screenshot library for converting DOM elements to canvas/image
- **html-to-image** (^1.11.13): Alternative library for DOM to image conversion

#### Styling
- **tailwindcss** (^3.4.18): Utility-first CSS framework
- **postcss** (^8.5.6): CSS transformation tool
- **autoprefixer** (^10.4.21): CSS vendor prefixing

### Development Dependencies

- **vite** (^7.1.7): Next-generation frontend build tool
- **eslint** (^9.36.0): JavaScript linting utility
- **@vitejs/plugin-react** (^5.0.4): Official Vite plugin for React
- **@eslint/js** (^9.36.0): ESLint JavaScript rules
- **eslint-plugin-react-hooks** (^5.2.0): ESLint plugin for React hooks
- **eslint-plugin-react-refresh** (^0.4.22): ESLint plugin for React Fast Refresh
- **globals** (^16.4.0): Global identifiers for ESLint
- **@types/react** (^19.1.16): TypeScript definitions for React
- **@types/react-dom** (^19.1.9): TypeScript definitions for React DOM

### Dependency Installation Breakdown

Total package count: Approximately 300-400 packages (including sub-dependencies)
Total size: Approximately 200-300 MB

---

## Features

### Lottie Intro Animation

The application features a stunning Lottie-based intro animation on the homepage:

- **Technology**: lottie-react library for smooth JSON-based animations
- **Animation File**: `public/gdgc.json` (also available in `src/assets/gdgc.json`)
- **Behavior**: 
  - Plays once on first visit
  - 2-second animation with 0.8-second fade-out
  - Stored in sessionStorage to prevent replaying on navigation
  - Clear session storage to replay: `sessionStorage.removeItem('gdgcIntroShown')`

### Easter Egg - Developer Credits

Triple-click the GDGC logo on the homepage to unlock a hidden feature:

- **Technology**: GSAP (GreenSock Animation Platform) for advanced animations
- **Feature**: ChromaGrid component with interactive developer cards
- **Animations**:
  - Mouse-tracking spotlight effects with grayscale masks
  - GPU-accelerated transforms for smooth 60fps performance
  - Dynamic gradient backgrounds matching Google colors
- **Developers Featured**: Safwan (UI/UX), Kranthi (Frontend), Akshith (Backend), Azaruddin (Frontend)
- **Optimization**: Uses `requestAnimationFrame`, `will-change`, and memoized callbacks for lag-free experience

### Vite Configuration for Lottie

The `vite.config.js` includes custom configuration for Lottie files:

```javascript
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.lottie'],
})
```

This allows Vite to properly handle both `.lottie` and `.json` Lottie animation files.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Port Already in Use

**Error Message**:
```
Port 5173 is already in use
```

**Solution**:
1. Kill the process using port 5173:
   ```bash
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:5173 | xargs kill -9
   ```
2. Or use a different port:
   ```bash
   npm run dev -- --port 3000
   ```

#### Issue 2: Module Not Found

**Error Message**:
```
Cannot find module 'package-name'
```

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue 3: Build Errors

**Solution**:
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

#### Issue 4: ESLint Errors

**Solution**:
```bash
# Fix auto-fixable issues
npm run lint -- --fix
```

#### Issue 5: Environment Variables Not Working

**Solution**:
1. Ensure variable names start with `VITE_`
2. Restart development server after changing `.env`
3. Check `.env` file is in correct directory

---

## API Integration

### Backend Requirements

The frontend expects a backend API running at the URL specified in `VITE_API_BASE_URL`.

### API Endpoints Expected

#### Authentication
- POST `/api/auth/register` - Admin registration
- POST `/api/auth/login` - Admin login
- POST `/api/auth/logout` - Admin logout
- GET `/api/auth/me` - Get current admin
- POST `/api/auth/refresh-token` - Refresh JWT token

#### Events
- GET `/api/events` - Get all events
- GET `/api/events/:id` - Get event by ID
- POST `/api/events` - Create event (admin)
- PUT `/api/events/:id` - Update event (admin)
- DELETE `/api/events/:id` - Delete event (admin)

#### Quiz
- GET `/api/quiz/validate/:code` - Validate quiz code
- POST `/api/quiz/start` - Start quiz session
- GET `/api/quiz/:quizId/questions` - Get quiz questions
- POST `/api/quiz/submit` - Submit quiz answers

#### Leaderboard
- GET `/api/leaderboard` - Get leaderboard with pagination
- POST `/api/leaderboard/update` - Update points (admin)

#### Team
- GET `/api/team` - Get team members
- POST `/api/team` - Add team member (admin)

#### Contact
- POST `/api/contact` - Send contact message

### Mock Data Fallback

If the backend is not available, the application automatically uses mock data from `src/mockData/` directory.

---

## Development Guidelines

### Code Style

- Use functional components with React hooks
- Follow ESLint rules configured in `eslint.config.js`
- Use meaningful variable and function names
- Keep components small and focused

### File Naming Conventions

- Components: PascalCase (e.g., `Button.jsx`, `Navbar.jsx`)
- Utilities: camelCase (e.g., `helpers.js`, `validators.js`)
- Styles: kebab-case (e.g., `theme.css`)

### Git Workflow

1. Create feature branch from main
2. Make changes and commit regularly
3. Write descriptive commit messages
4. Create pull request for review
5. Merge after approval

### Best Practices

- Test components before committing
- Write clean, readable code
- Comment complex logic
- Handle errors gracefully
- Use TypeScript for better type safety (future enhancement)

---

## Additional Resources

### Documentation Links

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [GSAP Documentation](https://greensock.com/docs/)
- [Axios Documentation](https://axios-http.com)

### Project Information

- **Project Name**: GDGC IARE Platform
- **Version**: 1.0.0
- **License**: Proprietary
- **Team**: GDGC IARE Development Team

### Support

For technical issues or questions:
1. Check this documentation first
2. Review existing issues in the repository
3. Contact the development team
4. Create a new issue with detailed description

---

## License

Copyright 2025 GDGC IARE. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.
