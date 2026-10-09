import { db } from "@/lib/db";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
};


export async function findUserByEmail(
  email: string
): Promise<User | null> {
  const result = await db.query<User>(
    `
      SELECT
        id,
        name,
        email,
        password,
        created_at AS "createdAt"
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function findUserById(
  id: number
): Promise<User | null> {
  const result = await db.query<User>(
    `
      SELECT
        id,
        name,
        email,
        password,
        created_at AS "createdAt"
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function createUser(
  data: CreateUserInput
): Promise<User> {
  const { name, email, password } = data;

  const result = await db.query<User>(
    `
      INSERT INTO users (
        name,
        email,
        password
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        email,
        password,
        created_at AS "createdAt"
    `,
    [name, email, password]
  );

  return result.rows[0];
}