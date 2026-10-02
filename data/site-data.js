// ============================================================
// CONFIGURAÇÕES EDITÁVEIS DO PORTAL EVB
// ============================================================
// Este é o arquivo principal para atualizar o conteúdo do site.
//
// Aqui você pode:
// 1. Adicionar/remover ferramentas no menu superior.
// 2. Adicionar fotos e legendas no carrossel da aba Início.
// 3. Atualizar integrantes da equipe.
// 4. Adicionar trabalhos na aba Repositório.
// 5. Editar serviços, contatos, links externos e textos das abas.
//
// Dicas importantes:
// - Mantenha vírgula entre os blocos { ... }.
// - Caminhos de imagem são relativos à pasta principal do site.
// - Para fotos, use por exemplo: img/fotos/F9.jpg
// - Nas legendas, use <em>...</em> para nomes científicos em itálico.
// - Se um campo de link não existir, deixe como "".
(() => {

// ============================================================
// FERRAMENTAS DO MENU SUPERIOR
// ============================================================
// Para adicionar uma ferramenta:
// 1. Coloque a pasta da ferramenta dentro de tools/.
// 2. Copie um bloco abaixo.
// 3. Altere id, name, category, description, accepts, output, status, versión e path.
//
// Exemplo:
// {
//     id: "minha-ferramenta",
//     name: "Minha Ferramenta",
//     category: "Categoria",
//     description: "Descrição curta da ferramenta.",
//     accepts: "Arquivos aceitos pela ferramenta.",
//     output: "Resultado gerado pela ferramenta.",
//     status: "Estavel",
//     versión: "2.0",
//     path: "tools/Minha_Ferramenta/index.html"
// }
const tools = [
    {
        id: "jabot-extract",
        name: "JABOT Extract",
        category: "Códigos de barras",
        description: "Recorta, lê e organiza individualmente os códigos de barras exportados pelo JABOT em PDFs A4 padronizados.",
        accepts: "PDFs A4 gerados pelo JABOT com 44 códigos por página, organizados em 4 colunas e 11 linhas.",
        output: "Arquivo .zip com imagens .png recortadas e nomeadas automaticamente pelo código EVB do exemplar.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/Jabot_Extract/index.html",
        exampleLabel: "PDF exemplo",
        exampleUrl: "exemplos/jabot-extract-codigos-barras.pdf"
    },
    {
        id: "evb-labels",
        name: "EVB Labels",
        category: "Etiquetas",
        description: "Gera etiquetas complementares para materiais recebidos por doação, combinando dados da planilha com códigos de barras do JABOT.",
        accepts: "Planilha .xls ou .xlsx do lote e imagens .png dos códigos de barras geradas pelo JABOT Extract.",
        output: "PDF com etiquetas prontas para conferência, impressão, recorte e colagem nas exsicatas.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/EVB_Labels/index.html",
        exampleLabel: "Planilha exemplo",
        exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx"
    },
    {
        id: "evb-labels-collection",
        name: "EVB Labels Collection",
        category: "Etiquetas",
        description: "Gera etiquetas para caixas da coleção, auxiliando a organização física dos armários, prateleiras e pacotes de exsicatas.",
        accepts: "Planilha-mapa da coleção em .xls, .xlsx ou .csv, com caixas, famílias e intervalos armazenados.",
        output: "PDF com as etiquetas de caixas selecionadas, pronto para impressão e substituição das etiquetas antigas.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/EVB_Labels_Collection/index.html",
        exampleLabel: "Planilha exemplo",
        exampleUrl: "exemplos/evb-labels-collection-dados.xlsx"
    },
    {
        id: "analise-botanica",
        name: "EVB DataCheck",
        category: "Análise",
        description: "Gera estatísticas descritivas, gráficos, mapas, listas florísticas e cruzamentos auxiliares a partir de planilhas botânicas.",
        accepts: "Planilhas no modelo JABOT ou dados próprios organizados com campos botânicos, taxonômicos, geográficos e curatoriais.",
        output: "Painel analítico com estatísticas, completude, listas por família, mapas, gráficos e relatório textual padronizado.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/Analise_Botanica/analise-botanica.html",
        exampleLabel: "Planilha exemplo",
        exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx"
    },
    {
        id: "mapa-coordenadas",
        name: "EVB GeoCheck",
        category: "Georreferenciamento",
        description: "Plota coordenadas em mapa interativo, permite filtrar e buscar registros, avalia completude espacial e apoia o georreferenciamento de registros sem coordenada.",
        accepts: "Planilhas .xls, .xlsx ou .csv com coordenadas decimais ou campos em graus, minutos e segundos.",
        output: "Mapa interativo, tabela copiável, planilha atualizada em .xlsx, lista de pontos, filtros, busca, legenda dinâmica, relatório espacial e conversoes de coordenadas.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/Mapa_Coordenadas/index.html",
        exampleLabel: "Planilha exemplo",
        exampleUrl: "exemplos/Planilha_GeoCheck.xlsx"
    },
    {
        id: "evb-revisao",
        name: "EVB Revisão",
        category: "Revisão",
        description: "Revisa planilhas botânicas antes da incorporação, destacando alertas, corrigindo campos seguros e identificando duplicidades prováveis.",
        accepts: "Planilhas .xls, .xlsx ou .csv no modelo JABOT, speciesLink convertido ou formatos autorais próximos do padrão EVB.",
        output: "Planilha revisada com a mesma estrutura de colunas da original, sem colunas extras obrigatórias, além de alertas visuais e correções destacadas.",
        status: "Experimental",
        versión: "1.0",
        path: "tools/EVB_Revisao/index.html",
        exampleLabel: "Planilha exemplo",
        exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx"
    },
    {
        id: "evb-darwincore",
        name: "EVB DarwinCore",
        category: "Padronização",
        description: "Converte planilhas autorais, JABOT e PELD/RAPELD Vegetacao para uma estrutura Darwin Core voltada a flora, preservando campos verbatim e gerando relatório local de validação.",
        accepts: "Planilhas .xls, .xlsx ou .csv com dados botanicos, geográficos, curatoriais, taxonomicos ou dados de parcelas PELD/RAPELD.",
        output: "Planilha Darwin Core com preview, sheet de mapeamento, relatório auxiliar e, no perfil PELD/RAPELD, aba MeasurementOrFact.",
        status: "Estavel",
        versión: "1.0",
        path: "tools/EVB_DarwinCore/index.html"
    },
    {
        id: "specieslink-jabot",
        name: "SpeciesLink para JABOT",
        category: "Conversão",
        description: "Converte planilhas Excel exportadas do speciesLink, em formato Darwin Core, para o modelo padrão utilizado pelo JABOT.",
        accepts: "Planilhas .xlsx exportadas do speciesLink, especialmente de materiais recebidos por doação de outros herbários.",
        output: "Planilha reorganizada no padrão JABOT, com coletores, determinadores, autores, coordenadas e campos principais estruturados.",
        status: "Estavel",
        versión: "2.0",
        path: "tools/Conversot_SpecisLink_JABOT/index.html",
        exampleLabel: "Planilha speciesLink",
        exampleUrl: "exemplos/specieslink-exportacao-exemplo.xlsx"
    }
];

// ============================================================
// TEXTOS EXPANDIDOS DOS CARDS DE FERRAMENTAS
// ============================================================
// Estes textos aparecem quando o usuário clica em "Mais sobre" na aba Ferramentas.
const toolLongDescriptions = {
    "jabot-extract": `
        <p>A ferramenta <strong>JABOT Extract</strong> tem como objetivo recortar, extrair e organizar individualmente os códigos de barras gerados pelo sistema JABOT em arquivos PDF no formato A4.</p>
        <p>No JABOT, os códigos de barras dos exemplares previamente selecionados são exportados em uma folha A4, distribuídos em <strong>44 códigos por página</strong>, organizados em <strong>4 colunas e 11 linhas</strong>. Como esses códigos ocupam posições fixas no documento, a ferramenta foi previamente configurada para realizar os recortes de forma padronizada, capturando cada código individualmente.</p>
        <p>Após o recorte, cada imagem passa por um processo de leitura, no qual a ferramenta identifica as informações contidas no código de barras. No contexto do Herbário Evaldo Buttura, o código segue o formato <strong>EVB001234</strong>, em que o número de tombo do exemplar corresponde ao próprio código de barras. Assim, a ferramenta utiliza essa informação para nomear automaticamente cada imagem extraída.</p>
        <p>Depois de concluir a leitura e a nomeação dos códigos, o JABOT Extract permite exportar todas as imagens em formato <strong>.png</strong>, reunidas em um arquivo compactado <strong>.zip</strong>. Esse arquivo deve ser descompactado em uma pasta definida pelo usuário.</p>
        <p>Recomenda-se manter uma organização rigorosa dos arquivos, especialmente porque essa ferramenta é utilizada em conjunto com o processo de geração de etiquetas para materiais recebidos por doação. Como esses materiais são previamente incorporados e validados no JABOT por meio de uma planilha padrão, é recomendável utilizar o mesmo nome do lote em todos os arquivos e pastas relacionados.</p>
        <p>Por exemplo, se o herbário recebeu uma doação em agosto de 2026, o lote pode ser nomeado como <strong>EVB_Ago_2026</strong>. Nesse caso, recomenda-se criar uma pasta principal com esse nome, preferencialmente dentro de uma pasta maior chamada <strong>Incorporações</strong>. Dentro da pasta do lote, podem ser mantidos todos os documentos relacionados àquela validação, incluindo a planilha, o PDF exportado do JABOT e uma subpasta chamada <strong>códigos_barra</strong>, onde devem ser extraídas as imagens geradas pelo JABOT Extract.</p>
        <p>Quando o PDF possui menos de 44 códigos de barras em uma página, a ferramenta ainda realiza os 44 recortes previstos. Nesses casos, podem ser geradas imagens em branco, nomeadas automaticamente com identificadores genéricos, como <strong>EVB000001</strong>. Essas imagens podem ser excluídas sem prejuízo ao processo.</p>
        <p>Ao final, o usuário terá as imagens dos códigos de barras devidamente recortadas, nomeadas e prontas para a próxima etapa: a criação das etiquetas por meio da ferramenta <strong>EVB Labels</strong>.</p>
    `,
    "evb-labels": `
        <p>A ferramenta <strong>EVB Labels</strong> gera etiquetas padronizadas para materiais recebidos por doação pelo Herbário Evaldo Buttura.</p>
        <p>Esse tipo de etiqueta é utilizado especialmente quando o material recebido já possui uma etiqueta original do herbário de origem. Nesses casos, a etiqueta original é preservada na exsicata, e o EVB acrescenta uma etiqueta complementar, menor, contendo as informações necessárias para a incorporação do exemplar ao acervo.</p>
        <p>As etiquetas geradas incluem número de tombo, família botânica, nome científico com autoria, coletor, número de coleta, data de coleta, determinador, projeto e o código de barras gerado pelo JABOT. O código de barras utilizado é aquele previamente recortado pela ferramenta <strong>JABOT Extract</strong>.</p>
        <p>Para funcionar corretamente, a ferramenta solicita dois conjuntos de dados: imagens dos códigos de barras em formato <strong>.png</strong> e uma planilha em formato <strong>.xls</strong> ou <strong>.xlsx</strong> contendo as informações dos exemplares. As imagens devem estar organizadas em uma pasta; o usuário seleciona todas as imagens e, em seguida, carrega a planilha correspondente ao lote.</p>
        <p>Essa planilha pode ser a mesma utilizada para incorporar e validar os exemplares no JABOT, ou uma planilha exportada a partir de uma seleção personalizada no próprio sistema. A ferramenta é capaz de ler ambos os formatos, <strong>.xls</strong> e <strong>.xlsx</strong>.</p>
        <p>Após o carregamento, a ferramenta gera automaticamente as etiquetas. Nesse momento, o usuário consegue identificar problemas como ausência de imagens, imagens carregadas a partir de outro lote ou inconsistências entre a planilha e os códigos disponíveis. Quando uma imagem correspondente não é encontrada, a etiqueta é gerada sem código de barras, permitindo identificar rapidamente a inconsistência.</p>
        <p>Esse comportamento reduz a margem de erro, pois a ferramenta não insere códigos aleatórios em etiquetas incorretas. Quando há correspondência entre a planilha e as imagens, o código é inserido corretamente; quando não há correspondência, a etiqueta permanece sem código de barras.</p>
        <p>Após a conferência, a ferramenta permite baixar um arquivo em <strong>PDF</strong> contendo todas as etiquetas geradas. Recomenda-se verificar as configurações de impressão, especialmente o ajuste de margens e o ajuste ao conteúdo da página, para evitar cortes.</p>
        <p>Depois da impressão, as etiquetas devem ser recortadas e coladas nas respectivas exsicatas. Em seguida, o material pode seguir o fluxo normal de processamento da coleção, incluindo fotografia, separação de duplicatas e encaminhamento ao freezer.</p>
    `,
    "evb-labels-collection": `
        <p>A ferramenta <strong>EVB Labels Collection</strong> gera etiquetas para as caixas da coleção do Herbário Evaldo Buttura.</p>
        <p>Diferentemente do EVB Labels, utilizado para etiquetas de exemplares individuais, o EVB Labels Collection tem uso mais pontual, voltado à organização física da coleção. Ele é utilizado quando há necessidade de atualizar etiquetas de caixas, especialmente em situações de reorganização dos pacotes de exsicatas.</p>
        <p>Esse tipo de atualização pode ser necessário quando novas famílias são adicionadas a uma caixa, quando pacotes são transferidos entre caixas ou quando há necessidade de reordenar o conteúdo físico da coleção para melhor acomodação dos exemplares. Nesses casos, a etiqueta da caixa deve refletir corretamente quais famílias, pacotes e intervalos estão armazenados em seu interior.</p>
        <p>Para isso, a ferramenta utiliza uma planilha específica, que funciona como um mapa da coleção. Essa planilha contém informações sobre cada caixa e os pacotes ou intervalos de exemplares armazenados. A versão atual aceita arquivos <strong>.xls</strong>, <strong>.xlsx</strong> e <strong>.csv</strong>.</p>
        <p>O processo é simples: quando ocorre uma alteração na organização física, a planilha deve ser atualizada. Em seguida, o usuário abre a ferramenta, carrega o arquivo e informa uma caixa específica, uma lista de caixas ou um intervalo de etiquetas que desej? gerar.</p>
        <p>A ferramenta permite gerar apenas as etiquetas necessárias, sem obrigar a produção de todas as etiquetas da coleção de uma só vez. Isso torna o processo mais prático para atualizações pontuais.</p>
        <p>Após o carregamento da planilha e a definição da seleção desejada, a ferramenta gera as etiquetas e permite o download do arquivo final em <strong>PDF</strong>. Depois disso, o usuário imprime as etiquetas, recorta e cola sobre um suporte mais resistente, como cartolina, formando um cartão mais firme. Por fim, as etiquetas antigas devem ser substituídas pelas novas na coleção.</p>
    `,
    "analise-botanica": `
        <p>A ferramenta <strong>EVB DataCheck</strong> gera estatísticas descritivas a partir de um conjunto de exemplares previamente definido pelo usuário.</p>
        <p>A ferramenta trabalha com planilhas no formato padrão do JABOT, o mesmo modelo utilizado para incorporar novos materiais à coleção. Essas planilhas contêm campos importantes para a análise de dados botânicos, taxonômicos, geográficos, temporais e curatoriais. A partir desses campos, a ferramenta produz um conjunto amplo de informações estatísticas e interpretativas sobre o recorte analisado.</p>
        <p>Entre os principais resultados gerados estão dados sobre composição e diversidade taxonômica, incluindo número de famílias, gêneros e espécies, riqueza total, abundância de registros, nível de identificação dos exemplares e grupos taxonômicos mais representativos. A ferramenta também permite identificar padrões de raridade, indicando quantas espécies aparecem com apenas um registro, duas ocorrências ou diferentes frequências no conjunto analisado.</p>
        <p>A análise temporal inclui informações sobre esforço amostral por ano e por mês, permitindo observar a intensidade de coleta ao longo do tempo e possíveis padrões de sazonalidade. Quando os dados permitem, também podem ser geradas curvas de acumulação de espécies e curvas do coletor.</p>
        <p>A ferramenta realiza análises espaciais, reunindo informações sobre municípios, estados, cidades e localidades mais amostradas. Quando há coordenadas disponíveis, os registros podem ser plotados em mapa, incluindo visualizações espaciais e camadas de concentração dos pontos amostrais.</p>
        <p>Outro recurso importante é a análise de completude dos dados. A ferramenta calcula indicadores relacionados a coordenadas válidas, data completa de coleta, determinador informado e outros campos relevantes, apresentando valores absolutos e percentuais para avaliar a qualidade e a consistência dos dados.</p>
        <p>A ferramenta também possibilita comparações entre áreas, como estados ou municípios, e gera listas de espécies agrupadas por família em formato semelhante ao de tabelas florísticas, incluindo nome científico, nome popular, hábito, número de registros e testemunhos associados, quando disponíveis.</p>
        <p>Também são produzidos gráficos e informações sobre hábitos ou formas de crescimento, herbário de origem dos registros, proporção de amostras contribuídas por cada herbário, principais coletores e principais determinadores.</p>
        <p>Como complemento, a ferramenta possui integração com dados taxonômicos auxiliares, especialmente relacionados à Flora do Brasil 2020. Quando os arquivos auxiliares são carregados, realiza validação taxonômica dos nomes científicos, verificando nomes aceitos, sinônimos, origem, endemismo, forma de vida e habitat.</p>
        <p>A ferramenta também cruza automaticamente a lista de espécies com bases de espécies exóticas invasoras, incluindo a Base Nacional de Espécies Exóticas Invasoras do Instituto Hórus e a Lista de Espécies Exóticas Invasoras do Paraná, vinculada ao Programa do Estado do Paraná para Espécies Exóticas Invasoras e reconhecida pela Portaria IAP n. 59/2015.</p>
        <p>Outro módulo importante é a consulta ao status de conservação. A referência nacional principal é a base de avaliações de risco de extinção da flora brasileira do CNCFlora/JBRJ, com categorias como EX, EW, CR, EN, VU, NT, LC, DD e NE. A ferramenta também pode consultar a IUCN Red List como fonte complementar, por meio de um proxy do EVB hospedado no Cloudflare Worker.</p>
        <p>O EVB DataCheck é uma ferramenta dinâmica, cuj? utilidade depende da pergunta de pesquisa e do recorte de dados definido pelo usuário. Ela não se limita a planilhas exportadas do JABOT: também pode ser utilizada com dados próprios de pesquisas individuais ou dados de outras coleções, desde que organizados segundo o modelo básico do JABOT.</p>
        <p>Ao final, a ferramenta gera um relatório textual padronizado com os principais resultados e uma breve contextualização. Esse relatório funciona como referência inicial, mas deve ser revisado criticamente, especialmente quando utilizado em relatórios técnicos, resumos científicos, artigos, diagnósticos de coleção ou outros produtos formais.</p>
    `,
    "mapa-coordenadas": `
        <p>A ferramenta <strong>EVB GeoCheck</strong> foi criada para concentrar as funções espaciais em uma interface própria, independente do EVB DataCheck.</p>
        <p>Ela permite carregar planilhas em formato <strong>.xls</strong>, <strong>.xlsx</strong> ou <strong>.csv</strong>, reconhecer coordenadas decimais ou coordenadas organizadas em graus, minutos e segundos, plotar os pontos em mapa interativo e avaliar a completude espacial do conjunto de dados.</p>
        <p>O mapa possui camadas base, visualizacao por satélite, agrupamento de pontos, filtros, busca, legenda interativa e lista de pontos visíveis. A tabela carregada pode ser visualizada abaixo do mapa, copiada para revisão em planilhas externas ou exportada novamente em formato <strong>.xlsx</strong>.</p>
        <p>A ferramenta também inclui um módulo inicial de <strong>georreferenciamento assistido</strong>. Nesse fluxo, o usuário seleciona um registro sem coordenadas, usa as informações de coleta para aproximar a localidade, consulta pistas de registros do mesmo coletor com coordenadas, desenha no mapa a área provável de ocorrência e aplica a coordenada estimada nos campos JABOT de latitude, longitude e GMS.</p>
        <p>A ferramenta também funciona como conversor de coordenadas. O usuário pode converter uma coordenada individual entre decimal e GMS, plotar uma coordenada digitada manualmente e converter lotes de coordenadas, gerando uma tabela pronta para copiar e colar em planilhas externas.</p>
        <p>Esse módulo e util tanto para revisão de planilhas botânicas quanto para tarefas rápidas de georreferenciamento, conferência de campo, organização de coordenadas e preparação de dados espaciais para outras análises.</p>
    `,
    "evb-revisao": `
        <p>A ferramenta <strong>EVB Revisão</strong> foi criada para atuar na etapa de conferência curatorial das planilhas botânicas antes da incorporação, análise ou padronização final.</p>
        <p>Seu objetivo é carregar uma planilha, manter a estrutura original das colunas e destacar problemas prováveis, como nomes científicos incorretos, campos textuais mal formatados, datas incoerentes, ausência de informações importantes e possíveis duplicidades entre registros.</p>
        <p>A ferramenta aplica apenas correções consideradas seguras, como limpeza de espaços, padronização de nomes de coletores e determinadores, normalização de textos, inferência simples de hábito a partir das notas e correção de grafia taxonômica quando o GBIF retorna uma correspondência forte.</p>
        <p>As linhas corrigidas são destacadas em verde, linhas com avisos aparecem em amarelo, erros críticos em vermelho e possíveis duplicidades em azul claro. A ferramenta nunca exclui registros automaticamente e não cria colunas extras obrigatórias no arquivo exportado.</p>
        <p>Ela deve funcionar como uma etapa intermediária do fluxo do herbário: planilha bruta ou recém-convertida entra na EVB Revisão, passa por correções e alertas, e depois segue para JABOT, EVB DataCheck, EVB GeoCheck ou EVB DarwinCore.</p>
    `,
    "specieslink-jabot": `
        <p>A ferramenta <strong>SpeciesLink para JABOT</strong> converte planilhas Excel exportadas do speciesLink, organizadas em formato Darwin Core, para o modelo de planilha padrão utilizado pelo JABOT.</p>
        <p>Essa conversão é especialmente útil quando o Herbário Evaldo Buttura precisa incorporar materiais recebidos por doação de herbários que não utilizam o sistema JABOT, mas possuem seus acervos informatizados e disponibilizados no speciesLink. Nesses casos, o usuário pode buscar os registros no speciesLink, filtrar os exemplares desejados, exportar a planilha em Excel e converter os dados automaticamente para o padrão exigido pelo JABOT.</p>
        <p>Um exemplo de uso ocorre quando o herbário recebe uma doação de uma instituição como o HCF. O usuário pode buscar no speciesLink os registros correspondentes ao herbário de origem e aos números de tombo desejados, baixar a planilha com todas as colunas disponíveis e utilizar a ferramenta para converter esses dados.</p>
        <p>Durante a conversão, a ferramenta organiza automaticamente campos como coletores, determinadores, autores dos nomes científicos, informações geográficas e coordenadas. Ela também formata nomes de coletores e determinadores conforme o padrão adotado pelo EVB, separando o coletor principal dos coletores adicionais.</p>
        <p>Um recurso importante é a conversão de coordenadas. O speciesLink pode disponibilizar coordenadas decimais e coordenadas em campos verbatim. É necessário ter atenção, pois as colunas longitude e latitude podem representar coordenadas gerais associadas ao município, enquanto <strong>verbatimLatitude</strong> e <strong>verbatimLongitude</strong> tendem a preservar as coordenadas informadas na etiqueta original ou no registro de coleta.</p>
        <p>Por isso, a ferramenta prioriza as coordenadas presentes em <strong>verbatimLatitude</strong> e <strong>verbatimLongitude</strong>, quando disponíveis. Quando estão em formato decimal, converte automaticamente para graus, minutos e segundos; quando já estão em GMS, transfere as informações para as colunas adequadas.</p>
        <p>O processo economiza tempo e reduz o trabalho manual de transcrição, mas não substitui a revisão dos dados pelo usuário. É fundamental conferir coordenadas, coletores adicionais, habitat, localidade e demais dados presentes na etiqueta original.</p>
        <p>A ferramenta também pode ser utilizada para converter dados do speciesLink com a finalidade de analisá-los na ferramenta <strong>EVB DataCheck</strong>, facilitando estudos comparativos, diagnósticos de coleção e levantamentos baseados em dados de diferentes herbários.</p>
        <p>Ao abrir a ferramenta, o usuário informa o nome do projeto e o nome do arquivo de saída. O nome do projeto é inserido na coluna correspondente da planilha final, sendo útil em casos de incorporação de material recebido por doação. O nome do arquivo deve seguir, preferencialmente, o mesmo padrão organizacional das demais etapas, como <strong>EVB_Ago_2026</strong>.</p>
        <p>Durante o processo, são exibidos erros e alertas relacionados à conversão. Esses avisos devem ser conferidos, pois podem indicar campos ausentes, dados incompatíveis ou informações que exigem revisão manual.</p>
        <p>Embora automatize grande parte do processo, a conferência final continua indispensável. O usuário deve verificar exemplar por exemplar, especialmente coordenadas, coletores adicionais, habitat e informações que podem estar na etiqueta original, mas ausentes ou incompletas na planilha exportada.</p>
    `,
    "evb-darwincore": `
        <p>A ferramenta <strong>EVB DarwinCore</strong> foi criada para padronizar planilhas botânicas autorais ou no modelo JABOT em uma estrutura compativel com o Darwin Core, com foco inicial em dados de flora.</p>
        <p>O objetivo principal desta primeira versão e automatizar a passagem de um formato de trabalho interno para um formato mais universal de exibição, intercâmbio e compartilhamento de dados, sem perder o rastro do que estava escrito originalmente na planilha de origem.</p>
        <p>Por isso, a ferramenta preserva sempre que possível campos <strong>verbatim</strong>, especialmente relacionados a nome científico, data, localidade e coordenadas. Ao mesmo tempo em que produz colunas padronizadas do Darwin Core, ela guarda também a forma original do dado quando essa informação existe na planilha ou pode ser reconstruida com segurança.</p>
        <p>A versão atual aceita planilhas em <strong>.xls</strong>, <strong>.xlsx</strong> e <strong>.csv</strong>, tenta reconhecer automaticamente o perfil de entrada e trabalha especialmente bem com duas situações: planilhas no modelo JABOT e planilhas autorais com colunas taxonômicas, geográficas e curatoriais minimamente reconhecíveis.</p>
        <p>Durante a conversão, a ferramenta monta uma planilha Darwin Core com preview imediato, gera uma folha auxiliar de mapeamento entre colunas de origem e termos finais, produz um relatório local de validação e permite exportar o resultado em <strong>.xlsx</strong> ou <strong>.csv</strong>.</p>
        <p>O perfil <strong>PELD/RAPELD Vegetacao</strong> reconhece planilhas de parcelas com módulo, parcela, lado, faixa, subparcela, plaqueta, taxonomia, DAP, altura, POM, flags e posições locais X/Y. Nesses casos, a ferramenta gera uma tabela principal de ocorrências e uma aba <strong>MeasurementOrFact</strong> com as medidas associadas a cada individuo.</p>
        <p>Esta primeira etapa ainda não substitui uma validação taxonômica mais robusta. Ela entrega o núcleo estrutural: padronização, preservação de verbatim, revisão local e preparação do conjunto para passos posteriores, como matching taxonomico, checagem contra backbone externo e uso em plataformas de biodiversidade.</p>
    `
};

tools.forEach(tool => {
    tool.longDescriptionHtml = toolLongDescriptions[tool.id] || "";
});

// ============================================================
// AJUDA E EXEMPLOS DAS FERRAMENTAS
// ============================================================
// Estes dados aparecem dentro da aba Ferramentas, abaixo dos cards.
//
// Arquivos esperados na pasta exemplos/:
// - jabot-extract-codigos-barras.pdf
// - evb-labels-dados-etiquetas.xlsx
// - evb-labels-collection-dados.xlsx
// - specieslink-exportacao-exemplo.xlsx
//
// Observação: o EVB DataCheck usa a mesma planilha exemplo do EVB Labels.
const toolHelp = {
    flow: [
        {
            step: "1",
            title: "Extrair códigos de barras",
            tool: "JABOT Extract",
            text: "Exporte no JABOT o PDF A4 com códigos de barras e use a ferramenta para recortar, ler e nomear automaticamente cada imagem."
        },
        {
            step: "2",
            title: "Gerar etiquetas",
            tool: "EVB Labels",
            text: "Use a planilha do lote junto com as imagens .png geradas no passo anterior para criar etiquetas complementares de incorporação."
        },
        {
            step: "3",
            title: "Atualizar caixas",
            tool: "EVB Labels Collection",
            text: "Atualize a planilha-mapa da coleção e gere apenas as etiquetas das caixas que precisam ser substituídas."
        },
        {
            step: "4",
            title: "Analisar dados",
            tool: "EVB DataCheck",
            text: "Carregue uma planilha no modelo JABOT para produzir estatísticas, gráficos, mapas, listas floristicas e relatório interpretativo."
        },
        {
            step: "5",
            title: "Revisar planilha",
            tool: "EVB Revisão",
            text: "Corrija campos seguros, revise nomes científicos, padronize textos e identifique duplicidades prováveis antes da incorporação final."
        },
        {
            step: "6",
            title: "Conferir coordenadas",
            tool: "EVB GeoCheck",
            text: "Plote pontos, revise completude espacial, filtre registros e converta coordenadas em formato decimal ou GMS."
        },
        {
            step: "7",
            title: "Converter speciesLink",
            tool: "SpeciesLink para JABOT",
            text: "Converta planilhas Darwin Core exportadas do speciesLink para o padrão JABOT antes da conferência e incorporação."
        },
        {
            step: "8",
            title: "Padronizar para Darwin Core",
            tool: "EVB DarwinCore",
            text: "Converta planilhas autorais ou no modelo JABOT para uma estrutura Darwin Core com campos verbatim preservados, preview e relatório local de validação."
        }
    ],
    tools: [
        {
            toolId: "jabot-extract",
            expectedInput: "PDF A4 exportado pelo JABOT com códigos de barras em posições fixas, normalmente 44 códigos por página, em 4 colunas e 11 linhas.",
            steps: [
                "Abra a ferramenta JABOT Extract.",
                "Carregue o PDF padronizado gerado pelo JABOT.",
                "Aguarde o recorte automatico das posições previstas na página.",
                "Confira se os códigos foram lidos e nomeados no formato EVB001234.",
                "Baixe o arquivo .zip com as imagens .png recortadas.",
                "Descompacte as imagens em uma pasta organizada para usar no EVB Labels."
            ],
            commonErrors: [
                "PDF fora do padrão de 44 códigos por página.",
                "Pagina incompleta gerando recortes em branco, que podem ser excluidos depois.",
                "Código não identificado corretamente para nomear o arquivo automaticamente.",
                "Misturar imagens de códigos de barras de lotes diferentes."
            ],
            exampleUrl: "exemplos/jabot-extract-codigos-barras.pdf",
            exampleLabel: "Baixar PDF exemplo"
        },
        {
            toolId: "evb-labels",
            expectedInput: "Planilha .xls ou .xlsx do lote e imagens .png dos códigos de barras correspondentes, previamente recortadas pelo JABOT Extract.",
            steps: [
                "Primeiro gere e descompacte os códigos recortados no JABOT Extract.",
                "Abra o EVB Labels.",
                "Selecione as imagens .png dos códigos de barras do lote.",
                "Carregue a planilha correspondente aos exemplares.",
                "Confira a previa e verifique etiquetas sem código de barras, pois elas indicam ausência de correspondência.",
                "Baixe o PDF final, imprima, recorte e cole as etiquetas nas exsicatas."
            ],
            commonErrors: [
                "Código de barras ausente para um exemplar listado na planilha.",
                "Imagens de outro lote carregadas junto com a planilha atual.",
                "Colunas da planilha com nomes diferentes do modelo esperado.",
                "Configuracao de impressao cortando margens ou ajustando incorretamente o PDF."
            ],
            exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx",
            exampleLabel: "Baixar planilha exemplo"
        },
        {
            toolId: "evb-labels-collection",
            expectedInput: "Planilha-mapa da coleção em .xls, .xlsx ou .csv, contendo o identificador da caixa, as famílias e os pacotes ou intervalos armazenados.",
            steps: [
                "Atualize a planilha-mapa sempre que houver reorganização física da coleção.",
                "Abra o EVB Labels Collection.",
                "Carregue a planilha atualizada.",
                "Informe uma caixa especifica, uma lista de caixas ou o intervalo de etiquetas que desej? gerar.",
                "Baixe o PDF final.",
                "Imprima, recorte, cole em suporte mais resistente e substitua as etiquetas antigas das caixas."
            ],
            commonErrors: [
                "Planilha-mapa desatualizada em relação a organização física real.",
                "Caixa especifica ou intervalo de caixas informado incorretamente.",
                "Campos de armário, prateleira, caixa ou pacote ausentes.",
                "Imprimir todas as etiquetas quando apenas uma atualização pontual era necessária."
            ],
            exampleUrl: "exemplos/evb-labels-collection-dados.xlsx",
            exampleLabel: "Baixar planilha exemplo"
        },
        {
            toolId: "analise-botanica",
            expectedInput: "Planilha no modelo JABOT, ou dados próprios organizados nesse padrão basico, com campos botanicos, taxonomicos, geográficos, temporais e curatoriais.",
            steps: [
                "Abra o EVB DataCheck.",
                "Carregue a planilha de dados.",
                "Confira os campos reconhecidos e a completude dos dados.",
                "Carregue bases auxiliares quando desejar validar nomes, origem, endemismo, invasoras ou status de conservacao.",
                "Explore estatísticas, gráficos, mapas, listas por família e relatórios.",
                "Revise criticamente os resultados antes de usa-los em produtos técnicos ou científicos."
            ],
            commonErrors: [
                "Colunas taxonômicas, geográficas ou curatoriais ausentes.",
                "Nomes de família, gênero ou espécie inconsistentes.",
                "Coordenadas, datas ou determinadores incompletos reduzindo a completude.",
                "Interpretar o relatório automatico sem revisão técnica."
            ],
            exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx",
            exampleLabel: "Baixar planilha exemplo"
        },
        {
            toolId: "mapa-coordenadas",
            expectedInput: "Planilha .xls, .xlsx ou .csv com coordenadas decimais ou campos GMS do modelo JABOT.",
            steps: [
                "Abra EVB GeoCheck.",
                "Carregue a planilha JABOT ou uma planilha com coordenadas reconhecíveis.",
                "Confira os pontos no mapa, filtros, busca e completude espacial.",
                "Confira a tabela abaixo do mapa e copie o conteúdo quando precisar revisar os dados em uma planilha externa.",
                "Use a aba Coordenadas do portal quando precisar converter coordenadas individualmente ou em lote."
            ],
            commonErrors: [
                "Usar coordenadas gerais de município em vez das coordenadas reais de coleta.",
                "Planilha sem campos de latitude/longitude ou campos GMS incompletos.",
                "Camadas espaciais muito grandes deixando a interface lenta."
            ],
            exampleUrl: "exemplos/Planilha_GeoCheck.xlsx",
            exampleLabel: "Baixar planilha exemplo"
        },
        {
            toolId: "evb-revisao",
            expectedInput: "Planilha .xls, .xlsx ou .csv no modelo JABOT, speciesLink convertido ou planilha autoral com campos botânicos e curatoriais reconhecíveis.",
            steps: [
                "Abra EVB Revisão.",
                "Carregue a planilha que precisa ser conferida.",
                "Use Analisar planilha para localizar avisos, erros e duplicidades prováveis.",
                "Use Corrigir seguro para aplicar limpeza de texto, padronização simples de pessoas, localização e hábito inferido por notas.",
                "Use Corrigir nomes GBIF para corrigir grafias taxonômicas com correspondência forte.",
                "Revise as linhas destacadas e exporte a planilha revisada mantendo as colunas originais."
            ],
            commonErrors: [
                "Nomes científicos com erro de digitação.",
                "Coletores e determinadores com separadores inconsistentes.",
                "Data de determinação anterior à data de coleta.",
                "Campos de projeto ou herbário de origem ausentes em material de doação.",
                "Registros muito semelhantes indicando duplicidade provável."
            ],
            exampleUrl: "exemplos/evb-labels-dados-etiquetas.xlsx",
            exampleLabel: "Baixar planilha exemplo"
        },
        {
            toolId: "specieslink-jabot",
            expectedInput: "Planilha Excel .xlsx exportada do speciesLink em formato Darwin Core, preferencialmente com todos os campos disponiveis.",
            steps: [
                "Busque e filtre no speciesLink os registros desejados.",
                "Exporte a planilha Excel com os dados do lote.",
                "Abra a ferramenta SpeciesLink para JABOT.",
                "Informe o nome do projeto e o nome do arquivo de saida.",
                "Carregue a planilha exportada.",
                "Confira alertas, coordenadas, coletores, determinadores, habitat e localidade.",
                "Baixe a planilha reorganizada no padrão JABOT e revise exemplar por exemplar."
            ],
            commonErrors: [
                "Campos obrigatorios ausentes ou exportados em colunas diferentes do esperado.",
                "Coordenadas gerais de município confundidas com coordenadas da etiqueta original.",
                "Informações de localidade, habitat, coletores adicionais ou determinadores incompletas.",
                "Incorporar os dados convertidos sem comparacao com as etiquetas originais."
            ],
            exampleUrl: "exemplos/specieslink-exportacao-exemplo.xlsx",
            exampleLabel: "Baixar planilha speciesLink"
        },
        {
            toolId: "evb-darwincore",
            expectedInput: "Planilhas autorais, planilhas no modelo JABOT, planilhas parcialmente alinhadas ao Darwin Core ou planilhas PELD/RAPELD de vegetacao, com dados taxonomicos, geográficos, curatoriais ou de parcelas.",
            steps: [
                "Abra EVB DarwinCore.",
                "Carregue a planilha .xls, .xlsx ou .csv que desej? padronizar.",
                "Escolha o perfil de leitura automatico, JABOT, autoral, Darwin Core parcial ou PELD/RAPELD Vegetacao.",
                "Preencha os metadados principais do conjunto, como datasetName, institutionCode, collectionCode, basisOfRecord, license e rightsHolder.",
                "Execute a conversão para gerar a planilha Darwin Core com preservação de campos verbatim. Para PELD/RAPELD, revise também a aba MeasurementOrFact.",
                "Revise o preview, os alertas locais e a aba de mapeamento antes de exportar o arquivo final."
            ],
            commonErrors: [
                "scientificName ausente ou montado apenas parcialmente a partir de genus e epiteto.",
                "Coordenadas ausentes, invalidas ou distribuidas em colunas inesperadas.",
                "Campos geográficos muito incompletos para montar country, stateProvince, county e locality com segurança.",
                "Planilhas autorais com nomes de colunas muito idiossincraticos exigindo revisão manual depois da conversão."
            ]
        }
    ]
};

// ============================================================
// FOTOS DO CARROSSEL DA ABA INÍCIO
// ============================================================
// Para adicionar uma nova foto:
// 1. Coloque a imagem na pasta img/fotos/.
// 2. Copie uma linha da lista abaixo.
// 3. Troque o nome do arquivo e a legenda.
//
// Campos:
// - src: caminho da imagem.
// - alt: texto alternativo para acessibilidade.
// - caption: legenda exibida sobre a foto. É opcional.
//
// Exemplo:
// { src: "img/fotos/F9.jpg", alt: "Sala do herbário", caption: "Nova legenda" }
const photoGallery = [
    { src: "img/fotos/F2.jpg", alt: "Sala do herbário", caption: "Fruto de <em>Cedrela fissilis</em>, símbolo do Herbário" },
    { src: "img/fotos/F3.jpg", alt: "Sala do herbário", caption: "Processo de costura de uma exsicata" },
    { src: "img/fotos/F4.jpg", alt: "Sala do herbário" },
    { src: "img/fotos/F5.jpg", alt: "Sala do herbário", caption: "Equipe do Herbário" },
    { src: "img/fotos/F8.jpg", alt: "Sala do herbário", caption: "Sonia Marcela fotografando uma exsicata" }    
];

// ============================================================
// EQUIPE
// ============================================================
// Para adicionar um novo integrante:
// 1. Coloque a foto em img/fotos/.
// 2. Copie um bloco abaixo.
// 3. Altere name, role, group, email e photo.
//
// O campo group controla em qual grupo a pessoa aparece.
// Exemplos: "Curadoria", "Bolsistas", "Estagiários", "Colaboradores".
//
// Exemplo:
// {
//     name: "Nome Completo",
//     role: "Função no herbário",
//     group: "Bolsistas",
//     email: "email@exemplo.com",
//     photo: "img/fotos/Nome.png"
// }
const teamMembers = [
    {
        name: "Laura Cristina Pires Lima",
        role: "Curadora do herbário",
        group: "Curadoria",
        email: "laura.lima@unila.edu.br",
        photo: "img/fotos/Laura Lima.png"
    },
    {
        name: "Giovana Secretti Vendruscolo",
        role: "Vice-curadora",
        group: "Curadoria",
        email: "giovana.vendruscolo@unila.edu.br",
        photo: "img/fotos/Giovana Vendruscolo.png"
    },
    {
        name: "Marlon Royer de Morais",
        role: "Biólogo e bolsista técnico do herbário",
        group: "Bolsistas",
        email: "marlonbioyt@gmail.com",
        photo: "img/fotos/Marlon Royer.png"
    },
    {
        name: "Aline Barbosa",
        role: "Bolsista graduanda do EVB",
        group: "Bolsistas",
        email: "",
        photo: "img/fotos/Aline Barboza.png"
    },
    {
        name: "Sonia Marcela",
        role: "Ex-bolsista graduanda do EVB",
        group: "Bolsistas",
        email: "",
        photo: "img/fotos/Sonia Marcela.png"
    }
];

// ============================================================
// REPOSITÓRIO DE TRABALHOS
// ============================================================
// Para adicionar um novo trabalho:
// 1. Copie um bloco abaixo.
// 2. Preencha título, autor, tipo, ano e links disponíveis.
//
// A lista é ordenada automaticamente do ano mais recente para o mais antigo.
//
// Tipos sugeridos:
// - "TCC"
// - "Dissertação"
// - "Artigo"
// - "Relatório"
// - "Capítulo"
//
// Campos de link:
// - pdfUrl: link direto para o PDF.
// - abstractUrl: link para resumo, página institucional ou registro.
// - externalUrl: outro link externo relacionado.
//
// Exemplo:
// {
//     title: "Título do trabalho",
//     author: "Nome do autor",
//     type: "TCC",
//     year: "2024",
//     pdfUrl: "https://link-do-pdf",
//     abstractUrl: "",
//     externalUrl: ""
// }
const repositoryItems = [
    {
        title: "Espécies Arbóreas de um Fragmento de Floresta Estacional Semidecidual no Oeste do Paraná: Levantamento Florístico e Chave de Identificação Dendrológica",
        author: "Izabele Oliveira Munaro",
        type: "TCC",
        year: "2022",
        pdfUrl: "https://dspace.unila.edu.br/bitstreams/b2f6b62a-0281-4359-8e32-b0e76b20d4ef/download",
        abstractUrl: "",
        externalUrl: ""
    }
];

// ============================================================
// ORIENTAÇÕES E PROCEDIMENTOS
// ============================================================
// Estes cards aparecem na aba Orientações.
// Para alterar, edite title, description e status.
//
// Exemplo:
// {
//     title: "Novo procedimento",
//     description: "Descrição do procedimento.",
//     status: "Em preparação"
// }
const serviceItems = [
    {
        title: "Guia de boas práticas",
        description: "Espaço reservado para reunir orientações gerais para novos integrantes, estagiários, estudantes de iniciação científica e demais pessoas que estejam começando a atuar no herbário.",
        status: "Em preparação"
    },
    {
        title: "Processos de herborização",
        description: "Espaço reservado para descrever, futuramente, as etapas de coleta, prensagem, secagem, montagem, costura, etiquetagem, fotografia e armazenamento do material botânico.",
        status: "Em preparação"
    },
    {
        title: "Incorporação de material",
        description: "Orientações iniciais para estudantes de TCC, iniciação científica e projetos vinculados ao EVB sobre como organizar dados de coleta e preparar material para incorporação ao acervo.",
        status: "Modelo em breve",
        actionLabel: "Baixar planilha modelo",
        actionUrl: "exemplos/modelo-incorporacao-evb.xlsx"
    },
    {
        title: "Uso e consulta da coleção",
        description: "Espaço reservado para registrar normas internas de conservação, manuseio de exsicatas, consulta ao acervo físico e digital, registro de uso e acompanhamento pela equipe responsável.",
        status: "Uso orientado"
    },
    {
        title: "Rotinas internas",
        description: "Espaço reservado para procedimentos de organização, digitalização, conferência de dados, manejo de duplicatas, freezer, armários e demais etapas da rotina curatorial.",
        status: "EVB / UNILA"
    }
];

const orientationGuides = [
    {
        id: "boas-praticas",
        title: "Guia de boas práticas",
        status: "Em construção",
        summary: "Orientações essenciais para novos integrantes, estagiários, estudantes de iniciação científica, TCC e colaboradores que atuam no EVB.",
        sections: [
            {
                title: "Segurança e preparação para campo",
                body: [
                    "Antes das atividades de coleta, o aluno ou pesquisador deve estar adequadamente equipado para garantir sua segurança e a qualidade do trabalho. Recomenda-se o uso de calçados fechados, perneiras, calças compridas, camisa de manga longa, chapéu ou boné, protetor solar e repelente.",
                    "Em condições de chuva, devem ser utilizados capa impermeável ou outros equipamentos compatíveis com o clima. A preparação prévia evita interrupções no campo e reduz perdas de informação e de material botânico."
                ],
                items: [
                    "Levar caderno de campo, lápis ou caneta, tesoura de poda, podão, sacos plásticos, fita crepe, prensa, jornais, papelões e cordas ou cintas.",
                    "Usar GPS ou aplicativo capaz de registrar coordenadas geográficas associadas às fotografias.",
                    "Manter o material identificado desde o momento da coleta."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Registro de dados no campo",
                body: [
                    "O caderno de campo é uma das ferramentas mais importantes da coleta botânica. Nele devem ser registradas informações que não serão preservadas após a secagem, como altura da planta, hábito, coloração de flores e frutos, presença de látex, odor, textura das folhas, tipo de casca, arquitetura da copa e demais observações relevantes.",
                    "Um erro frequente entre iniciantes é confiar que as informações observadas em campo serão lembradas depois. Como muitos detalhes se perdem, os dados devem ser registrados imediatamente durante a coleta."
                ],
                items: [
                    "Registrar data, coletor principal, colaboradores, número da coleta, localidade, coordenadas, habitat, hábito e descrição do ambiente.",
                    "Fotografar o indivíduo completo, o ambiente e detalhes de folhas, casca, flores, frutos, inflorescências, espinhos, acúleos e outras estruturas diagnósticas.",
                    "Quando necessário, usar fundo escuro e escala métrica para fotos padronizadas."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Rastreabilidade e padronização",
                body: [
                    "Cada coleta deve receber uma numeração única atribuída pelo coletor, seguindo uma sequência contínua. Esse número deve acompanhar o material no caderno de campo, nas etiquetas temporárias, na prensa, na planilha e nas etapas posteriores do processamento.",
                    "Os nomes dos coletores devem ser registrados de forma padronizada, com o sobrenome primeiro e as iniciais dos prenomes, como em Silva, J.R. O coletor principal deve ser associado ao número da coleta, enquanto os demais participantes aparecem como coletores adicionais."
                ],
                items: [
                    "Não misturar indivíduos diferentes sob o mesmo número de coleta.",
                    "Manter duplicatas da mesma coleta agrupadas durante prensagem, secagem e montagem.",
                    "Registrar todos os participantes da coleta para garantir reconhecimento e rastreabilidade."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Cuidados recorrentes e erros comuns",
                body: [
                    "Grande parte dos problemas em herbário surge de falhas simples: material coletado sem estrutura reprodutiva, dados incompletos, amostras insuficientes, perda de etiquetas temporárias, secagem incompleta, fungos, montagem frágil ou identificação taxonômica assumida sem conferência.",
                    "A adoção de procedimentos padronizados reduz esses riscos e aumenta o valor científico dos exemplares incorporados ao herbário."
                ],
                items: [
                    "Priorizar material fértil sempre que disponível.",
                    "Evitar deixar plantas delicadas muitas horas sem prensagem.",
                    "Descartar jornais e papelões contaminados por fungos.",
                    "Manusear exsicatas secas com delicadeza, pois folhas, flores e frutos quebram com facilidade.",
                    "Comparar diferentes fontes antes de considerar uma identificação como definitiva."
                ],
                image: "",
                imageAlt: ""
            }
        ]
    },
    {
        id: "herborizacao",
        title: "Processos de herborização",
        status: "Conteúdo inicial disponível",
        summary: "Fluxo técnico para transformar plantas coletadas em exsicatas permanentes, documentadas e aptas à incorporação no acervo.",
        sections: [
            {
                title: "Visão geral do fluxo",
                body: [
                    "A herborização é o conjunto de procedimentos utilizados para transformar plantas coletadas em exsicatas, isto é, espécimes permanentes compostos por partes secas de uma planta. O processo envolve coleta, prensagem, secagem, identificação, montagem, documentação, digitalização, armazenamento e, quando aplicável, doação ou permuta de duplicatas.",
                    "No EVB, parte desse fluxo é executada por estudantes, professores e pesquisadores responsáveis pelas coletas, e parte é conduzida pela equipe técnica do herbário. Essa divisão ajuda a garantir a confiabilidade das informações e a qualidade física dos exemplares depositados."
                ],
                items: [
                    "Coletar material representativo e bem documentado.",
                    "Prensar e secar o exemplar sem perder a associação com seus dados.",
                    "Identificar, montar, etiquetar, digitalizar e organizar o material antes da incorporação definitiva."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "1. Coleta botânica",
                body: [
                    "A coleta botânica tem como objetivo obter amostras representativas das plantas em seu ambiente natural, preservando características vegetativas e reprodutivas e registrando informações essenciais para identificação e documentação científica.",
                    "Sempre que possível, deve-se priorizar material fértil, contendo flores e/ou frutos, pois as estruturas reprodutivas fornecem caracteres importantes para a identificação. O tamanho da amostra deve ser compatível com a exsicata, geralmente com cerca de 29,7 cm por 42 cm."
                ],
                items: [
                    "Coletar ramos que permitam observar a disposição das folhas e outras características relevantes.",
                    "Fazer dobras técnicas ou selecionar partes representativas quando o material exceder o tamanho da cartolina.",
                    "Coletar duplicatas quando possível, mantendo todas associadas ao mesmo número de coleta.",
                    "Acondicionar em sacos plásticos identificados quando a prensagem não puder ser imediata."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "2. Prensagem",
                body: [
                    "A prensagem preserva a morfologia do espécime por meio do achatamento e da organização adequada do material vegetal. Folhas, flores, frutos e demais estruturas diagnósticas devem ser posicionados de modo estratégico, evitando sobreposições excessivas.",
                    "O processo é realizado com prensa botânica, jornais, papelões e cordas ou cintas. O material deve ser acomodado em jornal, intercalado com papelões e comprimido de forma suficiente para permanecer firme durante o transporte e a secagem."
                ],
                items: [
                    "Expor as faces adaxial e abaxial das folhas sempre que possível.",
                    "Manter flores e frutos visíveis, evitando que fiquem ocultos sob folhas.",
                    "Identificar cada amostra na prensa com número de coleta.",
                    "Acondicionar frutos carnosos ou estruturas delicadas em envelopes de jornal identificados."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "3. Secagem em estufa",
                body: [
                    "A secagem promove a desidratação controlada do material vegetal, impedindo decomposição e proliferação de fungos. O tempo de secagem varia conforme o tipo de material, a quantidade de amostras, a circulação de ar e a temperatura utilizada.",
                    "Em condições normais, a secagem costuma ocorrer entre dois e cinco dias. Materiais delicados geralmente respondem melhor a temperaturas próximas de 50°C, enquanto ramos lenhosos podem ser secos em temperaturas próximas de 60°C."
                ],
                items: [
                    "Avaliar cada exemplar individualmente antes de retirar da estufa.",
                    "Prolongar a secagem se folhas, flores, frutos ou caules ainda estiverem úmidos ou flexíveis.",
                    "Descartar jornais e papelões com fungos para evitar contaminação de outros exemplares.",
                    "Acompanhar grupos delicados, suculentas, cactáceas e materiais com alto teor de água com atenção especial."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "4. Identificação taxonômica",
                body: [
                    "A identificação taxonômica determina a identidade do material coletado por meio da análise morfológica, consulta à literatura, comparação com coleções de referência e, quando necessário, apoio de especialistas.",
                    "Ela pode ocorrer em qualquer fase do fluxo, desde o campo até depois da montagem. A identificação deve ser vista como um processo investigativo, sujeito a revisões, redeterminações e atualizações nomenclaturais."
                ],
                items: [
                    "Utilizar chaves, livros, guias, artigos e materiais de herbário como referência.",
                    "Comparar exemplares com acervos digitais como speciesLink e Reflora.",
                    "Validar a nomenclatura em bases atualizadas, como Reflora e Plants of the World Online.",
                    "Reavaliar identificações incompatíveis com a distribuição geográfica conhecida da espécie."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "5. Montagem e costura das exsicatas",
                body: [
                    "Após a secagem, o material é fixado permanentemente em cartolina apropriada para conservação. A duplicata mais representativa e melhor preservada costuma ser selecionada como exemplar principal.",
                    "O espécime deve ser acomodado preferencialmente na região central da folha, mantendo livre o canto inferior direito para a etiqueta e o canto superior esquerdo para envelope de partes soltas, quando necessário."
                ],
                items: [
                    "Usar poucos pontos de costura, mas suficientes para garantir estabilidade.",
                    "Iniciar os pontos pelo verso da cartolina, mantendo os nós na parte posterior.",
                    "Testar a fixação virando a folha cuidadosamente de cabeça para baixo.",
                    "Usar pequenas tiras de fita gomada em estruturas muito delicadas.",
                    "Acondicionar a exsicata montada em pasta de papel pardo identificada."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "6. Etiquetagem, digitalização e organização",
                body: [
                    "Depois do tombamento e da conferência dos dados, a etiqueta científica definitiva deve ser produzida, revisada e fixada no exemplar. A etiqueta precisa corresponder exatamente ao material, ao número de tombo e às informações registradas no banco.",
                    "A digitalização produz uma representação permanente do exemplar, exigindo nitidez, enquadramento adequado e nomeação correta dos arquivos. Em seguida, duplicatas devem ser separadas, o material pode passar por congelamento preventivo e, por fim, ser organizado físicamente no acervo."
                ],
                items: [
                    "Conferir dados com o banco antes da impressão da etiqueta.",
                    "Verificar nitidez, enquadramento e nomeação das imagens digitalizadas.",
                    "Separar duplicatas por número de coleta e registrar sua destinação.",
                    "Utilizar congelamento preventivo para controle de insetos e organismos associados.",
                    "Organizar famílias, espécies e caixas mantendo rastreabilidade de localização."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "7. Doação e permuta de duplicatas",
                body: [
                    "A distribuição de duplicatas para outras coleções científicas amplia o acesso ao material e fortalece redes de colaboração entre herbários. Também reduz riscos de perda de informação, pois exemplares associados à mesma coleta passam a estar preservados em mais de uma instituição."
                ],
                items: [
                    "Selecionar duplicatas adequadas para envio.",
                    "Definir herbários contemplados conforme acordos e prioridades curatoriais.",
                    "Registrar a saída do material e sua destinação.",
                    "Embalar os exemplares de forma segura para evitar danos durante o transporte."
                ],
                image: "",
                imageAlt: ""
            }
        ]
    },
    {
        id: "incorporacao",
        title: "Incorporação de material",
        status: "Modelo disponível",
        summary: "Orientações para estudantes de TCC, IC e projetos vinculados ao EVB organizarem dados e materiais para o acervo.",
        actionLabel: "Baixar planilha modelo",
        actionUrl: "exemplos/modelo-incorporacao-evb.xlsx",
        sections: [
            {
                title: "Quando o material está apto",
                body: [
                    "A incorporação é a etapa em que o exemplar passa oficialmente a integrar a coleção científica. Para isso, o material precisa estar adequadamente coletado, seco, montado, identificado, acompanhado de dados consistentes e apto à conferência pela equipe do herbário.",
                    "A qualidade da incorporação depende diretamente da qualidade das anotações de campo, da rastreabilidade do número de coleta e da organização do material físico."
                ],
                items: [
                    "Material montado e estável na cartolina.",
                    "Número de coleta vinculado ao coletor principal.",
                    "Duplicatas separadas e identificadas quando houver.",
                    "Dados mínimos de coleta presentes e revisados."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Registro no banco de dados e tombamento",
                body: [
                    "No EVB, o registro dos exemplares é realizado por meio do sistema JABOT. Esse processo é chamado de tombamento. Durante o tombamento, cada exsicata recebe um número único de registro, também chamado de número de tombo ou voucher.",
                    "O voucher serve como comprovação material da ocorrência e da identificação de uma espécie. Em trabalhos científicos, relatórios, dissertações e teses, o número do voucher permite que outros pesquisadores localizem e consultem o exemplar utilizado."
                ],
                items: [
                    "Exemplares coletados por estudantes e pesquisadores devem ser acompanhados da planilha padrão de tombamento.",
                    "Materiais recebidos por doação, permuta ou intercâmbio são cadastrados pela equipe técnica do herbário.",
                    "O acesso ao JABOT é restrito à equipe técnica, mas a qualidade dos dados enviados é responsabilidade do aluno ou pesquisador responsável."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Preenchimento da planilha modelo",
                body: [
                    "A planilha modelo padroniza o processo de registro. Cada informação deve ser inserida na coluna correta, respeitando as regras de importação e validação do JABOT. Datas, coordenadas, nomes científicos e campos curatoriais precisam seguir o formato esperado.",
                    "Informações inseridas em colunas incorretas, coordenadas mal formatadas, nomes científicos grafados fora do padrão ou dados incompletos podem impedir ou comprometer o tombamento."
                ],
                items: [
                    "Preservar os nomes das colunas da planilha modelo.",
                    "Preencher dados de identificação taxonômica, localidade, coordenadas, coletores, datas, projeto e observações de campo.",
                    "Revisar nomes científicos em bases atualizadas, como Reflora e Plants of the World Online.",
                    "Padronizar coletores, determinadores e colaboradores.",
                    "Conferir sinais negativos, hemisférios e formato das coordenadas."
                ],
                image: "",
                imageAlt: ""
            },
            {
                title: "Conferência e entrega ao herbário",
                body: [
                    "A equipe técnica do herbário revisa as planilhas recebidas antes da incorporação definitiva, mas a entrega deve chegar ao EVB tão completa e consistente quanto possível. Pendências de dados podem atrasar o tombamento e reduzir o valor científico do exemplar.",
                    "A conferência deve considerar tanto o material físico quanto a planilha. O exemplar, a etiqueta temporária, o número de coleta e os dados digitais precisam apontar para a mesma coleta."
                ],
                items: [
                    "Enviar a planilha preenchida junto com o material físico correspondente.",
                    "Indicar materiais com dúvida de identificação.",
                    "Corrigir pendências apontadas pela equipe antes da incorporação definitiva.",
                    "Aguardar geração de etiquetas, digitalização, congelamento preventivo e organização no acervo."
                ],
                image: "",
                imageAlt: ""
            }
        ]
    }
];

// ============================================================
// INSTAGRAM
// ============================================================
// Estes dados aparecem na aba Instagram.
//
// Para trocar o perfil:
// - Altere profileUrl.
//
// Para usar um QR Code próprio:
// 1. Salve a imagem em img/, por exemplo: img/qrcode-instagram.png
// 2. Troque qrCodeUrl pelo caminho da imagem.
//
// Para adicionar um card de publicação/evento:
// 1. Copie um bloco dentro de posts.
// 2. Altere title, text, tag e link.
const instagramInfo = {
    profileUrl: "https://www.instagram.com/herbario.unila/",
    handle: "@herbario.unila",
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=https%3A%2F%2Fwww.instagram.com%2Fherbario.unila%2F",
    qrCodeAlt: "QR Code para acessar o Instagram do Herbário Evaldo Buttura",
    callout: "Acompanhe o Herbário Evaldo Buttura no Instagram para ver bastidores da coleção, atividades de extensão, divulgação científica, eventos e registros do cotidiano do acervo.",
    posts: [
        {
            title: "Bastidores do herbário",
            text: "Registros da rotina de curadoria, organização, digitalização e conservação da coleção botânica.",
            tag: "Rotina EVB",
            link: "https://www.instagram.com/herbario.unila/"
        },
        {
            title: "Educação ambiental",
            text: "Divulgação de ações, visitas, oficinas e atividades de extensão realizadas pelo herbário.",
            tag: "Extensão",
            link: "https://www.instagram.com/herbario.unila/"
        },
        {
            title: "Flora regional",
            text: "Publicações sobre plantas, biodiversidade, conservação e pesquisas relacionadas à flora do oeste do Paraná.",
            tag: "Divulgação científica",
            link: "https://www.instagram.com/herbario.unila/"
        }
    ]
};

// ============================================================
// ABAS INSTITUCIONAIS DO MENU LATERAL
// ============================================================
// Aqui ficam as abas como Início, Onde estamos, Equipe, Orientações,
// Taxonline e Repositório.
//
// Para alterar texto de uma aba:
// - title: título principal.
// - summary: resumo abaixo do título.
// - body: parágrafos simples em lista.
// - bodyHtml: texto com HTML controlado, usado quando precisa de <strong> ou <em>.
//
// Para atualizar links:
// - Instagram: altere actionUrl na aba "instagram".
// - Taxonline: altere actionUrl na aba "taxonline".
//
// Para criar uma nova aba:
// 1. Copie um bloco existente.
// 2. Use um id único, sem espaços e sem acentos.
// 3. Altere label, title, eyebrow, summary e body.
const infoPages = [
    {
        id: "quem-somos",
        label: "Início",
        title: "Herbário Evaldo Buttura",
        eyebrow: "Herbário Evaldo Buttura",
        summary: "Coleção botânica da UNILA dedicada à flora regional, à formação técnico-científica e à difusão do conhecimento sobre biodiversidade.",
        bodyHtml: `
            <p>O herbário Evaldo Buttura (<strong>EVB</strong>), da Universidade Federal da Integração Latino-Americana (UNILA), está localizado em Foz do Iguaçu, no extremo oeste do estado do Paraná. A sigla <strong>EVB</strong> foi dada em homenagem ao engenheiro agrônomo <strong>Evaldo Buttura</strong>, responsável pelo levantamento florístico na região de Foz do Iguaçu até Guaíra há mais de 40 anos, sendo seu trabalho botânico uma importante referência para a flora regional. O herbário iniciou suas atividades em <strong>2015</strong> a partir da doação e restauração da coleção botânica de Buttura, composta por pouco mais de 1.200 amostras de plantas secas, coletadas majoritariamente entre as décadas de 1970 e 1980 na microrregião de Foz do Iguaçu e parte do Paraguai.</p>
            <p>O herbário <strong>EVB</strong> atua na coleta e no intercâmbio de materiais da flora do oeste do Paraná, com enfoque no Parque Nacional do Iguaçu, em Plantas Alimentícias Não Convencionais (PANC) e na flora urbana. Além disso, promove a formação técnico-científica por meio da oferta de vagas de estágio supervisionado e iniciação científica, bem como pela orientação de dissertações de mestrado e trabalhos de conclusão de curso.</p>
            <p>Além de manter uma coleção botânica de referência para a flora regional e contribuir para a formação técnica e acadêmica, o herbário <strong>EVB</strong> desempenha um papel fundamental na disseminação do conhecimento sobre biodiversidade e conservação da flora. Para isso, desenvolve atividades de educação ambiental e divulgação científica voltadas à comunidade externa, incluindo ações em feiras, escolas e espaços públicos. Dessa forma, o herbário atua de maneira integrada nas dimensões de ensino, pesquisa e extensão universitária.</p>
            <p>Atualmente, o herbário migrou a informatização de seus dados do software Brahms para o Jabot. O acervo conta com cerca de <strong>8.000</strong> exemplares informatizados, dos quais a maior parte possui imagens digitalizadas e disponíveis online nas plataformas Herbário Virtual Reflora, Jabot, <em>speciesLink</em>, INCT - Herbário Virtual Reflora, GBIF e SIBBr.</p>
            <p>Desde 2015, o herbário integra a Rede Brasileira de Herbários da Sociedade Botânica do Brasil. Em 2020, foi cadastrado no <em>Index Herbáriorum</em>, passando a ser reconhecido internacionalmente entre os herbários do mundo.</p>
        `,
        image: "",
        imageAlt: "Logo do Herbário Evaldo Buttura",
        imageMode: "contain logo-showcase",
        gallery: photoGallery,
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "onde-estamos",
        label: "Onde estamos",
        title: "Onde estamos",
        eyebrow: "Localização",
        summary: "O EVB está localizado no Parque Tecnológico Itaipu, em Foz do Iguaçu, Paraná.",
        body: [
            "Endereço: Edifício das Águas, Laboratórios Multiusuários Engenheira Enedina Alves Marques, Parque Tecnológico Itaipu, Bloco 04, Espaço 02, Salas 10, 11 e 12.",
            "E-mail do herbário: herbarioevaldobuttura@gmail.com."
        ],
        map: {
            title: "Localização do Herbário Evaldo Buttura no Google Maps",
            src: "https://www.google.com/maps?q=-25.4354247,-54.5964765&z=19&output=embed"
        },
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "equipe",
        label: "Conheça a equipe",
        title: "Conheça a equipe",
        eyebrow: "Equipe EVB",
        summary: "Equipe vinculada à curadoria, gestão, apoio técnico e atividades de pesquisa e extensão do EVB.",
        body: [
            "A equipe do Herbário Evaldo Buttura (EVB) é composta pela curadoria, vice-curadoria, bolsistas técnicos, bolsistas de graduação e estagiários vinculados principalmente ao curso de Ciências Biológicas. Seus integrantes atuam de forma colaborativa em atividades relacionadas à curadoria científica, manutenção e organização da coleção, informatização e digitalização do acervo, manejo de doações e apoio às atividades de pesquisa, ensino e extensão desenvolvidas pelo herbário."
        ],
        team: teamMembers,
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "instagram",
        label: "Instagram",
        title: "Nossa página no Instagram",
        eyebrow: "Redes sociais",
        summary: "Acompanhe as novidades, atividades, eventos e bastidores do Herbário Evaldo Buttura.",
        body: [
            "O Instagram do EVB reúne registros da rotina do herbário, ações de educação ambiental, divulgação científica, atividades de pesquisa e momentos de interação com a comunidade."
            
        ],
        image: "",
        imageAlt: "",
        instagram: instagramInfo,
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "servicos",
        label: "Orientações",
        title: "Orientações e procedimentos",
        eyebrow: "Informações internas",
        summary: "Espaço para reunir guias, procedimentos e materiais de apoio para quem está começando a atuar no Herbário Evaldo Buttura.",
        body: [
            "Esta seção não representa uma oferta de serviços externos. Ela foi pensada como uma porta de entrada para estudantes, estagiários, bolsistas e colaboradores que precisam compreender as rotinas básicas do herbário.",
            "Os guias abaixo estão preparados para receber textos extensos, etapas detalhadas, imagens ilustrativas e materiais de apoio."
        ],
        guides: orientationGuides,
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "taxonline",
        label: "Taxonline",
        title: "Taxonline",
        eyebrow: "Consulta externa",
        summary: "Página externa com informações institucionais do Herbário Evaldo Buttura na Rede Taxonline.",
        body: [
            "A página do EVB no Taxonline reúne histórico, informações de localização, curadoria, equipe, publicações e links relacionados ao herbário.",
            "Use esta aba como ponte para consulta externa e como referência para manter os dados institucionais do portal atualizados."
        ],
        image: "",
        imageAlt: "",
        actionLabel: "Abrir Taxonline",
        actionUrl: "https://www.taxonline.bio.br/evb"
    },
    {
        id: "repositorio",
        label: "Repositório",
        title: "Repositório",
        eyebrow: "Produção acadêmica",
        summary: "Trabalhos, publicações e materiais produzidos por integrantes vinculados ao Herbário Evaldo Buttura.",
        body: [
            "Este espaço reúne trabalhos publicados por membros da equipe e colaboradores do herbário."
        ],
        repository: repositoryItems,
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "acervo",
        label: "Acervo",
        title: "Mapa da coleção",
        eyebrow: "Curadoria física",
        summary: "Ambiente visual de curadoria física para consultar, localizar e conferir caixas, armários, prateleiras e espaços da coleção do Herbário Evaldo Buttura.",
        bodyHtml: `
            <p>O mapa reproduz a organização física da coleção e permite navegar pelos armários A1 a A8, prateleiras, espaços e caixas, mantendo a leitura visual próxima da disposição real do acervo.</p>
            <p>A busca localiza caixas por número, família, gênero, conteúdo ou posição física. Quando a base <a href="https://ipt.jbrj.gov.br/jabot/resource?r=hevb" target="_blank" rel="noopener noreferrer"><strong>DwC-A</strong></a> do EVB é carregada, a ferramenta também pode buscar por número de tombo ou nome científico, recuperar dados do exemplar e estimar a caixa mais provável com base na família e nos intervalos alfabéticos dos pacotes.</p>
            <p>Os dados do mapa podem ser atualizados a partir da planilha publicada no Google Sheets, preservando uma cópia local para consulta quando a atualização online não estiver disponível.</p>
        `,
        utility: "collectionMap",
        collectionMap: {
            googleSheetId: "1Q61RoCbEy3MUB9pwqdvGXID11X0vcPuhpRpvF59QvlQ",
            sheets: ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
            searchLabel: "Buscar no acervo",
            searchPlaceholder: "Caixa, família, gênero, conteúdo ou localização...",
            statusLabel: "Status",
            allStatus: "Todos",
            occupiedStatus: "Ocupados",
            freeStatus: "Livres",
            sourceLabel: "Fonte",
            boxesLabel: "Caixas",
            spacesLabel: "Espaços",
            occupiedLabel: "Ocupados",
            freeLabel: "Livres",
            detailTitle: "Detalhes do espaço",
            emptyDetail: "Selecione uma caixa ou espaço no mapa para ver os detalhes.",
            noResults: "Nenhum espaço encontrado para os filtros aplicados.",
            refreshLabel: "Atualizar mapa",
            externalSearchLabel: "Buscar registro",
            externalEmptyQuery: "Digite um número de tombo ou nome antes de buscar na base.",
            externalLoading: "Buscando registro na base do herbário...",
            externalNoResults: "Nenhum registro foi encontrado na base do herbário para esta busca.",
            externalError: "Não foi possível consultar a base do herbário agora. A busca local continua disponível.",
            dwcaDownloadUrl: "https://ipt.jbrj.gov.br/jabot/archive.do?r=hevb",
            dwcaDownloadLabel: "Baixar base JABOT/HEVB",
            dwcaLoadLabel: "Carregar base DwC-A",
            dwcaEmptyStatus: "Base taxonômica opcional não carregada. Carregue a base DwC-A para estimar caixas por família e intervalo alfabético.",
            dwcaLoadedStatus: "Base taxonômica EVB carregada para refinar buscas por família e gênero.",
            dwcaLoading: "Lendo base DwC-A do EVB...",
            dwcaError: "Não foi possível ler a base DwC-A. Confira se o arquivo carregado é o ZIP baixado do IPT/JABOT HEVB.",
            dwcaZipError: "Não foi possível ler ZIP neste ambiente. Verifique a conexão para carregar a biblioteca JSZip.",
            loadingStatus: "Carregando dados do Google Sheets...",
            liveStatus: "Dados atualizados a partir do Google Sheets.",
            fallbackStatus: "Usando cópia local do mapa. Confira se a planilha está publicada para leitura.",
            errorStatus: "Não foi possível atualizar pelo Google Sheets agora. A cópia local continua disponível."
        },
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "tombos",
        label: "Tombos",
        title: "Organizador de tombos",
        eyebrow: "Consulta em lote",
        summary: "Cole números de tombo em qualquer formato e gere uma sequencia em ordem crescente, separada por virgula e espaco.",
        body: [
            "Use este utilitario para preparar buscas em lote no JABOT, speciesLink ou planilhas temporarias de conferência.",
            "A ferramenta extrai apenas números, remove repeticoes e devolve a lista pronta para copiar."
        ],
        utility: "tombSorter",
        tombSorter: {
            inputLabel: "Números de entrada",
            inputHint: "Cole aqui a lista de tombos, mesmo que estej? com quebras de linha, virgulas, ponto e virgula, colchetes ou texto misturado.",
            outputLabel: "Resultado ordenado",
            outputHint: "A saida fica pronta para copiar e usar em buscas por lote.",
            sortLabel: "Ordenar tombos",
            copyLabel: "Copiar resultado",
            clearLabel: "Limpar",
            emptyStatus: "Cole os números para iniciar.",
            readyStatus: "{count} número(s) organizado(s). {duplicatas} repetido(s) removido(s).",
            copiedStatus: "Resultado copiado para a área de transferencia.",
            copyErrorStatus: "Não foi possível copiar automaticamente. Selecione o resultado e copie manualmente."
        },
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "coordenadas",
        label: "Coordenadas",
        title: "Conversor de coordenadas",
        eyebrow: "Utilitário rápido",
        summary: "Converta coordenadas entre graus decimais e graus, minutos e segundos, individualmente ou em lote.",
        body: [
            "Use este utilitário para converter coordenadas rapidamente sem abrir o EVB GeoCheck.",
            "O histórico da sessão gera uma tabela com latitude, longitude e os campos lat_grau, lat_min, lat_seg, ns, long_grau, long_min, long_seg e ew, pronta para copiar."
        ],
        utility: "coordinateConverter",
        coordinateConverter: {
            singleTitle: "Conversor individual",
            batchTitle: "Conversão em lote",
            historyTitle: "Histórico da sessão",
            latitudeDecimalLabel: "Latitude decimal",
            longitudeDecimalLabel: "Longitude decimal",
            latitudeDmsLabel: "Latitude GMS",
            longitudeDmsLabel: "Longitude GMS",
            decimalToDmsLabel: "Decimal para GMS",
            dmsToDecimalLabel: "GMS para decimal",
            copySingleLabel: "Copiar",
            convertBatchLabel: "Converter lote",
            copyBatchLabel: "Copiar tabela",
            copyHistoryLabel: "Copiar histórico",
            clearHistoryLabel: "Limpar",
            batchHint: "Cole uma coordenada por linha. Pode ser decimal separado por vírgula/ponto e vírgula ou GMS com hemisfério.",
            emptyStatus: "Informe uma coordenada para iniciar."
        },
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    },
    {
        id: "ajuda",
        label: "Ajuda",
        title: "Ajuda das ferramentas",
        eyebrow: "Fluxo de trabalho",
        summary: "Guia rápido para entender a ordem recomendada de uso, arquivos esperados, exemplos disponíveis e erros comuns de cada ferramenta.",
        body: [
            "Esta aba organiza o uso das ferramentas do Portal EVB como um fluxo de etapas. Os arquivos de exemplo ficam na pasta exemplos/ e podem ser substituídos por modelos reais quando você separar os materiais.",
            "Para baixar um arquivo modelo (indisponíveis no momento, ainda em processo), use os botões indicados em cada ferramenta."
        ],
        help: toolHelp,
        image: "",
        imageAlt: "",
        actionLabel: "",
        actionUrl: ""
    }
];

// ============================================================
// VERSOES EM OUTROS IDIOMAS
// ============================================================
// O portugues acima continua sendo a base principal do site.
// Para adicionar espanhol futuramente, copie o bloco "en", troque a chave
// para "es" e preencha as traducoes correspondentes.
const localized = {
    en: {
        tools: [
            {
                id: "jabot-extract",
                category: "Barcodes",
                description: "Crops, reads and organizes individual barcodes exported by JABOT in standardized A4 PDF files.",
                accepts: "A4 PDFs generated by JABOT with 44 barcodes per page, arranged in 4 columns and 11 rows.",
                output: "A .zip file with cropped .png images automatically named from the EVB specimen barcode.",
                status: "Stable",
                exampleLabel: "Sample PDF"
            },
            {
                id: "evb-labels",
                category: "Labels",
                description: "Generates complementary labels for donated material by combining spreadsheet data with JABOT barcode images.",
                accepts: ".xls or .xlsx batch spreadsheet and .png barcode images generated by JABOT Extract.",
                output: "PDF with labels ready for checking, printing, cutting and attaching to specimens.",
                status: "Stable",
                exampleLabel: "Sample spreadsheet"
            },
            {
                id: "evb-labels-collection",
                category: "Labels",
                description: "Generates labels for collection boxes, supporting the physical organization of cabinets, shelves and specimen packets.",
                accepts: ".xls, .xlsx or .csv collection map with boxes, families and stored intervals.",
                output: "PDF with selected box labels, ready for printing and replacing old labels.",
                status: "Stable",
                exampleLabel: "Sample spreadsheet"
            },
            {
                id: "analise-botanica",
                name: "EVB DataCheck",
                category: "Analysis",
                description: "Generates descriptive statistics, charts, maps, floristic lists and auxiliary comparisons from botânical spreadsheets.",
                accepts: "JABOT-format spreadsheets or user datasets organized with botânical, taxonomic, geographic and curatorial fields.",
                output: "Analytical panel with statistics, completeness, family lists, maps, charts and a standardized text report.",
                status: "Stable",
                exampleLabel: "Sample spreadsheet"
            },
            {
                id: "mapa-coordenadas",
                name: "EVB GeoCheck",
                category: "Georeferencing",
                description: "Plots coordinates on an interactive map, checks spatial data quality, summarizes geographic information and converts coordinates between decimal and DMS.",
                accepts: ".xls, .xlsx or .csv spreadsheets with decimal coordinates or DMS fields.",
                output: "Interactive map, copy-ready table, visible point list, filters, search, dynamic legend, spatial report and coordinate conversións.",
                status: "Stable",
                exampleLabel: "Sample spreadsheet"
            },
            {
                id: "evb-revisao",
                name: "EVB Revisão",
                category: "Review",
                description: "Reviews botânical spreadsheets before incorporation, highlighting alerts, applying safe corrections and detecting probable duplicatas.",
                accepts: ".xls, .xlsx or .csv spreadsheets in JABOT, converted speciesLink or similar EVB-style formats.",
                output: "Reviewed spreadsheet with the same original column structure, visual alerts and highlighted safe corrections.",
                status: "Experimental",
                exampleLabel: "Sample spreadsheet"
            },
            {
                id: "specieslink-jabot",
                name: "SpeciesLink to JABOT",
                category: "Conversión",
                description: "Converts Excel spreadsheets exported from speciesLink in Darwin Core format into the standard JABOT model.",
                accepts: ".xlsx spreadsheets exported from speciesLink, especially for donated material from other herbaria.",
                output: "JABOT-format spreadsheet with collectors, determiners, authors, coordinates and main fields organized.",
                status: "Stable",
                exampleLabel: "speciesLink spreadsheet"
            },
            {
                id: "evb-darwincore",
                name: "EVB DarwinCore",
                category: "Standardization",
                description: "Converts authorial or JABOT-format spreadsheets into a flora-oriented Darwin Core structure with preserved verbatim fields.",
                accepts: ".xls, .xlsx or .csv spreadsheets with botânical, taxonomic, geographic and curatorial data.",
                output: "Darwin Core spreadsheet with preview, mapping sheet, auxiliary report and export in .xlsx or .csv.",
                status: "Stable",
                exampleLabel: "Sample spreadsheet"
            }
        ],
        toolHelp: {
            flow: [
                { step: "1", title: "Extract barcodes", tool: "JABOT Extract", text: "Export the A4 barcode PDF from JABOT and use the tool to crop, read and name each image automatically." },
                { step: "2", title: "Generat? labels", tool: "EVB Labels", text: "Use the batch spreadsheet together with the .png images from the previous step to creat? complementary incorporation labels." },
                { step: "3", title: "Update boxes", tool: "EVB Labels Collection", text: "Update the collection map spreadsheet and generat? only the box labels that need replacement." },
                { step: "4", title: "Analyze data", tool: "EVB DataCheck", text: "Load a JABOT-format spreadsheet to produce statistics, charts, maps, floristic lists and an interpretive report." },
                { step: "5", title: "Review spreadsheet", tool: "EVB Revisão", text: "Apply safe corrections, review scientific names, standardize text fields and detect probable duplicatas before final incorporation." },
                { step: "6", title: "Check coordinates", tool: "EVB GeoCheck", text: "Plot records, review spatial completeness, filter points and convert coordinates in decimal or DMS format." },
                { step: "7", title: "Convert speciesLink", tool: "SpeciesLink to JABOT", text: "Convert Darwin Core spreadsheets exported from speciesLink into the JABOT format before checking and incorporation." },
                { step: "8", title: "Standardize Darwin Core", tool: "EVB DarwinCore", text: "Convert authorial or JABOT spreadsheets into a Darwin Core structure with preserved verbatim fields, local validation and export sheets." }
            ],
            tools: [
                {
                    toolId: "jabot-extract",
                    expectedInput: "A4 PDF exported by JABOT with barcodes in fixed positions, usually 44 codes per page in 4 columns and 11 rows.",
                    steps: ["Open JABOT Extract.", "Load the standardized PDF generated by JABOT.", "Wait for the automatic cropping of the expected page positions.", "Check whether codes were read and named in the EVB001234 format.", "Download the .zip file with cropped .png images."],
                    commonErrors: ["PDF outside the expected 44-code layout.", "Incomplete page generating blank crops that can later be deleted.", "Barcode not identified for automatic file naming.", "Mixing barcode images from different batches."],
                    exampleLabel: "Download sample PDF"
                },
                {
                    toolId: "evb-labels",
                    expectedInput: ".xls or .xlsx batch spreadsheet and corresponding .png barcode images previously cropped by JABOT Extract.",
                    steps: ["First generat? and unzip the cropped barcodes in JABOT Extract.", "Open EVB Labels.", "Select the .png barcode images for the batch.", "Load the corresponding specimen spreadsheet.", "Review the preview and check labels without barcodes as possible mismatches.", "Download the final PDF for printing, cutting and attaching."],
                    commonErrors: ["Barcode missing for a specimen listed in the spreadsheet.", "Images from another batch loaded with the current spreadsheet.", "Spreadsheet columns with names different from the expected model.", "Print settings cutting margins or scaling the PDF incorrectly."],
                    exampleLabel: "Download sample spreadsheet"
                },
                {
                    toolId: "evb-labels-collection",
                    expectedInput: "Collection map in .xls, .xlsx or .csv format, containing the box identifier, families and stored packets or specimen intervals.",
                    steps: ["Update the collection map whenever the physical organization changes.", "Open EVB Labels Collection.", "Load the updated spreadsheet.", "Enter a specific box, a list of boxes or the label interval to generat?.", "Download the final PDF.", "Print, cut and replace the old box labels."],
                    commonErrors: ["Collection map not matching the current physical organization.", "Incorrect specific box or box interval.", "Missing cabinet, shelf, box or packet fields.", "Generating all labels when only a punctual update is needed."],
                    exampleLabel: "Download sample spreadsheet"
                },
                {
                    toolId: "analise-botanica",
                    expectedInput: "JABOT-format spreadsheet, or a user dataset organized in that basic model, with botânical, taxonomic, geographic, temporal and curatorial fields.",
                    steps: ["Open EVB DataCheck.", "Load the data spreadsheet.", "Check recognized fields and data completeness.", "Load auxiliary databases when taxonomic validation, origin, endemism, invasives or conservation status are needed.", "Explore statistics, charts, maps, family lists and reports.", "Review results critically before technical or scientific use."],
                    commonErrors: ["Missing taxonomic, geographic or curatorial columns.", "Inconsistent family, genus or species names.", "Incomplete coordinates, dates or determiners reducing data completeness.", "Using the automatic report without technical review."],
                    exampleLabel: "Download sample spreadsheet"
                },
                {
                    toolId: "mapa-coordenadas",
                    expectedInput: ".xls, .xlsx or .csv spreadsheet with decimal coordinates or JABOT DMS fields.",
                    steps: ["Open EVB GeoCheck.", "Load the JABOT spreadsheet or another spreadsheet with recognizable coordinates.", "Check points, filters, search and spatial completeness on the map.", "Review the table below the map and copy it when data need external review.", "Use the individual or batch converter when coordinates need standardization."],
                    commonErrors: ["Using municipality-level coordinates instead of real collection coordinates.", "Spreadsheet without latitude/longitude fields or incomplete DMS fields.", "Latitude and longitude inverted.", "Coordinates without hemisphere information when using DMS fields."],
                    exampleLabel: "Download sample spreadsheet"
                },
                {
                    toolId: "specieslink-jabot",
                    expectedInput: ".xlsx spreadsheet exported from speciesLink in Darwin Core format, preferably with all available fields.",
                    steps: ["Search and filter the target records in speciesLink.", "Export the Excel spreadsheet for the batch.", "Open SpeciesLink to JABOT.", "Enter the project name and output file name.", "Load the exported spreadsheet.", "Check alerts, coordinates, collectors, determiners, habitat and locality.", "Download the JABOT-format spreadsheet and review each specimen."],
                    commonErrors: ["Required fields missing or exported in unexpected columns.", "Municipality-level coordinates confused with original label coordinates.", "Incomplete locality, habitat, additional collectors or determiner information.", "Importing converted data without comparison with original labels."],
                    exampleLabel: "Download speciesLink spreadsheet"
                },
                {
                    toolId: "evb-darwincore",
                    expectedInput: "Authorial spreadsheets, JABOT spreadsheets or partially Darwin Core-like sheets with botânical, taxonomic, geographic and curatorial data.",
                    steps: ["Open EVB DarwinCore.", "Load the .xls, .xlsx or .csv spreadsheet to standardize.", "Choose the automatic, JABOT, authorial or partial Darwin Core reading profile.", "Fill in the main dataset metadata such as datasetName, institutionCode, collectionCode, basisOfRecord, license and rightsHolder.", "Run the conversión to generat? a Darwin Core sheet with preserved verbatim fields.", "Review preview, local warnings and the mapping sheet before exporting the final file."],
                    commonErrors: ["Missing scientificName or a name built only partially from genus and epithet.", "Missing, invalid or unexpectedly placed coordinates.", "Geographic fields too incomplete to safely populate country, stateProvince, county and locality.", "Authorial spreadsheets with highly idiosyncratic column names requiring manual review after conversión."],
                    exampleLabel: "Use your own spreadsheet"
                }
            ]
        },
        photoGallery: [
            { src: "img/fotos/F2.jpg", alt: "Herbarium room", caption: "Fruit of <em>Cedrela fissilis</em>, symbol of the Herbarium" },
            { src: "img/fotos/F3.jpg", alt: "Herbarium room", caption: "Specimen mounting and sewing process" },
            { src: "img/fotos/F4.jpg", alt: "Herbarium room" },
            { src: "img/fotos/F5.jpg", alt: "Herbarium room", caption: "Herbarium team on Any Valentina's last internship day" },
            { src: "img/fotos/F8.jpg", alt: "Herbarium room", caption: "Sonia Marcela digitizing herbarium specimens" }
        ],
        teamMembers: [
            { name: "Laura Cristina Pires Lima", role: "Herbarium Curator", group: "Curatorship" },
            { name: "Giovana Secretti Vendruscolo", role: "Deputy Curator", group: "Curatorship" },
            { name: "Marlon Royer de Morais", role: "Biologist and technical fellow of the herbarium", group: "Fellows" },
            { name: "Aline Barbosa", role: "Undergraduat? fellow at EVB", group: "Fellows" },
            { name: "Sonia Marcela", role: "Former undergraduat? fellow at EVB", group: "Fellows" }
        ],
        repositoryItems: [
            {
                title: "Tree Species from a Seasonal Semideciduous Forest Fragment in Western Parana: Floristic Survey and Dendrological Identification Key",
                author: "Izabele Oliveira Munaro",
                type: "Undergraduat? thesis",
                year: "2022"
            }
        ],
        serviceItems: [
            {
                title: "Good practices guide",
                description: "Reserved space for general guidance for new team members, interns, undergraduat? research students and collaborators beginning work at the herbarium.",
                status: "In preparation"
            },
            {
                title: "Herborization processes",
                description: "Reserved space to describe the future steps of collecting, pressing, drying, mounting, sewing, labeling, photographing and storing botânical material.",
                status: "In preparation"
            },
            {
                title: "Material incorporation",
                description: "Initial guidance for undergraduat? thesis students, research students and EVB-linked projects on how to organize collection data and prepare material for incorporation into the collection.",
                status: "Templat? soon",
                actionLabel: "Download spreadsheet template",
                actionUrl: "exemplos/modelo-incorporacao-evb.xlsx"
            },
            {
                title: "Collection use and consultation",
                description: "Reserved space for internal rules on conservation, specimen handling, physical and digital collection consultation, use records and staff supervision.",
                status: "Supervised use"
            },
            {
                title: "Internal routines",
                description: "Reserved space for procedures related to organization, digitization, data checking, duplicate handling, freezer use, cabinets and other curatorial routines.",
                status: "EVB / UNILA"
            }
        ],
        orientationGuides: [
            {
                id: "boas-praticas",
                title: "Good practices guide",
                status: "In preparation",
                summary: "Entry point for new team members, interns, undergraduat? research students and collaborators.",
                sections: [
                    {
                        title: "Introduction to the space",
                        body: [
                            "Reserved space to present the general organization of the herbarium, work áreas, responsible team and first guidance for people beginning activities at EVB.",
                            "When the final guide is written, this chapter may include photos of the room, cabinets, sorting área and circulation spaces."
                        ],
                        items: ["Who to contact when arriving at the herbarium.", "Which áreas can be accessed freely.", "Which activities require team supervision."]
                    },
                    {
                        title: "Conduct and safety",
                        body: ["Reserved space for guidance on responsible use of the collection, care with equipment, bench organization, biosafety and good practices during laboratory and curatorial routines."],
                        items: ["Keep benches clean and materials identified.", "Avoid handling specimens without prior guidance.", "Report questions, problems or damage observed."]
                    },
                    {
                        title: "Work routine",
                        body: ["Reserved space to explain how activities are distributed, how to record completed tasks and how to follow pending work related to the collection, digitization, organization and research support."],
                        items: ["Record completed activities.", "Report pending tasks to the person responsible for the routine.", "Separat? materials that require review."]
                    }
                ]
            },
            {
                id: "herborizacao",
                title: "Herborization processes",
                status: "In preparation",
                summary: "Steps for collection, pressing, drying, mounting, labeling and storage of botânical material.",
                sections: [
                    {
                        title: "Collection and field records",
                        body: ["Reserved space to describe how to record field information, collect fertile material, photograph the living plant and organize essential data such as locality, coordinates, habitat, habit, collector and collection number."],
                        items: ["Record data at the time of collection.", "Prioritize fertile material whenever possible.", "Photograph vegetative details, flowers, fruits and environment."]
                    },
                    {
                        title: "Pressing and newspaper changes",
                        body: ["Reserved space to guide press assembly, material positioning, newspaper changes, preservation of important structures and care to avoid fungi, loss of parts or deformation."],
                        items: ["Arrange leaves, flowers and fruits so they remain visible.", "Change newspapers according to material humidity.", "Keep provisional identification with the specimen."]
                    },
                    {
                        title: "Drying, mounting and label",
                        body: ["Reserved space to describe drying, specimen mounting, attachment of loose parts, label printing and minimum criteria before incorporation into the collection."],
                        items: ["Check whether material is dry before mounting.", "Ensure that the label matches the specimen.", "Separat? incomplete material for review."]
                    }
                ]
            },
            {
                id: "incorporacao",
                title: "Material incorporation",
                status: "Templat? available",
                summary: "Guidance for students and EVB-linked projects to organize data and materials for the collection.",
                actionLabel: "Download spreadsheet template",
                actionUrl: "exemplos/modelo-incorporacao-evb.xlsx",
                sections: [
                    {
                        title: "Data organization",
                        body: ["Reserved space to guide completion of the template spreadsheet, with attention to collection data, taxonomic identification, locality, coordinates, linked project and responsible person."],
                        items: ["Keep the template column names.", "Fill coordinates in decimal degrees whenever possible.", "Review scientific name spelling before delivery."]
                    },
                    {
                        title: "Material check",
                        body: ["Reserved space to explain how to check whether the material is dry, identified, properly stored, accompanied by complete data and ready for team evaluation."],
                        items: ["Separat? duplicatas when available.", "Keep collection number and collector linked to the specimen.", "Indicat? materials with identification doubts."]
                    },
                    {
                        title: "Delivery and team review",
                        body: ["Reserved space to describe the delivery flow, review, correction of pending issues, label generation and final incorporation into the physical and digital collection."],
                        items: ["Send the completed spreadsheet together with the material.", "Wait for data checking by the team.", "Correct pending issues before final incorporation."]
                    }
                ]
            }
        ],
        instagramInfo: {
            qrCodeAlt: "QR Code to access the Herbário Evaldo Buttura Instagram profile",
            callout: "Follow Herbário Evaldo Buttura on Instagram for behind-the-scenes views of the collection, outreach activities, science communication, events and everyday records of the herbarium.",
            posts: [
                { title: "Behind the scenes", text: "Records of curation, organization, digitization and conservation routines in the botânical collection.", tag: "EVB routine" },
                { title: "Environmental education", text: "News about actions, visits, workshops and outreach activities carried out by the herbarium.", tag: "Outreach" },
                { title: "Regional flora", text: "Posts about plants, biodiversity, conservation and research related to the flora of western Parana.", tag: "Science communication" }
            ]
        },
        infoPages: [
            {
                id: "quem-somos",
                label: "Home",
                title: "Herbário Evaldo Buttura",
                eyebrow: "Herbário Evaldo Buttura",
                summary: "UNILA botânical collection dedicated to regional flora, technical and scientific training, and the dissemination of biodiversity knowledge.",
                bodyHtml: `
                    <p>The Herbário Evaldo Buttura (<strong>EVB</strong>) of the Federal University for Latin American Integration (UNILA) is located in Foz do Iguaçu, in the westernmost region of Paraná, Brazil. The acronym <strong>EVB</strong> honors agronomist <strong>Evaldo Buttura</strong>, who carried out floristic surveys in the region from Foz do Iguaçu to Guaíra more than 40 years ago. His botânical work remains an important reference for the regional flora. The herbarium began its activities in <strong>2015</strong> with the donation and restoration of Buttura's botânical collection, composed of just over 1,200 dried plant samples collected mainly between the 1970s and 1980s in the Foz do Iguaçu microregion and part of Paraguay.</p>
                    <p>The <strong>EVB</strong> herbarium works with collection and exchange of plant material from western Paraná, with emphasis on Iguaçu National Park, non-conventional food plants (PANC) and urban flora. It also promotes technical and scientific training through supervised internships, undergraduat? research opportunities, master's dissertation supervision and undergraduat? final projects.</p>
                    <p>In addition to maintaining a reference botânical collection for the regional flora and contributing to technical and academic training, the <strong>EVB</strong> herbarium plays an important role in disseminating knowledge about biodiversity and plant conservation. It develops environmental education and science communication activities for the external community, including actions in fairs, schools and public spaces. In this way, the herbarium works across teaching, research and university outreach.</p>
                    <p>The herbarium has migrated its data management from Brahms to Jabot. The collection currently includes about <strong>8,000</strong> digitized specimens, most of them with images available online through Herbário Virtual Reflora, Jabot, <em>speciesLink</em>, INCT - Herbário Virtual Reflora, GBIF and SIBBr.</p>
                    <p>Since 2015, the herbarium has been part of the Brazilian Herbarium Network of the Brazilian Botânical Society. In 2020, it was registered in the <em>Index Herbáriorum</em>, becoming internationally recognized among the world's herbaria.</p>
                `
            },
            {
                id: "onde-estamos",
                label: "Location",
                title: "Location",
                eyebrow: "Location",
                summary: "EVB is located at Itaipu Technological Park, in Foz do Iguaçu, Paraná, Brazil.",
                body: [
                    "Address: Edifício das Águas, Laboratórios Multiusuários Engenheira Enedina Alves Marques, Itaipu Technological Park, Block 04, Space 02, Rooms 10, 11 and 12.",
                    "Herbarium e-mail: herbarioevaldobuttura@gmail.com."
                ]
            },
            {
                id: "equipe",
                label: "Team",
                title: "Team",
                eyebrow: "EVB team",
                summary: "Team linked to curatorship, management, technical support, research and outreach activities at EVB.",
                body: [
                    "The Herbário Evaldo Buttura (EVB) team includes the curator, deputy curator, technical fellows, undergraduat? fellows and interns, mainly linked to the Biological Sciences program. Team members work collaboratively in scientific curation, collection maintenance and organization, database management and digitization, donation handling, and support for research, teaching and outreach activities developed by the herbarium."
                ]
            },
            {
                id: "instagram",
                label: "Instagram",
                title: "Our Instagram profile",
                eyebrow: "Social media",
                summary: "Follow news, activities, events and behind-the-scenes content from Herbário Evaldo Buttura.",
                body: [
                    "EVB's Instagram brings together records of herbarium routines, environmental education actions, science communication, research activities and moments of interaction with the community.",
                    "This section can also highlight posts and important events without depending on the Instagram API, keeping the page lightweight and stable."
                ]
            },
            {
                id: "servicos",
                label: "Guidelines",
                title: "Guidelines and procedures",
                eyebrow: "Internal information",
                summary: "Space for guides, procedures and support materials for people beginning work at Herbário Evaldo Buttura.",
                body: [
                    "This section does not represent an external service offer. It is intended as an entry point for students, interns, fellows and collaborators who need to understand the herbarium's basic routines.",
                    "The blocks below are prepared spaces for a good practices guide, herborization processes, material incorporation guidelines and other internal procedures."
                ]
            },
            {
                id: "acervo",
                label: "Collection",
                title: "Collection map",
                eyebrow: "Physical curation",
                summary: "Physical curation environment for consulting, locating and checking boxes, cabinets, shelves and spaces in the Herbário Evaldo Buttura collection.",
                body: [
                    "The map reproduces the physical organization of the collection and lets users navigate cabinets A1 to A8, shelves, spaces and boxes while keeping the visual reading close to the real layout of the collection.",
                    "The search finds boxes by number, family, genus, content or physical position. When the EVB DwC-A base is loaded, the tool can also search by accession number or scientific name, recover specimen data and estimate the most likely box using the family and alphabetical package intervals.",
                    "Map data can be refreshed from the published Google Sheets inventory, while a local copy remains available when the online update cannot be reached."
                ],
                collectionMap: {
                    searchLabel: "Search collection",
                    searchPlaceholder: "Box, family, genus, content or location...",
                    statusLabel: "Status",
                    allStatus: "All",
                    occupiedStatus: "Occupied",
                    freeStatus: "Free",
                    sourceLabel: "Source",
                    boxesLabel: "Boxes",
                    spacesLabel: "Spaces",
                    occupiedLabel: "Occupied",
                    freeLabel: "Free",
                    detailTitle: "Space details",
                    emptyDetail: "Select a box or space on the map to view details.",
                    noResults: "No spaces found for the selected filters.",
                    refreshLabel: "Refresh map",
                    externalSearchLabel: "Search record",
                    externalEmptyQuery: "Enter a catalog number or name before searching the database.",
                    externalLoading: "Searching herbarium database...",
                    externalNoResults: "No herbarium record was found for this search.",
                    externalError: "The herbarium database could not be queried now. Local search remains available.",
                    dwcaDownloadUrl: "https://ipt.jbrj.gov.br/jabot/archive.do?r=hevb",
                    dwcaDownloadLabel: "Download JABOT/HEVB base",
                    dwcaLoadLabel: "Load DwC-A base",
                    dwcaEmptyStatus: "Optional taxonomic base not loaded. Load the DwC-A base to estimate boxes by family and alphabetical range.",
                    dwcaLoadedStatus: "EVB taxonomic base loaded to refine searches by family and genus.",
                    dwcaLoading: "Reading EVB DwC-A base...",
                    dwcaError: "Could not read the DwC-A base. Check whether the loaded file is the ZIP downloaded from IPT/JABOT HEVB.",
                    dwcaZipError: "Could not read ZIP in this environment. Check the connection to load the JSZip library.",
                    loadingStatus: "Loading data from Google Sheets...",
                    liveStatus: "Data updated from Google Sheets.",
                    fallbackStatus: "Using the local map copy. Check whether the spreadsheet is published for reading.",
                    errorStatus: "Could not update from Google Sheets now. The local copy remains available."
                }
            },
            {
                id: "tombos",
                label: "Catalog numbers",
                title: "Catalog number organizer",
                eyebrow: "Batch search",
                summary: "Paste catalog numbers in any format and generat? an ascending list separated by comma and space.",
                body: [
                    "Use this utility to prepare batch searches in JABOT, speciesLink or temporary checking spreadsheets.",
                    "The tool extracts numbers only, removes repeated values and returns a list ready to copy."
                ],
                tombSorter: {
                    inputLabel: "Input numbers",
                    inputHint: "Paste the catalog numbers here, even if they use line breaks, commas, semicolons, brackets or mixed text.",
                    outputLabel: "Sorted result",
                    outputHint: "The output is ready to copy and use in batch searches.",
                    sortLabel: "Sort numbers",
                    copyLabel: "Copy result",
                    clearLabel: "Clear",
                    emptyStatus: "Paste numbers to begin.",
                    readyStatus: "{count} number(s) organized. {duplicatas} duplicate(s) removed.",
                    copiedStatus: "Result copied to the clipboard.",
                    copyErrorStatus: "Could not copy automatically. Select the result and copy it manually."
                }
            },
            {
                id: "coordenadas",
                label: "Coordinates",
                title: "Coordinate converter",
                eyebrow: "Quick utility",
                summary: "Convert coordinates between decimal degrees and degrees, minutes and seconds, individually or in batch.",
                body: [
                    "Use this utility to convert coordinates quickly without opening EVB GeoCheck.",
                    "The session history generates a table with latitude, longitude and the JABOT coordinate fields, ready to copy."
                ],
                coordinateConverter: {
                    singleTitle: "Single converter",
                    batchTitle: "Batch conversion",
                    historyTitle: "Session history",
                    latitudeDecimalLabel: "Decimal latitude",
                    longitudeDecimalLabel: "Decimal longitude",
                    latitudeDmsLabel: "DMS latitude",
                    longitudeDmsLabel: "DMS longitude",
                    decimalToDmsLabel: "Decimal to DMS",
                    dmsToDecimalLabel: "DMS to decimal",
                    copySingleLabel: "Copy",
                    convertBatchLabel: "Convert batch",
                    copyBatchLabel: "Copy table",
                    copyHistoryLabel: "Copy history",
                    clearHistoryLabel: "Clear",
                    batchHint: "Paste one coordinate per line. It can be decimal separated by comma/semicolon or DMS with hemisphere.",
                    emptyStatus: "Enter a coordinate to begin."
                }
            },
            {
                id: "ajuda",
                label: "Help",
                title: "Tool help",
                eyebrow: "Workflow",
                summary: "Quick guide to the recommended order of use, expected files, available examples and common errors for each tool.",
                body: [
                    "This tab organizes the EVB Portal tools as a workflow. Example files are stored in the exemplos/ folder and can be replaced by real models when available.",
                    "To download a model file, use the buttons shown for each tool."
                ]
            },
            {
                id: "taxonline",
                label: "Taxonline",
                title: "Taxonline",
                eyebrow: "External reference",
                summary: "External page with institutional information about Herbário Evaldo Buttura on the Taxonline network.",
                body: [
                    "EVB's Taxonline page provides history, location information, curatorship, team details, publications and herbarium-related links.",
                    "Use this tab as a bridge to external consultation and as a reference to keep institutional data in the portal up to date."
                ],
                actionLabel: "Open Taxonline"
            },
            {
                id: "repositorio",
                label: "Repository",
                title: "Repository",
                eyebrow: "Academic production",
                summary: "Works, publications and materials produced by members linked to Herbário Evaldo Buttura.",
                body: [
                    "This section gathers works published by team members and herbarium collaborators. To add new records, edit the repositoryItems list in data/site-data.js."
                ]
            }
        ]
    },
    es: {
        tools: [
            {
                id: "jabot-extract",
                category: "Códigos de barras",
                description: "Recorta, lee y organiza individualmente los códigos de barras exportados por JABOT en PDFs A4 estandarizados.",
                accepts: "PDFs A4 generados por JABOT con 44 códigos por página, organizados en 4 columnas y 11 filas.",
                output: "Archivo .zip con imagenes .png recortadas y nombradas automaticamente a partir del código EVB del ejemplar.",
                status: "Estable",
                exampleLabel: "PDF de ejemplo"
            },
            {
                id: "evb-labels",
                category: "Etiquetas",
                description: "Genera etiquetas complementarias para materiales recibidos por donacion, combinando datos de la planilla con códigos de barras de JABOT.",
                accepts: "Planilla .xls o .xlsx del lote e imagenes .png de códigos de barras generadas por JABOT Extract.",
                output: "PDF con etiquetas listas para revision, impresion, corte y fijacion en las exsicatas.",
                status: "Estable",
                exampleLabel: "Planilla de ejemplo"
            },
            {
                id: "evb-labels-collection",
                category: "Etiquetas",
                description: "Genera etiquetas para cajas de la colección, apoyando la organización física de armários, estantes y paquetes de exsicatas.",
                accepts: "Planilla-mapa de la colección en .xls, .xlsx o .csv, con cajas, famílias e intervalos almacenados.",
                output: "PDF con las etiquetas de cajas seleccionadas, listo para impresion y sustitucion de etiquetas antiguas.",
                status: "Estable",
                exampleLabel: "Planilla de ejemplo"
            },
            {
                id: "analise-botanica",
                name: "EVB DataCheck",
                category: "Análisis",
                description: "Genera estadisticas descriptivas, gráficos, mapas, listas floristicas y comparaciones auxiliares a partir de planillas botânicas.",
                accepts: "Planillas en el modelo JABOT o datos propios organizados con campos botanicos, taxonomicos, geográficos y curatoriales.",
                output: "Panel analitico con estadisticas, completitud, listas por família, mapas, gráficos e informe textual estandarizado.",
                status: "Estable",
                exampleLabel: "Planilla de ejemplo"
            },
            {
                id: "mapa-coordenadas",
                name: "EVB GeoCheck",
                category: "Georreferenciación",
                description: "Representa coordenadas en un mapa interactivo, permite filtrar y buscar registros, evalua la completitud espacial y convierte coordenadas entre decimal y GMS.",
                accepts: "Planillas .xls, .xlsx o .csv con coordenadas decimales o campos GMS.",
                output: "Mapa interactivo, tabla lista para copiar, lista de puntos visibles, filtros, búsqueda, leyenda dinâmica, informe espacial y conversiónes de coordenadas.",
                status: "Estable",
                exampleLabel: "Planilla de ejemplo"
            },
            {
                id: "evb-revisao",
                name: "EVB Revisión",
                category: "Revisión",
                description: "Revisa planillas botánicas antes de la incorporación, destacando alertas, aplicando correcciones seguras e identificando duplicidades probables.",
                accepts: "Planillas .xls, .xlsx o .csv en el modelo JABOT, speciesLink convertido o formatos autorales similares al estándar EVB.",
                output: "Planilla revisada con la misma estructura original de columnas, alertas visuales y correcciones seguras destacadas.",
                status: "Experimental",
                exampleLabel: "Planilla de ejemplo"
            },
            {
                id: "specieslink-jabot",
                name: "SpeciesLink para JABOT",
                category: "Conversión",
                description: "Convierte planillas Excel exportadas de speciesLink, en formato Darwin Core, al modelo estandar utilizado por JABOT.",
                accepts: "Planillas .xlsx exportadas de speciesLink, especialmente de materiales recibidos por donacion de otros herbários.",
                output: "Planilla reorganizada en el estandar JABOT, con colectores, determinadores, autores, coordenadas y campos principales estructurados.",
                status: "Estable",
                exampleLabel: "Planilla speciesLink"
            },
            {
                id: "evb-darwincore",
                name: "EVB DarwinCore",
                category: "Estandarización",
                description: "Convierte planillas autorales o en el modelo JABOT a una estructura Darwin Core orientada a flora, con preservacion de campos verbatim.",
                accepts: "Planillas .xls, .xlsx o .csv con datos botanicos, taxonomicos, geográficos y curatoriales.",
                output: "Planilla Darwin Core con vista previa, hoja de mapeo, informe auxiliar y exportacion en .xlsx o .csv.",
                status: "Estable",
                exampleLabel: "Planilla de ejemplo"
            }
        ],
        toolHelp: {
            flow: [
                { step: "1", title: "Extraer códigos de barras", tool: "JABOT Extract", text: "Exporte en JABOT el PDF A4 con códigos de barras y use la herramienta para recortar, leer y nombrar cada imagen automaticamente." },
                { step: "2", title: "Generar etiquetas", tool: "EVB Labels", text: "Use la planilla del lote junto con las imagenes .png del paso anterior para crear etiquetas complementarias de incorporacion." },
                { step: "3", title: "Actualizar cajas", tool: "EVB Labels Collection", text: "Actualice la planilla-mapa de la colección y genere solo las etiquetas de cajas que necesitan sustitucion." },
                { step: "4", title: "Analizar datos", tool: "EVB DataCheck", text: "Cargue una planilla en el modelo JABOT para producir estadisticas, gráficos, mapas, listas floristicas e informe interpretativo." },
                { step: "5", title: "Revisar planillas", tool: "EVB Revisión", text: "Revise nombres científicos, campos textuales, fechas, duplicidades probables y correcciones seguras antes de incorporar o analizar los datos." },
                { step: "6", title: "Revisar coordenadas", tool: "EVB GeoCheck", text: "Represente puntos, revise la completitud espacial, filtre registros y convierta coordenadas en formato decimal o GMS." },
                { step: "7", title: "Convertir speciesLink", tool: "SpeciesLink para JABOT", text: "Convierta planillas Darwin Core exportadas de speciesLink al estandar JABOT antes de la revision e incorporacion." },
                { step: "8", title: "Estandarizar Darwin Core", tool: "EVB DarwinCore", text: "Convierta planillas autorales o JABOT a una estructura Darwin Core con campos verbatim preservados, validación local y hojas auxiliares." }
            ],
            tools: [
                {
                    toolId: "jabot-extract",
                    expectedInput: "PDF A4 exportado por JABOT con códigos de barras en posiciones fijas, normalmente 44 códigos por página, en 4 columnas y 11 filas.",
                    steps: ["Abra JABOT Extract.", "Cargue el PDF estandarizado generado por JABOT.", "Espere el recorte automatico de las posiciones previstas.", "Verifique si los códigos fueron leidos y nombrados en el formato EVB001234.", "Descargue el archivo .zip con las imagenes .png recortadas."],
                    commonErrors: ["PDF fuera del estandar de 44 códigos por página.", "Pagina incompleta generando recortes en blanco que pueden eliminarse despues.", "Código no identificado para nombrar el archivo automaticamente.", "Mezclar imagenes de códigos de barras de lotes diferentes."],
                    exampleLabel: "Descargar PDF de ejemplo"
                },
                {
                    toolId: "evb-labels",
                    expectedInput: "Planilla .xls o .xlsx del lote e imagenes .png de códigos de barras correspondientes, previamente recortadas por JABOT Extract.",
                    steps: ["Primero genere y descomprima los códigos recortados en JABOT Extract.", "Abra EVB Labels.", "Seleccione las imagenes .png de códigos de barras del lote.", "Cargue la planilla correspondiente a los ejemplares.", "Revise la vista previa y verifique etiquetas sin código de barras como posibles inconsistencias.", "Descargue el PDF final para imprimir, cortar y fijar."],
                    commonErrors: ["Código de barras ausente para un ejemplar listado en la planilla.", "Imagenes de otro lote cargadas junto con la planilla actual.", "Columnas de la planilla con nombres diferentes del modelo esperado.", "Configuracion de impresion cortando margenes o escalando incorrectamente el PDF."],
                    exampleLabel: "Descargar planilla de ejemplo"
                },
                {
                    toolId: "evb-labels-collection",
                    expectedInput: "Planilla-mapa de la colección en formato .xls, .xlsx o .csv, con identificador de caja, famílias y paquetes o intervalos almacenados.",
                    steps: ["Actualice la planilla-mapa siempre que cambie la organización física de la colección.", "Abra EVB Labels Collection.", "Cargue la planilla actualizada.", "Informe una caja especifica, una lista de cajas o el intervalo de etiquetas que desea generar.", "Descargue el PDF final.", "Imprima, corte y sustituya las etiquetas antiguas de las cajas."],
                    commonErrors: ["Planilla-mapa desactualizada respecto a la organización física real.", "Caj? especifica o intervalo de cajas informado incorrectamente.", "Campos de armário, estante, caja o paquete ausentes.", "Generar todas las etiquetas cuando solo se necesita una actualizacion puntual."],
                    exampleLabel: "Descargar planilla de ejemplo"
                },
                {
                    toolId: "analise-botanica",
                    expectedInput: "Planilla en el modelo JABOT, o datos propios organizados en ese modelo basico, con campos botanicos, taxonomicos, geográficos, temporales y curatoriales.",
                    steps: ["Abro EVB DataCheck.", "Cargue la planilla de datos.", "Verifique los campos reconocidos y la completitud.", "Cargue bases auxiliares cuando necesite validar nombres, origen, endemismo, invasoras o estado de conservacion.", "Explore estadisticas, gráficos, mapas, listas por família e informes.", "Revise criticamente los resultados antes de usos técnicos o científicos."],
                    commonErrors: ["Columnas taxonômicas, geográficas o curatoriales ausentes.", "Nombres de família, gênero o espécie inconsistentes.", "Coordenadas, fechas o determinadores incompletos reduciendo la completitud.", "Usar el informe automatico sin revision técnica."],
                    exampleLabel: "Descargar planilla de ejemplo"
                },
                {
                    toolId: "mapa-coordenadas",
                    expectedInput: "Planilla .xls, .xlsx o .csv con coordenadas decimales o campos GMS del modelo JABOT.",
                    steps: ["Abra EVB GeoCheck.", "Cargue la planilla JABOT u otra planilla con coordenadas reconocibles.", "Revise los puntos, filtros, búsqueda y completitud espacial en el mapa.", "Revise la tabla debajo del mapa y copiela cuando necesite revisar los datos externamente.", "Use el conversor individual o por lote cuando necesite estandarizar coordenadas."],
                    commonErrors: ["Usar coordenadas generales de município en vez de coordenadas reales de colecta.", "Planilla sin campos de latitud/longitud o campos GMS incompletos.", "Latitud y longitud invertidas.", "Coordenadas sin hemisferio cuando se usan campos GMS."],
                    exampleLabel: "Descargar planilla de ejemplo"
                },
                {
                    toolId: "specieslink-jabot",
                    expectedInput: "Planilla Excel .xlsx exportada de speciesLink en formato Darwin Core, preferentemente con todos los campos disponibles.",
                    steps: ["Busque y filtre en speciesLink los registros deseados.", "Exporte la planilla Excel con los datos del lote.", "Abra SpeciesLink para JABOT.", "Informe el nombre del proyecto y del archivo de salida.", "Cargue la planilla exportada.", "Revise alertas, coordenadas, colectores, determinadores, habitat y localidad.", "Descargue la planilla en formato JABOT y revise ejemplar por ejemplar."],
                    commonErrors: ["Campos obligatorios ausentes o exportados en columnas inesperadas.", "Coordenadas generales de município confundidas con coordenadas de la etiqueta original.", "Informacion de localidad, habitat, colectores adicionales o determinadores incompleta.", "Incorporar los datos convertidos sin compararlos con las etiquetas originales."],
                    exampleLabel: "Descargar planilla speciesLink"
                },
                {
                    toolId: "evb-darwincore",
                    expectedInput: "Planillas autorales, planillas en el modelo JABOT o planillas parcialmente alíneadas con Darwin Core, con datos botanicos, taxonomicos, geográficos y curatoriales.",
                    steps: ["Abra EVB DarwinCore.", "Cargue la planilla .xls, .xlsx o .csv que desea estandarizar.", "Elij? el perfil automatico, JABOT, autoral o Darwin Core parcial.", "Complete los metadatos principales del conjunto como datasetName, institutionCode, collectionCode, basisOfRecord, license y rightsHolder.", "Ejecute la conversión para generar la planilla Darwin Core con campos verbatim preservados.", "Revise la vista previa, las alertas locales y la hoja de mapeo antes de exportar el archivo final."],
                    commonErrors: ["scientificName ausente o armado solo parcialmente a partir de genus y epiteto.", "Coordenadas ausentes, invalidas o ubicadas en columnas inesperadas.", "Campos geográficos demasiado incompletos para poblar country, stateProvince, county y locality con seguridad.", "Planillas autorales con nombres de columnas muy particulares que exigen revision manual despues de la conversión."],
                    exampleLabel: "Use su propia planilla"
                }
            ]
        },
        photoGallery: [
            { src: "img/fotos/F2.jpg", alt: "Sala del herbário", caption: "Fruto de <em>Cedrela fissilis</em>, símbolo del Herbário" },
            { src: "img/fotos/F3.jpg", alt: "Sala del herbário", caption: "Proceso de costura de una exsicata" },
            { src: "img/fotos/F4.jpg", alt: "Sala del herbário" },
            { src: "img/fotos/F5.jpg", alt: "Sala del herbário", caption: "Equipo del Herbário en el último día de pasantía de Any Valentina" },
            { src: "img/fotos/F8.jpg", alt: "Sala del herbário", caption: "Sonia Marcela en el proceso de digitalización de exsicatas" }
        ],
        teamMembers: [
            { name: "Laura Cristina Pires Lima", role: "Curadora del herbário", group: "Curaduría" },
            { name: "Giovana Secretti Vendruscolo", role: "Vicecuradora", group: "Curaduría" },
            { name: "Marlon Royer de Morais", role: "Biólogo y becario técnico del herbário", group: "Becarios" },
            { name: "Aline Barbosa", role: "Becaria de grado del EVB", group: "Becarios" },
            { name: "Sonia Marcela", role: "Exbecaria de grado del EVB", group: "Becarios" }
        ],
        repositoryItems: [
            {
                title: "Espécies arbóreas de un fragmento de Bosque Estacional Semidecidual en el oeste de Paraná: relevamiento florístico y clave de identificación dendrológica",
                author: "Izabele Oliveira Munaro",
                type: "Trabajo de conclusión de grado",
                year: "2022"
            }
        ],
        serviceItems: [
            {
                title: "Guía de buenas prácticas",
                description: "Espacio reservado para orientaciones generales destinadas a nuevos integrantes, pasantes, estudiantes de iniciación científica y colaboradores que comienzan a trabajar en el herbário.",
                status: "En preparación"
            },
            {
                title: "Procesos de herborización",
                description: "Espacio reservado para describir las etapas de colecta, prensado, secado, montaje, costura, etiquetado, fotografía y almacenamiento del material botánico.",
                status: "En preparación"
            },
            {
                title: "Incorporación de material",
                description: "Orientaciones iniciales para estudiantes de TCC, iniciación científica y proyectos vinculados al EVB sobre cómo organizar datos de colecta y preparar material para incorporación al acervo.",
                status: "Modelo próximamente",
                actionLabel: "Descargar planilla modelo",
                actionUrl: "exemplos/modelo-incorporacao-evb.xlsx"
            },
            {
                title: "Uso y consulta de la colección",
                description: "Espacio reservado para normas internas de conservación, manejo de exsicatas, consulta del acervo físico y digital, registro de uso y acompañamiento por el equipo responsable.",
                status: "Uso orientado"
            },
            {
                title: "Rutinas internas",
                description: "Espacio reservado para procedimientos de organización, digitalización, revisión de datos, manejo de duplicados, freezer, armários y demás etapas de la rutina curatorial.",
                status: "EVB / UNILA"
            }
        ],
        orientationGuides: [
            {
                id: "boas-praticas",
                title: "Guía de buenas prácticas",
                status: "En preparación",
                summary: "Puerta de entrada para nuevos integrantes, pasantes, estudiantes de iniciación científica y colaboradores.",
                sections: [
                    {
                        title: "Presentación del espacio",
                        body: [
                            "Espacio reservado para presentar la organización general del herbário, las áreas de trabajo, el equipo responsable y las primeras orientaciones para quienes comienzan sus actividades en el EVB.",
                            "Cuando la guía definitiva sea escrita, este capítulo podrá recibir fotos de la sala, armários, área de selección y espacios de circulación."
                        ],
                        items: ["A quién contactar al llegar al herbário.", "Qué áreas pueden ser accedidas libremente.", "Qué actividades requieren supervisión del equipo."]
                    },
                    {
                        title: "Conducta y seguridad",
                        body: ["Espacio reservado para orientaciones sobre uso responsable del acervo, cuidado con equipos, organización de la mesa de trabajo, bioseguridad y buenas prácticas durante las rutinas curatoriales."],
                        items: ["Mantener las mesas limpias y los materiales identificados.", "Evitar manipular exsicatas sin orientación previa.", "Registrar dudas, problemas o daños observados."]
                    },
                    {
                        title: "Rutina de trabajo",
                        body: ["Espacio reservado para explicar cómo se distribuyen las actividades, cómo registrar táreas realizadas y cómo acompañar pendientes relacionadas con la colección, digitalización, organización y apoyo a la investigación."],
                        items: ["Registrar actividades concluidas.", "Informar pendientes al responsable de la rutina.", "Separar materiales que necesitan revisión."]
                    }
                ]
            },
            {
                id: "herborizacao",
                title: "Procesos de herborización",
                status: "En preparación",
                summary: "Etapas de colecta, prensado, secado, montaje, etiquetado y almacenamiento del material botánico.",
                sections: [
                    {
                        title: "Colecta y registro de campo",
                        body: ["Espacio reservado para describir cómo registrar información de campo, colectar material fértil, fotografiar la planta viva y organizar datos esenciales como localidad, coordenadas, hábitat, hábito, colector y número de colecta."],
                        items: ["Registrar datos en el momento de la colecta.", "Priorizar material fértil siempre que sea posible.", "Fotografiar detalles vegetativos, flores, frutos y ambiente."]
                    },
                    {
                        title: "Prensado y cambio de periódicos",
                        body: ["Espacio reservado para orientar el montaje de la prensa, la posición del material, el cambio de periódicos, la preservación de estructuras importantes y los cuidados para evitar hongos, pérdida de partes o deformaciones."],
                        items: ["Distribuir hojas, flores y frutos de forma visible.", "Cambiar periódicos según la humedad del material.", "Mantener la identificación provisional junto al ejemplar."]
                    },
                    {
                        title: "Secado, montaje y etiqueta",
                        body: ["Espacio reservado para describir el secado, montaje de la exsicata, fijación de partes sueltas, impresión de etiqueta y criterios mínimos antes de la incorporación al acervo."],
                        items: ["Verificar si el material está seco antes del montaje.", "Garantizar que la etiqueta corresponda al ejemplar.", "Separar material incompleto para revisión."]
                    }
                ]
            },
            {
                id: "incorporacao",
                title: "Incorporación de material",
                status: "Modelo disponible",
                summary: "Orientaciones para estudiantes y proyectos vinculados al EVB sobre organización de datos y materiales para el acervo.",
                actionLabel: "Descargar planilla modelo",
                actionUrl: "exemplos/modelo-incorporacao-evb.xlsx",
                sections: [
                    {
                        title: "Organización de los datos",
                        body: ["Espacio reservado para orientar el llenado de la planilla modelo, con atención a datos de colecta, identificación taxonómica, localidad, coordenadas, proyecto vinculado y responsable del envío."],
                        items: ["Mantener los nombres de las columnas del modelo.", "Completar coordenadas en grados decimales cuando sea posible.", "Revisar la grafía de los nombres científicos antes de la entrega."]
                    },
                    {
                        title: "Revisión del material",
                        body: ["Espacio reservado para explicar cómo verificar si el material está seco, identificado, bien acondicionado, acompañado de datos completos y listo para la evaluación del equipo."],
                        items: ["Separar duplicados cuando existan.", "Mantener número de colecta y colector vinculados al ejemplar.", "Indicar materiales con dudas de identificación."]
                    },
                    {
                        title: "Entrega y revisión por el equipo",
                        body: ["Espacio reservado para describir el flujo de entrega, revisión, corrección de pendientes, generación de etiquetas e incorporación final al acervo físico y digital."],
                        items: ["Enviar la planilla completa junto con el material.", "Esperar la revisión de datos por el equipo.", "Corregir pendientes antes de la incorporación definitiva."]
                    }
                ]
            }
        ],
        instagramInfo: {
            qrCodeAlt: "QR Code para acceder al Instagram del Herbário Evaldo Buttura",
            callout: "Acompañe al Herbário Evaldo Buttura en Instagram para ver bastidores de la colección, actividades de extensión, divulgación científica, eventos y registros cotidianos del acervo.",
            posts: [
                { title: "Bastidores del herbário", text: "Registros de la rutina de curaduría, organización, digitalización y conservación de la colección botánica.", tag: "Rutina EVB" },
                { title: "Educación ambiental", text: "Divulgación de acciones, visitas, talleres y actividades de extensión realizadas por el herbário.", tag: "Extensión" },
                { title: "Flora regional", text: "Publicaciones sobre plantas, biodiversidad, conservación e investigaciones relacionadas con la flora del oeste de Paraná.", tag: "Divulgación científica" }
            ]
        },
        infoPages: [
            {
                id: "quem-somos",
                label: "Inicio",
                title: "Herbário Evaldo Buttura",
                eyebrow: "Herbário Evaldo Buttura",
                summary: "Colección botánica de la UNILA dedicada a la flora regional, a la formación técnico-científica y a la difusión del conocimiento sobre biodiversidad.",
                bodyHtml: `
                    <p>El Herbário Evaldo Buttura (<strong>EVB</strong>), de la Universidad Federal de la Integración Latinoamericana (UNILA), está ubicado en Foz do Iguaçu, en el extremo oeste del estado de Paraná, Brasil. La sigla <strong>EVB</strong> fue dada en homenaje al ingeniero agrónomo <strong>Evaldo Buttura</strong>, responsable del relevamiento florístico en la región de Foz do Iguaçu hasta Guaíra hace más de 40 años, siendo su trabajo botánico una referencia importante para la flora regional. El herbário inició sus actividades en <strong>2015</strong> a partir de la donación y restauración de la colección botánica de Buttura, compuesta por poco más de 1.200 muestras de plantas secas, colectadas principalmente entre las décadas de 1970 y 1980 en la microrregión de Foz do Iguaçu y parte de Paraguay.</p>
                    <p>El herbário <strong>EVB</strong> actúa en la colecta y el intercâmbio de materiales de la flora del oeste de Paraná, con énfasis en el Parque Nacional do Iguaçu, en Plantas Alimenticias No Convencionales (PANC) y en la flora urbana. Además, promueve la formación técnico-científica mediante pasantías supervisadas, iniciación científica, orientación de disertaciones de maestría y trabajos de conclusión de curso.</p>
                    <p>Además de mantener una colección botánica de referencia para la flora regional y contribuir a la formación técnica y académica, el herbário <strong>EVB</strong> desempeña un papel fundamental en la difusión del conocimiento sobre biodiversidad y conservación de la flora. Para ello, desarrolla actividades de educación ambiental y divulgación científica dirigidas a la comunidad externa, incluyendo acciones en ferias, escuelas y espacios públicos. De esta forma, el herbário actúa de manera integrada en las dimensiones de enseñanza, investigación y extensión universitaria.</p>
                    <p>Actualmente, el herbário migró la informatización de sus datos del software Brahms a Jabot. El acervo cuenta con cerca de <strong>8.000</strong> ejemplares informatizados, de los cuales la mayor parte posee imágenes digitalizadas y disponibles en línea en las plataformas Herbário Virtual Reflora, Jabot, <em>speciesLink</em>, INCT - Herbário Virtual Reflora, GBIF y SIBBr.</p>
                    <p>Desde 2015, el herbário integra la Red Brasileña de Herbários de la Sociedad Botánica de Brasil. En 2020, fue registrado en el <em>Index Herbáriorum</em>, pasando a ser reconocido internacionalmente entre los herbários del mundo.</p>
                `
            },
            {
                id: "onde-estamos",
                label: "Dónde estamos",
                title: "Dónde estamos",
                eyebrow: "Ubicación",
                summary: "El EVB está ubicado en el Parque Tecnológico Itaipu, en Foz do Iguaçu, Paraná, Brasil.",
                body: [
                    "Dirección: Edifício das Águas, Laboratórios Multiusuários Engenheira Enedina Alves Marques, Parque Tecnológico Itaipu, Bloque 04, Espacio 02, Salas 10, 11 y 12.",
                    "E-mail del herbário: herbarioevaldobuttura@gmail.com."
                ]
            },
            {
                id: "equipe",
                label: "Equipo",
                title: "Equipo",
                eyebrow: "Equipo EVB",
                summary: "Equipo vinculado a la curaduría, gestión, apoyo técnico y actividades de investigación y extensión del EVB.",
                body: [
                    "El equipo del Herbário Evaldo Buttura (EVB) está compuesto por la curaduría, vicecuraduría, becarios técnicos, becarios de grado y pasantes vinculados principalmente al curso de Ciencias Biológicas. Sus integrantes actúan de forma colaborativa en actividades relacionadas con la curaduría científica, mantenimiento y organización de la colección, informatización y digitalización del acervo, manejo de donaciones y apoyo a las actividades de investigación, enseñanza y extensión desarrolladas por el herbário."
                ]
            },
            {
                id: "instagram",
                label: "Instagram",
                title: "Nuestra página en Instagram",
                eyebrow: "Redes sociales",
                summary: "Acompañe las novedades, actividades, eventos y bastidores del Herbário Evaldo Buttura.",
                body: [
                    "El Instagram del EVB reúne registros de la rutina del herbário, acciones de educación ambiental, divulgación científica, actividades de investigación y momentos de interacción con la comunidad.",
                    "Esta área también puede destacar publicaciones y eventos importantes sin depender de la API de Instagram, manteniendo la página liviana y estable."
                ]
            },
            {
                id: "servicos",
                label: "Orientaciones",
                title: "Orientaciones y procedimientos",
                eyebrow: "Información interna",
                summary: "Espacio para reunir guías, procedimientos y materiales de apoyo para quienes comienzan a actuar en el Herbário Evaldo Buttura.",
                body: [
                    "Esta sección no representa una oferta de servicios externos. Fue pensada como una puerta de entrada para estudiantes, pasantes, becarios y colaboradores que necesitan comprender las rutinas básicas del herbário.",
                    "Los bloques siguientes son espacios preparados para recibir la guía de buenas prácticas, los procesos de herborización, las orientaciones de incorporación de material y otros procedimientos internos."
                ]
            },
            {
                id: "acervo",
                label: "Colección",
                title: "Mapa de la colección",
                eyebrow: "Curaduría física",
                summary: "Ambiente de curaduría física para consultar, localizar y revisar cajas, armários, estantes y espacios de la colección del Herbário Evaldo Buttura.",
                body: [
                    "El mapa reproduce la organización física de la colección y permite navegar por los armários A1 a A8, estantes, espacios y cajas, manteniendo una lectura visual cercana a la disposición real del acervo.",
                    "La búsqueda localiza cajas por número, família, gênero, contenido o posicion física. Cuando se carga la base DwC-A del EVB, la herramienta tambien puede buscar por número de registro o nombre científico, recuperar datos del ejemplar y estimar la caja mas probable con base en la família y los intervalos alfabéticos de los paquetes.",
                    "Los datos del mapa pueden actualizarse desde la planilla publicada en Google Sheets, conservando una copia local para consulta cuando la actualizacion en línea no este disponible."
                ],
                collectionMap: {
                    searchLabel: "Buscar en la colección",
                    searchPlaceholder: "Caja, família, gênero, contenido o ubicación...",
                    statusLabel: "Estado",
                    allStatus: "Todos",
                    occupiedStatus: "Ocupados",
                    freeStatus: "Libres",
                    sourceLabel: "Fuente",
                    boxesLabel: "Cajas",
                    spacesLabel: "Espacios",
                    occupiedLabel: "Ocupados",
                    freeLabel: "Libres",
                    detailTitle: "Detalles del espacio",
                    emptyDetail: "Seleccione una caja o espacio en el mapa para ver los detalles.",
                    noResults: "No se encontraron espacios para los filtros aplicados.",
                    refreshLabel: "Actualizar mapa",
                    externalSearchLabel: "Buscar registro",
                    externalEmptyQuery: "Ingrese un número de registro o nombre antes de buscar en la base.",
                    externalLoading: "Buscando registro en la base del herbário...",
                    externalNoResults: "No se encontro ningun registro del herbário para esta búsqueda.",
                    externalError: "No fue posible consultar la base del herbário ahora. La búsqueda local sigue disponible.",
                    dwcaDownloadUrl: "https://ipt.jbrj.gov.br/jabot/archive.do?r=hevb",
                    dwcaDownloadLabel: "Descargar base JABOT/HEVB",
                    dwcaLoadLabel: "Cargar base DwC-A",
                    dwcaEmptyStatus: "Base taxonômica opcional no cargada. Cargue la base DwC-A para estimar cajas por família e intervalo alfabético.",
                    dwcaLoadedStatus: "Base taxonômica EVB cargada para refinar búsquedas por família y gênero.",
                    dwcaLoading: "Leyendo base DwC-A del EVB...",
                    dwcaError: "No fue posible leer la base DwC-A. Verifique si el archivo cargado es el ZIP descargado de IPT/JABOT HEVB.",
                    dwcaZipError: "No fue posible leer ZIP en este entorno. Verifique la conexion para cargar la biblioteca JSZip.",
                    loadingStatus: "Cargando datos desde Google Sheets...",
                    liveStatus: "Datos actualizados desde Google Sheets.",
                    fallbackStatus: "Usando copia local del mapa. Verifique si la planilla esta publicada para lectura.",
                    errorStatus: "No fue posible actualizar desde Google Sheets ahora. La copia local sigue disponible."
                }
            },
            {
                id: "tombos",
                label: "Números",
                title: "Organizador de números de registro",
                eyebrow: "Búsqueda por lote",
                summary: "Pegue números de registro en cualquier formato y genere una secuencia ascendente separada por coma y espacio.",
                body: [
                    "Use esta utilidad para preparar búsquedas por lote en JABOT, speciesLink o planillas temporales de revision.",
                    "La herramienta extrae solo números, elimina repeticiones y devuelve la lista lista para copiar."
                ],
                tombSorter: {
                    inputLabel: "Números de entrada",
                    inputHint: "Pegue aqui la lista de números, incluso con saltos de línea, comas, punto y coma, corchetes o texto mezclado.",
                    outputLabel: "Resultado ordenado",
                    outputHint: "La salida queda lista para copiar y usar en búsquedas por lote.",
                    sortLabel: "Ordenar números",
                    copyLabel: "Copiar resultado",
                    clearLabel: "Limpiar",
                    emptyStatus: "Pegue los números para comenzar.",
                    readyStatus: "{count} número(s) organizado(s). {duplicatas} repetido(s) eliminado(s).",
                    copiedStatus: "Resultado copiado al portapapeles.",
                    copyErrorStatus: "No fue posible copiar automaticamente. Seleccione el resultado y copielo manualmente."
                }
            },
            {
                id: "coordenadas",
                label: "Coordenadas",
                title: "Conversor de coordenadas",
                eyebrow: "Utilidad r?pida",
                summary: "Convierta coordenadas entre grados decimales y grados, minutos y segundos, individualmente o por lote.",
                body: [
                    "Use esta utilidad para convertir coordenadas r?pidamente sin abrir EVB GeoCheck.",
                    "El historial de la sesi?n genera una tabla con latitud, longitud y los campos de coordenadas del modelo JABOT, lista para copiar."
                ],
                coordinateConverter: {
                    singleTitle: "Conversor individual",
                    batchTitle: "Conversi?n por lote",
                    historyTitle: "Historial de la sesi?n",
                    latitudeDecimalLabel: "Latitud decimal",
                    longitudeDecimalLabel: "Longitud decimal",
                    latitudeDmsLabel: "Latitud GMS",
                    longitudeDmsLabel: "Longitud GMS",
                    decimalToDmsLabel: "Decimal a GMS",
                    dmsToDecimalLabel: "GMS a decimal",
                    copySingleLabel: "Copiar",
                    convertBatchLabel: "Convertir lote",
                    copyBatchLabel: "Copiar tabla",
                    copyHistoryLabel: "Copiar historial",
                    clearHistoryLabel: "Limpiar",
                    batchHint: "Pegue una coordenada por l?nea. Puede ser decimal separado por coma/punto y coma o GMS con hemisferio.",
                    emptyStatus: "Ingrese una coordenada para comenzar."
                }
            },
            {
                id: "ajuda",
                label: "Ayuda",
                title: "Ayuda de las herramientas",
                eyebrow: "Flujo de trabajo",
                summary: "Guía rápida para entender el orden recomendado de uso, archivos esperados, ejemplos disponibles y errores comunes de cada herramienta.",
                body: [
                    "Esta pestaña organiza el uso de las herramientas del Portal EVB como un flujo de etapas. Los archivos de ejemplo quedan en la carpeta exemplos/ y pueden ser sustituidos por modelos reales cuando se separen los materiales.",
                    "Para descargar un archivo modelo, use los botones indicados en cada herramienta."
                ]
            },
            {
                id: "taxonline",
                label: "Taxonline",
                title: "Taxonline",
                eyebrow: "Consulta externa",
                summary: "Página externa con información institucional del Herbário Evaldo Buttura en la Red Taxonline.",
                body: [
                    "La página del EVB en Taxonline reúne histórico, información de ubicación, curaduría, equipo, publicaciones y enlaces relacionados con el herbário.",
                    "Use esta pestaña como puente para consulta externa y como referencia para mantener actualizados los datos institucionales del portal."
                ],
                actionLabel: "Abrir Taxonline"
            },
            {
                id: "repositorio",
                label: "Repositorio",
                title: "Repositorio",
                eyebrow: "Producción académica",
                summary: "Trabajos, publicaciones y materiales producidos por integrantes vinculados al Herbário Evaldo Buttura.",
                body: [
                    "Este espacio reúne trabajos publicados por miembros del equipo y colaboradores del herbário. Para agregar nuevos registros, edite la lista repositoryItems en el archivo data/site-data.js."
                ]
            }
        ]
    }
};

const localizedToolLongDescriptions = {
    en: {
        "jabot-extract": `
            <p><strong>JABOT Extract</strong> crops, extracts and organizes individual barcodes generated by JABOT from standardized A4 PDF files.</p>
            <p>In JABOT, selected specimen barcodes are exported on an A4 sheet with <strong>44 codes per page</strong>, arranged in <strong>4 columns and 11 rows</strong>. Because these codes occupy fixed positions in the document, the tool is configured to crop each barcode in a standardized way.</p>
            <p>After cropping, each image is read so the tool can identify the information encoded in the barcode. At Herbário Evaldo Buttura, the barcode follows the format <strong>EVB001234</strong>, where the specimen accession number corresponds to the barcode itself. This information is used to name each extracted image automatically.</p>
            <p>The tool exports all cropped images as <strong>.png</strong> files inside a compressed <strong>.zip</strong> file. This file should be extracted into a folder chosen by the user.</p>
            <p>Careful file organization is recommended because this tool is usually used together with the label-generation workflow for donated material. If a batch is named <strong>EVB_Ago_2026</strong>, for example, the PDF, spreadsheet and extracted barcode folder should preferably use the same batch name.</p>
            <p>When a PDF page has fewer than 44 barcodes, the tool still performs all 44 expected crops. Blank images may be generated and named with generic identifiers such as <strong>EVB000001</strong>; these files can be deleted without affecting the workflow.</p>
            <p>At the end, the user has cropped and correctly named barcode images ready for the next step: generating labels with <strong>EVB Labels</strong>.</p>
        `,
        "evb-labels": `
            <p><strong>EVB Labels</strong> generates standardized complementary labels for material received by donation at Herbário Evaldo Buttura.</p>
            <p>This type of label is used especially when the donated specimen already has an original label from the source herbarium. In these cases, the original label is preserved on the specimen, and EVB adds a smaller complementary label with the information needed for incorporation into the collection.</p>
            <p>The labels include accession number, botânical family, scientific name with authorship, collector, collection number, collection date, determiner, project name and the JABOT barcode. The barcode used by this tool is the one previously cropped with <strong>JABOT Extract</strong>.</p>
            <p>The tool requires two data sets: barcode images in <strong>.png</strong> format and a specimen spreadsheet in <strong>.xls</strong> or <strong>.xlsx</strong> format. The user selects all barcode images from the batch folder and then loads the corresponding spreadsheet.</p>
            <p>After loading the data, the tool automatically generates the labels. Missing images, images from another batch or inconsistencies between spreadsheet records and available barcodes become visible immediately. When no matching image is found, the label is generated without a barcode, making the problem easy to identify.</p>
            <p>This behavior reduces errors because the tool does not insert random barcodes into incorrect labels. When there is a match, the barcode is inserted; when there is no match, the label remains without a barcode.</p>
            <p>After checking the preview, the user can download a <strong>PDF</strong> with all generated labels. Print settings should be reviewed carefully, especially page scaling and margin adjustment, to avoid cutting the labels.</p>
        `,
        "evb-labels-collection": `
            <p><strong>EVB Labels Collection</strong> generates labels for the physical boxes of the Herbário Evaldo Buttura collection.</p>
            <p>Unlike EVB Labels, which is used for individual specimen labels, this tool supports the physical organization of the collection. It is useful when box labels need to be updated after reorganizing specimen packets.</p>
            <p>Updates may be needed when new families are added to a box, when packets are moved between boxes, or when the collection is rearranged to better accommodate specimens. In these cases, the box label must correctly reflect the families, packets and intervals stored inside it.</p>
            <p>The tool uses a specific spreadsheet as a collection map. This spreadsheet contains information about each box and the specimen packets or intervals stored in it. The current versión accepts <strong>.xls</strong>, <strong>.xlsx</strong> and <strong>.csv</strong> files.</p>
            <p>The user loads the updated spreadsheet and chooses a specific box, a list of boxes or an interval of labels to generat?. This allows punctual updates without producing the entire set of collection labels again.</p>
            <p>After generating the labels, the tool exports a final <strong>PDF</strong>. The labels can then be printed, cut and attached to a more resistant support, such as cardstock, before replacing the old box labels.</p>
        `,
        "analise-botanica": `
            <p><strong>EVB DataCheck</strong> generates descriptive statistics from a set of specimens defined by the user.</p>
            <p>The tool works with spreadsheets in the standard JABOT format, the same model used to incorporat? new material into the collection. These spreadsheets include botânical, taxonomic, geographic, temporal and curatorial fields, allowing the tool to produce a broad analytical overview of the selected data set.</p>
            <p>Main outputs include taxonomic composition and diversity, number of families, genera and species, total richness, record abundance, identification level and the most representative taxonomic groups. The tool also highlights rarity patterns, such as species represented by one or two records.</p>
            <p>Temporal analyses summarize sampling effort by year and month, helping identify collection intensity over time and possible seasonal patterns. When data allow it, species accumulation and collector curves can also be generated.</p>
            <p>Spatial analyses summarize municipalities, states, cities and localities. When coordinates are available, records can be plotted on maps, including spatial visualizations and concentration layers.</p>
            <p>The tool also evaluates data completeness, including valid coordinates, complete collection dates, determiner information and other relevant fields. Results are shown as absolute values and percentages.</p>
            <p>Additional modules support taxonomic validation using Flora do Brasil 2020, checks for exotic and invasive species using Instituto Hórus and Paraná IAT sources, and conservation status searches using CNCFlora/JBRJ as the main national reference and the IUCN Red List as a complementary global source.</p>
            <p>The tool can also be used with user datasets or data from other collections, as long as they follow the basic JABOT structure. The automatically generated report should be treated as an initial interpretation and reviewed carefully before being used in technical or scientific products.</p>
        `,
        "mapa-coordenadas": `
            <p><strong>EVB GeoCheck</strong> concentrates spatial checking and coordinate conversión in an independent interface.</p>
            <p>The tool loads <strong>.xls</strong>, <strong>.xlsx</strong> and <strong>.csv</strong> spreadsheets, recognizes decimal coordinates or JABOT-style degrees, minutes and seconds fields, and plots valid records on an interactive map.</p>
            <p>The map includes base layers, satellite view, clustering, filters, search, an interactive legend and visible point lists. The loaded table can be viewed below the map and copied for review in external spreadsheets.</p>
            <p>Coordinate conversion was moved to the Portal EVB Coordinates tab, keeping GeoCheck focused on map review, spatial alerts and assisted georeferencing.</p>
        `,
        "evb-revisao": `
            <p><strong>EVB Revisão</strong> supports the curatorial review step before a spreadsheet is incorporated, analyzed or converted into another standard.</p>
            <p>The tool keeps the original column structure and highlights likely problems such as scientific name misspellings, text formatting issues, date inconsistencies, missing important information and probable duplicate records.</p>
            <p>Safe corrections can be applied with one click. These include spacing cleanup, standardization of collector and determiner separators, simple text normalization, habit inference from notes and taxonomic spelling corrections when GBIF returns a strong match.</p>
            <p>Corrected rows are highlighted in green, warnings in yellow, critical errors in red and probable duplicatas in blue. The tool never deletes records automatically and does not require extra columns in the exported file.</p>
        `,
        "specieslink-jabot": `
            <p><strong>SpeciesLink to JABOT</strong> converts Excel spreadsheets exported from speciesLink, organized in Darwin Core format, into the standard spreadsheet model used by JABOT.</p>
            <p>This conversión is especially useful when Herbário Evaldo Buttura receives donated material from herbaria that do not use JABOT but have their collections digitized and available through speciesLink.</p>
            <p>The user can search speciesLink, filter the desired records, export an Excel spreadsheet and use the tool to convert the data automatically into the JABOT structure. During conversión, the tool organizes collectors, determiners, scientific name authors, geographic information and coordinates.</p>
            <p>Coordinat? conversión is a key feature. speciesLink may provide decimal coordinates and verbatim coordinate fields. The tool prioritizes <strong>verbatimLatitude</strong> and <strong>verbatimLongitude</strong> when available, because these fields tend to preserve the coordinates from the original label or collection record.</p>
            <p>When coordinates are decimal, they are converted to degrees, minutes and seconds; when they are already in DMS format, they are transferred to the corresponding JABOT columns.</p>
            <p>The conversión reduces manual transcription work, but it does not replace data review. Coordinates, additional collectors, habitat, locality and information from the original labels must always be checked before incorporation.</p>
            <p>The converted spreadsheet can also be used in <strong>EVB DataCheck</strong>, enabling comparative studies, collection diagnoses and analyses based on data from different herbaria.</p>
        `,
        "evb-darwincore": `
            <p><strong>EVB DarwinCore</strong> was created to standardize authorial or JABOT-format spreadsheets into a Darwin Core structure, with an initial focus on flora data.</p>
            <p>This first versión is meant to solve the structural core of the problem: moving internal working spreadsheets into a more universal format for display, exchange and sharing, while preserving the trace of what was originally written.</p>
            <p>For that reason, the tool preserves <strong>verbatim</strong> fields whenever possible, especially for scientific name, date, locality and coordinates. Alongside standardized Darwin Core columns, it keeps the original form of the data whenever that information exists or can be reconstructed safely.</p>
            <p>The current versión accepts <strong>.xls</strong>, <strong>.xlsx</strong> and <strong>.csv</strong> files, auto-detects the input profile and works especially well with JABOT spreadsheets and authorial spreadsheets that have minimally recognizable taxonomic, geographic and curatorial columns.</p>
            <p>During conversión, the tool builds a Darwin Core table with immediate preview, creates an auxiliary mapping sheet between source columns and final terms, produces a local validation report and allows export in <strong>.xlsx</strong> or <strong>.csv</strong>.</p>
            <p>This first step does not replace a more robust taxonomic validation workflow yet. It delivers the structural layer: standardization, verbatim preservation, local review and preparation for later steps such as taxonomic matching, external backbone checking and publication-oriented review.</p>
        `
    },
    es: {
        "jabot-extract": `
            <p><strong>JABOT Extract</strong> recorta, extrae y organiza individualmente los códigos de barras generados por JABOT a partir de archivos PDF A4 estandarizados.</p>
            <p>En JABOT, los códigos de barras de los ejemplares seleccionados se exportan en una hoja A4 con <strong>44 códigos por página</strong>, organizados en <strong>4 columnas y 11 filas</strong>. Como ocupan posiciones fijas, la herramienta fue configurada para recortar cada código de forma estandarizada.</p>
            <p>Después del recorte, cada imagen pasa por un proceso de lectura. En el Herbário Evaldo Buttura, el código sigue el formato <strong>EVB001234</strong>, en el que el número de registro del ejemplar corresponde al propio código de barras. Esta información se utiliza para nombrar automáticamente cada imagen extraída.</p>
            <p>La herramienta exporta todas las imágenes en formato <strong>.png</strong>, reunidas en un archivo comprimido <strong>.zip</strong>, que debe descomprimirse en una carpeta definida por el usuário.</p>
            <p>Se recomienda mantener una organización rigurosa de los archivos, especialmente porque esta herramienta se usa junto con el proceso de generación de etiquetas para materiales recibidos por donación. Si un lote se llama <strong>EVB_Ago_2026</strong>, por ejemplo, el PDF, la planilla y la carpeta de códigos deberían seguir el mismo nombre.</p>
            <p>Cuando el PDF tiene menos de 44 códigos en una página, la herramienta realiza igualmente los 44 recortes previstos. Pueden generarse imágenes en blanco con identificadores genéricos, como <strong>EVB000001</strong>, que pueden eliminarse sin afectar el proceso.</p>
        `,
        "evb-labels": `
            <p><strong>EVB Labels</strong> genera etiquetas complementarias estandarizadas para materiales recibidos por donación en el Herbário Evaldo Buttura.</p>
            <p>Este tipo de etiqueta se utiliza especialmente cuando el material recibido ya posee una etiqueta original del herbário de origen. En esos casos, la etiqueta original se conserva en la exsicata y el EVB agrega una etiqueta complementaria más pequeña con la información necesaria para la incorporación al acervo.</p>
            <p>Las etiquetas incluyen número de registro, família botánica, nombre científico con autoría, colector, número de colecta, fecha de colecta, determinador, proyecto y el código de barras generado por JABOT. El código utilizado es el que fue recortado previamente con <strong>JABOT Extract</strong>.</p>
            <p>La herramienta requiere dos conjuntos de datos: imágenes de códigos de barras en formato <strong>.png</strong> y una planilla en formato <strong>.xls</strong> o <strong>.xlsx</strong>. El usuário selecciona las imágenes del lote y luego carga la planilla correspondiente.</p>
            <p>Después de cargar los datos, la herramienta genera las etiquetas automáticamente. Si falta una imagen, si se cargaron imágenes de otro lote o si hay inconsistencias entre la planilla y los códigos disponibles, el problema aparece en la vista previa. Cuando no se encuentra una imagen correspondiente, la etiqueta se genera sin código de barras.</p>
            <p>Este comportamiento reduce errores porque la herramienta no inserta códigos aleatorios en etiquetas incorrectas. Al final, el usuário puede descargar un <strong>PDF</strong> para revisar, imprimir, recortar y fijar las etiquetas en las exsicatas.</p>
        `,
        "evb-labels-collection": `
            <p><strong>EVB Labels Collection</strong> genera etiquetas para las cajas de la colección del Herbário Evaldo Buttura.</p>
            <p>A diferencia de EVB Labels, usado para etiquetas de ejemplares individuales, esta herramienta apoya la organización física de la colección. Se utiliza cuando es necesario actualizar etiquetas de cajas, especialmente después de reorganizar paquetes de exsicatas.</p>
            <p>Estas actualizaciones pueden ser necesarias cuando nuevas famílias se agregan a una caja, cuando paquetes se transfieren entre cajas o cuando se reorganiza el contenido físico de la colección. En esos casos, la etiqueta debe reflejar correctamente las famílias, paquetes e intervalos almacenados.</p>
            <p>La herramienta utiliza una planilla específica como mapa de la colección. La versión actual acepta archivos <strong>.xls</strong>, <strong>.xlsx</strong> y <strong>.csv</strong>.</p>
            <p>El usuário carga la planilla actualizada e informa una caja específica, una lista de cajas o un intervalo de etiquetas. Así puede generar solo las etiquetas necesarias, sin producir nuevamente todas las etiquetas de la colección.</p>
            <p>Después de generar las etiquetas, la herramienta exporta un <strong>PDF</strong> que puede imprimirse, recortarse y fijarse en un soporte más resistente antes de sustituir las etiquetas antiguas.</p>
        `,
        "analise-botanica": `
            <p><strong>EVB DataCheck</strong> genera estadísticas descriptivas a partir de un conjunto de ejemplares definido por el usuário.</p>
            <p>La herramienta trabaj? con planillas en el formato estándar de JABOT, el mismo modelo usado para incorporar nuevos materiales a la colección. Estas planillas contienen campos botánicos, taxonómicos, geográficos, temporales y curatoriales, permitiendo producir una visión analítica amplia del conjunto de datos.</p>
            <p>Entre los principales resultados se incluyen composición y diversidad taxonómica, número de famílias, géneros y espécies, riqueza total, abundancia de registros, nivel de identificación y grupos taxonómicos más representativos. También identifica patrones de rareza, como espécies con uno o dos registros.</p>
            <p>Los análisis temporales resumen el esfuerzo de muestreo por año y mes, ayudando a observar la intensidad de colecta y posibles patrones estacionales. Cuando los datos lo permiten, también pueden generarse curvas de acumulación de espécies y curvas del colector.</p>
            <p>Los análisis espaciales reúnen información sobre municípios, estados, ciudades y localidades. Cuando hay coordenadas disponibles, los registros pueden representarse en mapas.</p>
            <p>La herramienta también evalúa la completitud de los datos, valida nombres con Flora do Brasil 2020, cruza espécies con bases de exóticas invasoras y consulta estados de conservación usando CNCFlora/JBRJ como referencia nacional principal e IUCN Red List como fuente complementaria.</p>
            <p>El informe automático debe usarse como una interpretación inicial y revisarse cuidadosamente antes de su uso en informes técnicos, resúmenes científicos, artículos o diagnósticos de colección.</p>
        `,
        "mapa-coordenadas": `
            <p><strong>EVB GeoCheck</strong> concentra la revisión espacial y la conversión de coordenadas en una interfaz independiente.</p>
            <p>La herramienta carga planillas <strong>.xls</strong>, <strong>.xlsx</strong> y <strong>.csv</strong>, reconoce coordenadas decimales o campos en grados, minutos y segundos del modelo JABOT, y representa los registros válidos en un mapa interactivo.</p>
            <p>El mapa incluye capas base, visualización satelital, agrupamiento de puntos, filtros, búsqueda, leyenda interactiva y lista de puntos visibles. La tabla cargada puede visualizarse debajo del mapa y copiarse para revision en planillas externas.</p>
            <p>El conversor de coordenadas funciona con coordenadas individuales y lotes, siendo útil para revisión de campo, limpieza de planillas y preparación de datos espaciales para otros análisis.</p>
        `,
        "evb-revisao": `
            <p><strong>EVB Revisi&oacute;n</strong> apoya la etapa de revisi&oacute;n curatorial antes de incorporar, analizar o convertir una planilla a otro est&aacute;ndar.</p>
            <p>La herramienta mantiene la estructura original de columnas y destaca problemas probables, como errores de escritura en nombres cient&iacute;ficos, campos textuales mal formateados, fechas incoherentes, informaci&oacute;n importante ausente y posibles registros duplicados.</p>
            <p>Las correcciones seguras pueden aplicarse con un clic. Incluyen limpieza de espacios, estandarizaci&oacute;n de separadores de colectores y determinadores, normalizaci&oacute;n simple de textos, inferencia de h&aacute;bito a partir de notas y correcciones taxon&oacute;micas cuando GBIF devuelve una coincidencia fuerte.</p>
            <p>Las l&iacute;neas corregidas se destacan en verde, los avisos en amarillo, los errores cr&iacute;ticos en rojo y las duplicidades probables en azul. La herramienta nunca elimina registros autom&aacute;ticamente y no exige columnas extras en el archivo exportado.</p>
        `,
        
        "specieslink-jabot": `
            <p><strong>SpeciesLink para JABOT</strong> convierte planillas Excel exportadas de speciesLink, organizadas en formato Darwin Core, al modelo estándar utilizado por JABOT.</p>
            <p>La conversión es especialmente útil cuando el Herbário Evaldo Buttura recibe materiales por donación de herbários que no utilizan JABOT, pero que tienen sus colecciónes informatizadas y disponibles en speciesLink.</p>
            <p>El usuário puede buscar registros en speciesLink, filtrar los ejemplares deseados, exportar una planilla Excel y convertir los datos automáticamente al formato requerido por JABOT. Durante la conversión, la herramienta organiza colectores, determinadores, autores de nombres científicos, información geográfica y coordenadas.</p>
            <p>La conversión de coordenadas es un recurso importante. speciesLink puede ofrecer coordenadas decimales y campos verbatim. La herramienta prioriza <strong>verbatimLatitude</strong> y <strong>verbatimLongitude</strong> cuando están disponibles, porque suelen preservar las coordenadas de la etiqueta original o del registro de colecta.</p>
            <p>Cuando las coordenadas están en formato decimal, se convierten a grados, minutos y segundos; cuando ya están en formato GMS, se transfieren a las columnas correspondientes.</p>
            <p>El proceso reduce el trabajo manual de transcripción, pero no sustituye la revisión de los datos. Coordenadas, colectores adicionales, hábitat, localidad e información de las etiquetas originales deben revisarse antes de la incorporación.</p>
        `,
        "evb-darwincore": `
            <p><strong>EVB DarwinCore</strong> fue creada para estandarizar planillas autorales o en el modelo JABOT en una estructura compatible con Darwin Core, con foco inicial en datos de flora.</p>
            <p>El objetivo principal de esta primera versión es automatizar el paso de un formato interno de trabajo a un formato mas universal de exhibición, intercâmbio y compartición de datos, sin perder el rastro de lo que estaba escrito originalmente.</p>
            <p>Por eso la herramienta preserva siempre que es posible campos <strong>verbatim</strong>, especialmente los relacionados con nombre científico, fecha, localidad y coordenadas. Al mismo tiempo que produce columnas estandarizadas de Darwin Core, conserva la forma original del dato cuando esa informacion existe o puede reconstruirse con seguridad.</p>
            <p>La versión actual acepta archivos <strong>.xls</strong>, <strong>.xlsx</strong> y <strong>.csv</strong>, intenta reconocer automaticamente el perfil de entrada y funciona especialmente bien con planillas JABOT y planillas autorales con columnas taxonômicas, geográficas y curatoriales minimamente reconocibles.</p>
            <p>Durante la conversión, la herramienta genera una planilla Darwin Core con vista previa inmediata, una hoja auxiliar de mapeo entre columnas de origen y términos finales, un informe local de validación y la exportacion final en <strong>.xlsx</strong> o <strong>.csv</strong>.</p>
            <p>Esta primera etapa todavía no sustituye una validación taxonómica más robusta. Entrega la capa estructural: estandarización, preservacion de verbatim, revision local y preparación del conjunto para pasos posteriores, como matching taxonomico, chequeo contra backbone externo y revision orientada a publicación.</p>
        `
    }
};

Object.entries(localizedToolLongDescriptions).forEach(([language, descriptions]) => {
    if (!localized[language]) return;
    localized[language].tools = (localized[language].tools || []).map(tool => ({
        ...tool,
        longDescriptionHtml: descriptions[tool.id] || tool.longDescriptionHtml || ""
    }));
});

    window.EVB_SITE_DATA = {
    tools,
    photoGallery,
    teamMembers,
    repositoryItems,
    serviceItems,
    orientationGuides,
    instagramInfo,
    toolHelp,
    infoPages,
    localized
};
})();
