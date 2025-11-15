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
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: inherit;
}

/* Sidebar fixed to the left */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100vh;
  background-color: #1f2937;
  color: white;
  padding: 15px;
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  margin-bottom: 12px;
}

.sidebar a {
  color: white;
  text-decoration: none;
  display: block;
  padding-left: 0;
}

/* Main content fills remaining width */
.content {
  margin-left: 220px; /* same as sidebar width */
  width: calc(100vw - 220px); /* ensures it spans remaining width */
  height: 100vh;
  padding: 10px;
  background-color: #f9fafb;
  overflow-y: auto;
}

/* Responsive for smaller screens */
@media (max-width: 768px) {
  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
  }
  .content {
    margin-left: 0;
    width: 100%;
  }
}
</style>
