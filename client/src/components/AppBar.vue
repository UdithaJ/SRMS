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
        color="white"
        class="ml-2"
      />
      
      <v-spacer />
      
      <v-btn 
        variant="text" 
        class="logout-btn"
        @click="logout"
      >
        <v-icon color="white" class="mr-2">mdi-logout</v-icon>
        <span class="logout-text">Logout</span>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script setup>
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const display = useDisplay()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(['toggle-drawer'])

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
  background: linear-gradient(135deg, #2D2640 0%, #1F1B2E 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0 !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(91, 147, 255, 0.1) !important;
  margin: 0 auto;
  max-width: calc(100% - 32px);
  
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
  
  :deep(.v-btn--icon) {
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s;
    
    .v-icon {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 12px rgba(91, 147, 255, 0.3);
      
      .v-icon {
        color: #5B93FF !important;
      }
    }
  }
  
  .logout-btn {
    color: white !important;
    background: rgba(255, 255, 255, 0.05) !important;
    transition: all 0.2s ease;
    text-transform: none;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 12px;
    
    .v-icon {
      color: rgba(255, 107, 107, 0.9) !important;
    }
    
    .logout-text {
      color: white;
      font-weight: 500;
    }
    
    &:hover {
      background: rgba(255, 107, 107, 0.15) !important;
      box-shadow: 0 0 12px rgba(255, 107, 107, 0.3);
      
      .v-icon {
        color: #ff6b6b !important;
      }
    }
  }
}
</style>
