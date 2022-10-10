declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      SECRET: string;
      EXPIRES: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}
export {};
