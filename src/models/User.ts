export type Role = 'ADMIN' | 'STUDENT';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
}

export type AuthenticatedUser = Omit<User, 'passwordHash'>;

export interface Credentials {
  email: string;
  password: string;
}
