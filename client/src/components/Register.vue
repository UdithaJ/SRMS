<template>
  <div class="register-container">
    <h2>User Registration</h2>
    <form @submit.prevent="registerUser">
      <div class="form-group">
        <input v-model="firstName" type="text" placeholder="First Name" required />
      </div>

      <div class="form-group">
        <input v-model="lastName" type="text" placeholder="Last Name" required />
      </div>

      <div class="form-group">
        <input v-model="userName" type="text" placeholder="Username" required />
      </div>

      <div class="form-group">
        <input v-model="referenceNo" type="text" placeholder="Reference Number" required />
      </div>

      <div class="form-group">
        <input v-model="password" type="password" placeholder="Password" required />
      </div>

      <button type="submit">Register</button>
    </form>

    <p class="message" v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { http } from '@/api/http';

const firstName = ref('');
const lastName = ref('');
const userName = ref('');
const referenceNo = ref('');
const password = ref('');
const message = ref('');

const API_URL = '/api/auth/register';

const registerUser = async () => {
  try {
    const response = await http.post(API_URL, {
      firstName: firstName.value,
      lastName: lastName.value,
      userName: userName.value,
      referenceNo: referenceNo.value,
      password: password.value,
    });

    message.value = response.data.message;

    firstName.value = '';
    lastName.value = '';
    userName.value = '';
    referenceNo.value = '';
    password.value = '';

  } catch (error) {
    message.value = error.response?.data?.message || 'Registration failed';
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
