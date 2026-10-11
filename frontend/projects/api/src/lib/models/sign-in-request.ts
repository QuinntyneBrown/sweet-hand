export interface SignInRequest {
  email: string;
  password: string;
  /** Required once the network has failed too often (L2-076.5). */
  challengeToken?: string;
}
