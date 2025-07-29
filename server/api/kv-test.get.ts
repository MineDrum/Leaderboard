import { testKV, getScores, initializeScores } from '../utils/leaderboard-state'

export default defineEventHandler(async () => {
  console.log('KV Test endpoint called')
  
  try {
    // Test basic KV functionality
    const kvTest = await testKV()
    
    // Test leaderboard scores
    const scores = await getScores()
    
    // Try to initialize scores
    await initializeScores()
    
    return {
      timestamp: new Date().toISOString(),
      kvTest,
      scores,
      hubConfig: {
        kv: true,
        workers: true
      }
    }
  } catch (error) {
    console.error('KV test endpoint error:', error)
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
  }
}) 