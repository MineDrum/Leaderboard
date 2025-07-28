import { getScores } from '../utils/leaderboard-state'

export default defineEventHandler(() => {
  return getScores()
}) 