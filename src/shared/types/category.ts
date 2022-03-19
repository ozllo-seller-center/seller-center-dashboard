export interface Category {
  _id?: any;
  code: number;
  value: string;
  attributes: [];
}

export interface SubCategory {
  _id?: any;
  categoryCode: number;
  code: number;
  value: string;
}

export interface Attribute {
  name: string;
  type: string;
  values?: any[];
}
