const {
  PORT,
  SECRET,
  EXPIRES,
  NODE_ENV
} = process.env;

export const port = PORT;
export const jwtConfig = {
  secret: SECRET,
  expiresIn: +EXPIRES
};
export const environment = NODE_ENV;
export const isProduction = environment === 'production';
