import { initializeScores } from '../utils/leaderboard-state'

export default defineNitroPlugin(async () => {
  console.log('Initializing leaderboard scores...')
  await initializeScores()
  console.log('Leaderboard scores initialized!')
}) 