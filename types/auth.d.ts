export interface User {
  _id: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient';
  profile?: string;
  lastLogin?: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Session {
  user: User;
  token: string;
  expires: string;
}