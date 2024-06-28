import { drizzle } from 'drizzle-orm/libsql';
import * as schema1 from './schema/projectes'
import * as schema2 from './schema/images_projects'
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({ 
    url: process.env.TURSO_CONNECTION_URL!, 
    authToken: process.env.TURSO_AUTH_TOKEN! });

const db = drizzle(client,{schema : {...schema1,...schema2}});

export default db