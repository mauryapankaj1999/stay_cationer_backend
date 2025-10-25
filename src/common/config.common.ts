import * as dotenv from "dotenv";
dotenv.config({ override: true });

/**
 * Create a .env.local file for secrets
 */
dotenv.config({ path: ".env.local", override: true });
export const CONFIG = {
  PORT: process.env.PORT ? process.env.PORT : 3000,
  MONGOURI: process.env.MONGOURI ? process.env.MONGOURI : "",
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
  ACCESS_TOKEN: process.env.ACCESS_TOKEN,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  ADMIN_EAMIL: process.env.ADMIN_EAMIL,
  APP_URL: process.env.APP_URL,
};
