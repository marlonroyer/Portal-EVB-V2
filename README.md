# Portal EVB - Herbário Evaldo Buttura

Portal estático para organizar, documentar e integrar ferramentas digitais de apoio à rotina do Herbário Evaldo Buttura (EVB), da Universidade Federal da Integração Latino-Americana (UNILA).

O projeto reúne uma página institucional principal e um conjunto de ferramentas independentes, carregadas dentro do próprio portal. A ideia é manter uma interface comum para navegação, identidade visual, informações institucionais, equipe, repositório, serviços, Instagram, ajuda e acesso às ferramentas.

## Visão geral

O Portal EVB é composto por:

- Uma página principal em `index.html`.
- Um arquivo central de configuração em `data/site-data.js`.
- Estilos globais em `assets/css/`.
- Scripts do portal em `js/app.js`.
- Imagens institucionais em `img/`.
- Ferramentas digitais em `tools/`.
- Arquivos modelo em `exemplos/`.

O projeto foi pensado para funcionar como site estático, sem servidor próprio. Ele pode ser aberto localmente pelo navegador ou publicado no GitHub Pages.

## Ferramentas integradas

Atualmente o portal integra as seguintes ferramentas:

### JABOT Extract

Local:

```text
tools/Jabot_Extract/index.html
```

Função:

Recorta e exporta códigos de barras a partir de PDFs padronizados do JABOT.

Entrada esperada:

PDF gerado pelo JABOT no formato padrão de códigos de barras.

Saída:

Imagens dos códigos de barras recortadas e nomeadas automaticamente a partir do código EVB.

### EVB Labels

Local:

```text
tools/EVB_Labels/index.html
```

Função:

Gera etiquetas botânicas a partir de planilhas de dados e códigos de barras.

Entrada esperada:

Planilha de dados botânicos e imagens dos códigos de barras, preferencialmente geradas antes pelo JABOT Extract.

Saída:

Etiquetas botânicas prontas para conferência, impressão e organização do acervo.

### EVB Labels Collection

Local:

```text
tools/EVB_Labels_Collection/index.html
```

Função:

Gera etiquetas para caixas, famílias e intervalos da coleção.

Entrada esperada:

Planilha-mapa em `.xls`, `.xlsx` ou `.csv`, com colunas como ID, Família e Intervalos.

Também permite gerar uma caixa específica, uma lista de caixas ou um intervalo de caixas.

Saída:

PDF com etiquetas de caixas para impressão e substituição na coleção.

### EVB DataCheck

Local:

```text
tools/Analise_Botanica/analise-botanica.html
```

Função:

Analisa planilhas de dados botânicos no formato JABOT, produzindo estatísticas, tabelas, gráficos, validações taxonômicas, mapas e relatórios.

Recursos principais:

- Resumo da coleção.
- Estatísticas taxonômicas.
- Lista de espécies por família.
- Análise de completude.
- Distribuição espacial.
- Validação com Flora e Funga do Brasil.
- Apoio a dados de conservação.
- Consulta complementar à IUCN Red List via Cloudflare Worker.

Worker IUCN configurado:

```text
https://iucn-proxy-worker.marlonbioyt.workers.dev/
```

Observação:

O token da IUCN não fica no código público. Ele deve permanecer configurado como segredo no Cloudflare Worker.

### SpeciesLink para JABOT

Local:

```text
tools/Conversot_SpecisLink_JABOT/index.html
```

Função:

Converte dados exportados do speciesLink para uma estrutura mais compatível com o fluxo de trabalho do JABOT.

Entrada esperada:

Planilha ou arquivo tabular exportado do speciesLink.

Saída:

Tabela reorganizada para conferência e uso no fluxo do JABOT.

## Estrutura de pastas

