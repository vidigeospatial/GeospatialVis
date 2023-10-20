import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import VueAxios from 'vue-axios'

import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import "./styles/main.scss"
// import "./style.css"
import App from './App.vue'
import router from './router'

import ToastService from 'primevue/toastservice'

/* add icons to the library */
import { library } from "@fortawesome/fontawesome-svg-core"
import { faCircleInfo, faInfo } from '@fortawesome/free-solid-svg-icons'
library.add(faCircleInfo, faInfo)
// import pinia from './store/store'
const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(VueAxios, axios)
// app.use(Antd) 
// app.use(PrimeVue, { unstyled: true, pt: {} })
app.use(PrimeVue)
app.use(router)
app.use(ToastService)
app.component("FontAwesomeIcon", FontAwesomeIcon)
app.directive('tooltip', Tooltip)

app.mount('#app')

// FONT AWESOME REQUIRES A PORT  https://stackoverflow.com/questions/66389974/using-font-awesome-in-vue-3
