import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CampaignEntity } from './campaign.entity';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { OrderEntity } from '../orders/order.entity';
import { AddOrdersDto } from './dto/add-orders.dto';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async create(dto: CreateCampaignDto): Promise<CampaignEntity> {
    console.log('Service - Création de campagne avec DTO:', dto);
    try {
      const campaign = this.campaignRepository.create({
        name: dto.name,
        description: dto.description,
        shopId: dto.shopId,
      });
      console.log('Campagne créée (avant sauvegarde):', campaign);
      const savedCampaign = await this.campaignRepository.save(campaign);
      console.log('Campagne sauvegardée avec succès:', savedCampaign);
      return savedCampaign;
    } catch (error) {
      console.error('Erreur dans le service lors de la création de la campagne:', error);
      throw error;
    }
  }

  findAll(): Promise<CampaignEntity[]> {
    console.log('Récupération de toutes les campagnes');
    return this.campaignRepository.find({ 
      order: { createdAt: 'DESC' }, 
      relations: ['orders', 'shop'],
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        totalTtc: true,
        createdAt: true,
        updatedAt: true,
        shopId: true,
        shop: {
          id: true,
          name: true
        }
      }
    });
  }

  async findOne(id: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepository.findOne({ where: { id }, relations: ['orders'] });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  /** Ajoute des commandes à une campagne */
  async addOrders(id: string, dto: AddOrdersDto): Promise<CampaignEntity> {
    const campaign = await this.findOne(id);

    // Charger les orders
    const orders = await this.orderRepository.find({ where: { id: In(dto.orderIds) } });
    if (orders.length === 0) throw new BadRequestException('No orders found');

    for (const order of orders) {
      order.campaign = campaign;
      await this.orderRepository.save(order);
    }

    await this.recalculateTotal(campaign.id);
    return this.findOne(id);
  }

  /** Retire une commande de la campagne */
  async removeOrder(campaignId: string, orderId: string): Promise<CampaignEntity> {
    const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['campaign'] });
    if (!order || order.campaign?.id !== campaignId) throw new NotFoundException('Order not in campaign');
    order.campaign = null;
    await this.orderRepository.save(order);
    await this.recalculateTotal(campaignId);
    return this.findOne(campaignId);
  }

  private async recalculateTotal(campaignId: string) {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId }, relations: ['orders'] });
    if (!campaign) return;
    const total = campaign.orders.reduce((sum, o) => sum + Number(o.totalTtc), 0);
    campaign.totalTtc = total;
    await this.campaignRepository.save(campaign);
  }

  /**
   * Retourne les campagnes groupées par boutique, avec le nombre de commandes, le montant total et la liste des produits de chaque campagne
   */
  async findCampaignsByShop() {
    // On récupère toutes les campagnes avec leurs commandes et produits
    const campaigns = await this.campaignRepository.find({
      relations: ['orders', 'orders.items', 'orders.items.product', 'shop'],
      order: { createdAt: 'DESC' },
    });
    // On groupe par boutique
    const grouped = {} as Record<string, any>;
    for (const campaign of campaigns) {
      const shopId = campaign.shopId;
      if (!grouped[shopId]) {
        grouped[shopId] = {
          shop: campaign.shop,
          campaigns: [],
        };
      }
      grouped[shopId].campaigns.push({
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalTtc: campaign.totalTtc,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        ordersCount: campaign.orders.length,
        orders: campaign.orders.map(order => ({
          id: order.id,
          totalTtc: order.totalTtc,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items,
        })),
        products: Array.from(new Set(campaign.orders.flatMap(order => order.items.map(item => item.product)))),
      });
    }
    return Object.values(grouped);
  }

  async remove(id: string): Promise<void> {
    console.log('Service - Suppression de la campagne:', id);
    try {
      const campaign = await this.findOne(id);
      if (!campaign) {
        throw new NotFoundException('Campagne non trouvée');
      }
      
      // D'abord, dissocier les commandes de la campagne
      if (campaign.orders && campaign.orders.length > 0) {
        for (const order of campaign.orders) {
          order.campaign = null;
          await this.orderRepository.save(order);
        }
      }
      
      // Ensuite, supprimer la campagne
      await this.campaignRepository.remove(campaign);
      console.log('Campagne supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la campagne:', error);
      throw error;
    }
  }

  async findByShop(shopId: string): Promise<CampaignEntity[]> {
    return this.campaignRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      relations: ['orders', 'orders.items', 'orders.items.product', 'shop'],
    });
  }
} 