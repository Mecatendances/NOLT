import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Récupérer l'utilisateur

    console.log('🔐 Vérification du rôle utilisateur:', user?.role);

    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Accès interdit : Vous devez être administrateur');
    }

    return true;
  }
}
