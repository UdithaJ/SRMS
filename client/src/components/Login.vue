<template>
  <v-container class="fill-height login-wrapper" fluid>
    <v-row align="center" justify="center" class="ma-0 pa-0" style="width:100%">
      <v-col cols="12" sm="10" md="6" lg="5" class="d-flex justify-center">
        <v-card class="pa-8 elevation-12 login-card">
          <v-row class="mb-4" align="center">
            <v-col cols="3" class="d-flex align-center justify-center">
              <v-avatar size="96" class="login-avatar">
                <v-icon size="64" color="white">mdi-account-circle</v-icon>
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
              variant="solo"
              density="comfortable"
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
              variant="solo"
              density="comfortable"
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
import { http } from '@/api/http'
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

const API_URL = '/api/auth/login'

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
    const res = await http.post(API_URL, {
      userName: form.userName,
      password: form.password,
    })

    const data = res.data
    
    // Store user data and token
    await userStore.setUser(data.user, data.token)
    
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

<style scoped lang="scss">
$neomorphic-bg: #e0e5ec;
$neomorphic-shadow-dark: rgba(163, 177, 198, 0.6);
$neomorphic-shadow-light: rgba(255, 255, 255, 0.9);
$neomorphic-accent: #667eea;
$neomorphic-text: #4a5568;
$neomorphic-text-light: #718096;

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0e5ec 0%, #d5dae5 100%);
}

.login-card {
  background: $neomorphic-bg;
  border-radius: 24px;
  max-width: 640px;
  width: 100%;
  box-shadow: 
    12px 12px 24px $neomorphic-shadow-dark,
    -12px -12px 24px $neomorphic-shadow-light;
  
  .login-avatar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    box-shadow: 
      8px 8px 16px $neomorphic-shadow-dark,
      -8px -8px 16px $neomorphic-shadow-light;
  }
  
  h3 {
    color: $neomorphic-text;
    font-weight: 600;
    font-size: 24px;
  }
  
  .subtitle-2 {
    color: $neomorphic-text-light;
    font-size: 14px;
  }
  
  :deep(.v-text-field) {
    .v-field {
      background: $neomorphic-bg !important;
      border-radius: 12px !important;
      box-shadow: 
        inset 3px 3px 6px $neomorphic-shadow-dark,
        inset -3px -3px 6px $neomorphic-shadow-light !important;
      
      input {
        color: $neomorphic-text !important;
      }
      
      .v-field__outline {
        display: none !important;
      }
    }
    
    .v-label {
      color: $neomorphic-text-light !important;
    }
    
    .v-field__append-inner {
      .v-icon {
        color: $neomorphic-text-light !important;
      }
    }
  }
  
  :deep(.v-btn) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border-radius: 12px;
    box-shadow: 
      6px 6px 12px $neomorphic-shadow-dark,
      -6px -6px 12px $neomorphic-shadow-light;
    text-transform: none;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.5px;
    
    &:hover {
      box-shadow: 
        4px 4px 8px $neomorphic-shadow-dark,
        -4px -4px 8px $neomorphic-shadow-light;
    }
    
    &:active {
      box-shadow: 
        inset 3px 3px 6px rgba(102, 126, 234, 0.4),
        inset -3px -3px 6px rgba(118, 75, 162, 0.2);
    }
  }
  
  :deep(.v-alert) {
    border-radius: 12px;
    box-shadow: 
      4px 4px 8px $neomorphic-shadow-dark,
      -4px -4px 8px $neomorphic-shadow-light;
    border: none !important;
    
    &.v-alert--variant-tonal {
      background: $neomorphic-bg !important;
    }
  }
}
</style>
