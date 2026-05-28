import { db } from './dbService';

export interface CreateTenantPayload {
  name: string;
  description?: string;
}

export class TenantService {
  static async createTenant(payload: CreateTenantPayload) {
    const { name, description } = payload;
    const result = await db.query(
      'INSERT INTO tenants (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at',
      [name, description ?? null]
    );
    return result.rows[0];
  }

  static async getTenant(id: string) {
    const result = await db.query('SELECT id, name, description, created_at FROM tenants WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }
}
