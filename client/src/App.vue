<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import SideBar from '@/components/SideBar.vue'
import AppBar from '@/components/AppBar.vue'
import { useToast } from '@/composables/useToast'

const route = useRoute()

// show sidebar only for app routes (e.g. /app/*)
const showSidebar = computed(() => route.path.startsWith('/app'))

// Toast notification
const { show, message, type, timeout, hideToast } = useToast()

const getToastColor = computed(() => {
  switch (type.value) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'success'
  }
})
</script>

<template>
  <v-app>
    <SideBar v-if="showSidebar" />
    <AppBar v-if="showSidebar" />
    <v-main class="pt-2">
      <RouterView />
    </v-main>
    <v-footer app class="app-footer">
      <div class="footer-content">
        <div class="footer-left">
          <v-icon size="small" class="footer-icon">mdi-copyright</v-icon>
          <span>2025 UDITHAJ. All rights reserved.</span>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-right">
          <v-icon size="small" class="footer-icon">mdi-map-marker</v-icon>
          <span>DS - Madurawala</span>
        </div>
      </div>
    </v-footer>

    <!-- Global Toast Notification -->
    <v-snackbar
      v-model="show"
      :timeout="timeout"
      :color="getToastColor"
      location="top right"
      class="toast-notification"
    >
      {{ message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="hideToast"
          icon="mdi-close"
          size="small"
        >
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped lang="scss">
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

.app-footer {
  background: linear-gradient(145deg, #e8e8e8, #ffffff);
  border-top: none;
  box-shadow: 
    0 -4px 12px rgba(0, 0, 0, 0.05),
    inset 0 2px 4px rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    width: 100%;
    font-size: 13px;
    color: #5a5a5a;
    font-weight: 500;
  }
  
  .footer-left,
  .footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .footer-icon {
    color: #7a7a7a;
    opacity: 0.8;
  }
  
  .footer-divider {
    width: 1px;
    height: 20px;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(0, 0, 0, 0.15) 20%,
      rgba(0, 0, 0, 0.15) 80%,
      transparent
    );
  }
  
  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
    }
    
    .footer-divider {
      display: none;
    }
  }
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

.toast-notification {
  :deep(.v-snackbar__wrapper) {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  :deep(.v-snackbar__content) {
    font-size: 14px;
    font-weight: 500;
  }
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
