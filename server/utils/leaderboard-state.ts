// Shared state for leaderboard scores
export let teamScores = [
  { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
  { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
  { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
  { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
]

export const updateScores = (newScores: typeof teamScores) => {
  teamScores = newScores
  console.log('Scores updated:', teamScores)
}

export const getScores = () => {
  return teamScores
} 