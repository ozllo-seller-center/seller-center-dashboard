export interface Category {
  _id?: any,
  code: number,
  value: string,
  attributes: [],
}

export interface SubCategory {
  _id?: any,
  categoryCode: number,
  code: number,
  value: string,
}

export interface DefaultAttribute {
  colors: string[],
  sizes: string[],
}

export class FoodAttribute {
  flavours: string[];
  gluten_free: boolean[];
  lactose_free: boolean[];
  sizes: string[];

  constructor(flavours: string[], gluten_free: boolean[], lactose_free: boolean[], sizes: string[]) {
    this.flavours = flavours;
    this.gluten_free = gluten_free;
    this.lactose_free = lactose_free;
    this.sizes = sizes;
  }
}
