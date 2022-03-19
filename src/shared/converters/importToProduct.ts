import { groupBy } from 'src/utils/util';
import { Product, Variation } from '../types/product';
import { ProductImport } from '../types/productImport';

function importToProduct(importProducts: ProductImport[]): Product[] {
  const products: Product[] = [];

  const groups = groupBy(
    importProducts,
    (i: ProductImport) => i.grouperId.value,
  );
  const keys = Array.from(groups.keys());

  keys.forEach(grouperId => {
    const group = groups.get(grouperId) as ProductImport[];

    const product: Product = {} as Product;

    product.nationality = group[0].catalogue.value.nationality;
    product.category = group[0].catalogue.value.category;
    product.subcategory = group[0].catalogue.value.subCategory;

    product._id = group[0]._id.value;
    product.name = group[0].name.value;
    product.brand = group[0].brand.value;
    product.description = group[0].description.value;
    product.ean = group[0].ean.value;
    product.sku = group[0].sku.value;
    product.gender = group[0].gender.value;
    product.price = group[0].price.value;
    product.price_discounted = group[0].price_discounted.value;
    product.height = group[0].height.value;
    product.width = group[0].width.value;
    product.length = group[0].length.value;
    product.weight = group[0].weight.value;
    product.grouperId = group[0].grouperId.value;

    product.images = [];

    group[0].image.value.forEach((img: string, i: number) => {
      product.images.push({
        id: '',
        name: `${product.name}-${i}`,
        alt_text: product.name,
        url: img,
      });
    });

    product.variations = group.map(v => {
      const variation = {
        size: v.size.value,
        stock: v.stock.value,
        color: v.color.value,
      } as Variation;

      if (v.gluten_free.value) {
        variation.gluten_free = v.gluten_free.value;
      }

      if (v.lactose_free.value) {
        variation.lactose_free = v.lactose_free.value;
      }

      return variation;
    });

    products.push(product);
  });

  return products;
}

export default importToProduct;