```text
PROJETO_PRINCIPAL/
├── index.html
├── README.md
├── .nojekyll
├── assets/
│   └── css/
│       ├── base.css
│       ├── theme.css
│       └── layout.css
├── data/
│   └── site-data.js
├── exemplos/
│   └── README.md
├── img/
│   ├── LogoEVB.png
│   └── fotos/
│       ├── F2.jpg
│       ├── F3.jpg
│       ├── F4.jpg
│       ├── F5.jpg
│       ├── F7.jpg
│       ├── F8.jpg
│       ├── Laura Lima.png
│       ├── Giovana Vendruscolo.png
│       ├── Marlon Royer.png
│       ├── Aline Barboza.png
│       └── Sonia Marcela.png
├── js/
│   └── app.js
└── tools/
    ├── shared/
    │   └── tool-standard.css
    ├── _shared/
    │   └── tool-standard.css
    ├── Jabot_Extract/
    ├── EVB_Labels/
    ├── EVB_Labels_Collection/
    ├── Analise_Botanica/
    └── Conversot_SpecisLink_JABOT/
```

## Arquivos principais

### `index.html`

Arquivo principal do portal.

Contém:

- Cabeçalho com logo e navegação das ferramentas.
- Menu lateral com abas institucionais.
- Área principal de conteúdo.
- Área de carregamento das ferramentas por `iframe`.
- Rodapé.
- Referências para CSS, `data/site-data.js` e `js/app.js`.

Quando alterar CSS ou JS, é recomendado atualizar o sufixo de versão nos links do `index.html`, por exemplo:

```html
assets/css/layout.css?v=20260530h
js/app.js?v=20260530h
```

Isso ajuda a evitar cache antigo no navegador e no GitHub Pages.

### `data/site-data.js`

Arquivo mais importante para edição de conteúdo.

Ele centraliza:

- Ferramentas exibidas no menu superior.
- Descrições das ferramentas.
- Status e versão das ferramentas.
- Links para exemplos.
- Fluxo da aba Ajuda.
- Fotos do carrossel.
- Integrantes da equipe.
- Trabalhos do repositório.
- Serviços.
- Informações do Instagram.
- Textos das abas institucionais.
- Links externos.

Na maior parte dos casos, para atualizar conteúdo do site, edite este arquivo.

### `js/app.js`

Script principal do portal.

Responsável por:

- Renderizar abas institucionais.
- Renderizar ferramentas.
- Controlar navegação por `hash`.
- Carregar ferramentas dentro do `iframe`.
- Abrir ferramentas em nova aba.
- Montar páginas de equipe, repositório, serviços, Instagram e ajuda.
- Controlar carrossel de fotos.
- Aplicar filtros do repositório.
- Adicionar cache busting aos caminhos das ferramentas.

Evite alterar este arquivo para mudanças simples de conteúdo. Para textos, fotos, links e dados, prefira `data/site-data.js`.

### `assets/css/base.css`

Estilos base.

Contém regras gerais de reset, comportamento padrão de elementos e ajustes básicos.

### `assets/css/theme.css`

Variáveis de tema.

Define cores, sombras, raios de borda e tokens visuais usados no portal.

Exemplos:

```css
--green-950
--green-900
--gold-500
--cream-100
--surface
--radius-md
```

### `assets/css/layout.css`

Estilos de layout e componentes do portal.

Contém:

- Cabeçalho.
- Sidebar.
- Abas.
- Cards.
- Carrossel.
- Equipe.
- Repositório.
- Serviços.
- Instagram.
- Ajuda.
- Área de ferramentas.
- Rodapé.
- Responsividade.

### `tools/shared/tool-standard.css`

CSS compartilhado entre ferramentas.

Padroniza:

- Cabeçalhos.
- Rodapés.
- Cores.
- Cards.
- Botões.
- Tipografia.
- Espaçamento.

Este arquivo é usado pelas ferramentas para manter identidade visual comum.

### `tools/_shared/tool-standard.css`

Cópia legada do CSS compartilhado.

Foi mantida por segurança durante a transição. As ferramentas atuais devem usar:

```text
tools/shared/tool-standard.css
```

Evite usar `_shared` em novos arquivos, especialmente em GitHub Pages. O arquivo `.nojekyll` existe justamente para evitar problemas com pastas iniciadas por `_`, mas a versão sem underline é mais simples.

## Como editar o conteúdo do site

Na maioria dos casos, edite:

```text
data/site-data.js
```

Esse arquivo já possui comentários internos explicando onde alterar cada parte.

## Como adicionar uma nova foto ao carrossel

1. Coloque a imagem em:

```text
img/fotos/
```

2. Abra:

```text
data/site-data.js
```

3. Encontre a lista:

```js
const photoGallery = [
```

