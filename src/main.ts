import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(pinia)

// Hydrate auth state before setting up router
// This is to ensure the auth state is hydrated before the router is used
async function initApp() {
  const authStore = useAuthStore()
  await authStore.hydrate()

  app.use(router)
  app.mount('#app')
}

initApp()
