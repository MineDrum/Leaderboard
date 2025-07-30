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
      console.log('Scores updated via WebSocket:', teams.value)
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
  
  // Set up a fallback timer in case WebSocket doesn't work
  setTimeout(async () => {
    if (teams.value.every(team => team.score === 0)) {
      console.log('WebSocket may not have worked, trying API again...')
      await loadScoresFromAPI()
    }
  }, 2000)
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

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<template>
  <div class="leaderboard-container">
    <div class="header">
      <h1 class="title">🦔 COLOR WARS LEADERBOARD! 🦔</h1>
    </div>

    <TransitionGroup name="team-card" tag="div" class="teams-grid">
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
            <AnimatedCounter :value="team.score" class="score-number" />
            <span class="score-label">POINTS</span>
          </div>
        </div>

        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${Math.min((team.score / Math.max(...teams.map(t => t.score), 1)) * 100, 100)}%` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>

    <div class="actions">
      <NuxtLink to="/update-scores" class="update-button">
        🦔 UPDATE SCORES
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-container {
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

.leaderboard-container::before {
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

.leaderboard-container::after {
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
  position: relative;
  z-index: 1;
}

.title {
  font-size: 3rem;
  color: white;
  text-shadow: 
    4px 4px 0px #000,
    8px 8px 0px rgba(0, 0, 0, 0.3);
  margin: 0;
  animation: titleBounce 2s ease-in-out infinite;
  font-weight: 900;
  letter-spacing: 2px;
  transform: rotate(-2deg);
}

@keyframes titleBounce {
  0%, 100% { transform: rotate(-2deg) translateY(0); }
  50% { transform: rotate(-2deg) translateY(-10px); }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 4px solid #000;
  transform: rotate(-1deg);
  background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
}

.team-card:hover {
  transform: rotate(0deg) translateY(-10px) scale(1.02);
  box-shadow: 
    12px 12px 0px #000,
    24px 24px 0px rgba(0, 0, 0, 0.3);
}

.team-card.winner {
  border-color: #FFD700;
  background: linear-gradient(135deg, #fff 0%, #fff9c4 50%, #fff 100%);
  animation: winnerPulse 2s ease-in-out infinite alternate;
  transform: rotate(-1deg) scale(1.05);
}

@keyframes winnerPulse {
  from { 
    box-shadow: 
      8px 8px 0px #FFD700,
      16px 16px 0px rgba(255, 215, 0, 0.5);
  }
  to { 
    box-shadow: 
      12px 12px 0px #FFD700,
      24px 24px 0px rgba(255, 215, 0, 0.8);
  }
}

.position-badge {
  position: absolute;
  top: -15px;
  right: -15px;
  font-size: 2rem;
  background: var(--team-color);
  border-radius: 0;
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px #000;
  border: 3px solid #000;
  transform: rotate(15deg);
}

.team-emoji {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
  filter: drop-shadow(2px 2px 0px #000);
  animation: emojiFloat 3s ease-in-out infinite;
}

@keyframes emojiFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

.team-info {
  text-align: center;
}

.team-name {
  font-size: 1.8rem;
  color: #000;
  margin: 0 0 0.5rem 0;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
  transform: rotate(-1deg);
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

  .score-number {
    font-size: 3.5rem;
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

.progress-bar {
  margin-top: 1.5rem;
  height: 12px;
  background: #000;
  border-radius: 0;
  overflow: hidden;
  border: 2px solid #000;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: var(--team-color);
  border-radius: 0;
  transition: width 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.5);
}

.actions {
  text-align: center;
  margin-top: 1rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.update-button {
  display: inline-block;
  background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4);
  background-size: 300% 300%;
  animation: buttonGradient 3s ease infinite;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: 900;
  box-shadow: 
    6px 6px 0px #000,
    12px 12px 0px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 3px solid #000;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-family: 'Bangers', 'Comic Sans MS', cursive;
}

@keyframes buttonGradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.update-button:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 
    8px 8px 0px #000,
    16px 16px 0px rgba(0, 0, 0, 0.4);
}

.update-button:active {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    4px 4px 0px #000,
    8px 8px 0px rgba(0, 0, 0, 0.3);
}

/* Card transition animations */
.team-card-enter-active,
.team-card-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.team-card-enter-from {
  opacity: 0;
  transform: translateY(50px) rotate(-5deg) scale(0.8);
}

.team-card-leave-to {
  opacity: 0;
  transform: translateY(-50px) rotate(5deg) scale(0.8);
}

.team-card-move {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
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
    gap: 1rem;
  }
  
  .team-card {
    padding: 1.5rem;
    transform: rotate(-1deg);
  }
  
  .team-card:hover {
    transform: rotate(0deg) translateY(-5px) scale(1.01);
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
}
</style>
