import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('🔒 Vérification de l\'authentification');
    
    // 1. D'abord, essayer l'authentification standard de passport-jwt
    try {
      const canActivate = await super.canActivate(context);
      if (canActivate) {
        const request = context.switchToHttp().getRequest();
        this.logger.debug('✅ Authentification réussie via passport-jwt');
        this.logger.debug('👤 Utilisateur:', request.user);
        return true;
      }
    } catch (e) {
      this.logger.warn('❌ Échec de l\'authentification via passport-jwt:', e.message);
    }

    // 2. Si ça échoue, essayer notre validation personnalisée
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      this.logger.error('❌ Pas de token trouvé dans les headers');
      return false;
    }

    try {
      const user = await this.authService.validateToken(token);
      request.user = user;
      this.logger.debug('✅ Authentification réussie via validation personnalisée');
      this.logger.debug('👤 Utilisateur:', user);
      return true;
    } catch (error) {
      this.logger.error('❌ Échec de la validation du token:', error.message);
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
