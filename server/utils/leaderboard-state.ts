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
    console.log('Attempting to load scores from KV...')
    const storedScores = await hubKV().get('leaderboard:scores')
    console.log('Raw KV response:', storedScores)
    
    if (storedScores) {
      console.log('Loaded scores from KV:', storedScores)
      return storedScores as typeof defaultTeamScores
    } else {
      console.log('No scores found in KV, using defaults')
    }
  } catch (error) {
    console.error('Error loading scores from KV:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }
  
  // Return default scores if no stored data
  console.log('Using default scores')
  return defaultTeamScores
}

// Update scores in KV storage
export const updateScores = async (newScores: typeof defaultTeamScores) => {
  try {
    console.log('Attempting to save scores to KV:', newScores)
    await hubKV().set('leaderboard:scores', newScores)
    console.log('Successfully saved scores to KV')
    
    // Verify the save worked
    const verifyScores = await hubKV().get('leaderboard:scores')
    console.log('Verification - loaded scores from KV:', verifyScores)
  } catch (error) {
    console.error('Error saving scores to KV:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }
}

// Initialize scores if they don't exist
export const initializeScores = async () => {
  try {
    console.log('Checking if scores exist in KV...')
    const hasScores = await hubKV().has('leaderboard:scores')
    console.log('Has scores in KV:', hasScores)
    
    if (!hasScores) {
      console.log('Initializing default scores in KV...')
      await hubKV().set('leaderboard:scores', defaultTeamScores)
      console.log('Successfully initialized default scores in KV')
      
      // Verify initialization
      const verifyInit = await hubKV().get('leaderboard:scores')
      console.log('Verification - initialized scores:', verifyInit)
    } else {
      console.log('Scores already exist in KV')
    }
  } catch (error) {
    console.error('Error initializing scores:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
  }
}

// Test KV functionality
export const testKV = async () => {
  try {
    console.log('Testing KV functionality...')
    
    // Test write
    await hubKV().set('test:key', { test: 'value', timestamp: Date.now() })
    console.log('Test write successful')
    
    // Test read
    const testValue = await hubKV().get('test:key')
    console.log('Test read successful:', testValue)
    
    // Test has
    const hasTest = await hubKV().has('test:key')
    console.log('Test has successful:', hasTest)
    
    // Clean up
    await hubKV().del('test:key')
    console.log('Test cleanup successful')
    
    return { success: true, message: 'KV test passed' }
  } catch (error) {
    console.error('KV test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
} 