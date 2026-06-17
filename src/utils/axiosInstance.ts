import axios from 'axios'
import { getToken } from '@josempgon/vue-keycloak'
import config from './config'
import { generateTraceparent } from './tracing'

const baseURL = config.apiUrl
const instance = axios.create({ baseURL })

instance.interceptors.request.use(
  async (config) => {
    const token = await getToken()
    config.headers['Authorization'] = `Bearer ${token}`
    config.headers['traceparent'] = generateTraceparent()
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default instance
