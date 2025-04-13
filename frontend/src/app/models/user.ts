export class User {
  _id?: string;
  username!: string;
  email!: string;
  password?: string;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class UserResponse {
  status!: number;
  message!: string;
  token!: string;
  user!: User;
}
