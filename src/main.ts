import './assets/main.css'
import config from './utils/config'
import { vueKeycloak } from '@josempgon/vue-keycloak'

import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import { register } from 'swiper/element/bundle'

import { createApp } from 'vue'
import App from './App.vue'
import initRouter from './router'

register()
const initApp = async () => {
  const app = createApp(App)

  await vueKeycloak.install(app, {
    config: {
      url: config.keycloakUrl,
      realm: config.keycloakRealm,
      clientId: config.keycloakClientId,
    },
  })

  const myCustomTheme: ThemeDefinition = {
    dark: false,
    colors: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      primary: '#5ba352',
      secondary: '#c8eb79',
      error: '#B00020',
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FB8C00',
    },
  }

  const vuetify = createVuetify({
    theme: {
      defaultTheme: 'myCustomTheme',
      themes: {
        myCustomTheme,
      },
    },
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
