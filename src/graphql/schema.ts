export const schema = `
type Todo {
  id: Int!
  title: String!
  completed: Boolean!
  createdAt: String!
}

type Query {
  todos: [Todo!]!
}

type Mutation {
  addTodo(title: String!): Todo!
  toggleTodo(id: Int!): Todo!
  deleteTodo(id: Int!): Boolean!
}
`;