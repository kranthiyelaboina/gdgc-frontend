import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaGithub, FaWhatsapp, FaEnvelope, FaChevronRight, FaInstagram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { LeftBracket, RightBracket } from '../../assets';
import AnimatedText from '../common/AnimatedText';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setEmail('');
  };

  const quickLinks = [
    { name: 'Events', path: '/events' },
    { name: 'Quiz', path: '/quiz' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Community', path: 'https://chat.whatsapp.com/CXyC9ia93S39spQ1cX5h9g?mode=ems_wa_t', external: true },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <footer
        style={{
          background: '#1a1a1a',
          color: '#ffffff',
          padding: '100px 120px 40px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '80px',
            marginBottom: '80px',
          }}
          className="footer-grid"
        >
          <div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
              className="footer-about-section"
            >
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#f9ab00',
                  textAlign: 'center',
                }}
              >
                About GDGC IARE
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}
                className="footer-animated-text"
              >
                <img
                  src={LeftBracket}
                  alt=""
                  style={{
                    width: '48px',
                    height: 'auto',
                  }}
                  className="footer-bracket"
                />
                <AnimatedText />
                <img
                  src={RightBracket}
                  alt=""
                  style={{
                    width: '48px',
                    height: 'auto',
                  }}
                  className="footer-bracket"
                />
              </div>
            </div>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.8,
                color: '#cccccc',
                marginTop: '24px',
                textAlign: 'center',
              }}
            >
              Google Developer Group on Campus IARE is a community of students passionate about technology, learning, and building innovative solutions together.
            </p>
          </div>

          <div className="footer-quick-links">
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                marginBottom: '28px',
                color: '#f9ab00',
              }}
            >
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none' }}>
              {quickLinks.map((link) => (
                <li key={link.name} style={{ marginBottom: '14px' }}>
                  {link.external ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#cccccc',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        paddingLeft: '20px',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.paddingLeft = '24px';
                        const icon = e.currentTarget.querySelector('.chevron-icon');
                        if (icon) icon.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#cccccc';
                        e.currentTarget.style.paddingLeft = '20px';
                        const icon = e.currentTarget.querySelector('.chevron-icon');
                        if (icon) icon.style.opacity = '0';
                      }}
                    >
                      <FaChevronRight
                        className="chevron-icon"
                        style={{
                          position: 'absolute',
                          left: 0,
                          opacity: 0,
                          transition: 'all 0.3s ease',
                        }}
                        size={12}
                      />
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      style={{
                        color: '#cccccc',
                        fontSize: '16px',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        paddingLeft: '20px',
                        display: 'inline-block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.paddingLeft = '24px';
                        const icon = e.currentTarget.querySelector('.chevron-icon');
                        if (icon) icon.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#cccccc';
                        e.currentTarget.style.paddingLeft = '20px';
                        const icon = e.currentTarget.querySelector('.chevron-icon');
                        if (icon) icon.style.opacity = '0';
                      }}
                    >
                      <FaChevronRight
                        className="chevron-icon"
                        style={{
                          position: 'absolute',
                          left: 0,
                          opacity: 0,
                          transition: 'all 0.3s ease',
                        }}
                        size={12}
                      />
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              style={{
                fontSize: '22px',
                fontWeight: 700,
                marginBottom: '24px',
                color: '#f9ab00',
              }}
            >
              Join Our Community
            </h3>
            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.7,
                color: '#cccccc',
                marginBottom: '20px',
              }}
            >
              Connect with fellow developers and stay updated on events, workshops, and opportunities.
            </p>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => window.open('https://chat.whatsapp.com/CXyC9ia93S39spQ1cX5h9g?mode=ems_wa_t', '_blank')}
              style={{
                width: '100%',
                height: '54px',
                background: '#25d366',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                border: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1fa855';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(37, 211, 102, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#25d366';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <FaWhatsapp size={24} />
              Join WhatsApp Community
            </motion.button>
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                gap: '16px',
              }}
            >
              {[
                { icon: FaLinkedin, color: '#0077b5', link: 'https://www.linkedin.com/company/gdgciare/' },
                { icon: FaGithub, color: '#333333', link: 'https://github.com/safwanishere' },
                { icon: FaInstagram, color: '#e4405f', link: 'https://www.instagram.com/gdgc.iare?igsh=NTRkdTh5eTQ4M3dl' },
                { icon: FaEnvelope, color: '#ea4335', link: 'mailto:gdgc@iare.ac.in' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = social.color;
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label={`Visit our ${social.icon.name}`}
                >
                  <social.icon size={20} color="white" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr
          style={{
            height: '1px',
            background: '#333333',
            border: 'none',
            margin: '60px 0',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          className="footer-bottom"
        >
          <p style={{ fontSize: '15px', color: '#888888' }}>
            © 2025 GDGC IARE. All rights reserved.
          </p>
          <p style={{ fontSize: '15px', color: '#888888' }}>
            Team GDGC IARE '25
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          footer {
            padding: 80px 60px 40px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > div:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 768px) {
          footer {
            padding: 80px 40px 40px !important;
          }
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 50px !important;
          }
          .footer-quick-links {
            display: none !important;
          }
          .footer-animated-text {
            transform: scale(0.7) !important;
          }
          .footer-bracket {
            width: 32px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;
