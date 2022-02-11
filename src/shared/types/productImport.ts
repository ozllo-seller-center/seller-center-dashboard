export type SheetLines = {
  [key: number]: string
}

export const importLines: SheetLines = {
  0: 'catalogue',
  1: 'name',
  2: 'brand',
  3: 'grouperId',
  4: 'size',
  5: 'color',
  6: 'stock',
  7: 'description',
  8: 'ean',
  9: 'sku',
  10: 'price',
  11: 'price_discounted',
  12: 'height',
  13: 'width',
  14: 'length',
  15: 'weight',
  16: 'gender',
  17: 'lactose_free',
  18: 'gluten_free',
  19: 'image',
  20: 'image',
  21: 'image',
  22: 'image',
  23: 'image',
  24: 'image',
  25: '_id',
}

type SheetAttr = {
  value: any,
  validate?: (v: any) => boolean;
}

export type ProductImport = {
  [key: string]: SheetAttr,
}

export type VariationDTO = {
  size: SheetAttr,
  stock: SheetAttr,
  color: SheetAttr,
  gluten_free?: SheetAttr,
  lactose_free?: SheetAttr,
}

export type ProductDTO = {
  grouperId: string,
  variations: VariationDTO[],
  properties: ProductImport[]
  images: ProductImport[]
}
