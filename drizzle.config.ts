import { defineConfig } from 'drizzle-kit';
import { serverEnv } from '@/lib/env';

export default defineConfig({
    out: './drizzle',
    schema: './db/schema/index.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: serverEnv.DATABASE_URL,
    },
});
