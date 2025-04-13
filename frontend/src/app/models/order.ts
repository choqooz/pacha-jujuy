import { Product } from './product';

export class Order {
  _id?: string;
  userId!: string;
  products!: Product[];
  amount!: number;
  address!: string;
  status!: string;
  createdAt?: Date;
  updatedAt?: Date;
}
