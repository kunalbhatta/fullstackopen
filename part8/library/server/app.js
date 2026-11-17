import { createServer } from 'node:http'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import { makeExecutableSchema } from '@graphql-tools/schema'
import express from 'express'
import { useServer } from 'graphql-ws/use/ws'
import { WebSocketServer } from 'ws'
import makeResolvers, { tokenUser } from './resolvers.js'
import typeDefs from './typeDefs.js'

export async function createLibrary({ secret, demoPassword }) {
  if (!secret) throw new Error('Set JWT_SECRET before starting the library')

  const app = express()
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers: makeResolvers({ secret, demoPassword }) })
  const websocket = new WebSocketServer({ server: httpServer, path: '/graphql' })
  const sockets = useServer({
    schema,
    context: async ({ connectionParams }) => ({
      currentUser: await tokenUser(connectionParams?.authorization, secret),
    }),
  }, websocket)
  const apollo = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      { async serverWillStart() { return { drainServer: () => sockets.dispose() } } },
    ],
  })

  await apollo.start()
  app.use('/graphql', express.json(), expressMiddleware(apollo, {
    context: async ({ req }) => ({ currentUser: await tokenUser(req.get('authorization'), secret) }),
  }))

  return { httpServer, stop: () => apollo.stop() }
}
