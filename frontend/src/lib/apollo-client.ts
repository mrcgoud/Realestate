import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
  credentials: 'include',
})

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Handle specific GraphQL errors
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Handle authentication errors
        console.error('Authentication error:', err.message)
      }
    }
  }

  if (networkError) {
    console.error('Network error:', networkError)
  }

  return forward(operation)
})

const authLink = new ApolloLink((operation, forward) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  if (token) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
  }

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  ssrMode: typeof window === 'undefined',
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          properties: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return incoming
            },
          },
          searchProperties: {
            keyArgs: false,
            merge(existing = [], incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
})

export default apolloClient
