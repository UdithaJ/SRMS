<template>
  <v-container class="fill-height login-wrapper" fluid>
    <v-row align="center" justify="center" class="ma-0 pa-0" style="width:100%">
      <v-col cols="12" sm="10" md="6" lg="5" class="d-flex justify-center">
        <v-card class="pa-8 elevation-12 login-card">
          <v-row class="mb-4" align="center">
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-avatar size="96">
                <v-img src="/logo192.png" alt="logo" />
              </v-avatar>
            </v-col>
            <v-col cols="9">
              <h3 class="mb-0">Welcome back</h3>
              <div class="subtitle-2">Sign in to your account</div>
            </v-col>
          </v-row>

          <v-form ref="formRef" @submit.prevent="login" lazy-validation>
            <v-text-field
              v-model="form.userName"
              label="Username"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <v-text-field
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append="showPassword = !showPassword"
              :rules="[rules.required]"
              outlined
              dense
              hide-details="auto"
              class="mb-3"
            />

            <v-btn :loading="loading" type="submit" class="mt-4" color="primary" large block>
              Sign in
            </v-btn>
          </v-form>

          <v-alert v-if="message" :type="messageType" class="mt-4" dense border="left">
            {{ message }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onBeforeMount } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const formRef = ref(null)
const form = reactive({ userName: '', password: '' })
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref('')

const userStore = useUserStore()
const router = useRouter()

const rules = {
  required: (v) => !!v || 'This field is required',
}

const API_URL = 'http://127.0.0.1:3000/api/auth/login'

import { onMounted } from 'vue'

onBeforeMount(async () => {
  try {
    // electronStore is only available in the Electron renderer via preload.
    // Guard access so the page also works in a browser/dev server environment.
    if (window && window.electronStore && typeof window.electronStore.get === 'function') {
      await userStore.loadUser()
      if (userStore.userId) {
        router.push({ name: 'dashboard' })
      }
    }
  } catch (err) {
    // don't block the UI if loading persisted user fails
    console.error('loadUser failed', err)
  }
})

const login = async () => {
  message.value = ''
  if (formRef.value && !(await formRef.value.validate())) return
  loading.value = true
  try {
    const res = await axios.post(API_URL, {
      userName: form.userName,
      password: form.password,
    })

    const data = res.data
    userStore.setUser(data.user)
    messageType.value = 'success'
    message.value = 'Login successful — redirecting...'
    setTimeout(() => router.push({ name: 'dashboard' }), 400)
  } catch (err) {
    messageType.value = 'error'
    message.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}

const forgotPassword = () => {
  // placeholder — can open a dialog or route to forgot password
  messageType.value = 'info'
  message.value = 'Please contact your administrator to reset your password.'
}
</script>

<style scoped>
.login-card {
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.9));
  max-width: 640px;
  width: 100%;
}
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v-application--wrap {
  min-height: 100vh;
}
body {
  background: linear-gradient(135deg, #e0f2fe, #fef3c7);
}
</style>
