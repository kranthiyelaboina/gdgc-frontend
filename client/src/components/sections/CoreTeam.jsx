import safwanImg from '../../assets/coreteam/safwan.png';
import kranthiImg from '../../assets/coreteam/kranthi.jpg';
import azaruddinImg from '../../assets/coreteam/Azaruddin.png';
import akshithImg from '../../assets/coreteam/akshith.jpg';
import keerthiImg from '../../assets/coreteam/keerthi.jpg';
import aashrithImg from '../../assets/coreteam/aashritha.png';
import geethikaImg from '../../assets/coreteam/geethika.png';
import sirimahalakshmiImg from '../../assets/coreteam/sirimahalakshmi.jpg';
import laasyaImg from '../../assets/coreteam/laasya.png';
import rexryanImg from '../../assets/coreteam/rexryan.jpg';
import deepikaImg from '../../assets/coreteam/deepika.png';
import rachikaImg from '../../assets/coreteam/rachika.png';
import sathvikaImg from '../../assets/coreteam/sathvika.jpg';
import lokeshImg from '../../assets/coreteam/lokesh.jpg';
import GlitchText from '../common/GlitchText';

const CoreTeam = () => {
  const teamMembers = [
    {
      name: 'Safwan',
      role: 'Campus Organizer',
      image: safwanImg,
      isOrganizer: true,
    },
    {
      name: 'Kranthi',
      role: 'Programming Lead',
      image: kranthiImg,
    },
    {
      name: 'Azaruddin',
      role: 'Programming Co-Lead',
      image: azaruddinImg,
    },
    {
      name: 'Akshith',
      role: 'Technical Lead',
      image: akshithImg,
    },
    {
      name: 'Keerthi',
      role: 'Technical Co-Lead',
      image: keerthiImg,
    },
    {
      name: 'Aashritha',
      role: 'Technical Co-Lead',
      image: aashrithImg,
    },
    {
      name: 'Geethika',
      role: 'Social Media Lead',
      image: geethikaImg,
    },
    {
      name: 'Siri Mahalakshmi',
      role: 'Social Media Co-Lead',
      image: sirimahalakshmiImg,
    },
    {
      name: 'Laasya',
      role: 'Social Media Co-Lead',
      image: laasyaImg,
    },
    {
      name: 'Rex Ryan',
      role: 'Design Lead',
      image: rexryanImg,
    },
    {
      name: 'Deepika',
      role: 'Design Co-Lead',
      image: deepikaImg,
    },
    {
      name: 'Rachika',
      role: 'Public Relation Lead',
      image: rachikaImg,
    },
    {
      name: 'Sathvika',
      role: 'Public Relation Co-Lead',
      image: sathvikaImg,
    },
    {
      name: 'Lokesh',
      role: 'Video Editing Lead',
      image: lokeshImg,
    }
  ];

  const TeamMemberCard = ({ member, isOrganizer }) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: isOrganizer ? '180px' : '140px',
          height: isOrganizer ? '180px' : '140px',
          borderRadius: '50%',
          padding: isOrganizer ? '6px' : '5px',
          background: isOrganizer 
            ? 'linear-gradient(135deg, #4285f4 0%, #34a853 25%, #f9ab00 50%, #ea4335 75%, #4285f4 100%)'
            : 'linear-gradient(90deg, #4285f4 0%, #34a853 25%, #f9ab00 50%, #ea4335 75%, #4285f4 100%)',
          backgroundSize: '300% 100%',
          animation: isOrganizer ? 'shimmer 3s linear infinite' : 'shimmer 4s linear infinite',
          boxShadow: isOrganizer 
            ? '0 12px 40px rgba(66, 133, 244, 0.4), 0 0 60px rgba(52, 168, 83, 0.3)'
            : '0 8px 24px rgba(66, 133, 244, 0.25)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = isOrganizer ? 'scale(1.15) rotate(8deg)' : 'scale(1.1) rotate(5deg)';
          e.currentTarget.style.boxShadow = isOrganizer 
            ? '0 16px 48px rgba(66, 133, 244, 0.5), 0 0 80px rgba(52, 168, 83, 0.4)'
            : '0 12px 32px rgba(66, 133, 244, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = isOrganizer 
            ? '0 12px 40px rgba(66, 133, 244, 0.4), 0 0 60px rgba(52, 168, 83, 0.3)'
            : '0 8px 24px rgba(66, 133, 244, 0.25)';
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: isOrganizer 
              ? 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
              : '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontSize: isOrganizer ? '64px' : '48px',
            fontWeight: '700',
            color: isOrganizer ? '#ea4335' : '#4285f4',
            border: isOrganizer ? '3px solid rgba(234, 67, 53, 0.1)' : 'none',
          }}
        >
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            member.name.charAt(0).toUpperCase()
          )}
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontSize: isOrganizer ? '26px' : '22px',
            fontWeight: isOrganizer ? '800' : '700',
            color: '#1a1a1a',
            marginBottom: '6px',
            letterSpacing: '0.3px',
          }}
          className={isOrganizer ? 'organizer-name' : ''}
        >
          {member.name}
        </h3>
        <p
          style={{
            fontSize: isOrganizer ? '16px' : '15px',
            fontWeight: isOrganizer ? '600' : '500',
            color: isOrganizer ? '#ea4335' : '#666666',
            lineHeight: '1.4',
          }}
          className={isOrganizer ? 'organizer-role' : ''}
        >
          {member.role}
        </p>
      </div>
    </div>
  );

  const campusOrganizer = teamMembers.slice(0, 1);
  const row1Left = teamMembers.slice(1, 3);
  const row1Right = teamMembers.slice(3, 6);
  const row2Left = teamMembers.slice(6, 9);
  const row2Right = teamMembers.slice(9, 11);
  const row3Left = teamMembers.slice(11, 13);
  const row3Right = [teamMembers[13]];

  return (
    <section
      style={{
        width: '100%',
        padding: '80px 60px 100px',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '60px' }}>
          <GlitchText className="glitch-heading">
            GDGC '25 Core Team
          </GlitchText>
        </div>

        <style>{`
          .glitch-heading {
            font-size: clamp(2rem, 8vw, 3rem) !important;
            color: #1a1a1a;
            white-space: nowrap;
          }

          @media (max-width: 768px) {
            .glitch-heading {
              font-size: clamp(2rem, 8.5vw, 2.8rem) !important;
            }
          }

          @media (max-width: 480px) {
            .glitch-heading {
              font-size: clamp(1.8rem, 7.5vw, 2.3rem) !important;
            }
          }

          @media (max-width: 380px) {
            .glitch-heading {
              font-size: clamp(1.6rem, 7vw, 2rem) !important;
            }
          }

          .organizer-role {
            white-space: nowrap;
          }

          .organizer-name {
          }

          @media (max-width: 768px) {
            .organizer-name {
              font-size: 22px !important;
            }

            .organizer-role {
              font-size: 14px !important;
            }
          }

          @media (max-width: 480px) {
            .organizer-name {
              font-size: 20px !important;
            }

            .organizer-role {
              font-size: 13px !important;
            }
          }

          @media (max-width: 380px) {
            .organizer-name {
              font-size: 18px !important;
            }

            .organizer-role {
              font-size: 12px !important;
            }
          }
        `}</style>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '60px',
          }}
        >
          {campusOrganizer.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={true} />
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            gap: '80px',
            marginBottom: '60px',
            alignItems: 'start',
          }}
          className="team-row-1"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              flexWrap: 'wrap',
            }}
          >
            {row1Left.map((member, index) => (
              <TeamMemberCard key={index} member={member} isOrganizer={false} />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              flexWrap: 'wrap',
            }}
          >
            {row1Right.map((member, index) => (
              <TeamMemberCard key={index} member={member} isOrganizer={false} />
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: '80px',
            marginBottom: '60px',
            alignItems: 'start',
          }}
          className="team-row-2"
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              flexWrap: 'wrap',
            }}
          >
            {row2Left.map((member, index) => (
              <TeamMemberCard key={index} member={member} isOrganizer={false} />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              flexWrap: 'wrap',
            }}
          >
            {row2Right.map((member, index) => (
              <TeamMemberCard key={index} member={member} isOrganizer={false} />
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '80px',
            flexWrap: 'wrap',
          }}
          className="team-row-3"
        >
          <div style={{ transform: 'translateX(-80px)' }}>
            <TeamMemberCard member={row3Left[0]} isOrganizer={false} />
          </div>
          <div style={{ transform: 'translateX(-80px)' }}>
            <TeamMemberCard member={row3Left[1]} isOrganizer={false} />
          </div>
          <div style={{ transform: 'translateX(80px)' }}>
            <TeamMemberCard member={row3Right[0]} isOrganizer={false} />
          </div>
        </div>

        <div className="mobile-programming-row" style={{ display: 'none' }}>
          {row1Left.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={false} />
          ))}
        </div>

        <div className="mobile-technical-row" style={{ display: 'none' }}>
          {row1Right.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={false} />
          ))}
        </div>

        <div className="mobile-socialmedia-row" style={{ display: 'none' }}>
          {row2Left.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={false} />
          ))}
        </div>

        <div className="mobile-design-video-row" style={{ display: 'none' }}>
          {row2Right.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={false} />
          ))}
          <TeamMemberCard member={teamMembers[13]} isOrganizer={false} />
        </div>

        <div className="mobile-pr-row" style={{ display: 'none' }}>
          {row3Left.map((member, index) => (
            <TeamMemberCard key={index} member={member} isOrganizer={false} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @media (max-width: 768px) {
          section {
            padding: 50px 20px 60px !important;
          }

          section > div > div:nth-child(3) {
            margin-bottom: 40px !important;
          }

          .team-row-1,
          .team-row-2,
          .team-row-3 {
            display: none !important;
          }

          .mobile-programming-row,
          .mobile-technical-row,
          .mobile-socialmedia-row,
          .mobile-design-video-row,
          .mobile-pr-row {
            display: grid !important;
          }

          .mobile-programming-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            margin-bottom: 35px !important;
            padding: 0 15px !important;
          }

          .mobile-programming-row > div > div:first-child {
            width: 130px !important;
            height: 130px !important;
          }

          .mobile-programming-row h3 {
            font-size: 18px !important;
          }

          .mobile-programming-row p {
            font-size: 13px !important;
          }

          .mobile-technical-row {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 35px !important;
            padding: 0 8px !important;
          }

          .mobile-technical-row > div > div:first-child {
            width: 105px !important;
            height: 105px !important;
          }

          .mobile-technical-row h3 {
            font-size: 15px !important;
          }

          .mobile-technical-row p {
            font-size: 11px !important;
          }

          .mobile-socialmedia-row {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 35px !important;
            padding: 0 8px !important;
          }

          .mobile-socialmedia-row > div > div:first-child {
            width: 105px !important;
            height: 105px !important;
          }

          .mobile-socialmedia-row h3 {
            font-size: 15px !important;
          }

          .mobile-socialmedia-row p {
            font-size: 11px !important;
          }

          .mobile-design-video-row {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px !important;
            margin-bottom: 35px !important;
            padding: 0 8px !important;
          }

          .mobile-design-video-row > div > div:first-child {
            width: 105px !important;
            height: 105px !important;
          }

          .mobile-design-video-row h3 {
            font-size: 15px !important;
          }

          .mobile-design-video-row p {
            font-size: 11px !important;
          }

          .mobile-pr-row {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 20px !important;
            padding: 0 15px !important;
          }

          .mobile-pr-row > div > div:first-child {
            width: 130px !important;
            height: 130px !important;
          }

          .mobile-pr-row h3 {
            font-size: 18px !important;
          }

          .mobile-pr-row p {
            font-size: 13px !important;
          }
        }

        @media (max-width: 480px) {
          section {
            padding: 40px 12px 50px !important;
          }

          .mobile-programming-row {
            gap: 15px !important;
            padding: 0 10px !important;
          }

          .mobile-programming-row > div > div:first-child {
            width: 115px !important;
            height: 115px !important;
          }

          .mobile-programming-row h3 {
            font-size: 16px !important;
          }

          .mobile-programming-row p {
            font-size: 12px !important;
          }

          .mobile-technical-row,
          .mobile-socialmedia-row,
          .mobile-design-video-row {
            gap: 8px !important;
            padding: 0 5px !important;
          }

          .mobile-technical-row > div > div:first-child,
          .mobile-socialmedia-row > div > div:first-child,
          .mobile-design-video-row > div > div:first-child {
            width: 95px !important;
            height: 95px !important;
          }

          .mobile-technical-row h3,
          .mobile-socialmedia-row h3,
          .mobile-design-video-row h3 {
            font-size: 14px !important;
          }

          .mobile-technical-row p,
          .mobile-socialmedia-row p,
          .mobile-design-video-row p {
            font-size: 10px !important;
          }

          .mobile-pr-row {
            gap: 15px !important;
            padding: 0 10px !important;
          }

          .mobile-pr-row > div > div:first-child {
            width: 115px !important;
            height: 115px !important;
          }

          .mobile-pr-row h3 {
            font-size: 16px !important;
          }

          .mobile-pr-row p {
            font-size: 12px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CoreTeam;
