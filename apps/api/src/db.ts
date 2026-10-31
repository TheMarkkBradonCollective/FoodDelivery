import { neon } from "@neondatabase/serverless";

export type Sql = ReturnType<typeof neon>;

export function getSql(databaseUrl: string): Sql {
  return neon(databaseUrl);
}

export type ProfileRow = {
  id: string;
  email: string | null;
  personal_email: string | null;
  company_email: string | null;
  name: string | null;
  role: string;
  is_founder: boolean;
  avatar_url: string | null;
  access_preference: string | null;
};

export function rows<T = Record<string, unknown>>(result: unknown): T[] {
  return result as T[];
}

export function firstRow<T = Record<string, unknown>>(result: unknown): T | undefined {
  return rows<T>(result)[0];
}
