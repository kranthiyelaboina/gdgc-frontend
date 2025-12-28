import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const CalendarButton = ({ animationsReady = true }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [eventCount, setEventCount] = useState(2);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const CALENDAR_ID = '3676fc1787c017ad0cf2eb589ad1bfc4c0541af722acc402bf9d2c4131b49ab6@group.calendar.google.com';
  const API_KEY = 'AIzaSyBNlYH01_9Hc5S1J9vuFmu2nxVMfRg4t2I';

  useEffect(() => {
    if (isCalendarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isCalendarOpen]);

  const openCalendar = () => {
    setIsCalendarOpen(true);
  };

  const closeCalendar = () => {
    setIsCalendarOpen(false);
  };

  return (
    <>
      {}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: animationsReady ? 1 : 0, 
          opacity: animationsReady ? 1 : 0 
        }}
        transition={{ delay: 1.3, duration: 0.5, type: 'spring', stiffness: 200 }}
        whileTap={{ scale: 0.9 }}
        onClick={openCalendar}
        className="calendar-bubble-btn"
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #f9ab00 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 998,
          border: 'none',
          boxShadow: '0 8px 32px rgba(234, 67, 53, 0.4), 0 0 0 0 rgba(234, 67, 53, 0.6)',
          animation: animationsReady ? 'pulse 2s infinite' : 'none',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 48px rgba(234, 67, 53, 0.6), 0 0 0 8px rgba(234, 67, 53, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(234, 67, 53, 0.4), 0 0 0 0 rgba(234, 67, 53, 0.6)';
        }}
        aria-label="Open Calendar"
      >
        <FaCalendarAlt size={28} color="white" />
        
        {}
        {!isLoadingEvents && eventCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 500, damping: 15 }}
            className="event-count-badge"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #ea4335 0%, #ff6b6b 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '800',
              color: 'white',
              padding: '0 6px',
              boxShadow: '0 4px 12px rgba(234, 67, 53, 0.5), 0 0 0 2px white',
              border: '2px solid white',
              zIndex: 1,
            }}
          >
            {eventCount > 99 ? '99+' : eventCount}
          </motion.div>
        )}
      </motion.button>

      {}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            {}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closeCalendar}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 9998,
              }}
            />

            {}
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px',
                pointerEvents: 'none',
              }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="calendar-modal-container"
                style={{
                  width: '100%',
                  maxWidth: '900px',
                  height: '80vh',
                  maxHeight: '700px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
                  pointerEvents: 'auto',
                  position: 'relative',
                  padding: '3px',
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 25%, #f9ab00 50%, #ea4335 75%, #4285f4 100%)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientRotate 6s ease infinite',
                }}
              >
                {}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '17px',
                    overflow: 'hidden',
                    background: 'white',
                    position: 'relative',
                  }}
                >
              {}
              <div
                className="calendar-header"
                style={{
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #f9ab00 100%)',
                  padding: '20px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <FaCalendarAlt size={28} color="white" />
                  <div>
                    <h2
                      style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: 'white',
                        margin: 0,
                        letterSpacing: '0.5px',
                      }}
                    >
                      GDGC Events Calendar
                    </h2>
                    <p
                      style={{
                        fontSize: '13px',
                        color: 'rgba(255, 255, 255, 0.9)',
                        margin: '4px 0 0 0',
                      }}
                    >
                      Stay updated with all our upcoming events
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={closeCalendar}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                  }}
                  aria-label="Close Calendar"
                >
                  <FaTimes size={20} color="white" />
                </motion.button>
              </div>

              {}
              <div
                className="calendar-iframe-container"
                style={{
                  width: '100%',
                  height: 'calc(100% - 96px)',
                  position: 'relative',
                  background: '#ffffff',
                }}
              >
                <iframe
                  src="https://calendar.google.com/calendar/embed?src=3676fc1787c017ad0cf2eb589ad1bfc4c0541af722acc402bf9d2c4131b49ab6%40group.calendar.google.com&ctz=Asia%2FKolkata"
                  style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    borderRadius: '0 0 17px 17px',
                  }}
                  title="GDGC Events Calendar"
                />
              </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 8px 32px rgba(234, 67, 53, 0.4), 0 0 0 0 rgba(234, 67, 53, 0.6);
          }
          50% {
            box-shadow: 0 8px 32px rgba(234, 67, 53, 0.4), 0 0 0 12px rgba(234, 67, 53, 0);
          }
          100% {
            box-shadow: 0 8px 32px rgba(234, 67, 53, 0.4), 0 0 0 0 rgba(234, 67, 53, 0);
          }
        }

        @keyframes gradientRotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @media (max-width: 1024px) {
          .calendar-bubble-btn {
            bottom: 32px !important;
            right: 32px !important;
            width: 60px !important;
            height: 60px !important;
          }
          .calendar-bubble-btn svg {
            width: 26px !important;
            height: 26px !important;
          }
          
          .event-count-badge {
            min-width: 22px !important;
            height: 22px !important;
            font-size: 11px !important;
            top: -3px !important;
            right: -3px !important;
          }
          
          .calendar-modal-container {
            max-width: 800px !important;
            height: 75vh !important;
            max-height: 650px !important;
          }
        }

        @media (max-width: 768px) {
          .calendar-bubble-btn {
            bottom: 24px !important;
            right: 24px !important;
            width: 56px !important;
            height: 56px !important;
          }
          .calendar-bubble-btn svg {
            width: 24px !important;
            height: 24px !important;
          }
          
          .event-count-badge {
            min-width: 20px !important;
            height: 20px !important;
            font-size: 10px !important;
            top: -2px !important;
            right: -2px !important;
            padding: 0 5px !important;
          }
          
          .calendar-modal-container {
            max-width: 95% !important;
            width: 95% !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            max-height: 95vh !important;
            margin: 0 10px !important;
          }

          .calendar-header {
            padding: 12px 16px !important;
          }

          .calendar-header h2 {
            font-size: 16px !important;
          }

          .calendar-header p {
            font-size: 10px !important;
          }

          .calendar-header svg {
            width: 20px !important;
            height: 20px !important;
          }

          .calendar-header button {
            width: 32px !important;
            height: 32px !important;
          }

          .calendar-header button svg {
            width: 16px !important;
            height: 16px !important;
          }

          .calendar-iframe-container {
            height: calc(100% - 58px) !important;
          }
        }

        @media (max-width: 600px) {
          .calendar-modal-container {
            max-width: 96% !important;
            width: 96% !important;
            aspect-ratio: 1 / 1 !important;
            max-height: 96vh !important;
            margin: 0 8px !important;
          }

          .calendar-header {
            padding: 10px 14px !important;
          }

          .calendar-header h2 {
            font-size: 14px !important;
          }

          .calendar-header p {
            font-size: 9px !important;
          }

          .calendar-header svg {
            width: 18px !important;
            height: 18px !important;
          }

          .calendar-iframe-container {
            height: calc(100% - 52px) !important;
          }
        }

        @media (max-width: 480px) {
          .calendar-bubble-btn {
            bottom: 20px !important;
            right: 20px !important;
            width: 52px !important;
            height: 52px !important;
          }
          .calendar-bubble-btn svg {
            width: 22px !important;
            height: 22px !important;
          }
          
          .event-count-badge {
            min-width: 18px !important;
            height: 18px !important;
            font-size: 9px !important;
            top: -2px !important;
            right: -2px !important;
            padding: 0 4px !important;
          }
          
          .calendar-modal-container {
            max-width: 98% !important;
            width: 98% !important;
            aspect-ratio: 1 / 1 !important;
            max-height: 98vh !important;
            margin: 0 4px !important;
            border-radius: 16px !important;
          }

          .calendar-header {
            padding: 8px 12px !important;
            gap: 10px !important;
          }

          .calendar-header > div {
            gap: 10px !important;
          }

          .calendar-header h2 {
            font-size: 13px !important;
            line-height: 1.2 !important;
          }

          .calendar-header p {
            font-size: 8px !important;
            margin-top: 2px !important;
          }

          .calendar-header svg {
            width: 16px !important;
            height: 16px !important;
          }

          .calendar-header button {
            width: 28px !important;
            height: 28px !important;
          }

          .calendar-header button svg {
            width: 14px !important;
            height: 14px !important;
          }

          .calendar-iframe-container {
            height: calc(100% - 46px) !important;
          }
        }
      `}</style>
    </>
  );
};

export default CalendarButton;
