<script setup lang="ts">
interface Props {
  value: number
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1000
})

const displayValue = ref(props.value)
const isAnimating = ref(false)

// Sound effect for number changes
const playSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    audio.volume = 0.3
    audio.play().catch(() => {
      // Ignore audio errors (browsers may block autoplay)
    })
  } catch (error) {
    // Ignore audio errors
  }
}

// Animate the counter
const animateCounter = () => {
  if (isAnimating.value) return
  
  isAnimating.value = true
  const startValue = displayValue.value
  const endValue = props.value
  const startTime = Date.now()
  
  const updateCounter = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / props.duration, 1)
    
    // Use easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
    
    // Generate random intermediate values during animation
    if (progress < 0.8) {
      const randomRange = Math.abs(endValue - startValue) * 2
      const randomOffset = (Math.random() - 0.5) * randomRange
      displayValue.value = Math.floor(startValue + (endValue - startValue) * easeOutQuart + randomOffset)
    } else {
      // Final approach to actual value
      displayValue.value = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
    }
    
    // Play sound effect periodically during animation
    if (Math.random() < 0.3) {
      playSound()
    }
    
    if (progress < 1) {
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(updateCounter)
      }
    } else {
      displayValue.value = endValue
      isAnimating.value = false
      // Final sound effect
      playSound()
    }
  }
  
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame(updateCounter)
  }
}

// Watch for value changes and trigger animation
watch(() => props.value, (newValue, oldValue) => {
  if (newValue !== oldValue && !isAnimating.value) {
    animateCounter()
  }
}, { immediate: false })

// Initialize with the current value
onMounted(() => {
  displayValue.value = props.value
})

// Format number with commas
const formatNumber = (num: number) => {
  return num.toLocaleString()
}
</script>

<template>
  <span class="animated-counter" :class="{ 'animating': isAnimating }">
    {{ formatNumber(displayValue) }}
  </span>
</template>

<style scoped>
.animated-counter {
  transition: all 0.3s ease;
  display: inline-block;
}

.animated-counter.animating {
  animation: numberPulse 0.1s ease-in-out;
}

@keyframes numberPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style> 