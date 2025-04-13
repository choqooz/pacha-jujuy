import { Product } from './product';
import { User } from './user';

export class Cart {
  _id!: string;
  user!: User;
  products!: Array<Product>;
  totalAmount!: number;
  createdAt!: string;
}
