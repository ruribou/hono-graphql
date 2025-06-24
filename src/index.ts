import { graphqlServer, type RootResolver } from '@hono/graphql-server'
import { buildSchema } from 'graphql'
import { Hono } from 'hono'
import { schema as originalSchema } from './graphql/schema'
import { PrismaClient } from './generated/prisma'

const app = new Hono()
const schema = buildSchema(originalSchema)
const prisma = new PrismaClient()

const rootResolver: RootResolver = () => ({
  todos: async () => {
    return await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
  },
  addTodo: async ({ title }: { title: string }) => {
    return await prisma.todo.create({ data: { title } });
  },
  toggleTodo: async ({ id }: { id: number }) => {
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new Error('Not found');
    return await prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });
  },
});

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