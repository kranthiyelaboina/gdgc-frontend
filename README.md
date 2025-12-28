# GDGC IARE Platform

A modern, production-ready React frontend application for the Google Developer Group on Campus (GDGC) at the Institute of Aeronautical Engineering. This platform serves as a comprehensive hub for college club activities, featuring event management, interactive quizzes, leaderboards, and community engagement tools.

## Features

### Core Functionality
- **Event Management**: Browse upcoming and past events with detailed information, filtering, and pagination
- **Interactive Quizzes**: Code-based quiz system with roll number verification
- **Leaderboard**: Real-time ranking system with search and pagination
- **Contact System**: Direct communication channel with the GDGC team
- **Admin Dashboard**: Secure admin authentication and management interface

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Modern UI**: Google Developer color palette with clean, professional design
- **API Integration**: Axios-based service layer with authentication
- **Route Protection**: Secure admin routes with JWT token management
- **Mock Data Support**: Development-ready with fallback mock data

## Technology Stack

### Frontend Framework
- **React 18.2+**: Modern React with hooks and functional components
- **Vite**: Lightning-fast build tool with Hot Module Replacement (HMR)

### Routing & State Management
- **React Router DOM v6.20+**: Client-side routing
- **Context API**: Global state management

### Styling & UI
- **Tailwind CSS 3.4+**: Utility-first CSS framework
- **Framer Motion 10.16+**: Animation library
- **React Icons 4.12+**: Comprehensive icon library
- **Custom CSS Variables**: Google Developer color theming

### HTTP & API
- **Axios 1.6+**: Promise-based HTTP client with interceptors
- **Date-fns 3.0+**: Modern date utility library

### Development Tools
- **ESLint**: Code quality and consistency
- **PostCSS & Autoprefixer**: CSS processing
- **Git**: Version control

## Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, SVGs, logos
│   ├── components/        
│   │   ├── common/        # Reusable UI components
│   │   ├── layout/        # Layout components (Navbar, Footer)
│   │   └── sections/      # Page sections (Hero, etc.)
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom React hooks
│   ├── mockData/          # Development mock data
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── styles/            # Global styles and themes
│   ├── utils/             # Helper functions and validators
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── index.css          # Global CSS with Tailwind
├── .env                   # Environment variables (not committed)
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── eslint.config.js       # ESLint configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 1.22.0
- Git
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/safwanishere/GDGCPlatformFrontend.git
   cd GDGCPlatformFrontend/GDGC/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your API base URL:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

## API Integration

The application expects a backend API with the following endpoints:

### Authentication
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh-token` - Refresh JWT token

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Quiz
- `GET /api/quiz/validate/:code` - Validate quiz code
- `POST /api/quiz/start` - Start quiz session
- `GET /api/quiz/:quizId/questions` - Get questions
- `POST /api/quiz/submit` - Submit answers

### Leaderboard
- `GET /api/leaderboard` - Get rankings
- `POST /api/leaderboard/update` - Update points (admin)

### Team
- `GET /api/team` - Get team members
- `POST /api/team` - Add member (admin)

### Contact
- `POST /api/contact` - Send message

## Design System

### Color Palette
- **Blue**: #4285f4 (Primary)
- **Green**: #34a853 (Success)
- **Yellow**: #f9ab00 (Accent)
- **Red**: #ea4335 (Error)

### Typography
- **Primary Font**: Inter
- **Secondary Font**: Poppins

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Development Guidelines

### Code Style
- Use functional components with React hooks
- Follow ESLint configuration
- Use meaningful variable and function names
- Keep components small and focused (Single Responsibility Principle)
- No comments in production code (self-documenting code)

### Component Structure
```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  const handleEvent = () => {
    // Event handler logic
  };

  return (
    <div className="component-class">
      {/* JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
};

export default ComponentName;
```

### File Naming
- Components: PascalCase (e.g., `Button.jsx`)
- Utilities: camelCase (e.g., `helpers.js`)
- Styles: kebab-case (e.g., `theme.css`)

## Building for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

The production build will be created in the `dist/` directory with:
- Minified JavaScript bundles
- Optimized CSS
- Compressed assets
- Source maps for debugging

## Deployment

### Recommended Platforms
- **Vercel**: Zero-config deployment for Vite apps
- **Netlify**: Continuous deployment from Git
- **GitHub Pages**: Free hosting for static sites
- **AWS S3 + CloudFront**: Scalable static hosting

### Environment Variables
Ensure all production environment variables are set:
- `VITE_API_BASE_URL`: Production API URL

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Module Not Found
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Documentation

For detailed setup instructions, see:
- [Setup Guide](client/setup.md) - Comprehensive installation and configuration
- [Requirements](client/requirements.txt) - System and package requirements

## Team

**GDGC IARE Development Team**

- Platform Development: Team GDGC IARE '25
- Design & UX: GDGC Design Team
- Project Lead: GDGC IARE

## Links

- **Instagram**: [GDGC IARE](https://www.instagram.com/gdgc.iare?igsh=NTRkdTh5eTQ4M3dl)
- **WhatsApp Community**: [Join Us](https://chat.whatsapp.com/CXyC9ia93S39spQ1cX5h9g?mode=ems_wa_t)
- **LinkedIn**: [GDGC IARE](https://www.linkedin.com/company/gdgc-iare)
- **GitHub**: [GDGC IARE](https://github.com/gdgc-iare)
- **Email**: gdgc@iare.ac.in .

## License

Copyright 2024 GDGC IARE. All rights reserved.

This project is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.

## Acknowledgments

- Google Developer Groups for inspiration and guidance
- Institute of Aeronautical Engineering for support
- Open source community for amazing tools and libraries
- All contributors and team members

---

Built with passion by GDGC IARE Development Team.
