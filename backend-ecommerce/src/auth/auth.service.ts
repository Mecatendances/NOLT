import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface JwtAuthResponse {
  code: string;
  data: { status: number };
}

@Injectable()
export class AuthService {
  private WP_VALIDATE_URL = process.env.WP_JWT_AUTH_URL || 'https://wpdev.wearenolt.com/wp-json/jwt-auth/v1/token/validate';

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.validateCredentials(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      licenseeShops: user.licenseeShops?.map(s => s.id),
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateToken(token: string) {
    console.log('🛠 Vérification du token reçu par NestJS:', token);

    // 1) Vérification locale
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      return payload;
    } catch (e) {
      console.warn('Token non signé localement, tentative de validation WordPress');
    }

    // 2) Fallback WordPress
    try {
      const response = await axios.post<JwtAuthResponse>(`${this.WP_VALIDATE_URL}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('✅ Réponse de WordPress:', response.data);

      if (response.data.code === 'jwt_auth_valid_token') {
        return response.data;
      } else {
        throw new UnauthorizedException('Invalid token');
      }
    } catch (err) {
      console.error('❌ Erreur de validation WordPress:', err.response?.data || err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
