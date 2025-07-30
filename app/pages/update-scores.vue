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

// Load scores from API as fallback
const loadScoresFromAPI = async () => {
  try {
    console.log('Loading scores from API as fallback...')
    const response = await $fetch('/api/scores')
    if (response && Array.isArray(response)) {
      teams.value = teams.value.map(team => {
        const apiTeam = response.find((t: any) => t.id === team.id)
        return apiTeam ? { ...team, score: apiTeam.score } : team
      })
      console.log('Scores loaded from API:', teams.value)
    }
  } catch (error) {
    console.error('Error loading scores from API:', error)
  }
}

// When the component is mounted, we connect to the websocket endpoint
onMounted(async () => {
  // Load scores from API first
  await loadScoresFromAPI()
  
  // Then connect to WebSocket
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
  
  // Set up a fallback timer in case WebSocket doesn't work
  setTimeout(async () => {
    if (teams.value.every(team => team.score === 0)) {
      console.log('WebSocket may not have worked, trying API again...')
      await loadScoresFromAPI()
    }
  }, 2000)
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
const quickAddPoints = [250, 500, 750, 1000]

// Clean up WebSocket on component unmount
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<template>
  <div class="update-container">
    <div class="header">
      <h1 class="title">🦔 UPDATE TEAM SCORES! 🦔</h1>
      <NuxtLink to="/" class="back-button">
        ← BACK TO LEADERBOARD
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
            <AnimatedCounter :value="team.score" class="score-number" />
            <span class="score-label">POINTS</span>
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
              placeholder="CUSTOM PNTS"
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
              ADD
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>🦔 CHANGES UPDATE IN REAL-TIME! 🦔</p>
    </div>
  </div>
</template>

<style scoped>
.update-container {
  height: 100vh;
  background: 
    linear-gradient(45deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  padding: 1rem;
  font-family: 'Comic Sans MS', 'Bangers', cursive, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.update-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 107, 107, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(78, 205, 196, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(69, 183, 209, 0.3) 0%, transparent 50%);
  pointer-events: none;
}

.update-container::after {
  content: '🦔 🦔 🦔';
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 2rem;
  opacity: 0.1;
  transform: rotate(15deg);
  pointer-events: none;
  animation: hedgehogFloat 4s ease-in-out infinite;
}

@keyframes hedgehogFloat {
  0%, 100% { transform: rotate(15deg) translateY(0); }
  50% { transform: rotate(15deg) translateY(-10px); }
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.header {
  text-align: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 2.5rem;
  color: white;
  text-shadow: 
    4px 4px 0px #000,
    8px 8px 0px rgba(0, 0, 0, 0.3);
  margin: 0;
  font-weight: 900;
  letter-spacing: 2px;
  transform: rotate(-1deg);
}

.back-button {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0;
  text-decoration: none;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 3px solid #000;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 900;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.5);
  font-family: 'Bangers', 'Comic Sans MS', cursive;
}

.back-button:hover {
  background: rgba(0, 0, 0, 1);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.7);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
}

.team-card {
  background: white;
  border-radius: 0;
  padding: 2rem;
  box-shadow: 
    8px 8px 0px #000,
    16px 16px 0px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 4px solid var(--team-color);
  transform: rotate(-1deg);
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.team-card:hover {
  transform: rotate(0deg) translateY(-10px) scale(1.02);
  box-shadow: 
    12px 12px 0px #000,
    24px 24px 0px rgba(0, 0, 0, 0.3);
}

.team-header {
  text-align: center;
  margin-bottom: 2rem;
}

.team-emoji {
  font-size: 4rem;
  margin-bottom: 1rem;
  filter: drop-shadow(2px 2px 0px #000);
  animation: emojiFloat 3s ease-in-out infinite;
}

@keyframes emojiFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

.team-name {
  font-size: 2rem;
  color: #000;
  margin: 0 0 1rem 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  transform: rotate(-1deg);
}

.current-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.score-number {
  font-size: 3rem;
  font-weight: 900;
  color: var(--team-color);
  text-shadow: 
    3px 3px 0px #000,
    6px 6px 0px rgba(0, 0, 0, 0.3);
  font-family: 'Bangers', 'Comic Sans MS', cursive;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  display: inline-block;
}

.score-number:hover {
  transform: scale(1.1);
  text-shadow: 
    4px 4px 0px #000,
    8px 8px 0px rgba(0, 0, 0, 0.4);
}

.score-number.animating {
  animation: scoreGlow 0.5s ease-in-out infinite alternate;
}

@keyframes scoreGlow {
  from { 
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 0px rgba(0, 0, 0, 0.3),
      0 0 10px var(--team-color);
  }
  to { 
    text-shadow: 
      3px 3px 0px #000,
      6px 6px 0px rgba(0, 0, 0, 0.3),
      0 0 20px var(--team-color),
      0 0 30px var(--team-color);
  }
}

.score-label {
  font-size: 1rem;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 900;
  background: var(--team-color);
  color: white;
  padding: 0.5rem 1rem;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px #000;
}

.score-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-add-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.quick-add-btn {
  background: var(--team-color);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 0;
  font-size: 1.2rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 4px 4px 0px #000;
  border: 2px solid #000;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Bangers', 'Comic Sans MS', cursive;
}

.quick-add-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 6px 6px 0px #000;
}

.quick-add-btn:active {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 2px 2px 0px #000;
}

.custom-add {
  display: flex;
  gap: 0.8rem;
}

.custom-input {
  flex: 1;
  padding: 1rem;
  border: 3px solid #000;
  border-radius: 0;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: white;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.3);
}

.custom-input:focus {
  outline: none;
  border-color: var(--team-color);
  box-shadow: 4px 4px 0px var(--team-color);
}

.custom-input::placeholder {
  color: #666;
  font-weight: 700;
}

.custom-add-btn {
  background: var(--team-color);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 0;
  font-size: 1rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: 4px 4px 0px #000;
  border: 2px solid #000;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Bangers', 'Comic Sans MS', cursive;
}

.custom-add-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 6px 6px 0px #000;
}

.footer {
  text-align: center;
  margin-top: 1rem;
  flex-shrink: 0;
  color: white;
  font-size: 1rem;
  opacity: 0.9;
  position: relative;
  z-index: 1;
  font-weight: 900;
  text-shadow: 2px 2px 0px #000;
  letter-spacing: 1px;
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
    font-size: 2rem;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .team-card {
    padding: 1.5rem;
    transform: rotate(0deg);
  }
  
  .team-card:hover {
    transform: translateY(-5px) scale(1.01);
  }
  
  .team-emoji {
    font-size: 3rem;
  }
  
  .score-number {
    font-size: 2.5rem;
  }
  
  .team-name {
    font-size: 1.5rem;
  }
  
  .quick-add-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-add-btn {
    font-size: 1rem;
    padding: 0.8rem;
  }
}
</style> 