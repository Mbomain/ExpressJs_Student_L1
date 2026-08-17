import pool from '../configuration/database';
import { Role, User } from '../models/User';

const COLUMNS = 'id, email, password_hash AS "passwordHash", role';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>(
      `SELECT ${COLUMNS} FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async create(email: string, passwordHash: string, role: Role): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`,
      [email, passwordHash, role]
    );
    return result.rows[0];
  }
}
