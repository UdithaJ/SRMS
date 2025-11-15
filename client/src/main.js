import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import 'vuetify/styles' // global Vuetify styles
import '@mdi/font/css/materialdesignicons.css' // optional, for icons

// 1️⃣ Create the Vue app once
const app = createApp(App)

// 2️⃣ Create Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
})

// 3️⃣ Register plugins
app.use(router)
app.use(createPinia())
app.use(vuetify)

// 4️⃣ Mount the app
app.mount('#app')
