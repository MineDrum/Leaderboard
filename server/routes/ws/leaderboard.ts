import { getScores, updateScores, initializeScores } from '../../utils/leaderboard-state'

export default defineWebSocketHandler({
  async open(peer) {
    console.log('New WebSocket client connected')
    
    // Initialize scores if needed
    await initializeScores()
    
    // Send current scores to new client
    peer.subscribe('leaderboard')
    const currentScores = await getScores()
    peer.send(JSON.stringify(currentScores))
    console.log('Sent initial scores to client:', currentScores)
  },
  
  async message(peer, message) {
    try {
      console.log('Received WebSocket message:', message)
      // Parse incoming score updates
      const messageText = typeof message === 'string' ? message : message.toString()
      const updatedScores = JSON.parse(messageText)
      
      console.log('Parsed updated scores:', updatedScores)
      
      // Update the stored scores in KV
      await updateScores(updatedScores)
      
      console.log('Updated stored scores in KV')
      
      // Broadcast updated scores to all connected clients
      peer.publish('leaderboard', JSON.stringify(updatedScores))
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