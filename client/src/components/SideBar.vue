<template>
  <nav>
    <v-app-bar app color="primary" dense dark :clipped-left="display.mdAndUp">
      <v-app-bar-nav-icon @click="drawer = !drawer" aria-label="Toggle navigation" />
      <v-toolbar-title class="ml-2">SRMS</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click.stop="toggleMini" v-if="display.mdAndUp" :title="mini ? 'Expand' : 'Collapse'">
        <v-icon>{{ mini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
      </v-btn>
      <v-btn icon @click="logout" title="Logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="display.mdAndUp"
      :temporary="!display.mdAndUp"
      :mini-variant="display.mdAndUp ? mini : false"
      width="240"
      mini-variant-width="72"
      elevation="2"
    >
      <v-list dense nav>
        <v-list-item two-line class="pt-4 pb-4">
          <v-list-item-avatar size="40">
            <v-img :src="userImg" />
          </v-list-item-avatar>
          <v-list-item-content v-if="!mini">
            <v-list-item-title class="white--text">{{ userName || 'User' }}</v-list-item-title>
            <v-list-item-subtitle class="white--text">{{ userStore.userRole || '' }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item @click="navigate('/app/dashboard')">
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="!mini">Dashboard</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" @click="navigate('/app/users')">
          <v-list-item-icon>
            <v-icon>mdi-account-multiple</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="!mini">Users</v-list-item-title>
        </v-list-item>

        <v-list-item @click="navigate('/app/inquiries')">
          <v-list-item-icon>
            <v-icon>mdi-file-document-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="!mini">Inquiries</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isAdmin" @click="navigate('/app/sections')">
          <v-list-item-icon>
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-list-item-icon>
          <v-list-item-title v-if="!mini">Sections</v-list-item-title>
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
const mini = ref(false)
try { const saved = window.localStorage.getItem('sidebarMini'); mini.value = saved === 'true' } catch (e) { mini.value = false }

onMounted(() => { if (display.mdAndUp) drawer.value = true })
watch(() => display.mdAndUp, (val) => { drawer.value = !!val })
watch(mini, (val) => { try { window.localStorage.setItem('sidebarMini', val ? 'true' : 'false') } catch (e) {} })

const toggleMini = () => { mini.value = !mini.value }
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
</style>
          const display = useDisplay()
