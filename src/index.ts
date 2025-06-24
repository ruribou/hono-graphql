import { graphqlServer, type RootResolver } from '@hono/graphql-server'
import { buildSchema } from 'graphql'
import { Hono } from 'hono'
import { schema as originalSchema } from './graphql/schema'
import { PrismaClient } from './generated/prisma'

const app = new Hono()
const schema = buildSchema(originalSchema)
const prisma = new PrismaClient()

function formatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000); // JSTに変換
  return `${jst.getFullYear()}-${pad(jst.getMonth() + 1)}-${pad(jst.getDate())} ${pad(jst.getHours())}:${pad(jst.getMinutes())}:${pad(jst.getSeconds())}`;
}

const rootResolver: RootResolver = () => ({
  todos: async () => {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    return todos.map(todo => ({
      ...todo,
      createdAt: formatDate(todo.createdAt),
    }));
  },
  addTodo: async ({ title }: { title: string }) => {
    const todo = await prisma.todo.create({ data: { title } });
    return {
      ...todo,
      createdAt: formatDate(todo.createdAt),
    };
  },
  toggleTodo: async ({ id }: { id: number }) => {
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) throw new Error('Not found');
    const updated = await prisma.todo.update({
      where: { id },
      data: { completed: !todo.completed },
    });
    return {
      ...updated,
      createdAt: formatDate(updated.createdAt),
    };
  },
  deleteTodo: async ({ id }: { id: number }) => {
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) return false;
    await prisma.todo.delete({ where: { id } });
    return true;
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