4. Adicione uma nova entrada:

```js
{
    src: "img/fotos/F9.jpg",
    alt: "Descrição curta da foto",
    caption: "Legenda que aparecerá no carrossel"
}
```

Para nomes científicos em itálico na legenda, use:

```html
<em>Cedrela fissilis</em>
```

Exemplo:

```js
caption: "Fruto de <em>Cedrela fissilis</em>, símbolo do Herbário"
```

## Como adicionar integrante da equipe

1. Coloque a foto em:

```text
img/fotos/
```

2. Abra:

```text
data/site-data.js
```

3. Encontre:

```js
const teamMembers = [
```

4. Adicione um bloco:

```js
{
    name: "Nome da pessoa",
    role: "Função no herbário",
    email: "email@exemplo.com",
    photo: "img/fotos/Nome da Pessoa.png",
    group: "Curadoria"
}
```

Grupos usados atualmente:

- Curadoria
- Bolsistas

Podem ser criados outros grupos, como:

- Estagiários
- Colaboradores
- Pesquisadores associados

## Como adicionar trabalho ao Repositório

1. Abra:

```text
data/site-data.js
```

2. Encontre:

```js
const repositoryItems = [
```

3. Adicione:

```js
{
    title: "Título do trabalho",
    author: "Nome do autor",
    type: "TCC",
    year: "2024",
    pdfUrl: "https://link-para-o-pdf",
    abstractUrl: "",
    externalUrl: ""
}
```

Campos:

- `title`: título do trabalho.
- `author`: autor ou autores.
- `type`: tipo do material, por exemplo TCC, dissertação, artigo, relatório, capítulo.
- `year`: ano.
- `pdfUrl`: link direto para PDF.
- `abstractUrl`: link para resumo ou registro.
- `externalUrl`: outro link externo.

A aba Repositório ordena os trabalhos do mais recente para o mais antigo e permite filtro por:

- busca textual;
- ano;
- tipo.

## Como editar Instagram

Abra:

```text
data/site-data.js
```

Procure:

```js
const instagramInfo = {
```

Campos principais:

```js
profileUrl: "https://www.instagram.com/herbario.unila/",
handle: "@herbario.unila",
qrCodeUrl: "...",
callout: "...",
posts: [...]
```

Para trocar o perfil:

```js
profileUrl: "https://www.instagram.com/novo.perfil/"
```

Para usar QR Code próprio:

1. Coloque a imagem em:

```text
img/qrcode-instagram.png
```

2. Troque:

```js
qrCodeUrl: "img/qrcode-instagram.png"
```

Para adicionar card estático:

```js
{
    title: "Título do card",
    text: "Texto curto sobre a publicação ou evento.",
    tag: "Evento",
    link: "https://www.instagram.com/herbario.unila/"
}
```

## Como editar Serviços

Abra:

```text
data/site-data.js
```

Procure:

```js
const serviceItems = [
```

Exemplo:

```js
{
    title: "Solicitação de identificação",
    description: "Texto explicando o serviço.",
    status: "Sob consulta"
}
```

Serviços atuais:

- Doação de material botânico.
- Solicitação de identificação.
- Visitas ao herbário.
- Uso da coleção.
- Contato e horários.

## Como editar a aba Onde estamos

Abra:

```text
data/site-data.js
```

Procure a página:

```js
id: "onde-estamos"
```

Ali ficam:

- título;
- resumo;
- texto do endereço;
- e-mail;
- mapa incorporado;
- link/URL do mapa.

O mapa usa um `iframe` do Google Maps.

## Como adicionar uma nova ferramenta

1. Crie uma pasta dentro de:

```text
tools/
```

Exemplo:

```text
tools/Nova_Ferramenta/
```

2. Coloque o HTML principal da ferramenta dentro da pasta.

Exemplo:

```text
tools/Nova_Ferramenta/index.html
```

3. No HTML da ferramenta, use o CSS compartilhado:

```html
<link rel="stylesheet" href="../shared/tool-standard.css?v=20260530h">
```

4. Abra:

```text
data/site-data.js
```

5. Encontre:

```js
const tools = [
```

6. Adicione:

