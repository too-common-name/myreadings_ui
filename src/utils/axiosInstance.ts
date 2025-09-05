import axios from 'axios'
import { getToken } from '@josempgon/vue-keycloak'

const baseURL = import.meta.env.VITE_API_URL
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
