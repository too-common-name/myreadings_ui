declare global {
  interface Window {
    __APP_CONFIG__?: Record<string, string>
  }
}

function get(key: string): string {
  return window.__APP_CONFIG__?.[key] || import.meta.env[key] || ''
}

export const config = {
  apiUrl: get('VITE_API_URL'),
  keycloakUrl: get('VITE_VUE_APP_KEYCLOAK_URL'),
  keycloakRealm: get('VITE_VUE_APP_KEYCLOAK_REALM'),
  keycloakClientId: get('VITE_VUE_APP_KEYCLOAK_CLIENT_ID'),
  apiStrategy: get('VITE_API_STRATEGY'),
}

export default config
