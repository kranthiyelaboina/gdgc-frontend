import axios from 'axios';
import api from './api';

export const getStudyJamsData = async () => {
  try {
    console.log('📡 Fetching Study Jams data from backend...');
    const response = await api.get('/admin/participants', {
      transformRequest: [(data, headers) => {
        delete headers.Authorization;
        return data;
      }]
    });
    
    console.log('✅ Successfully fetched Study Jams data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching Study Jams data:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      throw new Error('Connection timeout. The server might be starting up. Please try again in a moment.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Study Jams data not found. Please contact admin to upload participant data.');
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Authentication error. Please contact the administrator.');
    }
    
    if (error.code === 'ERR_NETWORK' || !error.response) {
      throw new Error('Network error. Please check your internet connection or the server may be down.');
    }
    
    throw new Error(error.response?.data?.message || error.message || 'Failed to load Study Jams data');
  }
};

// Enroll new participants (admin only)
export const uploadEnrollmentFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('participantsFile', file);
    
    const response = await api.post('/admin/upload-study-jams', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading enrollment file:', error);
    throw error;
  }
};

// Update participant progress (admin only)
export const uploadProgressFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('participantsFile', file);
    
    const response = await api.post('/admin/update-progress', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading progress file:', error);
    throw error;
  }
};

// Delete a single participant (admin only)
export const deleteParticipant = async (email) => {
  try {
    const response = await api.delete(`/admin/participant/${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
};

// Delete all participants (admin only)
export const deleteAllParticipants = async () => {
  try {
    const response = await api.delete('/admin/participants/all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all participants:', error);
    throw error;
  }
};

// Team name mappings
const TEAM_NAMES = {
  '1': 'GDGC Alpha',
  '2': 'GDGC Beta',
  '3': 'GDGC Gamma',
  '4': 'GDGC Delta',
  '5': 'GDGC Epsilon',
  '6': 'GDGC Firebase',
  '7': 'GDGC Tensor',
  '8': 'GDGC Vertex',
  '9': 'GDGC Orbit',
  '10': 'GDGC Quantum',
  '11': 'GDGC Fusion',
  '12': 'GDGC Catalyst',
  '13': 'GDGC Horizon',
  '14': 'GDGC Nova',
  '15': 'GDGC Nimbus',
  '16': 'GDGC Aurora'
};

// Get team name by number
export const getTeamName = (teamNumber) => {
  return TEAM_NAMES[String(teamNumber)] || `Team ${teamNumber}`;
};

// Transform backend API data to frontend format
export const transformApiDataToTeams = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) {
    return [];
  }

  return apiData.map(teamData => {
    // Get totals from API
    const sumTotalPoints = teamData.totalScore || 0;
    const sumTotalBadges = teamData.totalSkillBadges || 0;
    const sumTotalArcadeGames = teamData.totalArcadeGames || 0;
    
    // Combine lead and members
    const allMembers = [];

    // Handle new backend structure (participants array)
    if (teamData.participants && Array.isArray(teamData.participants)) {
      teamData.participants.forEach(member => {
        allMembers.push({
          name: member.userName,
          email: member.userEmail || '',
          badges: member.skillBadgesCompleted || 0,
          arcadeGames: member.arcadeGamesCompleted || 0,
          points: (member.skillBadgesCompleted || 0) + (member.arcadeGamesCompleted || 0),
          isLead: member.isLead || false
        });
      });
    } 
    // Handle legacy backend structure (lead object + members array)
    else {
      if (teamData.lead) {
        allMembers.push({
          name: teamData.lead.userName,
          email: teamData.lead.userEmail || '',
          badges: teamData.lead.skillBadgesCompleted || 0,
          arcadeGames: teamData.lead.arcadeGamesCompleted || 0,
          points: (teamData.lead.skillBadgesCompleted || 0) + (teamData.lead.arcadeGamesCompleted || 0),
          isLead: true
        });
      }
      
      if (teamData.members && Array.isArray(teamData.members)) {
        teamData.members.forEach(member => {
          allMembers.push({
            name: member.userName,
            email: member.userEmail || '',
            badges: member.skillBadgesCompleted || 0,
            arcadeGames: member.arcadeGamesCompleted || 0,
            points: (member.skillBadgesCompleted || 0) + (member.arcadeGamesCompleted || 0),
            isLead: false
          });
        });
      }
    }

    const memberCount = teamData.memberCount || allMembers.length || 1; // Prevent division by zero
    
    // Calculate average per member with decimal precision (for team cards and ranking)
    const avgPointsPerMember = memberCount > 0 ? Number((sumTotalPoints / memberCount).toFixed(2)) : 0;
    const avgBadgesPerMember = memberCount > 0 ? Number((sumTotalBadges / memberCount).toFixed(2)) : 0;
    const avgGamesPerMember = memberCount > 0 ? Number((sumTotalArcadeGames / memberCount).toFixed(2)) : 0;

    // Debug log for first team
    if (teamData.team === 1 || teamData.team === '1') {
      console.log('🔍 Team transformation:', {
        teamName: getTeamName(teamData.team),
        memberCount,
        totalPoints: sumTotalPoints,
        totalBadges: sumTotalBadges,
        totalGames: sumTotalArcadeGames,
        avgPointsPerMember,
        avgBadgesPerMember,
        avgGamesPerMember
      });
    }

    return {
      teamName: getTeamName(teamData.team),
      team: teamData.team,
      teamRank: teamData.teamRank,
      members: allMembers,
      // Keep total sums for top-level stats
      totalPoints: sumTotalPoints,
      totalBadges: sumTotalBadges,
      totalArcadeGames: sumTotalArcadeGames,
      // Add averages for individual team display and ranking
      avgPointsPerMember,
      avgBadgesPerMember,
      avgGamesPerMember,
      memberCount,
      averageSkillBadges: teamData.averageSkillBadges || 0,
      averageArcadeGames: teamData.averageArcadeGames || 0,
      lastUpdated: new Date().toISOString()
    };
  });
};

// Get team rankings (based on average per member for fairness)
export const getRankings = (teams) => {
  return teams
    .sort((a, b) => b.avgPointsPerMember - a.avgPointsPerMember)
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));
};

// Calculate progress percentage (based on average per member)
export const calculateProgressPercent = (teams) => {
  const maxPoints = Math.max(...teams.map(t => t.avgPointsPerMember || 0), 1); // Prevent division by zero
  return teams.map(team => ({
    ...team,
    progressPercent: maxPoints > 0 ? Math.round((team.avgPointsPerMember / maxPoints) * 100) : 0
  }));
};
