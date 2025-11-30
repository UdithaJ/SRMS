<template>
  <div class="app-bar-wrapper">
    <v-app-bar
      app
      class="modern-app-bar"
      height="64"
      elevation="0"
      flat
    >
      <v-app-bar-nav-icon 
        v-if="!display.mdAndUp"
        @click="toggleDrawer" 
        :color="isDarkTheme ? 'white' : '#1a1a2e'"
        class="ml-2"
      />
      
      <div class="system-branding">
        <div class="system-name">CIMS</div>
        <div class="system-slogan" v-if="display.smAndUp">Digitalizing Today for a Better Tomorrow</div>
      </div>
      
      <v-spacer />
      
      <v-btn 
        icon
        class="theme-toggle-btn mr-2"
        @click="toggleTheme"
        :title="isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
      >
        <v-icon>{{ isDarkTheme ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      
      <v-btn 
        v-show="false"
        icon
        class="seasonal-btn mr-2"
        :class="{ 'seasonal-active': seasonalTheme }"
        @click="toggleSeasonalTheme(!seasonalTheme)"
        title="Toggle Seasonal Theme"
      >
        <v-icon>mdi-snowflake</v-icon>
      </v-btn>
      
      <v-btn 
        variant="text" 
        class="logout-btn"
        @click="logout"
      >
        <v-icon class="mr-2 logout-icon">mdi-logout</v-icon>
        <span class="logout-text">Logout</span>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { ref, onMounted, computed } from 'vue'

const display = useDisplay()
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()

const emit = defineEmits(['toggle-drawer'])

const seasonalTheme = ref(false)

const isDarkTheme = computed(() => themeStore.isDark)

onMounted(() => {
  // Load saved preference from localStorage
  const saved = localStorage.getItem('seasonalTheme')
  seasonalTheme.value = saved === 'true'
  // Dispatch event on mount to sync with App.vue
  window.dispatchEvent(new CustomEvent('seasonal-theme-changed', { detail: seasonalTheme.value }))
})

const toggleSeasonalTheme = (value) => {
  seasonalTheme.value = value
  localStorage.setItem('seasonalTheme', value.toString())
  window.dispatchEvent(new CustomEvent('seasonal-theme-changed', { detail: value }))
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

const toggleDrawer = () => {
  emit('toggle-drawer')
}

const logout = () => {
  userStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped lang="scss">
.app-bar-wrapper {
  padding: 12px 16px 0 16px;
}

.modern-app-bar {
  background: var(--app-bar-color) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(91, 147, 255, 0.1) !important;
  margin: 0 auto;
  max-width: calc(100% - 32px);
  transition: background 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(ellipse at top, rgba(91, 147, 255, 0.1) 0%, transparent 60%);
    pointer-events: none;
  }
  
  :deep(.v-toolbar__content) {
    padding: 0 24px;
  }
  
  .system-branding {
    display: flex;
    flex-direction: column;
    gap: 2px;
    
    .system-name {
      font-size: 24px;
      font-weight: 700;
      color: var(--app-bar-text);
      letter-spacing: 2px;
      text-shadow: 0 2px 8px rgba(91, 147, 255, 0.3);
      background: linear-gradient(135deg, #ffffff 0%, #5B93FF 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .system-slogan {
      font-size: 11px;
      font-weight: 400;
      color: var(--app-bar-text);
      letter-spacing: 1px;
      text-transform: uppercase;
      position: relative;
      background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.5) 0%,
        rgba(91, 147, 255, 1) 50%,
        rgba(255, 255, 255, 0.5) 100%);
      background-size: 200% 100%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: electricSweep 6s linear infinite;
      
      &::before {
        content: 'Digitalizing Today for a Better Tomorrow';
        position: absolute;
        left: 0;
        top: 0;
        background: linear-gradient(90deg, 
          transparent 0%,
          rgba(91, 147, 255, 0.8) 50%,
          transparent 100%);
        background-size: 200% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: electricSweep 6s linear infinite;
        filter: blur(2px);
      }
    }
  }
  
  :deep(.v-btn--icon) {
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
    
    .v-icon {
      color: var(--app-bar-icon) !important;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 12px rgba(91, 147, 255, 0.3);
      
      .v-icon {
        color: #5B93FF !important;
      }
    }
  }
  
  .theme-toggle-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    transition: all 0.3s ease;
    
    .v-icon {
      color: var(--app-bar-icon) !important;
      transition: all 0.3s ease;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 0 15px rgba(255, 193, 7, 0.4);
      
      .v-icon {
        color: #ffc107 !important;
        transform: rotate(15deg);
      }
    }
  }
  
  .logout-btn {
    color: var(--app-bar-text) !important;
    background: rgba(255, 255, 255, 0.1) !important;
    transition: all 0.2s ease;
    text-transform: none;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    
    .logout-icon {
      color: var(--app-bar-icon) !important;
    }
    
    .logout-text {
      color: var(--app-bar-text);
      font-weight: 500;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 0 12px rgba(91, 147, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
      
      .v-icon {
        color: #5B93FF !important;
      }
    }
  }
  
  .seasonal-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    transition: all 0.3s ease;
    
    .v-icon {
      color: rgba(255, 255, 255, 0.5) !important;
      transition: all 0.3s ease;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      
      .v-icon {
        color: rgba(91, 147, 255, 0.8) !important;
        transform: rotate(15deg);
      }
    }
    
    &.seasonal-active {
      background: rgba(91, 147, 255, 0.2) !important;
      box-shadow: 0 0 20px rgba(91, 147, 255, 0.4),
                  inset 0 0 20px rgba(91, 147, 255, 0.2);
      
      .v-icon {
        color: #5B93FF !important;
        animation: snowflakeRotate 3s linear infinite;
      }
      
      &:hover {
        background: rgba(91, 147, 255, 0.25) !important;
        box-shadow: 0 0 25px rgba(91, 147, 255, 0.5),
                    inset 0 0 20px rgba(91, 147, 255, 0.3);
      }
    }
  }
}

@keyframes electricSweep {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes snowflakeRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
