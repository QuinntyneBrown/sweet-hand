/**
 * A customer registration (L2-023, L2-070.2). There is no role field: the
 * server creates a customer whatever else the body holds (L2-056.1).
 */
export interface RegisterRequest {
  displayName: string;
  email: string;
  password: string;
  consent: boolean;
  challengeToken: string;
}
