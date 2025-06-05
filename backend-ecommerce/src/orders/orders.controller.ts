import { Controller, Post, Body, Get, Param, UseGuards, Request, Patch, UnauthorizedException, Logger, Headers } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Roles } from '../auth/decorators/roles.decorator';
import { GlobalRole } from '../users/user-role.enum';
import { UserShopRoleService } from '../users/services/user-shop-role.service';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly jwt: JwtService,
    private readonly userShopRoleService: UserShopRoleService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Headers('x-tenant-id') shopId: string,
    @Body() dto: CreateOrderDto,
    @Request() req
  ) {
    const userId = req.user?.userId;
    this.logger.debug(`Création de commande - userId: ${userId}, shopId: ${shopId}`);
    
    if (!shopId) {
      throw new UnauthorizedException('x-tenant-id est requis');
    }
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, shopId);
    this.logger.debug(`Rôles trouvés pour l'utilisateur: ${JSON.stringify(userShopRoles)}`);
    
    if (!userShopRoles.length) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette boutique');
    }

    // Ajouter le shopId au DTO
    dto.shopId = shopId;

    const order = await this.ordersService.createOrder(dto, userId);
    return { id: order.id, status: order.status };
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async findMyOrders(@Request() req) {
    const userId = req.user?.userId;
    this.logger.debug(`Liste des commandes personnelles - userId: ${userId}`);
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    return this.ordersService.findByUser(userId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard)
  @Roles(GlobalRole.ADMIN)
  async findAll() {
    this.logger.debug('Liste de toutes les commandes (admin)');
    return this.ordersService.findAll();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByShop(
    @Headers('x-tenant-id') shopId: string,
    @Request() req
  ) {
    const userId = req.user?.userId;
    this.logger.debug(`Liste des commandes - userId: ${userId}, shopId: ${shopId}`);
    
    if (!shopId) {
      throw new UnauthorizedException('x-tenant-id est requis');
    }
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, shopId);
    this.logger.debug(`Rôles trouvés pour l'utilisateur: ${JSON.stringify(userShopRoles)}`);
    
    if (!userShopRoles.length) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette boutique');
    }

    return this.ordersService.findByShop(shopId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @Headers('x-tenant-id') shopId: string,
    @Request() req
  ) {
    const userId = req.user?.userId;
    this.logger.debug(`Détails de commande - userId: ${userId}, shopId: ${shopId}, orderId: ${id}`);
    
    if (!shopId) {
      throw new UnauthorizedException('x-tenant-id est requis');
    }
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, shopId);
    this.logger.debug(`Rôles trouvés pour l'utilisateur: ${JSON.stringify(userShopRoles)}`);
    
    if (!userShopRoles.length) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette boutique');
    }

    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-tenant-id') shopId: string,
    @Body('status') status: OrderStatus,
    @Request() req
  ) {
    const userId = req.user?.userId;
    this.logger.debug(`Mise à jour du statut - userId: ${userId}, shopId: ${shopId}, orderId: ${id}, status: ${status}`);
    
    if (!shopId) {
      throw new UnauthorizedException('x-tenant-id est requis');
    }
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, shopId);
    this.logger.debug(`Rôles trouvés pour l'utilisateur: ${JSON.stringify(userShopRoles)}`);
    
    if (!userShopRoles.length) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette boutique');
    }

    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/campaign')
  @UseGuards(JwtAuthGuard)
  async assignCampaign(
    @Param('id') id: string,
    @Headers('x-tenant-id') shopId: string,
    @Body('campaignId') campaignId: string | null,
    @Request() req
  ) {
    const userId = req.user?.userId;
    this.logger.debug(`Assignation de campagne - userId: ${userId}, shopId: ${shopId}, orderId: ${id}, campaignId: ${campaignId}`);
    
    if (!shopId) {
      throw new UnauthorizedException('x-tenant-id est requis');
    }
    
    if (!userId) {
      throw new UnauthorizedException('Utilisateur non authentifié');
    }

    // Vérifier que l'utilisateur a accès à cette boutique
    const userShopRoles = await this.userShopRoleService.getUserShopRoles(userId, shopId);
    this.logger.debug(`Rôles trouvés pour l'utilisateur: ${JSON.stringify(userShopRoles)}`);
    
    if (!userShopRoles.length) {
      throw new UnauthorizedException('Vous n\'avez pas accès à cette boutique');
    }

    return this.ordersService.assignCampaign(id, campaignId);
  }
} 