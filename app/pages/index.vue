<script setup lang="ts">
// Team data with specific names and colors
const teams = ref([
  { id: 1, name: 'Volleyball', color: '#FF69B4', score: 0, emoji: '🏐' },
  { id: 2, name: 'Baking', color: '#9370DB', score: 0, emoji: '🧁' },
  { id: 3, name: 'Basketball', color: '#FF8C00', score: 0, emoji: '🏀' },
  { id: 4, name: 'Science', color: '#32CD32', score: 0, emoji: '🔬' }
])

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
})

// Sort teams by score (highest first)
const sortedTeams = computed(() => {
  return [...teams.value].sort((a, b) => b.score - a.score)
})

// Get position with fun emoji
const getPosition = (index: number) => {
  const positions = ['🥇', '🥈', '🥉', '🎯']
  return positions[index] || '🎯'
}
</script>

<template>
  <div class="leaderboard-container">
    <div class="header">
      <h1 class="title">🏆 Team Leaderboard! 🏆</h1>
    </div>

    <div class="teams-grid">
      <div 
        v-for="(team, index) in sortedTeams" 
        :key="team.id"
        class="team-card"
        :class="{ 'winner': index === 0 && team.score > 0 }"
        :style="{ '--team-color': team.color }"
      >
        <div class="position-badge">
          {{ getPosition(index) }}
        </div>
        
        <div class="team-emoji">
          {{ team.emoji }}
        </div>
        
        <div class="team-info">
          <h3 class="team-name">{{ team.name }}</h3>
          <div class="score-display">
            <span class="score-number">{{ team.score }}</span>
            <span class="score-label">points</span>
          </div>
        </div>

        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${Math.min((team.score / Math.max(...teams.map(t => t.score), 1)) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="actions">
      <NuxtLink to="/update-scores" class="update-button">
        📝 Update Scores
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-container {
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
}

.title {
  font-size: 2.5rem;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin: 0;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 3px solid transparent;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 200px;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.team-card.winner {
  border-color: gold;
  background: linear-gradient(135deg, #fff 0%, #fff9c4 100%);
  animation: winner-glow 2s ease-in-out infinite alternate;
}

@keyframes winner-glow {
  from { box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3); }
  to { box-shadow: 0 15px 40px rgba(255, 215, 0, 0.6); }
}

.position-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
  background: var(--team-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.team-emoji {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.team-info {
  text-align: center;
}

.team-name {
  font-size: 1.3rem;
  color: #333;
  margin: 0 0 0.5rem 0;
  font-weight: bold;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--team-color);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.score-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.progress-bar {
  margin-top: 1rem;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--team-color);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.actions {
  text-align: center;
  margin-top: 1rem;
  flex-shrink: 0;
}

.update-button {
  display: inline-block;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.update-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .leaderboard-container {
    padding: 0.5rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .team-card {
    padding: 1rem;
    min-height: 150px;
  }
  
  .team-emoji {
    font-size: 2rem;
  }
  
  .score-number {
    font-size: 1.5rem;
  }
}
</style>
