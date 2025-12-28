

const PageBackground = ({ animationsReady = true }) => {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(120deg, #ffb3ba 0%, #ffffff 50%, #b3f5bc 100%)',
          backgroundSize: '200% 200%',
          animation: animationsReady ? 'gradientShift 15s ease infinite, fadeIn 0.8s ease-out' : 'gradientShift 15s ease infinite',
          zIndex: -3,
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          maxHeight: '300vh',
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 179, 186, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 80% 80%, rgba(179, 245, 188, 0.3) 0%, transparent 70%),
            radial-gradient(circle at 50% 10%, rgba(249, 171, 0, 0.2) 0%, transparent 70%)
          `,
          animation: animationsReady ? 'fadeIn 1s ease-out' : 'none',
          opacity: animationsReady ? 1 : 0,
          zIndex: -2,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          maxHeight: '300vh',
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          animation: animationsReady ? 'fadeIn 1.2s ease-out' : 'none',
          opacity: animationsReady ? 1 : 0,
          zIndex: -1,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, transparent 100%)',
          animation: animationsReady ? 'fadeIn 1s ease-out' : 'none',
          opacity: animationsReady ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default PageBackground;
