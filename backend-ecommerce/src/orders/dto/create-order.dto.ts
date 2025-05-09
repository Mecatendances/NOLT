export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
  size?: string;
}

export interface CreateOrderDto {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  zipCode: string;
  city: string;
  items: CreateOrderItemDto[];
} 