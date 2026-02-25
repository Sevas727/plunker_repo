import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: process.env.POSTGRES_SSL === 'false' ? false : 'require',
});

export default sql;
