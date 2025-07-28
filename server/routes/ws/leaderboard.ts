import { teamScores, updateScores, getScores } from '../../utils/leaderboard-state'

export default defineWebSocketHandler({
  open(peer) {
    console.log('New WebSocket client connected')
    // Send current scores to new client
    peer.subscribe('leaderboard')
    peer.send(JSON.stringify(getScores()))
    console.log('Sent initial scores to client:', getScores())
  },
  
  message(peer, message) {
    try {
      console.log('Received WebSocket message:', message)
      // Parse incoming score updates
      const messageText = typeof message === 'string' ? message : message.toString()
      const updatedScores = JSON.parse(messageText)
      
      console.log('Parsed updated scores:', updatedScores)
      
      // Update the stored scores
      updateScores(updatedScores)
      
      console.log('Updated stored scores:', getScores())
      
      // Broadcast updated scores to all connected clients
      peer.publish('leaderboard', JSON.stringify(getScores()))
      console.log('Broadcasted updated scores to all clients')
    } catch (error) {
      console.error('Error processing leaderboard message:', error)
    }
  },
  
  close(peer) {
    console.log('WebSocket client disconnected')
    peer.unsubscribe('leaderboard')
  },
}) 