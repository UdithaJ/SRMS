<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to your dashboard!</p>

    <div class="cards">
      <div class="card">
        <h2>Users</h2>
        <p>Number of users: {{ usersCount }}</p>
      </div>
      <div class="card">
        <h2>Inquiries</h2>
        <p>Number of Inquiries: {{ inquiriesCount }}</p>
      </div>
      <div class="card">
        <h2>Sections</h2>
        <p>Number of Sections: {{ sectionsCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const usersCount = ref(0);
const inquiriesCount = ref(0);
const sectionsCount = ref(0);

// Fetch number of users
const fetchUsersCount = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/auth/users');
    usersCount.value = response.data.length;
  } catch (err) {
    console.error('Failed to fetch users count:', err);
    usersCount.value = 0;
  }
};

// Fetch number of inquiries
const fetchInquiriesCount = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/inquiries');
    inquiriesCount.value = response.data.length;
  } catch (err) {
    console.error('Failed to fetch inquiries count:', err);
    inquiriesCount.value = 0;
  }
};

// Fetch number of sections
const fetchSectionsCount = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:3000/api/sections');
    sectionsCount.value = response.data.length;
  } catch (err) {
    console.error('Failed to fetch sections count:', err);
    sectionsCount.value = 0;
  }
};

onMounted(() => {
  fetchUsersCount();
  fetchInquiriesCount();
  fetchSectionsCount();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.cards {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.card {
  background: #f3f4f6;
  padding: 15px;
  border-radius: 8px;
  flex: 1;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

h1 {
  margin: 0;
}

h2 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}
</style>
