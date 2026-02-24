import { vi } from 'vitest';

const sql = vi.fn((..._args: unknown[]) => Promise.resolve([]));

export default sql;
