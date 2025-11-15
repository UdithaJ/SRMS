<template>
  <div class="app-container">
    <aside class="sidebar">
      <Sidebar />
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<style scoped>
/* Make the container span full width/height */
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;       /* full viewport width */
  margin: 0;
  padding: 0;
}

/* Sidebar fixed to the very left */
.sidebar {
  width: 220px;           /* your sidebar width */
  background-color: #1f2937;
  color: white;
  padding: 15px;
  flex-shrink: 0;         /* prevent shrinking */
  margin: 0;              /* ensure no margin from left */
}

/* Sidebar menu should start at left edge */
.sidebar ul {
  list-style: none;
  padding: 0;             /* remove default left padding */
  margin: 0;              /* remove default margin */
}

.sidebar li {
  margin-bottom: 12px;
}

.sidebar a {
  color: white;
  text-decoration: none;
  display: block;         /* full width clickable */
  padding-left: 0;        /* remove extra indent */
}

/* Main content fills remaining space */
.content {
  flex: 1;
  padding: 20px;
  background-color: #f9fafb;
  overflow-y: auto;
}
</style>
