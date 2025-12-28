import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaGamepad, FaStar, FaUsers, FaChartLine } from 'react-icons/fa';
import SpotlightCard from '../common/SpotlightCard';
import { getInitials, getAvatarColor } from '../../utils/helpers';

const ProgressBar = ({ percent, color = '#4285F4', height = '12px', animated = true, showLabel = true }) => {
  return (
    <div style={{ width: '100%' }}>
      <div 
        style={{ 
          width: '100%', 
          height, 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '100px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
      >
        <motion.div
          initial={animated ? { width: 0 } : { width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
            borderRadius: '100px',
            position: 'relative',
            boxShadow: `0 0 10px ${color}66`
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </motion.div>
      </div>
      {showLabel && (
        <div style={{ 
          marginTop: '6px', 
          fontSize: '13px', 
          fontWeight: 600, 
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'right'
        }}>
          {percent}%
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const TeamAvatar = ({ name, size = '40px', tooltip = true }) => {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  
  return (
    <div 
      title={tooltip ? name : ''}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: `calc(${size} * 0.4)`,
        boxShadow: `0 2px 8px ${color}44`,
        border: '2px solid rgba(255, 255, 255, 0.2)',
        cursor: tooltip ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      {initials}
    </div>
  );
};

const LeaderboardCard = ({ team, rank, maxPoints, onSelect, isSelected }) => {
  const progressPercent = maxPoints > 0 ? Math.round((team.avgPointsPerMember / maxPoints) * 100) : 0;
  
  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#4285F4';
  };
  
  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };
  
  const rankColor = getRankColor(rank);
  const leadMember = team.members.find(m => m.isLead);
  
  return (
    <SpotlightCard
      spotlightColor={isSelected ? 'rgba(66, 133, 244, 0.3)' : 'rgba(255, 255, 255, 0.25)'}
      className=""
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (rank % 5) * 0.05 }}
        onClick={() => onSelect(team)}
        style={{
          cursor: 'pointer',
          position: 'relative',
          padding: '28px',
          minHeight: '240px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Rank Badge */}
        <div className="rank-badge" style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '70px',
          height: '70px',
          background: `linear-gradient(135deg, ${rankColor} 0%, ${rankColor}dd 100%)`,
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 6px 20px ${rankColor}55`,
          border: '3px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}>
          <span className="rank-emoji" style={{ fontSize: '28px', marginBottom: '2px' }}>
            {getRankEmoji(rank)}
          </span>
          <span className="rank-number" style={{ 
            fontSize: '14px', 
            fontWeight: 800, 
            color: 'white',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}>
            #{rank}
          </span>
        </div>
        
        {/* Team Info */}
        <div>
          <h3 style={{ 
            color: 'white', 
            fontSize: '26px', 
            fontWeight: 900,
            marginBottom: '8px',
            paddingRight: '90px',
            background: 'linear-gradient(90deg, white 0%, rgba(255, 255, 255, 0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            {team.teamName}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.85)', 
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <FaUsers size={14} color="rgba(255, 255, 255, 0.9)" />
              {team.members.length} Members
            </span>
            {leadMember && (
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.85)', 
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <FaStar size={12} color="rgba(255, 255, 255, 0.9)" />
                Lead: {leadMember.name}
              </span>
            )}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <div style={{ 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 900, 
                color: 'white',
                marginBottom: '4px',
                lineHeight: 1
              }}>
                {team.avgPointsPerMember}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <FaTrophy size={10} color="rgba(255, 255, 255, 0.8)" /> Avg Points
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 900, 
                color: 'white',
                marginBottom: '4px',
                lineHeight: 1
              }}>
                {team.avgBadgesPerMember}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <FaMedal size={10} color="rgba(255, 255, 255, 0.8)" /> Avg Badges
              </div>
            </div>
            
            <div style={{ 
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '12px 8px',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: 900, 
                color: 'white',
                marginBottom: '4px',
                lineHeight: 1
              }}>
                {team.avgGamesPerMember}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <FaGamepad size={10} color="rgba(255, 255, 255, 0.8)" /> Avg Games
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Members Avatars */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontWeight: 600,
            marginRight: '8px'
          }}>
            Team:
          </span>
          {team.members.slice(0, 6).map((member, idx) => (
            <TeamAvatar key={idx} name={member.name} size="36px" />
          ))}
          {team.members.length > 6 && (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '12px',
              fontWeight: 700,
              border: '2px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0
            }}>
              +{team.members.length - 6}
            </div>
          )}
        </div>
      </motion.div>
    </SpotlightCard>
  );
};

const TeamDetailsPanel = ({ team, rank, maxPoints }) => {
  if (!team) {
    return (
      <SpotlightCard spotlightColor="rgba(66, 133, 244, 0.25)">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '400px'
        }}>
          <div>
            <FaChartLine size={64} style={{ color: '#4285F4', marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '8px'
            }}>
              Select a team to view details
            </h3>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px' 
            }}>
              Click on any team from the leaderboard
            </p>
          </div>
        </div>
      </SpotlightCard>
    );
  }
  
  const progressPercent = maxPoints > 0 ? Math.round((team.totalPoints / maxPoints) * 100) : 0;
  const topPerformer = team.members.reduce((max, member) => 
    member.points > max.points ? member : max
  , team.members[0]);
  
  return (
    <SpotlightCard spotlightColor="rgba(66, 133, 244, 0.25)">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          overflow: 'auto'
        }}
      >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ 
              color: 'white', 
              fontSize: '28px', 
              fontWeight: 800,
              marginBottom: '12px'
            }}>
              {team.teamName}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{
                padding: '8px 18px',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 800,
                border: '2px solid rgba(255, 255, 255, 0.3)',
                letterSpacing: '0.5px'
              }}>
                Rank #{rank || team.teamRank}
              </span>
              {(rank || team.teamRank) <= 3 && (
                <span style={{ fontSize: '32px' }}>
                  {(rank || team.teamRank) === 1 ? '🥇' : (rank || team.teamRank) === 2 ? '🥈' : '🥉'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <FaTrophy size={32} style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }} />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: 'white',
            marginBottom: '4px'
          }}>
            {team.avgPointsPerMember}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 600
          }}>
            Average Points
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <FaMedal size={32} style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }} />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: 'white',
            marginBottom: '4px'
          }}>
            {team.avgBadgesPerMember}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 600
          }}>
            Avg Badges
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}>
          <FaGamepad size={32} style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }} />
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: 'white',
            marginBottom: '4px'
          }}>
            {team.avgGamesPerMember}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 600
          }}>
            Avg Games
          </div>
        </div>
      </div>
      
      {/* Top Performer */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '32px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px'
        }}>
          <FaStar size={24} style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
          <h3 style={{ 
            color: 'white', 
            fontSize: '18px',
            fontWeight: 700
          }}>
            Top Performer
          </h3>
        </div>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <TeamAvatar name={topPerformer.name} size="56px" tooltip={false} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              color: 'white',
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '4px'
            }}>
              {topPerformer.name}
            </div>
            <div style={{ 
              display: 'flex',
              gap: '16px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              alignItems: 'center'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaTrophy size={12} color="rgba(255, 255, 255, 0.8)" /> {topPerformer.points} pts
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaMedal size={12} color="rgba(255, 255, 255, 0.8)" /> {topPerformer.badges} badges
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FaGamepad size={12} color="rgba(255, 255, 255, 0.8)" /> {topPerformer.arcadeGames} games
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Members */}
      <div>
        <h3 style={{ 
          color: 'white', 
          fontSize: '20px',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaUsers />
          Team Members ({team.members.length})
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {team.members
            .sort((a, b) => b.points - a.points)
            .map((member, idx) => (
            <div 
              key={idx}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <TeamAvatar name={member.name} size="48px" tooltip={false} />
              <div style={{ flex: 1 }}>
                <div style={{ 
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '4px'
                }}>
                  {member.name}
                </div>
                <div style={{ 
                  display: 'flex',
                  gap: '12px',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  alignItems: 'center'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaTrophy size={10} color="rgba(255, 255, 255, 0.7)" /> {member.points}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaMedal size={10} color="rgba(255, 255, 255, 0.7)" /> {member.badges}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FaGamepad size={10} color="rgba(255, 255, 255, 0.7)" /> {member.arcadeGames}
                  </span>
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.12)',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Last Updated */}
      <div style={{ 
        marginTop: '24px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: '13px'
      }}>
        Last updated: {new Date(team.lastUpdated).toLocaleString()}
      </div>
    </motion.div>
    </SpotlightCard>
  );
};

export { ProgressBar, TeamAvatar, LeaderboardCard, TeamDetailsPanel };
