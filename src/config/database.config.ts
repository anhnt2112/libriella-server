import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongoHost: process.env.MONGO_HOST || 'localhost',
  mongoPort: process.env.MONGO_PORT || 27017,
  mongoUser: process.env.MONGO_USER,
  mongoPassword: process.env.MONGO_PASSWORD,
  mongoDatabase: process.env.MONGO_DATABASE,
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT, 10) || 6379,
}));