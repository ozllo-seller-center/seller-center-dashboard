import { ProductImport } from '../types/productImport';

export function valueDefined(v: string): boolean {
  return !!v;
}

export function descriptionValidate(v: any) {
  return !!v && v.length <= 1800;
}

export function catalogueValidate(v: any) {
  return !!v.category && !!v.subCategory && !!v.nationality;
}

export function discountValidate(
  v: number,
  validation: ProductImport,
): boolean {
  if (v) {
    validation.price_discounted.value = validation.price.value;
  }

  return true;
}

export function imagesValidate(v: string[]): boolean {
  return !!v[0] && !!v[1];
}

export function InitProductImport(): ProductImport {
  const productValidation = {
    grouperId: {
      value: undefined,
    },
    catalogue: {
      value: {
        category: undefined,
        subCategory: undefined,
        nationality: undefined,
      },
      validate: (v: any) => catalogueValidate(v),
    },
    name: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    description: {
      value: undefined,
      validate: (v: any) => descriptionValidate(v),
    },
    brand: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    gender: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    sku: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    ean: {
      value: undefined,
    },
    price: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    price_discounted: {
      value: undefined,
      validate: (v: any) => discountValidate(v, productValidation),
    },
    height: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    width: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    length: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    weight: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    size: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    stock: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    color: {
      value: undefined,
      validate: (v: any) => valueDefined(v),
    },
    lactose_free: {
      value: undefined,
    },
    gluten_free: {
      value: undefined,
    },
    image: {
      value: [],
    },
    _id: {
      value: undefined,
    },
  };

  return productValidation;
}
