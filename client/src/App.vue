<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import SideBar from '@/components/SideBar.vue'
import AppBar from '@/components/AppBar.vue'

const route = useRoute()

// show sidebar only for app routes (e.g. /app/*)
const showSidebar = computed(() => route.path.startsWith('/app'))
</script>

<template>
  <v-app>
    <SideBar v-if="showSidebar" />
    <AppBar v-if="showSidebar" />
    <v-main class="pt-2">
      <RouterView />
    </v-main>
    <v-footer app class="app-footer" height="40">
      <v-spacer />
      <span class="text-caption">© 2025 UDITHAJ. All rights reserved. | DS - Madurawala</span>
      <v-spacer />
    </v-footer>
  </v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.app-footer {
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
