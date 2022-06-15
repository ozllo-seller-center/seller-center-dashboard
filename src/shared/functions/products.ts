import Genres from 'src/shared/enums/Genres';
import { Variation } from '../types/product';

export const getGender = (produto: any) => {
  if (Genres.Masculino === produto.gender.trim()) {
    return Genres.M;
  }
  if (Genres.Feminino === produto.gender.trim()) {
    return Genres.F;
  }
  if (Genres.Unissex === produto.gender.trim()) {
    return Genres.U;
  }
  return '';
};

export const getImages = (images: any) => {
  let objetoImagem = {};
  for (let i = 0; i <= 5; i += 1) {
    objetoImagem = {
      ...objetoImagem,
      [`image_${i + 1}`]: images[i] ? images[i] : '',
    };
  }
  return objetoImagem;
};

export const getImagesHeader = () => {
  let objetoImagem = {};
  for (let i = 0; i <= 5; i += 1) {
    objetoImagem = {
      ...objetoImagem,
      [`image_${i + 1}`]: i <= 1 ? 'Obrigatório' : 'Opcional',
    };
  }
  return objetoImagem;
};

export const getVariations = (produto: any) => {
  const { variations } = produto;
  return variations.map((variacao: Variation) => ({
    Categoria: [produto.nationality, produto.category, produto.subcategory],
    Nome_do_Produto: produto.name,
    Marca: produto.brand,
    Id_agupador: variacao._id ? variacao._id : '',
    Tamanho: variacao.size ? variacao.size : '',
    Cor_ou_Sabor: variacao.color ? variacao.color : '',
    Quantidade: variacao.stock ? variacao.stock : '',
    Descricao_do_Produto: produto.description,
    EAN: produto.ean,
    SKU: produto.sku,
    Valor_cheio: produto.price,
    Valor_promocional: produto.price_discounted,
    Altura_embalagem: produto.height,
    Largura_embalagem: produto.width,
    Comprimento_embalagem: produto.length,
    Peso_embalagem: produto.weight,
    Genero: getGender(produto),
    Lactose: produto.lactose_free,
    Gluten: produto.gluten_free,
    ...getImages(produto.images),
    Id_Produto: produto._id,
  }));
};

export const getHeader = () => ({
  Categoria: 'Obrigatório',
  Nome_do_Produto: 'Obrigatório',
  Marca: 'Obrigatório',
  Id_agupador: 'Obrigatório',
  Tamanho: 'Obrigatório',
  Cor_ou_Sabor: 'Obrigatório',
  Quantidade: 'Obrigatório',
  Descricao_do_Produto: 'Obrigatório',
  EAN: 'Opcional',
  SKU: 'Obrigatório',
  Valor_cheio: 'Obrigatório',
  Valor_promocional: 'Obrigatório',
  Altura_embalagem: 'Obrigatório',
  Largura_embalagem: 'Obrigatório',
  Comprimento_embalagem: 'Obrigatório',
  Peso_embalagem: 'Obrigatório',
  Genero: 'Obrigatório',
  Lactose: 'Obrigatório para Alimentos',
  Gluten: 'Obrigatório para alimentos',
  ...getImagesHeader(),
  Id_Produto: 'Obrigatório',
});
