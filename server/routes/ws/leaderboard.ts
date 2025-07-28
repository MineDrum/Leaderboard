// Store team scores in memory (in a real app, you'd use a database)
let teamScores = [
  { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
  { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
  { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
  { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
]

export default defineWebSocketHandler({
  open(peer) {
    // Send current scores to new client
    peer.subscribe('leaderboard')
    peer.send(JSON.stringify(teamScores))
  },
  
  message(peer, message) {
    try {
      // Parse incoming score updates
      const messageText = typeof message === 'string' ? message : message.toString()
      const updatedScores = JSON.parse(messageText)
      
      // Update the stored scores
      teamScores = updatedScores
      
      // Broadcast updated scores to all connected clients
      peer.publish('leaderboard', JSON.stringify(teamScores))
    } catch (error) {
      console.error('Error processing leaderboard message:', error)
    }
  },
  
  close(peer) {
    peer.unsubscribe('leaderboard')
  },
}) 