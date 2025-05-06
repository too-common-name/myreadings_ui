import './assets/main.css'
import { vueKeycloak } from '@josempgon/vue-keycloak'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' 
import { register } from 'swiper/element/bundle';

import { createApp } from 'vue'
import App from './App.vue'
import initRouter from './router'

register();
const initApp = async () => {
    const app = createApp(App)
  
    await vueKeycloak.install(app, {
      config: {
        url: import.meta.env.VITE_VUE_APP_KEYCLOAK_URL,
        realm: import.meta.env.VITE_VUE_APP_KEYCLOAK_REALM,
        clientId: import.meta.env.VITE_VUE_APP_KEYCLOAK_CLIENT_ID,
      }
    })

    const vuetify = createVuetify({
      icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
      },
      components,
      directives,
    })
    
  
    const router = initRouter()
  
    app.use(router)
    app.use(vuetify)
    app.mount('#app')
  }
  
  initApp()