export type ProductImage = {
  file?: File;
  url?: string;
  uploaded?: boolean;
};

export type Variation = {
  _id?: string;
  size: number | string;
  stock?: number;
  color?: string;
  flavor?: string;
  gluten_free?: boolean;
  lactose_free?: boolean;
};

export type Product = {
  images: {
    id: any;
    name: string;
    alt_text: string;
    url: string;
  }[];
  name: string;
  description: string;
  brand: string;
  ean?: string;
  sku: string;
  gender: string;
  price: number;
  price_discounted?: number;
  height?: number;
  width?: number;
  length?: number;
  weight?: number;

  variations: Variation[];

  nationality: string;
  category: string;
  subcategory: string;
  _id: string;
  grouperId: string;
};

export type ProductSummary = {
  _id: string;
  is_active: boolean;
  name: string;
  brand: string;
  sku: string;
  price: number;
  stock: number;
  images?: string[];
  variations: Variation[];
  checked: boolean;
};
