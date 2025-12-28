## 🛠️ Project Setup

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Clone the Repository

```bash
git clone [https://github.com/your_username/GDGCPlatformFrontend.git]
cd GDGCPlatformFrontend
cd client 
```

### 2. Install Dependencies

This project uses several key dependencies:
- **React 19.1.1** - Core framework
- **React Router DOM 7.9.3** - Navigation
- **Framer Motion 12.23.22** - Animations
- **GSAP 3.13.0** - Advanced animations for Easter egg feature
- **lottie-react 2.4.1** - Lottie animation player
- **Tailwind CSS 3.4.18** - Styling
- **Vite 7.1.7** - Build tool
- **Axios 1.12.2** - HTTP client

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## ✨ Key Features

### Intro Animation
- Beautiful Lottie-based intro animation on homepage
- Plays once per session (uses sessionStorage)
- To replay: `sessionStorage.removeItem('gdgcIntroShown')` in browser console

### Easter Egg
- Triple-click the GDGC logo on homepage to reveal site developers
- Interactive ChromaGrid with GSAP-powered animations
- Mouse-tracking spotlight effects

### Animations
- Smooth scroll-driven navbar animations
- Fade-in effects for homepage sections
- Framer Motion-powered interactions
- GSAP-powered ChromaGrid effects

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
client/
├── public/
│   ├── gdgc.json          # Lottie intro animation
│   └── vite.svg
├── src/
│   ├── assets/
│   │   ├── coreteam/      # Team member photos
│   │   └── gdgc.json      # Lottie animation source
│   ├── components/
│   │   ├── common/        # Reusable components
│   │   ├── layout/        # Navbar, Footer
│   │   └── sections/      # Hero, CoreTeam
│   ├── pages/             # Route pages
│   ├── services/          # API services
│   └── utils/             # Helper functions
└── package.json
```

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration (includes Lottie support)
- `tailwind.config.js` - Tailwind CSS configuration
- `eslint.config.js` - ESLint rules
- `postcss.config.cjs` - PostCSS configuration

For detailed setup instructions, see [setup.md](./setup.md)