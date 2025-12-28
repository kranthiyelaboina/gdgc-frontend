// This is a temporary file containing the Study Jams tab replacement code
// Copy the content from line 762 onwards in AdminDashboardPage.jsx

{/* Study Jams Tab */}
{activeTab === 'studyjams' && (
  <div>
    {/* Action Buttons */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
      gap: '20px', 
      marginBottom: '32px' 
    }}>
      {/* Enroll Participants */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(52, 168, 83, 0.1) 100%)',
        border: '2px dashed rgba(66, 133, 244, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setShowEnrollmentModal(true)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <FaFileUpload size={48} style={{ color: '#4285F4', marginBottom: '12px' }} />
        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Enroll Participants
        </h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px' }}>
          Upload CSV/XLSX with participant details
        </p>
        <span style={{
          padding: '8px 16px',
          background: '#4285F4',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          Choose File
        </span>
      </div>

      {/* Update Progress */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(52, 168, 83, 0.1) 0%, rgba(251, 188, 4, 0.1) 100%)',
        border: '2px dashed rgba(52, 168, 83, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setShowProgressModal(true)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <GiProgression size={48} style={{ color: '#34A853', marginBottom: '12px' }} />
        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Update Progress
        </h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px' }}>
          Upload progress report CSV/XLSX
        </p>
        <span style={{
          padding: '8px 16px',
          background: '#34A853',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          Choose File
        </span>
      </div>

      {/* View Participants */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(251, 188, 4, 0.1) 0%, rgba(234, 67, 53, 0.1) 100%)',
        border: '2px dashed rgba(251, 188, 4, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onClick={() => setShowParticipantsModal(true)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <FaUsers size={48} style={{ color: '#FBBC04', marginBottom: '12px' }} />
        <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          View Participants
        </h4>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '16px' }}>
          Manage {stats.totalParticipants} participants in {stats.totalTeams} teams
        </p>
        <span style={{
          padding: '8px 16px',
          background: '#FBBC04',
          color: 'white',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'inline-block'
        }}>
          View All
        </span>
      </div>
    </div>

    {/* Teams Overview */}
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h4 style={{ color: 'white', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
        Teams Overview
      </h4>
      {participants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255, 255, 255, 0.6)' }}>
          <GiProgression size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '16px' }}>No teams enrolled yet</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>Upload a participant enrollment file to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {participants.slice(0, 5).map((team, idx) => (
            <div key={idx} style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto auto',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${['#4285F4', '#34A853', '#FBBC04', '#EA4335'][idx % 4]}, ${['#1a73e8', '#2d8f47', '#f9ab00', '#c5221f'][idx % 4]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                color: 'white'
              }}>
                #{team.teamRank || idx + 1}
              </div>
              <div>
                <h5 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  Team {team.team}
                </h5>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                  {team.memberCount} members • Lead: {team.lead?.userName || 'N/A'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#4285F4', fontSize: '20px', fontWeight: 700 }}>
                  {team.totalScore || 0}
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Total Score
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#34A853', fontWeight: 700 }}>{team.totalSkillBadges || 0}</div>
                  <div>Badges</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FBBC04', fontWeight: 700 }}>{team.totalArcadeGames || 0}</div>
                  <div>Games</div>
                </div>
              </div>
            </div>
          ))}
          {participants.length > 5 && (
            <button
              onClick={() => setShowParticipantsModal(true)}
              style={{
                padding: '12px',
                background: 'rgba(66, 133, 244, 0.1)',
                border: '1px solid rgba(66, 133, 244, 0.3)',
                borderRadius: '10px',
                color: '#4285F4',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(66, 133, 244, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(66, 133, 244, 0.1)'}
            >
              View All {participants.length} Teams →
            </button>
          )}
        </div>
      )}
    </div>

    {/* Documentation */}
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <h4 style={{ color: 'white', fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
        📋 File Format Requirements
      </h4>
      <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#4285F4', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Enrollment File (.csv or .xlsx)
          </h5>
          <p style={{ marginBottom: '8px' }}>Must include: userName, userEmail, team, isLead, skillBadgesCompleted, arcadeGamesCompleted</p>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#34A853', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            Progress Report File (.csv or .xlsx)
          </h5>
          <p style={{ marginBottom: '8px' }}>Must include: User Name, Total Skill Badges Completed, Total Arcade Games Completed</p>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
            ℹ️ This updates existing participants only - won't create new ones
          </p>
        </div>
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: 'rgba(251, 188, 4, 0.1)', 
          borderRadius: '12px',
          borderLeft: '4px solid #FBBC04'
        }}>
          <p style={{ margin: 0, fontSize: '13px' }}>
            <strong style={{ color: '#FBBC04' }}>⚠️ Important:</strong> Files can be either CSV or XLSX format. Make sure column names match exactly.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
