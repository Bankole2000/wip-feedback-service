import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();
export const config = {
  app: {
    PORT: process.env.PORT || 5007,
    EMAIL_SERVICE_KEY: process.env.EMAIL_SERVICE_KEY || "",
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || "10"),
  },
  authScope: "app",
  jwt: {
    TOKEN_EXPIRY: parseInt(process.env.TOKEN_EXPIRY || "3600"),
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || "",
  },
  db: {
    MONGO_URI: process.env.MONGO_URI || "",
    DB_NAME: process.env.DB_NAME || "",
  },
  aws: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
    AWS_REGION: process.env.AWS_REGION || "",
  },
  serviceURIs: {
    MESSAGE_SERVICE: process.env.MESSAGE_SERVICE_URI || "",
  },
  allowedServiceKeys: (process.env.SERVICE_KEYS || "").split(","), // comma separated list of allowed service keys
  serviceKeys: {
    MESSAGE_SERVICE_APP_ID: process.env.MESSAGE_SERVICE_APP_ID || "",
    USER_SERVICE_APP_ID: process.env.USER_SERVICE_APP_ID || "",
  },
};
