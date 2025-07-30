import { getScores, updateScores, initializeScores } from '../../utils/leaderboard-state'

export default defineWebSocketHandler({
  async open(peer) {
    console.log('New WebSocket client connected')
    
    try {
      // Initialize scores if needed
      console.log('Initializing scores for new client...')
      await initializeScores()
      
      // Get current scores from KV
      console.log('Loading scores from KV for new client...')
      const currentScores = await getScores()
      console.log('Scores loaded for client:', currentScores)
      
      // Send current scores to new client
      peer.subscribe('leaderboard')
      peer.send(JSON.stringify(currentScores))
      console.log('Successfully sent initial scores to client')
    } catch (error) {
      console.error('Error in WebSocket open handler:', error)
      // Send default scores as fallback
      const defaultScores = [
        { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
        { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
        { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
        { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
      ]
      peer.subscribe('leaderboard')
      peer.send(JSON.stringify(defaultScores))
      console.log('Sent fallback default scores to client')
    }
  },
  
  async message(peer, message) {
    try {
      console.log('Received WebSocket message:', message)
      // Parse incoming score updates
      const messageText = typeof message === 'string' ? message : message.toString()
      const updatedScores = JSON.parse(messageText)
      
      console.log('Parsed updated scores:', updatedScores)
      
      // Update the stored scores in KV
      console.log('Saving updated scores to KV...')
      await updateScores(updatedScores)
      
      console.log('Successfully saved scores to KV')
      
      // Broadcast updated scores to all connected clients
      peer.publish('leaderboard', JSON.stringify(updatedScores))
      console.log('Broadcasted updated scores to all clients')
    } catch (error) {
      console.error('Error processing leaderboard message:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
    }
  },
  
  close(peer) {
    console.log('WebSocket client disconnected')
    peer.unsubscribe('leaderboard')
  },
}) 