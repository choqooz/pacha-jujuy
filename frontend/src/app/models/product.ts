export class Product {
  _id!: string;
  title!: string;
  desc!: string;
  img!: string;
  categories!: string;
  size!: string;
  color!: string;
  price!: number;
  inStock!: boolean;
  quantity!: number; 
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export class ProductResponse {
  products!: Product[];
}
