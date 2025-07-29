import { updateScores } from '../utils/leaderboard-state'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log('API: Received score update:', body)
  
  await updateScores(body)
  
  return { success: true, scores: body }
}) 