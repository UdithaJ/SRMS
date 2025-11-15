<template>
  <nav>
    <ul class="menu">
      <li><RouterLink to="/app/dashboard">Dashboard</RouterLink></li>
      <li v-if="isAdmin"><RouterLink to="/app/users">Users</RouterLink></li>
      <li><RouterLink to="/app/inquiries">Inquiries</RouterLink></li>
      <li><RouterLink to="/app/sections">Sections</RouterLink></li>
      <li>
        <button @click="logout" class="logout-btn">Logout</button>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore();

userStore.loadUser();

// Check if the user has the 'admin' role

const isAdmin = computed(() => userStore.userRole == 'admin')
console.error(userStore);

// Logout function
const logout = () => {
userStore.logout();
 router.push({ name: 'login' })}
</script>

<style>
.menu {
  list-style: none;
  padding: 0;
}
.menu li {
  margin-bottom: 15px;
}
.menu a {
  color: white;
  text-decoration: none;
}
.menu a.router-link-active {
  font-weight: bold;
}
.logout-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1em;
  padding: 0;
}
.logout-btn:hover {
  text-decoration: underline;
}
</style>
