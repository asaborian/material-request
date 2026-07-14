import { drizzle } from 'drizzle-orm/neon-http';

// 他のファイルから「db」を呼び出せるように export する
export const db = drizzle(process.env.DATABASE_URL!);

