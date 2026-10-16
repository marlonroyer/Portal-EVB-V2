# Arquivos de exemplo do Portal EVB

Coloque nesta pasta os arquivos modelo usados pela aba Ajuda e pelos botoes "Baixar exemplo".

## Nomes esperados

- `jabot-extract-codigos-barras.pdf`
  - PDF de uma pagina com codigos de barras no formato usado pelo JABOT Extract.

- `evb-labels-dados-etiquetas.xlsx`
  - Planilha modelo para o EVB Labels.
  - Tambem sera usada como exemplo para a ferramento EVB DataCheck.

- `evb-labels-collection-dados.xlsx`
  - Planilha modelo para o EVB Labels Collection.
  - Tambem pode ser `.xls` ou `.csv`, desde que o link em `data/site-data.js` seja atualizado.

- `specieslink-exportacao-exemplo.xlsx`
  - Planilha modelo exportada do speciesLink para testar a conversao para JABOT.

## Observacao

Se algum arquivo estiver em `.xls` ou `.csv` em vez de `.xlsx`, renomeie o link correspondente em `data/site-data.js`.
