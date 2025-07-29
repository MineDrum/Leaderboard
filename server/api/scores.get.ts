import { getScores } from '../utils/leaderboard-state'

export default defineEventHandler(async () => {
  return await getScores()
}) 