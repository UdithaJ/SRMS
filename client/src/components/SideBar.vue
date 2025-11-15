<template>
  <nav>
    <v-app-bar app color="cyan-darken-4" class="app-bar-gradient" dense dark :clipped-left="display.mdAndUp">
      <v-app-bar-nav-icon @click="drawer = !drawer" aria-label="Toggle navigation" />
      <v-toolbar-title class="ml-2">SRMS</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="logout" title="Logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      app
      class="drawer-gradient"
      :permanent="display.mdAndUp"
      :temporary="!display.mdAndUp"
      width="240"
      elevation="2"
    >
      <v-list dense nav>
        <v-list-item class="pt-6 pb-4 d-flex flex-column align-center">
          <v-list-item-avatar size="88" class="sidebar-avatar">
            <v-img :src="userImg" />
          </v-list-item-avatar>
          <v-list-item-content class="text-center mt-2">
            <v-list-item-title class="white--text">{{ userName || 'User' }}</v-list-item-title>
            <v-list-item-subtitle class="white--text">{{ userStore.userRole || '' }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item @click="navigate('/app/dashboard')" class="d-flex align-center">
          <template v-slot:prepend>
            <v-list-item-icon class="icon-spacer">
              <v-icon>mdi-view-dashboard</v-icon>
            </v-list-item-icon>
          </template>
          <v-list-item-content>
            <v-list-item-title class="text-no-wrap">Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isAdmin" @click="navigate('/app/users')" class="d-flex align-center">
          <template v-slot:prepend>
            <v-list-item-icon class="icon-spacer">
              <v-icon>mdi-account-multiple</v-icon>
            </v-list-item-icon>
          </template>
          <v-list-item-content>
            <v-list-item-title class="text-no-wrap">Users</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item @click="navigate('/app/inquiries')" class="d-flex align-center">
          <template v-slot:prepend>
            <v-list-item-icon class="icon-spacer">
              <v-icon>mdi-file-document-outline</v-icon>
            </v-list-item-icon>
          </template>
          <v-list-item-content>
            <v-list-item-title class="text-no-wrap">Inquiries</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="isAdmin" @click="navigate('/app/sections')" class="d-flex align-center">
          <template v-slot:prepend>
            <v-list-item-icon class="icon-spacer">
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-list-item-icon>
          </template>
          <v-list-item-content>
            <v-list-item-title class="text-no-wrap">Sections</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useUserStore } from '@/stores/user'
import userImg from '@/assets/user.png'

const router = useRouter()
const display = useDisplay()
const userStore = useUserStore()

userStore.loadUser()

const drawer = ref(false)

onMounted(() => { if (display.mdAndUp) drawer.value = true })
watch(() => display.mdAndUp, (val) => { drawer.value = !!val })

const isAdmin = computed(() => userStore.userRole === 'admin')
const userName = computed(() => userStore.userFullName || userStore.userId || '')
const navigate = (path) => { router.push(path); if (!display.mdAndUp) drawer.value = false }
const logout = () => { userStore.logout(); router.push({ name: 'login' }) }
</script>

<style scoped>
.menu { list-style: none; padding: 0; }
.menu li { margin-bottom: 15px; }
.menu a { color: white; text-decoration: none; }
.menu a.router-link-active { font-weight: bold; }
.logout-btn { background: none; border: none; color: white; cursor: pointer; font-size: 1em; padding: 0 }
.logout-btn:hover { text-decoration: underline }
.icon-spacer { margin-right: 12px; min-width: 24px; }
.v-list-item { align-items: center; }
.text-no-wrap { white-space: nowrap; }
.sidebar-avatar { width: 112px; height: 112px; }
.sidebar-avatar .v-image__image { width: 112px !important; height: 112px !important; object-fit: cover; border-radius: 50%; }
.app-bar-gradient {
  background-image: linear-gradient(to right, #021229 0%, #1976D2 100%) !important;
  background-repeat: no-repeat;
}
.app-bar-gradient .v-toolbar-title,
.app-bar-gradient .v-btn,
.app-bar-gradient .v-icon {
  color: #fff !important;
}
.drawer-gradient {
  background-image: linear-gradient(to bottom, #021229 0%, #1976D2 100%) !important;
  background-repeat: no-repeat;
}
.drawer-gradient .v-list-item-title,
.drawer-gradient .v-list-item-subtitle,
.drawer-gradient .v-icon {
  color: #fff !important;
}
</style>