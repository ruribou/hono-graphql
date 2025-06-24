import { graphqlServer, type RootResolver } from '@hono/graphql-server'
import { buildSchema } from 'graphql'
import { Hono } from 'hono'
import { schema as originalSchema } from './graphql/schema'

const app = new Hono()

const schema = buildSchema(originalSchema)

const rootResolver: RootResolver = () => {
  return {
    hello: () => 'Hello Hono GraphQL!!',
  };
};

app.use(
  '/graphql',
  graphqlServer({
    schema,
    rootResolver,
    graphiql: true,
  })
)

if (require.main === module) {
  Bun.serve({
    fetch: app.fetch,
    port: 3000,
  })
}

export default app