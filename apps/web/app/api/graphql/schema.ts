export const typeDefs = `#graphql
  type Todo {
    id: ID!
    title: String!
    description: String!
    status: String!
    created_at: String!
    updated_at: String!
    user_id: String!
    user_name: String
    user_email: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Stats {
    totalTodos: Int!
    pendingTodos: Int!
    completedTodos: Int!
  }

  type TodosPage {
    data: [Todo!]!
    page: Int!
    totalPages: Int!
  }

  type Query {
    todos(query: String, page: Int, userId: String): TodosPage!
    todo(id: ID!): Todo
    stats: Stats!
    users: [User!]!
  }

  type Mutation {
    createTodo(title: String!, description: String): Todo!
    updateTodo(id: ID!, title: String!, description: String, status: String!): Todo!
    deleteTodo(id: ID!): ID!
  }
`;
