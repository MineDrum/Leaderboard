// Default team scores
const defaultTeamScores = [
  { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
  { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
  { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
  { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
]

// Get scores from KV storage
export const getScores = async () => {
  try {
    const storedScores = await hubKV().get('leaderboard:scores')
    if (storedScores) {
      console.log('Loaded scores from KV:', storedScores)
      return storedScores as typeof defaultTeamScores
    }
  } catch (error) {
    console.error('Error loading scores from KV:', error)
  }
  
  // Return default scores if no stored data
  console.log('Using default scores')
  return defaultTeamScores
}

// Update scores in KV storage
export const updateScores = async (newScores: typeof defaultTeamScores) => {
  try {
    await hubKV().set('leaderboard:scores', newScores)
    console.log('Saved scores to KV:', newScores)
  } catch (error) {
    console.error('Error saving scores to KV:', error)
  }
}

// Initialize scores if they don't exist
export const initializeScores = async () => {
  try {
    const hasScores = await hubKV().has('leaderboard:scores')
    if (!hasScores) {
      await hubKV().set('leaderboard:scores', defaultTeamScores)
      console.log('Initialized default scores in KV')
    }
  } catch (error) {
    console.error('Error initializing scores:', error)
  }
} 