export interface AddOperatorRequest {
  name: string;
  email: string;
  role: 'operator' | 'admin';
}
