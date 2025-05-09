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
    const campaign = this.campaignRepository.create({
      name: dto.name,
      description: dto.description,
    });
    return this.campaignRepository.save(campaign);
  }

  findAll(): Promise<CampaignEntity[]> {
    return this.campaignRepository.find({ order: { createdAt: 'DESC' }, relations: ['orders'] });
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
} 