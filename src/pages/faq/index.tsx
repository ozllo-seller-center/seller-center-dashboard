import { MdExpandMore } from 'react-icons/md';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import styles from './styles.module.scss';

const Faq: React.FC = () => {
  return (
    <div className={styles.container}>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Box>
            <h3 className={styles.h3}>
              Como fazer o seu catálogo da forma correta:
            </h3>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>Como cadastrar as imagens</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography variant="subtitle1">Requisitos:</Typography>
                <List>
                  <ListItemText>- De 2 à 6 imagens</ListItemText>
                  <ListItemText>
                    - Imagem com fundo branco ou cinza claro.
                  </ListItemText>
                  <ListItemText>- Imagem sem escritos.</ListItemText>
                  <ListItemText>- Imagem sem colagem.</ListItemText>
                  <ListItemText>
                    - Imagem não podem ser fotos no espelho (selfies no espelho)
                  </ListItemText>
                </List>
                <Typography variant="subtitle1">Ordem das imagens:</Typography>
                <Typography>
                  A foto de capa precisa ser em fundo branco ou cinza claro,
                  mostrando o produto de frente e sem recortes.
                </Typography>
                <Typography>
                  O restante das fotos precisa ser mostrando detalhes do produto
                  e é importante ter referência de tamanho. Para produtos de
                  moda, é interessante adicionar a tabela de medidas na última
                  foto, caso exista.
                </Typography>
                <Typography>
                  Para produtos de beleza e alimentos, é interessante adicionar
                  a tabela nutricional. Lembre-se que o consumidor está
                  comprando a foto. Ou seja, capriche na foto e tente colocar o
                  maior número de fotos possível.
                </Typography>
                <Typography>
                  Observação 1: Nossa plataforma recorta automaticamente para
                  que todas as imagens fiquem no formato de 1000x1000. Veja se o
                  recorte ficou coerente. Caso tenha cortado o seu produto,
                  cadastre uma foto 1000x1000.
                </Typography>
                <Typography>
                  Observação 2: Nossa plataforma reconfigura para que a imagem
                  tenha 1MG, tamanho exigido pelos marketplaces. Veja se, após a
                  reconfiguração, a imagem se mantém em boa qualidade.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography>Como cadastrar o nome do produto</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Nome do produto + Principais Características + Cor/Sabor +
                  Marca
                </Typography>
                <Typography>
                  Lembrando que mais de 60% dos consumidores pesquisam palavras
                  chaves nos marketplaces, então adicione as principais
                  características no título para que aumente a chance do seu
                  produto ser encontrado.
                </Typography>
                <Typography>Exemplo:</Typography>
                <Typography>
                  Se o seu produto chama “Blusa Victoria” um exemplo de cadastro
                  seria “Blusa Victoria algodão estampado amarelo XYZ Brand”. Se
                  o seu produto chama “Blush rosa” um exemplo de cadastro seria
                  “Blush rosa bastão vegano XYZ Brand”
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel3a-content"
                id="panel3a-header"
              >
                <Typography>Como cadastrar a descrição</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  A descrição precisa ter todos os elementos necessários para o
                  consumidor. Recomendamos as seguintes informações:
                </Typography>
                <Typography>
                  Nome do produto + detalhes do produto + Nome da marca +
                  Funcionalidades e como usar o produto + Composição + Medidas +
                  Validade.
                </Typography>
                <Typography>
                  É proibido escrever dados pessoais: site, telefone pessoal,
                  e-mail da empresa, conta de rede social na descrição.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel4a-content"
                id="panel4a-header"
              >
                <Typography>O EAN é obrigatorio?</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  O EAN é o código de barras do seu produto que possui 13
                  digitos. Caso você tenha, preencha-o na plataforma. Caso você
                  não tenha, pode deixar em branco
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel5a-content"
                id="panel5a-header"
              >
                <Typography>Como preencher o SKU</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  O SKU é como se fosse o RG do seu produto. Serve para você
                  identifca-lo. O campo de SKU na plataforma é referente ao SKU
                  pai do seu produto. É um campo obrigatório. Caso você não
                  tenha, é necessário criar.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel6a-content"
                id="panel6a-header"
              >
                <Typography>
                  Como cadastrar medidas e peso da emabalagem
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  As medidas e peso das embalagens são importantes para o
                  calculo do frete. Insira o tamanho da embalagem do seu produto
                  e o peso estimado. Lembrando que as medidas são em CM e o peso
                  é em GRAMAS.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel7a-content"
                id="panel7a-header"
              >
                <Typography>
                  Como cadastrar os atributos: Tamanho, Cor/Sabor e Estoque
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Tamanho: escolha o tamanho na listagem que aparece.
                </Typography>
                <Typography>
                  Se sua categoria for vestuario, você vai criar uma variação
                  para cada tamanho, ou seja, Variação 1 = PP, Variação 2 = P,
                  Variação 3 = M e assim vai. Se a sua categoria for Beleza,
                  você pode selecionar {'"'}U{'"'} caso seja tamanho Único. Ou
                  também pode escolher o Tamanho 30, caso sua embalagem tenha
                  30gramas.
                </Typography>
                <Typography>
                  {' '}
                  Cor/Sabor: na seleção, escolha a cor ou sabor que melhor
                  represente o seu produto.
                </Typography>
                <Typography>
                  Caso seu produto seja da cor {'"'}
                  azul turquesa{'"'} escolha a cor aproximada, como {'"'}azul
                  {'"'} na nossa plataforma. Estoque: coloque a informação de
                  estoque de cada variação.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
          <Box>
            <h3 className={styles.h3}>
              As 3 formas de cadastrar seus produtos:
            </h3>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel8a-content"
                id="panel8a-header"
              >
                <Typography>Cadastrando produtos manualmente</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Vá em Menu {'>'} Produtos {'>'} Cadastrar novos produtos e
                  cadastre seus produtos conforme as orientações que contém na
                  plataforma de cada campo.
                </Typography>
                <Typography>
                  Se você quiser mais detalhes de como cadastrar cada campo, em
                  nosso FAQ {'"'}Como fazer seu catálogo da forma correta{'"'}{' '}
                  explica detalhadamente cada campo.
                </Typography>
                <Typography>
                  Caso você queira editar seu produto, é possível editar a
                  qualquer momento. Vá em Menu {'>'} Produtos {'>'} Editar.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel9a-content"
                id="panel9a-header"
              >
                <Typography>
                  Cadastrando produtos de forma massiva via Excel
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Caso você tenha diversos produtos, é possível cadastrar eles
                  via Excel. Vá em Produtos {'>'} Importar ou Exportar {'>'}{' '}
                  Exportar Planilha Inicial. O uso da nossa planilha é
                  obrigatório.
                </Typography>
                <Typography>
                  Caso você tente subir qualquer outra planilha vai dar erro e
                  não será possível cadastrar seus produtos. Também irá dar erro
                  caso você altere alguma informação das 2 primeiras linhas da
                  planilha. Não exclua nenhuma coluna. Cada linha da planilha é
                  uma variação. Ou seja, se seu produto tenha 3 variações
                  (exemplo P, M e G), cadastre as informações da variação P na
                  primeira linha, as informações da variação M na segunda linha
                  e as informações da variação G na terceira linha. E assim por
                  diante.
                </Typography>
                <Typography>
                  Para que a plataforma entenda que será necessário agrupar
                  essas 3 linhas e considera-las um produto só, o campo ID
                  Agrupador precisa ser preenchido.
                </Typography>
                <Typography>
                  Exemplo: No campo ID Agrupador, preencha o numero 1 em todas
                  as variações do produto 1. Preencha o numero 2 em todos as
                  variações do produto 2. E assim por diante.
                </Typography>
                <Typography>
                  Se você quiser mais detalhes de como cadastrar cada campo, em
                  nosso FAQ {'"'}
                  Como fazer seu catálogo da forma correta{'"'} explica
                  detalhadamente cada campo, como Titulo e Descrição.
                </Typography>
                <Typography>
                  Após preenchido, vá em Vá em Produtos {'>'} Importar ou
                  Exportar {'>'} Importar Planilha. Seus produtos estarão na Aba
                  de Produtos {'>'} Meus Produtos.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel10a-content"
                id="panel10a-header"
              >
                <Typography>
                  Alterando produtos de forma massiva via Excel
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Caso você queira alterar seus produtos, é possivel faze-los de
                  forma massiva via excel. Vá em Produtos {'>'} Meus produtos{' '}
                  {'>'} Selecione os produtos que você queira exportar para
                  editar {'>'} Ações em Massa {'>'} Exportar Produtos {'>'}{' '}
                  Aplicar
                </Typography>
                <Typography>
                  Edite seus produtos através do Excel e suba novamente na
                  plataforma em Produtos {'>'} Importar ou Exportar {'>'}{' '}
                  Importar Planilha.
                </Typography>
                <Typography>
                  Em segundos suas atualizações estarão disponíveis na pagina de
                  produtos.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel11a-content"
                id="panel11a-header"
              >
                <Typography>Cadastrando produtos via Integração</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Caso você tenha algum ERP/Ecommerce que possuímos integração,
                  recomendo fazer a integração de seus produtos para que você
                  tenha todo o processo automatizado.
                </Typography>
                <Typography>A integração significa que iremos:</Typography>
                <List>
                  <ListItem>- Importar seus produtos para a OZLLO</ListItem>
                  <ListItem>
                    - Seu estoque e preço estará pareado com a sua plataforma.
                    Ou seja, se vender um produto na sua plataforma, irá
                    atualizar o saldo do estoque para a nossa, e vice versa.
                  </ListItem>
                  <ListItem>
                    - Possibilidade de Emissão de Nota Fiscal e Etiqueta de
                    Despacho automatizada.
                  </ListItem>
                </List>
                <Typography>
                  Caso você tenha um processo automatizado de emissão de NF e
                  Etiqueta de Despacho na nossa plataforma, assim que tiver uma
                  venda, receberemos sua Nota Fiscal e Etiqueta de Despacho.
                </Typography>
                <Typography>
                  Para começar a integração, vá em Integrações {'>'} escolha sua
                  plataforma e coloque os dados.
                </Typography>
                <Typography>
                  Caso você tenha dúvidas de como conseguir os dados requeridos,
                  aperte no botão de {'"'}
                  Dúvidas?{'"'} no canto direito que você terá o passo a passo.
                </Typography>
                <Typography>
                  Após completar as informações necessárias da integração, seu
                  catálogo de produtos será importado para o Seller Center e
                  estará disponível para visualização no menu
                  {'"'}Produtos{'"'}.
                </Typography>
                <Typography>
                  Informação importante: Após importado o seu catálogo, caso
                  você queira atualizar o preço ou estoque, será necessário
                  fazer direto no seu ERP/Ecommerce. Os demais campos como
                  Descrição, Título e Imagens, devem obrigatoriamente ser
                  editados direto no Seller Center OZLLO.
                </Typography>
                <Typography>
                  Caso você deseja excluir um produto, entre em contato com o
                  Suporte.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
          <Box>
            <h3 className={styles.h3}>Dúvidas sobre vendas:</h3>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel12a-content"
                id="panel12a-header"
              >
                <Typography>
                  Quanto tempo leva para que meus produtos apareçam nos
                  marketplaces?
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  A partir do momento em que os seus produtos estão em nossa
                  plataforma, eles são enviados automaticamente para cada canal
                  e o prazo de Go Live depende de cada canal.
                </Typography>
                <Typography>
                  Magazine Luiza e B2W: Até 2 dias uteis Mercado Livre e Shopee:
                  Até 7 dias uteis CEA, Dafiti, Zattini, Netshoes, Drogasil,
                  Carrefour e GPA: até 15 dias uteis.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel13a-content"
                id="panel13a-header"
              >
                <Typography>Vendi um produto e agora?</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Sempre que houver vendas você será notificado no email
                  cadastrado em seu painel.
                </Typography>
                <Typography>1.Ver detalhes do pedido:</Typography>
                <Typography>
                  No seu pedido, aperte {'"'}ver detalhes{'"'} para ver todo os
                  detalhes do pedido
                </Typography>
                <Typography>
                  2. Emita a Nota Fiscal e insira em nosssa plataforma:
                </Typography>
                <Typography>
                  Vá em Aguardando Faturamento {'>'} Inserir NF e anexe a sua
                  Nota Fiscal.
                </Typography>
                <Typography>
                  3. Emita e Etiqueta de Despacho e insira na nossa plataforma:
                </Typography>
                <Typography>
                  Depois que voce emitir a NF, o pedido aparecerá na aba
                  Aguardando Despacho. No canto a direita, aperte em Anexar
                  Etiqueta de Despacho e coloque as informações da Etiqueta.
                </Typography>
                <Typography>
                  Caso seu cadastro seja de Integração, o pedido aparecerá em
                  sua plataforma e você pode seguir a etapa normalmente de
                  Emissão de Nota Fiscal e Etiqueta de Despacho em sua
                  plataforma e ela será importada para a nossa plataforma.
                </Typography>
                <Typography>
                  Informação relevante: vendas da B2W, Mercado Livre e Shopee o
                  uso da Etiqueta de Despacho que eles fornecem é obrigatório e
                  estará disponível na Aba
                  {'"'}Aguardando Despacho{'"'} após a emissão da Nota Fiscal.
                </Typography>
                <Typography>
                  Assim que feito esses passos, o processo da venda é concluída
                  e o cliente final será atualizado. O prazo para esse passo é
                  de 48hrs uteis após a venda.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel14a-content"
                id="panel14a-header"
              >
                <Typography>Posso enviar uma cartinha na embalagem?</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Você pode enviar uma carta de agradecimento pela compra porém
                  é PROIBIDO enviar brindes, cupons de desconto que direcionam
                  ao seu site ou seu telefone na embalagem.
                </Typography>
                <Typography>
                  Caso enviado, sua marca entrará no Black List do marketplace
                  por tempo indeterminado.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel15a-content"
                id="panel15a-header"
              >
                <Typography>Quando recebo minhas vendas?</Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Vendas entre os dias 11 ao 24 são repassadas dia 15 do mês
                  seguinte. Vendas entre os dias 25 ao 10 são repassadas dia 30.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel16a-content"
                id="panel16a-header"
              >
                <Typography>
                  Como participar de campanhas nos marketplaces?
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  Semanalmente disponibilizamos as campanhas da semana em nossa
                  plataforma. Vá em Menu {'>'} Campanhas e selecione as
                  campanhas que você quer participar.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<MdExpandMore />}
                aria-controls="panel17a-content"
                id="panel17a-header"
              >
                <Typography>
                  Como funciona a cobrança da mensalidade?
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={styles.accordionDetails}>
                <Typography>
                  À partir do momento em que você faz a contratação do plano,
                  você já começa a pagar a sua assinatura.
                </Typography>
                <Typography>
                  A data em que você fez a assinatura será a data do mês que
                  sempre será cobrado em seu cartão de crédito.
                </Typography>
                <Typography>
                  O pagamento refere-se ao direito de possibilidade de uso da
                  plataforma e independe do fluxo de uso ou de vendas. Você pode
                  alterar seu plano a qualquer momento, basta chamar o nosso
                  Suporte. para te auxiliarem com a mudança de plano.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Stack>
      </Container>
    </div>
  );
};

export default Faq;
