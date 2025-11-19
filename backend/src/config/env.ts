import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL'];

required.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[env] Optional missing env var: ${key}. Some features may not work until it is set.`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  openAiApiKey: process.env.OPENAI_API_KEY,
};
