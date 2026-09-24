export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface ProfilePayload {
  username: string;
  full_name: string;
  email: string;
}

export interface User {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: {
    id: string;
    code: string;
    name: string;
  } | null;
}
