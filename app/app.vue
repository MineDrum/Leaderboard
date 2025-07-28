<script setup lang="ts">
const url = useRequestURL()

useSeoMeta({
  title: 'Kids Leaderboard - Fun Team Competition!',
  description: 'Track scores for Volleyball, Baking, Basketball, and Science teams in real-time!',
  ogImage: `${url.origin}/og-image.png`,
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator />
  <div class="app">
    <NuxtPage />
  </div>
</template>

<style>
html,
body {
  margin: 0;
  background: black;
  color: white;
  font-family: 'Public Sans', sans-serif;
  text-align: center;
  line-height: 1.5;
  font-size: 16px;
  height: 100vh;
  overflow: hidden;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  color: white;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

p {
  color: #888;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .app {
    padding: 1rem;
  }
}
</style>