```js
{
    id: "nova-ferramenta",
    name: "Nova Ferramenta",
    category: "Categoria",
    description: "Descrição curta da ferramenta.",
    accepts: "Tipo de arquivo aceito.",
    output: "Resultado gerado.",
    status: "Estavel",
    version: "2.0",
    path: "tools/Nova_Ferramenta/index.html",
    exampleLabel: "Arquivo exemplo",
    exampleUrl: ""
}
```

Campos importantes:

- `id`: identificador único, sem espaços e sem acentos.
- `name`: nome exibido no portal.
- `category`: categoria curta.
- `description`: descrição do card.
- `accepts`: arquivos aceitos.
- `output`: resultado gerado.
- `status`: status da ferramenta.
- `version`: versão.
- `path`: caminho do HTML.
- `exampleLabel`: texto do botão de exemplo.
- `exampleUrl`: caminho ou link do arquivo exemplo.

## Fluxo recomendado das ferramentas

O fluxo documentado na aba Ajuda é:

1. JABOT Extract
   - Extrair códigos de barras de um PDF do JABOT.

2. EVB Labels
   - Usar a planilha de dados e os códigos recortados para gerar etiquetas.

3. EVB Labels Collection
   - Gerar etiquetas para caixas específicas, listas de caixas ou intervalos da coleção.

4. EVB DataCheck
   - Analisar planilha de dados botânicos e gerar estatísticas.

5. SpeciesLink para JABOT
   - Converter planilhas exportadas do speciesLink para o fluxo do JABOT.

## Arquivos de exemplo

A pasta:

```text
exemplos/
```

foi criada para receber arquivos modelo.

Nomes esperados:

```text
jabot-extract-codigos-barras.pdf
evb-labels-dados-etiquetas.xlsx
evb-labels-collection-dados.xlsx
specieslink-exportacao-exemplo.xlsx
```

Observações:

- O EVB DataCheck usa o mesmo exemplo do EVB Labels:

```text
evb-labels-dados-etiquetas.xlsx
```

- Se preferir não armazenar arquivos grandes no GitHub, use links externos no `exampleUrl`, como Google Drive, OneDrive, DSpace, Zenodo ou OSF.

- Para o EVB Labels Collection, o exemplo pode estar em `.xls`, `.xlsx` ou `.csv`; se o nome do arquivo mudar, atualize o caminho em `data/site-data.js`.

## GitHub Pages

O projeto é compatível com GitHub Pages.

### Arquivo `.nojekyll`

Existe um arquivo:

```text
.nojekyll
```

Ele evita que o GitHub Pages processe o site com Jekyll. Isso ajuda a preservar pastas e arquivos do jeito que estão no repositório.

Mesmo assim, o projeto usa preferencialmente:

```text
tools/shared/
```

em vez de:

```text
tools/_shared/
```

para evitar problemas com diretórios iniciados por `_`.

### Cache

Quando alterar CSS ou JS, atualize os sufixos `?v=...`.

Exemplo:

```html
<link rel="stylesheet" href="assets/css/layout.css?v=20260530h">
<script defer src="js/app.js?v=20260530h"></script>
```

O portal também usa `APP_VERSION` em:

```text
js/app.js
```

Exemplo:

```js
const APP_VERSION = "20260530h";
```

Esse valor é usado para forçar atualização das ferramentas carregadas dentro do `iframe`.

### Checklist antes de publicar

Antes de subir para o GitHub Pages:

1. Confirme que `index.html` está na raiz do repositório.
2. Confirme que `data/site-data.js` foi enviado.
3. Confirme que `assets/css/` foi enviado.
4. Confirme que `js/app.js` foi enviado.
5. Confirme que `tools/` foi enviado.
6. Confirme que `img/` foi enviado.
7. Confirme que `.nojekyll` foi enviado.
8. Atualize os sufixos de cache se alterou CSS ou JS.
9. Abra o site em aba anônima ou limpe cache se aparecer versão antiga.

## Imagens e tamanho do repositório

Algumas imagens podem ficar grandes, especialmente fotos do carrossel.

Pontos de atenção:

- Fotos muito grandes deixam o GitHub Pages mais lento.
- Arquivos acima de 50 MB geram alerta no GitHub.
- Arquivos acima de 100 MB podem ser bloqueados.
- Fotos de 1 a 3 MB costumam ser aceitáveis.
- Fotos acima de 10 MB devem ser otimizadas quando possível.

