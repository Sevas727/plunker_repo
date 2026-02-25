export type UserRole = 'user' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: string;
};

export type TodoStatus = 'pending' | 'completed';

export type Todo = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type TodosTable = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
};

export type TodoForm = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
};
