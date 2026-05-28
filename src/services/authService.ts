import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import { TenantService } from './tenantService';
import { UserService } from './userService';

interface RegisterPayload {
  tenantId: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export class AuthService {
  static async register(payload: RegisterPayload) {
    const tenant = await TenantService.getTenant(payload.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }
    const user = await UserService.createUser(payload);
    return AuthService.generateToken(user.id, user.tenant_id, user.email, user.role);
  }

  static async login(payload: LoginPayload) {
    const user = await UserService.findByEmail(payload.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    await UserService.verifyPassword(payload.password, user.password_hash);
    return AuthService.generateToken(user.id, user.tenant_id, user.email, user.role);
  }

  private static generateToken(userId: string, tenantId: string, email: string, role: string) {
    return jwt.sign(
      { userId, tenantId, email, role },
      JWT_SECRET as jwt.Secret,
      {
        expiresIn: JWT_EXPIRES_IN,
      } as jwt.SignOptions
    );
  }
}
