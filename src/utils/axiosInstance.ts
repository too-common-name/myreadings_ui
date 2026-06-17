import axios from 'axios'
import { getToken } from '@josempgon/vue-keycloak'
import config from './config'

const baseURL = config.apiUrl
const instance = axios.create({ baseURL })

instance.interceptors.request.use(
  async (config) => {
    const token = await getToken()
    config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

export default instance
