<script setup lang="ts">
// Team data with specific names and colors
const teams = ref([
  { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
  { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
  { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
  { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
])

// WebSocket connection
let ws: WebSocket | null = null

// Connect to the websocket endpoint for real-time score updates
const { data, open } = useWebSocket('/ws/leaderboard', { immediate: false })

// When the data is received, we parse it as JSON and update the scores
watch(data, async (newData) => {
  if (newData) {
    try {
      const updatedScores = JSON.parse(typeof newData === 'string' ? newData : await newData.text())
      teams.value = teams.value.map(team => {
        const updatedTeam = updatedScores.find((t: any) => t.id === team.id)
        return updatedTeam ? { ...team, score: updatedTeam.score } : team
      })
    } catch (error) {
      console.error('Error parsing WebSocket data:', error)
    }
  }
})

// When the component is mounted, we connect to the websocket endpoint
onMounted(() => {
  open()
  
  // Create a direct WebSocket connection for sending messages
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/ws/leaderboard`
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket connected for sending messages')
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
  }
})

// Function to update team score
const updateScore = async (teamId: number, points: number) => {
  const team = teams.value.find(t => t.id === teamId)
  if (team) {
    team.score += points
    
    // Send updated scores to server via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(teams.value))
        console.log('Sent updated scores:', teams.value)
      } catch (error) {
        console.error('Error sending WebSocket message:', error)
      }
    } else {
      console.error('WebSocket not connected')
    }
  }
}

// Quick add buttons
const quickAddPoints = [1, 5, 10, 25, 50, 100]

// Clean up WebSocket on component unmount
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<template>
  <div class="update-container">
    <div class="header">
      <h1 class="title">📝 Update Team Scores! 📝</h1>
      <NuxtLink to="/" class="back-button">
        ← Back to Leaderboard
      </NuxtLink>
    </div>

    <div class="teams-grid">
      <div 
        v-for="team in teams" 
        :key="team.id"
        class="team-card"
        :style="{ '--team-color': team.color }"
      >
        <div class="team-header">
          <div class="team-emoji">{{ team.emoji }}</div>
          <h3 class="team-name">{{ team.name }}</h3>
          <div class="current-score">
            <span class="score-number">{{ team.score }}</span>
            <span class="score-label">points</span>
          </div>
        </div>

        <div class="score-controls">
          <div class="quick-add-buttons">
            <button
              v-for="points in quickAddPoints"
              :key="points"
              class="quick-add-btn"
              @click="updateScore(team.id, points)"
            >
              +{{ points }}
            </button>
          </div>
          
          <div class="custom-add">
            <input
              type="number"
              min="1"
              max="1000"
              placeholder="Custom points"
              class="custom-input"
              @keyup.enter="(e) => updateScore(team.id, parseInt((e.target as HTMLInputElement).value) || 0)"
            />
            <button
              class="custom-add-btn"
              @click="(e) => {
                const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement
                if (input) {
                  updateScore(team.id, parseInt(input.value) || 0)
                  input.value = ''
                }
              }"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>✨ Changes update in real-time! ✨</p>
    </div>
  </div>
</template>

<style scoped>
.update-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 2rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.back-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.team-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  border: 3px solid var(--team-color);
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.team-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.team-emoji {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.team-name {
  font-size: 1.5rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.current-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--team-color);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.score-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.score-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quick-add-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.quick-add-btn {
  background: var(--team-color);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.quick-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.quick-add-btn:active {
  transform: translateY(0);
}

.custom-add {
  display: flex;
  gap: 0.5rem;
}

.custom-input {
  flex: 1;
  padding: 0.8rem;
  border: 2px solid #ddd;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
}

.custom-input:focus {
  outline: none;
  border-color: var(--team-color);
}

.custom-add-btn {
  background: var(--team-color);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.custom-add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.footer {
  text-align: center;
  margin-top: 1rem;
  flex-shrink: 0;
  color: white;
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .update-container {
    padding: 0.5rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .team-card {
    padding: 1rem;
  }
  
  .team-emoji {
    font-size: 2.5rem;
  }
  
  .score-number {
    font-size: 2rem;
  }
  
  .quick-add-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 