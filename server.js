const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const path = require('path')

const PORT = process.env.PORT || 8080
const NAMESPACE = process.env.NAMESPACE || 'myreadings-dev'
const APP_SERVICE = process.env.APP_SERVICE_URL || 'http://myreadings-app:8081'
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://myreadings-user-service:8083'
const KC_SERVICE_NAME = process.env.KC_ROUTE_NAME || `myreadings-keycloak-${NAMESPACE}`
const KC_REALM = process.env.KEYCLOAK_REALM || 'my-readings'
const KC_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'myreadings-client'

const app = express()

app.get('/config.js', (req, res) => {
  const host = req.headers.host || ''
  const appsIdx = host.indexOf('.apps.')
  let keycloakUrl = ''
  if (appsIdx !== -1) {
    const appsDomain = host.substring(appsIdx + 1)
    keycloakUrl = `https://${KC_SERVICE_NAME}.${appsDomain}/`
  }
  res.type('application/javascript')
  res.send(`window.__APP_CONFIG__ = {
  VITE_API_URL: "/",
  VITE_VUE_APP_KEYCLOAK_URL: "${keycloakUrl}",
  VITE_VUE_APP_KEYCLOAK_REALM: "${KC_REALM}",
  VITE_VUE_APP_KEYCLOAK_CLIENT_ID: "${KC_CLIENT_ID}"
};`)
})

app.use('/api/v1/users', createProxyMiddleware({
  target: USER_SERVICE,
  changeOrigin: true,
  pathRewrite: { '^/api/v1/users': '/api/v1/users' },
}))

app.use('/api', createProxyMiddleware({
  target: APP_SERVICE,
  changeOrigin: true,
}))

app.use(express.static(path.join(__dirname, 'public')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`myreadings-ui listening on :${PORT}`)
  console.log(`  proxy /api -> ${APP_SERVICE}`)
  console.log(`  proxy /api/v1/users -> ${USER_SERVICE}`)
  console.log(`  keycloak route prefix: ${KC_SERVICE_NAME}`)
})
