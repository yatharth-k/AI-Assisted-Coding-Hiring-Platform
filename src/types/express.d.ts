declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      iat: number;
    } | null;
  }
} 