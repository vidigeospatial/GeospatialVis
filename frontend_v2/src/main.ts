import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
// import './style.css'
import "./styles/main.scss"
import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue)
app.mount('#app')
