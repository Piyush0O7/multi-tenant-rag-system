import bcrypt from 'bcryptjs';
import { db } from './dbService';

export class UserService {
  static async createUser({ tenantId, email, password }: { tenantId: string; email: string; password: string }) {
    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (tenant_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, tenant_id, email, role',
      [tenantId, email.toLowerCase(), hashed]
    );
    return result.rows[0];
  }

  static async findByEmail(email: string) {
    const result = await db.query('SELECT id, tenant_id, email, password_hash, role FROM users WHERE email = $1', [email.toLowerCase()]);
    return result.rows[0];
  }

  static async verifyPassword(password: string, hash: string) {
    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }
  }
}
