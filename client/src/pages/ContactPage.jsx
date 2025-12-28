import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageBackground from '../components/common/PageBackground';
import { FaWhatsapp, FaInstagram, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { FaPaperPlane } from 'react-icons/fa';
import { WHATSAPP_COMMUNITY_URL } from '../utils/constants';
import { Logo } from '../assets';

const ContactPage = () => {
  const socialLinks = [
    {
      icon: FaWhatsapp,
      name: 'WhatsApp',
      url: WHATSAPP_COMMUNITY_URL,
      color: '#25d366',
      bgColor: '#25d366',
    },
    {
      isImage: true,
      name: 'Join Us',
      url: 'https://gdg.community.dev/gdg-on-campus-institute-of-aeronautical-engineering-hyderabad-india/',
      color: '#4285f4',
      bgColor: '#FFFFFF',
    },
    {
      icon: FaInstagram,
      name: 'Instagram',
      url: 'https://instagram.com/gdgciare',
      color: '#E4405F',
      bgColor: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 75%, #8134af 100%)',
    },
    {
      icon: FaLinkedin,
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/gdgciare/',
      color: '#0077b5',
      bgColor: '#0077b5',
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <PageBackground animationsReady={true} />
      <Navbar />
      <main
        style={{
          width: '100%',
          padding: '120px 60px 60px',
          position: 'relative',
          zIndex: 1,
        }}
        className="contact-main"
      >
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 800,
            textAlign: 'center',
            color: '#1a1a1a',
            marginBottom: '24px',
          }}
          className="contact-title"
        >
          Get In Touch
        </h1>

        <p
          style={{
            fontSize: '20px',
            color: '#666666',
            textAlign: 'center',
            marginBottom: '48px',
          }}
          className="contact-subtitle"
        >
          Join our community and stay connected
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '70px',
            flexWrap: 'wrap',
          }}
          className="social-links-container"
        >
          {socialLinks.map((link, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  border: 'none',
                  padding: link.isImage ? '4px' : '0',
                  background: link.isImage ? 'linear-gradient(90deg, #4285f4 0%, #34a853 25%, #f9ab00 50%, #ea4335 75%, #4285f4 100%)' : 'transparent',
                  backgroundSize: link.isImage ? '300% 100%' : 'auto',
                  animation: link.isImage ? 'shimmer 4s linear infinite' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.18) rotate(5deg)';
                  e.currentTarget.style.boxShadow = link.isImage ? '0 0 0 4px #fff, 0 20px 50px rgba(66, 133, 244, 0.5)' : `0 0 0 4px #fff, 0 20px 50px ${link.color}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                aria-label={`Contact us on ${link.name}`}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: link.isImage ? '4px' : 0,
                    borderRadius: '50%',
                    background: link.isImage ? '#FFFFFF' : link.bgColor,
                    zIndex: 0,
                  }}
                />
                {link.isImage ? (
                  <img
                    src={Logo}
                    alt="GDGC Platform"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                ) : (
                  <link.icon
                    size={44}
                    color="white"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                )}
              </a>

              <span
                style={{
                  marginTop: '20px',
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#444444',
                  transition: 'color 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = link.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#444444';
                }}
              >
                {link.name}
              </span>
            </div>
          ))}
        </div>
      </main>
      
      <section
        aria-label="Send Direct Messages"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '60px 40px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 'min(100%, 720px)',
            padding: '5px',
            borderRadius: 24,
            background: 'linear-gradient(90deg, #4285f4 0%, #34a853 25%, #f9ab00 50%, #ea4335 75%, #4285f4 100%)',
            backgroundSize: '300% 100%',
            animation: 'shimmer 4s linear infinite',
            boxShadow: '0 8px 40px rgba(66, 133, 244, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 48px rgba(66, 133, 244, 0.25), 0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 40px rgba(66, 133, 244, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 20,
              padding: '56px 52px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              position: 'relative',
            }}
          >
          <h2
            style={{
              fontSize: 28,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              margin: '0 0 12px',
              color: '#1a1a1a',
              letterSpacing: 0.5,
            }}
          >
            <FaPaperPlane size={26} style={{ color: '#4285f4' }} />
            Send Direct Message
          </h2>
          <p
            style={{
              fontSize: 15,
              color: '#666666',
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Get in touch with us directly. We'll respond as soon as possible.
          </p>

          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              const fullName = e.target.fullName.value;
              const email = e.target.email.value;
              const subject = e.target.subject.value;
              const message = e.target.message.value;
              window.location.href = `mailto:gdgc@iare.ac.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                `Name: ${fullName}\nEmail: ${email}\n\n${message}`
              )}`;
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <input
              id="fullName"
              name="fullName"
              placeholder="Full Name"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                border: '3px solid #ea4335',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: 16,
                fontWeight: 500,
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ea4335';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(234, 67, 53, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email Address"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                border: '3px solid #f9ab00',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: 16,
                fontWeight: 500,
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f9ab00';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(249, 171, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <input
              id="subject"
              name="subject"
              placeholder="Subject Line"
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                border: '3px solid #34a853',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: 16,
                fontWeight: 500,
                transition: 'all 0.3s ease',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#34a853';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(52, 168, 83, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <textarea
              id="message"
              name="message"
              placeholder="Your Message"
              rows={5}
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                border: '3px solid #4285f4',
                background: '#ffffff',
                color: '#1a1a1a',
                fontSize: 16,
                fontWeight: 500,
                resize: 'vertical',
                transition: 'all 0.3s ease',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#4285f4';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(66, 133, 244, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              required
            />
            <button
              type="submit"
              aria-label="Send Message"
              style={{
                background: 'linear-gradient(135deg, #4285f4 0%, #2563eb 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '16px 32px',
                fontSize: 17,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginTop: 12,
                boxShadow: '0 4px 16px rgba(66, 133, 244, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(66, 133, 244, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(66, 133, 244, 0.3)';
              }}
            >
              <FaPaperPlane size={18} style={{ marginRight: 10 }} />
              Send Message
            </button>
          </form>
          </div>
        </div>
      </section>
      <Footer />

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @media (max-width: 1024px) {
          main {
            padding: 120px 40px 60px !important;
          }
        }

        @media (max-width: 768px) {
          main {
            padding: 100px 24px 40px !important;
          }
          h1 {
            font-size: 36px !important;
            margin-bottom: 16px !important;
          }
          p {
            font-size: 16px !important;
            margin-bottom: 32px !important;
            padding: 0 20px;
          }
          .social-links-container {
            gap: 40px !important;
            max-width: 500px;
            margin: 0 auto;
          }
          section[aria-label="Send Direct Messages"] {
            padding: 60px 24px !important;
          }
          section[aria-label="Send Direct Messages"] h2 {
            font-size: 32px !important;
          }
          section[aria-label="Send Direct Messages"] > div {
            max-width: 100% !important;
          }
          section[aria-label="Send Direct Messages"] > div > div {
            padding: 40px 28px !important;
          }
          section[aria-label="Send Direct Messages"] input,
          section[aria-label="Send Direct Messages"] textarea {
            font-size: 15px !important;
          }
          section[aria-label="Send Direct Messages"] button {
            font-size: 15px !important;
            padding: 14px 28px !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 100px 20px 32px !important;
          }
          h1 {
            font-size: 28px !important;
          }
          p {
            font-size: 14px !important;
          }
          .social-links-container {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 32px 24px !important;
            max-width: 360px;
            margin: 0 auto;
          }
          a[style*="width: 120px"] {
            width: 100px !important;
            height: 100px !important;
          }
          a[style*="width: 120px"] img {
            width: 80px !important;
            height: 80px !important;
          }
          a[style*="width: 120px"] svg {
            width: 36px !important;
            height: 36px !important;
          }
          section[aria-label="Send Direct Messages"] {
            padding: 40px 20px !important;
          }
          section[aria-label="Send Direct Messages"] h2 {
            font-size: 24px !important;
          }
          section[aria-label="Send Direct Messages"] > div > div {
            padding: 24px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