Atualmente há fotos grandes como:

```text
```

Recomendação futura:

- reduzir resolução;
- comprimir JPG;
- converter para WebP se fizer sentido;
- manter cópias originais fora do repositório.

## IUCN Red List e Cloudflare Worker

A ferramento EVB DataCheck possui consulta complementar à IUCN Red List.

Por limitação de CORS e segurança do token, a chamada direta do navegador não é ideal. Por isso, o projeto usa um Cloudflare Worker como proxy:

```text
https://iucn-proxy-worker.marlonbioyt.workers.dev/
```

O arquivo de referência do Worker está em:

```text
tools/Analise_Botanica/iucn-proxy-worker.js
```

Importante:

- O token da IUCN não deve ser colocado no HTML.
- O token deve ficar como segredo no Cloudflare.
- A URL do Worker pode ser pública.
- O Worker deve limitar origens permitidas quando possível.

No Worker existe uma lista:

```js
const ALLOWED_ORIGINS = new Set([
  'https://marlonroyer.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);
```

Se o domínio final do GitHub Pages mudar, atualize essa lista no Worker publicado.

## Rodando localmente

Como o projeto é estático, existem duas formas simples:

### Abrir diretamente

Você pode abrir:

```text
index.html
```

no navegador.

Isso funciona para boa parte do portal.

### Usar servidor local simples

Alguns navegadores podem restringir certos recursos quando o HTML é aberto diretamente por `file://`. Se algo não carregar corretamente, use um servidor local.

Com Python:

```bash
python -m http.server 5500
```

Depois acesse:

```text
http://localhost:5500
```

## Validação técnica

Durante a revisão mais recente foram validados:

- `data/site-data.js`
- `js/app.js`
- `tools/Jabot_Extract/scripts.js`
- `tools/EVB_Labels/script.js`
- `tools/EVB_Labels_Collection/script.js`
- `tools/Analise_Botanica/iucn-proxy-worker.js`
- scripts embutidos do EVB DataCheck
- scripts embutidos do SpeciesLink para JABOT
- links locais `href` e `src` dos principais HTMLs

Comandos equivalentes usados:

```bash
node --check data/site-data.js
node --check js/app.js
node --check tools/Jabot_Extract/scripts.js
node --check tools/EVB_Labels/script.js
node --check tools/EVB_Labels_Collection/script.js
node --check tools/Analise_Botanica/iucn-proxy-worker.js
```

## Manutenção recomendada

### Ao alterar conteúdo

Edite:

```text
data/site-data.js
```

Normalmente não é necessário mexer em `app.js`.

### Ao alterar visual do portal

Edite:

```text
assets/css/layout.css
assets/css/theme.css
assets/css/base.css
```

Depois atualize cache no `index.html`.

### Ao alterar visual das ferramentas

Edite:

```text
tools/shared/tool-standard.css
```

Depois atualize o sufixo `?v=` nos HTMLs das ferramentas que carregam esse arquivo.

### Ao alterar uma ferramenta específica

Edite os arquivos dentro da pasta da própria ferramenta.

Exemplo:

```text
tools/EVB_Labels/script.js
tools/EVB_Labels/styles.css
tools/EVB_Labels/index.html
```

Depois atualize o cache no HTML da ferramenta.

## Pontos de atenção conhecidos

### Arquivos em `exemplos/`

A estrutura está pronta, mas os arquivos modelo ainda precisam ser adicionados se a função de download for usada.

### Logos antigos

O portal principal usa `img/LogoEVB.png`. Logos antigos de versoes anteriores nao fazem parte da estrutura atual.


### Pasta `_shared`

Existe:

```text
tools/_shared/
```

Ela foi mantida por segurança, mas a pasta preferida é:

```text
tools/shared/
```

### Fotos grandes

Algumas fotos do carrossel estão grandes. Em algum momento, vale otimizar para melhorar carregamento.

## Créditos

Herbário Evaldo Buttura (EVB) - UNILA.

Portal desenvolvido por:

```text
Marlon Royer de Morais
```

Uso interno:

```text
EVB / UNILA
```

Versão do portal:

```text
1.0
```

Versão das ferramentas exibida no portal:

```text
2.0
```
