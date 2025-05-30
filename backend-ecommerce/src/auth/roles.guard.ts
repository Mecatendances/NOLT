import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      Logger.warn('Tentative d\'accès sans utilisateur authentifié');
      throw new ForbiddenException('Accès interdit : Utilisateur non authentifié');
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Pas de restriction
    }

    if (!requiredRoles.includes(user.role)) {
      Logger.warn(`Accès refusé à l'utilisateur ${user.email} (role: ${user.role}) pour roles requis: ${requiredRoles.join(', ')}`);
      throw new ForbiddenException('Accès interdit : Rôle insuffisant');
    }

    return true;
  }
}
