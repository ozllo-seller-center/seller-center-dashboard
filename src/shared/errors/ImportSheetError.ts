type SheetErrors = {
  [key: string]: {
    title: string,
    message: string
  }
}

export const ErrorMessages: SheetErrors = {
  catalogue: {
    title: 'Categorização de um produto não selecionada!',
    message: 'É necessário selecionar a categorização do produto de Id Agrupador %s, na linha %d',
  },
  name: {
    title: 'Nome de um produto não informado!',
    message: 'É necessário informar o nome do produto de Id Agrupador %s, na linha %d',
  },
  description: {
    title: 'Descrição de um produto não informada!',
    message: 'É necessário informar a descrição do produto de Id Agrupador %s, na linha %d',
  },
  brand: {
    title: 'Marca de um produto não informada!',
    message: 'É necessário informar a marca do produto de Id Agrupador %s, na linha %d',
  },
  gender: {
    title: 'Gênero de um produto não informado!',
    message: 'É necessário informar o gênero do produto de Id Agrupador %s, na linha %d',
  },
  sku: {
    title: 'SKU de um produto não informado!',
    message: 'É necessário informar o SKU do produto de Id Agrupador %s, na linha %d',
  },
  price: {
    title: 'Preço de um produto não informado!',
    message: 'É necessário informar o preço do produto de Id Agrupador %s, na linha %d',
  },
  height: {
    title: 'Altura de um produto não informada!',
    message: 'É necessário informar a altura(cm) do produto de Id Agrupador %s, na linha %d',
  },
  width: {
    title: 'Altura de um produto não informada!',
    message: 'É necessário informar a largura(cm) do produto de Id Agrupador %s, na linha %d',
  },
  length: {
    title: 'Comprimento de um produto não informado!',
    message: 'É necessário informar o comprimento(cm) do produto de Id Agrupador %s, na linha %d',
  },
  weight: {
    title: 'Peso de um produto não informado!',
    message: 'É necessário informar o peso(cm) do produto de Id Agrupador %s, na linha %d',
  },
  image: {
    title: 'Imagens não informadas!',
    message: 'É necessário informar pelo menos duas imagens do produto de Id Agrupador %s, na linha %d',
  }
}
