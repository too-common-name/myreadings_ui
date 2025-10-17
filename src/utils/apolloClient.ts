import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { getToken } from '@josempgon/vue-keycloak'

const baseURL = import.meta.env.VITE_API_URL
const httpLink = new HttpLink({
  uri: `${baseURL}graphql`,
})


const authLink = new SetContextLink(async ({ headers }, _) => {
  const token = await getToken()
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default apolloClient