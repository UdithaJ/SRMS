<template>
  <div class="register-container">
    <h2>Login</h2>
    <form @submit.prevent="login">

      <div class="form-group">
        <input v-model="userName" type="text" placeholder="Username" required />
      </div>

      <div class="form-group">
        <input v-model="password" type="password" placeholder="Password" required />
      </div>

      <button type="submit">Login</button>
    </form>

    <p class="message" v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'


const userName = ref('');
const password = ref('');
const message = ref('');
const userStore = useUserStore();
const router = useRouter()


const API_URL = 'http://127.0.0.1:3000/api/auth/login';

const login = async () => {
  try {
    const response = await axios.post(API_URL, {
      userName: userName.value,
      password: password.value,
    });

    message.value = response.data;

    userName.value = '';
    password.value = '';
    
    userStore.setUser(response.data.user);
    router.push({ name: 'dashboard' })
    

  } catch (error) {
    message.value = error.response?.data?.message || 'Login failed';
  }
};
</script>

<style scoped>
/* Container */
.register-container {
  width: 400px;
  margin: 50px auto;
  padding: 40px 30px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
}

/* Heading */
h2 {
  text-align: center;
  font-weight: 600;
  font-size: 28px;
  color: #1f2937;
  margin-bottom: 30px;
}

/* Form Group */
.form-group {
  position: relative;
  margin-bottom: 25px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  outline: none;
}

/* Button */
button {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Message */
.message {
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
  color: #10b981; /* green-500 */
}

/* Smooth background */
body {
  background: linear-gradient(135deg, #e0f2fe, #fef3c7);
  font-family: 'Poppins', sans-serif;
}
</style>
