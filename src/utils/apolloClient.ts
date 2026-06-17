import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { getToken } from '@josempgon/vue-keycloak'
import config from './config'
import { generateTraceparent } from './tracing'

const baseURL = config.apiUrl
const httpLink = new HttpLink({
  uri: `${baseURL}graphql`,
})

const authLink = new SetContextLink(async ({ headers }, _) => {
  const token = await getToken()

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      traceparent: generateTraceparent(),
    },
  }
})

const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default apolloClient