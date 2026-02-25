import postgres from 'postgres';
import { env } from './env';

const sql = postgres(env.POSTGRES_URL, {
  ssl: env.POSTGRES_SSL === 'false' ? false : 'require',
});

export default sql;
