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
