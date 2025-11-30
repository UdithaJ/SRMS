<template>
  <nav>
    <v-navigation-drawer
      v-model="drawer"
      app
      class="modern-sidebar"
      :rail="rail && display.mdAndUp"
      :permanent="display.mdAndUp"
      :temporary="!display.mdAndUp"
      :width="280"
      :rail-width="72"
      clipped
    >
      <!-- Collapse Toggle Button -->
      <div class="collapse-toggle pa-2" v-if="display.mdAndUp">
        <v-btn 
          icon 
          size="small" 
          variant="text" 
          @click="rail = !rail"
          class="toggle-btn"
        >
          <v-icon size="20" :color="themeStore.isDark ? 'white' : '#1a1a2e'">
            {{ rail ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
          </v-icon>
        </v-btn>
      </div>

      <!-- User Profile Section -->
      <div v-if="!rail" class="profile-section pa-4">
        <div class="d-flex align-center">
          <v-avatar size="64" class="profile-avatar">
            <v-img :src="avatarSrc" cover />
          </v-avatar>
          <div class="ml-3 flex-grow-1">
            <div class="user-name">{{ userName || 'User' }}</div>
            <div class="user-role">{{ userRoleLabel }}</div>
          </div>
          <v-btn icon size="small" variant="text" @click="pwdDialog = true" class="settings-btn">
            <v-icon size="20" :color="themeStore.isDark ? 'white' : '#1a1a2e'">mdi-lock-reset</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Rail Mode Avatar -->
      <div v-if="rail" class="rail-avatar pa-2 d-flex justify-center">
        <v-avatar size="48" class="profile-avatar">
          <v-img :src="avatarSrc" cover />
        </v-avatar>
      </div>

      <!-- Menu Label -->
      <div v-if="!rail" class="menu-label px-6 py-2">
        <span class="text-caption text-uppercase">MENU</span>
      </div>

      <!-- Navigation Menu -->
      <v-list class="nav-menu px-3" density="compact" nav>
        <v-list-item
          :active="route.path === '/app/dashboard'"
          @click="navigate('/app/dashboard')"
          class="menu-item mb-1"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon size="20">mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="isAdmin"
          :active="route.path === '/app/users'"
          @click="navigate('/app/users')"
          class="menu-item mb-1"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon size="20">mdi-account-group</v-icon>
          </template>
          <v-list-item-title>Users</v-list-item-title>
        </v-list-item>

        <v-list-item
          :active="route.path === '/app/inquiries'"
          @click="navigate('/app/inquiries')"
          class="menu-item mb-1"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon size="20">mdi-list-box</v-icon>
          </template>
          <v-list-item-title>Inquiries</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="isAdmin"
          :active="route.path === '/app/sections'"
          @click="navigate('/app/sections')"
          class="menu-item mb-1"
          rounded="lg"
        >
          <template v-slot:prepend>
            <v-icon size="20">mdi-sitemap</v-icon>
          </template>
          <v-list-item-title>Sections</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <!-- Change Password Dialog -->
    <v-dialog v-model="pwdDialog" persistent max-width="520">
      <div class="neomorphic-modal">
        <div class="modal-header pa-6">
          <h3 class="modal-title">Change Password</h3>
        </div>
        <div class="modal-content pa-6">
          <v-form ref="pwdFormRef" @submit.prevent="handleChangePassword">
            <v-text-field
              v-model="currentPwd"
              :type="showCurr ? 'text' : 'password'"
              label="Current password"
              :append-icon="showCurr ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showCurr = !showCurr"
              variant="solo"
              class="mb-3"
              hide-details="auto"
              required
            />
            <v-text-field
              v-model="newPwd"
              :type="showNew ? 'text' : 'password'"
              label="New password"
              :append-icon="showNew ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showNew = !showNew"
              variant="solo"
              class="mb-3"
              hide-details="auto"
              required
            />
            <v-text-field
              v-model="confirmPwd"
              :type="showNew ? 'text' : 'password'"
              label="Confirm new password"
              variant="solo"
              class="mb-1"
              hide-details="auto"
              required
            />
            <v-alert v-if="pwdMessage" :type="pwdMessageType" class="neomorphic-alert mt-3">{{ pwdMessage }}</v-alert>
          </v-form>
        </div>
        <div class="modal-actions pa-6 d-flex justify-end">
          <button class="neomorphic-btn mr-3" @click="closePwdDialog" :disabled="pwdLoading">Cancel</button>
          <button class="neomorphic-btn neomorphic-btn-primary" @click="handleChangePassword" :disabled="pwdLoading">
            <v-progress-circular v-if="pwdLoading" indeterminate size="20" width="2" class="mr-2"></v-progress-circular>
            Save
          </button>
        </div>
      </div>
    </v-dialog>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useToast } from '@/composables/useToast'
import userImg from '@/assets/user.png'
import { changePassword } from '@/api/auth'
import { ROLE_LABELS } from '@/utils/constants'

const { showToast } = useToast()

const router = useRouter()
const route = useRoute()
const display = useDisplay()
const userStore = useUserStore()
const themeStore = useThemeStore()

userStore.loadUser()

const drawer = ref(false)
const rail = ref(false)
const searchQuery = ref('')

onMounted(() => { if (display.mdAndUp) drawer.value = true })
watch(() => display.mdAndUp, (val) => { drawer.value = !!val })

const isAdmin = computed(() => userStore.userRole === 'admin')
const userName = computed(() => userStore.userFullName || userStore.userId || '')

const userRoleLabel = computed(() => {
  const role = userStore.userRole || ''
  return ROLE_LABELS[role] || role
})

function guessMimeFromBase64(b64) {
  return b64 && b64.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
}
const avatarSrc = computed(() => {
  const b64 = userStore.userProfileImage
  if (b64) {
    if (b64.startsWith('data:')) return b64
    const mime = guessMimeFromBase64(b64)
    return `data:${mime};base64,${b64}`
  }
  return userImg
})
const navigate = (path) => { router.push(path); if (!display.mdAndUp) drawer.value = false }
const logout = () => { userStore.logout(); router.push({ name: 'login' }) }

// Change Password state and handlers
const pwdDialog = ref(false)
const pwdFormRef = ref(null)
const currentPwd = ref('')
const newPwd = ref('')
const confirmPwd = ref('')
const showCurr = ref(false)
const showNew = ref(false)
const pwdLoading = ref(false)
const pwdMessage = ref('')
const pwdMessageType = ref('info')

const closePwdDialog = () => {
  pwdDialog.value = false
  currentPwd.value = ''
  newPwd.value = ''
  confirmPwd.value = ''
  pwdMessage.value = ''
}

const handleChangePassword = async () => {
  pwdMessage.value = ''
  if (!currentPwd.value || !newPwd.value || !confirmPwd.value) {
    pwdMessageType.value = 'error'
    pwdMessage.value = 'Please fill all fields'
    return
  }
  if (newPwd.value !== confirmPwd.value) {
    pwdMessageType.value = 'error'
    pwdMessage.value = 'New passwords do not match'
    return
  }
  try {
    pwdLoading.value = true
    await changePassword(userStore.userId, currentPwd.value, newPwd.value)
    showToast('Password changed successfully', 'success')
    closePwdDialog()
  } catch (err) {
    pwdMessageType.value = 'error'
    pwdMessage.value = err?.response?.data?.message || 'Failed to change password'
  } finally {
    pwdLoading.value = false
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/neomorphic.scss';

.modern-sidebar {
  background: var(--side-bar-color) !important;
  border-right: none !important;
  transition: background 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse at top left, rgba(91, 147, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  :deep(.v-navigation-drawer__content) {
    position: relative;
    z-index: 1;
  }
}

.collapse-toggle {
  display: flex;
  justify-content: flex-end;
  
  .toggle-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    transition: all 0.2s;
    
    :deep(.v-icon) {
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.08) !important;
      box-shadow: 0 0 12px rgba(91, 147, 255, 0.3);
      
      :deep(.v-icon) {
        color: #5B93FF !important;
      }
    }
  }
}

.modern-sidebar.v-navigation-drawer--rail {
  .collapse-toggle {
    justify-content: center;
  }
}

.rail-avatar {
  margin-bottom: 16px;
  
  .profile-avatar {
    border: 2px solid rgba(91, 147, 255, 0.3);
    box-shadow: 0 4px 12px rgba(91, 147, 255, 0.2);
  }
}

.profile-section {
  padding-top: 8px !important;
  
  .profile-avatar {
    border: 2px solid rgba(91, 147, 255, 0.3);
    box-shadow: 0 4px 12px rgba(91, 147, 255, 0.2);
  }
  
  .user-name {
    color: var(--sidebar-text);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
  }
  
  .user-role {
    color: var(--sidebar-icon);
    font-size: 12px;
    line-height: 1.2;
  }
  
  .settings-btn {
    background: rgba(255, 255, 255, 0.05) !important;
    transition: all 0.2s;
    
    :deep(.v-icon) {
      color: var(--sidebar-icon) !important;
    }
    
    &:hover {
      background: rgba(91, 147, 255, 0.15) !important;
      box-shadow: 0 0 12px rgba(91, 147, 255, 0.3);
      
      :deep(.v-icon) {
        color: #5B93FF !important;
      }
    }
  }
}

.search-section {
  .search-input {
    :deep(.v-field) {
      background: rgba(255, 255, 255, 0.08) !important;
      border-radius: 12px;
      box-shadow: none;
      
      input {
        color: #FFFFFF;
        
        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
      
      .v-icon {
        color: rgba(255, 255, 255, 0.5);
      }
    }
    
    :deep(.v-field__outline) {
      display: none;
    }
  }
}

.menu-label {
  color: var(--sidebar-icon);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.nav-menu {
  .menu-item {
    color: var(--sidebar-text);
    transition: all 0.2s ease;
    margin-bottom: 2px;
    
    :deep(.v-list-item__prepend) {
      .v-icon {
        color: var(--sidebar-icon);
        margin-right: 12px;
      }
    }
    
    :deep(.v-list-item-title) {
      font-size: 14px;
      font-weight: 400;
      color: var(--sidebar-text);
    }
    
    &:hover {
      background: rgba(91, 147, 255, 0.1) !important;
      color: var(--sidebar-text);
      
      :deep(.v-icon) {
        color: #5B93FF;
      }
      
      :deep(.v-list-item-title) {
        color: var(--sidebar-text);
      }
    }
    
    &.v-list-item--active {
      background: rgba(91, 147, 255, 0.15) !important;
      box-shadow: 0 0 16px rgba(91, 147, 255, 0.3);
      color: var(--sidebar-text);
      
      :deep(.v-icon) {
        color: #5B93FF;
      }
      
      :deep(.v-list-item-title) {
        color: var(--sidebar-text);
        font-weight: 500;
      }
    }
  }
  
  .menu-badge {
    :deep(.v-badge__badge) {
      background-color: #5B93FF !important;
      font-size: 11px;
      height: 18px;
      min-width: 18px;
      padding: 0 6px;
    }
  }
}
</style>