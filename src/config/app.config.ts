import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface IAppConfig {
  PORT: number;
  MONGO_URI: string;
}

const getAppConfig = (): IAppConfig => {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const mongoUri = process.env.MONGO_URI || '';
  return {
    PORT: port,
    MONGO_URI: mongoUri,
  };
};

const AppConfig = getAppConfig();

console.log('AppConfig:', AppConfig);

export default AppConfig;
