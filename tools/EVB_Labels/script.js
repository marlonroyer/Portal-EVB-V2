const DEBUG = false;

const state = {
    imagens: new Map(),
    registros: [],
    planilhaCarregada: false,
    modeloEtiqueta: 'padrao'
};

const elements = {
    imagensFile: document.getElementById('imagensFile'),
    excelFile: document.getElementById('excelFile'),
    imagensUploadArea: document.getElementById('imagensUploadArea'),
    excelUploadArea: document.getElementById('excelUploadArea'),
    statusImagens: document.getElementById('status-imagens'),
    statusPlanilha: document.getElementById('status-planilha'),
    previewCard: document.getElementById('previewCard'),
    gerarPdfBtn: document.getElementById('gerar-pdf'),
    etiquetaCount: document.getElementById('etiquetaCount'),
    emptyPreview: document.getElementById('emptyPreview'),
    progressCard: document.getElementById('progressCard'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    progressDetail: document.getElementById('progressDetail'),
    etiquetasContainer: document.getElementById('etiquetas-container'),
    labelModelInputs: Array.from(document.querySelectorAll('input[name="labelModel"]'))
};

function debugLog(...args) {
    if (DEBUG) console.log(...args);
}

document.addEventListener('DOMContentLoaded', setup);

function setup() {
    hide(elements.previewCard);
    hide(elements.gerarPdfBtn);
    hide(elements.progressCard);

    elements.imagensUploadArea.addEventListener('click', () => elements.imagensFile.click());
    elements.excelUploadArea.addEventListener('click', () => elements.excelFile.click());
    elements.imagensFile.addEventListener('change', handleImagesChange);
    elements.excelFile.addEventListener('change', handleSpreadsheetChange);
    elements.gerarPdfBtn.addEventListener('click', gerarPDF);
    elements.labelModelInputs.forEach(input => input.addEventListener('change', handleModelChange));
}

function handleModelChange(event) {
    state.modeloEtiqueta = event.target.value || 'padrao';
    atualizarPreview();
}

async function handleImagesChange(event) {
    const files = Array.from(event.target.files || []);
    state.imagens.clear();

    if (files.length === 0) {
        updateStatus(elements.statusImagens, 'Nenhum arquivo de código de barras selecionado', 'status-pendente');
        atualizarPreview();
        return;
    }

    updateStatus(elements.statusImagens, `Carregando ${files.length} arquivo${files.length > 1 ? 's' : ''}...`, 'status-carregando');

    try {
        const loadedGroups = await Promise.all(files.map(readBarcodeSourceFile));
        const loadedImages = loadedGroups.flat();

        if (loadedImages.length === 0) {
            throw new Error('Nenhuma imagem PNG encontrada nos arquivos selecionados.');
        }

        loadedImages.forEach(({ name, dataUrl }) => {
            state.imagens.set(name, dataUrl);
            state.imagens.set(normalizeFileName(name), dataUrl);
        });

        updateStatus(elements.statusImagens, `${loadedImages.length} imagem${loadedImages.length > 1 ? 'ns' : ''} carregada${loadedImages.length > 1 ? 's' : ''}`, 'status-sucesso');
        debugLog('Imagens carregadas:', Array.from(state.imagens.keys()));
        atualizarPreview();
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
        updateStatus(elements.statusImagens, 'Erro ao carregar códigos de barras', 'status-erro');
        alert(error.message || 'Erro ao carregar os códigos de barras.');
    }
}

async function readBarcodeSourceFile(file) {
    const name = String(file.name || '');
    if (/\.zip$/i.test(name)) return readZipImages(file);
    if (/\.png$/i.test(name)) return [await readImageFile(file)];
    return [];
}

function readImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve({ name: file.name, dataUrl: event.target.result });
        reader.onerror = () => reject(new Error(`Erro ao carregar imagem: ${file.name}`));
        reader.readAsDataURL(file);
    });
}

async function readZipImages(file) {
    if (!window.JSZip) {
        throw new Error('A biblioteca para leitura de ZIP não foi carregada corretamente.');
    }

    const zip = await JSZip.loadAsync(file);
    const imageEntries = Object.values(zip.files)
        .filter(entry => !entry.dir && /\.png$/i.test(entry.name));

    if (imageEntries.length === 0) return [];

    return Promise.all(imageEntries.map(async entry => {
        const blob = await entry.async('blob');
        const dataUrl = await blobToDataUrl(blob);
        return {
            name: getBaseFileName(entry.name),
            dataUrl
        };
    }));
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler imagem dentro do ZIP.'));
        reader.readAsDataURL(blob);
    });
}

function getBaseFileName(path) {
    return String(path || '').split(/[\\/]/).pop().trim();
}

async function handleSpreadsheetChange(event) {
    const file = event.target.files[0];

    if (!file) {
        state.planilhaCarregada = false;
        state.registros = [];
        updateStatus(elements.statusPlanilha, 'Nenhuma planilha selecionada', 'status-pendente');
        atualizarPreview();
        return;
    }

    updateStatus(elements.statusPlanilha, 'Carregando planilha...', 'status-carregando');

    try {
        const data = await readArrayBuffer(file);
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rows.length === 0) {
            state.planilhaCarregada = false;
            state.registros = [];
            updateStatus(elements.statusPlanilha, 'Planilha vazia', 'status-erro');
            alert('A planilha está vazia.');
            atualizarPreview();
            return;
        }

        state.registros = processarDadosExcel(rows);
        state.planilhaCarregada = true;
        updateStatus(elements.statusPlanilha, `Planilha carregada (${file.name})`, 'status-sucesso');
        atualizarPreview();
    } catch (error) {
        console.error('Erro ao processar o arquivo Excel:', error);
        state.planilhaCarregada = false;
        state.registros = [];
        updateStatus(elements.statusPlanilha, 'Erro ao processar planilha', 'status-erro');
        alert('Erro ao processar o arquivo Excel. Verifique se o arquivo está no formato esperado.');
        atualizarPreview();
    }
}

function readArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
        reader.readAsArrayBuffer(file);
    });
}

function processarDadosExcel(rows) {
    const cabecalhos = rows[0] || [];
    const mapeamentoColunas = {
        numtombo: encontrarIndice(cabecalhos, ['numtombo']),
        family: encontrarIndice(cabecalhos, ['family']),
        genus: encontrarIndice(cabecalhos, ['genus']),
        sp1: encontrarIndice(cabecalhos, ['sp1']),
        author1: encontrarIndice(cabecalhos, ['author1']),
        detby: encontrarIndice(cabecalhos, ['detby']),
        detdd: encontrarIndice(cabecalhos, ['detdd']),
        detmm: encontrarIndice(cabecalhos, ['detmm']),
        detyy: encontrarIndice(cabecalhos, ['detyy']),
        colldd: encontrarIndice(cabecalhos, ['colldd']),
        collmm: encontrarIndice(cabecalhos, ['collmm']),
        collyy: encontrarIndice(cabecalhos, ['collyy']),
        collector: encontrarIndice(cabecalhos, ['collector']),
        number: encontrarIndice(cabecalhos, ['number']),
        projeto: encontrarIndice(cabecalhos, ['projeto'])
    };

    const colunasFaltantes = Object.entries(mapeamentoColunas)
        .filter(([, indice]) => indice === -1)
        .map(([nome]) => nome);

    if (colunasFaltantes.length > 0) {
        throw new Error(`Colunas não encontradas na planilha: ${colunasFaltantes.join(', ')}`);
    }

    const registros = [];

    for (let i = 1; i < rows.length; i++) {
        const linha = rows[i];
        if (!linha.some(celula => celula !== '' && celula !== null && celula !== undefined)) continue;

        const numtombo = cleanCell(linha[mapeamentoColunas.numtombo]);
        const codigoBarras = getBarcodeFileName(numtombo);

        registros.push({
            evb: numtombo ? `EVB ${numtombo}` : '',
            familia: cleanCell(linha[mapeamentoColunas.family]),
            genero: cleanCell(linha[mapeamentoColunas.genus]),
            epiteto: cleanCell(linha[mapeamentoColunas.sp1]),
            autor: cleanCell(linha[mapeamentoColunas.author1]),
            determinador: cleanCell(linha[mapeamentoColunas.detby]),
            detDia: cleanCell(linha[mapeamentoColunas.detdd]),
            detMes: cleanCell(linha[mapeamentoColunas.detmm]),
            detAno: cleanCell(linha[mapeamentoColunas.detyy]),
            collDia: cleanCell(linha[mapeamentoColunas.colldd]),
            collMes: cleanCell(linha[mapeamentoColunas.collmm]),
            collAno: cleanCell(linha[mapeamentoColunas.collyy]),
            coletor: cleanCell(linha[mapeamentoColunas.collector]),
            numeroColeta: cleanCell(linha[mapeamentoColunas.number]),
            codigoBarras,
            projeto: cleanCell(linha[mapeamentoColunas.projeto])
        });
    }

    if (registros.length === 0) {
        throw new Error('Nenhum dado válido encontrado na planilha.');
    }

    debugLog(`Processados ${registros.length} registros.`);
    return registros;
}

function encontrarIndice(cabecalhos, possiveisNomes) {
    const normalizedHeaders = cabecalhos.map(cabecalho => normalizeHeader(cabecalho));

    for (const nome of possiveisNomes) {
        const exactIndex = normalizedHeaders.indexOf(normalizeHeader(nome));
        if (exactIndex !== -1) return exactIndex;
    }

    for (let i = 0; i < normalizedHeaders.length; i++) {
        for (const nome of possiveisNomes) {
            const normalizedName = normalizeHeader(nome);
            if (normalizedHeaders[i].includes(normalizedName) || normalizedName.includes(normalizedHeaders[i])) {
                debugLog(`Coluna "${cabecalhos[i]}" encontrada como correspondência parcial para "${nome}"`);
                return i;
            }
        }
    }

    return -1;
}

function atualizarPreview() {
    elements.etiquetasContainer.innerHTML = '';

    if (!state.planilhaCarregada || state.registros.length === 0) {
        hide(elements.previewCard);
        hide(elements.gerarPdfBtn);
        show(elements.emptyPreview);
        return;
    }

    const fragment = document.createDocumentFragment();
    state.registros.forEach(registro => {
        fragment.appendChild(criarEtiquetaPorModelo(registro));
    });
    elements.etiquetasContainer.appendChild(fragment);

    show(elements.previewCard);
    show(elements.gerarPdfBtn);
    hide(elements.emptyPreview);
    const modo = getModeloAtual().labelSuffix;
    elements.etiquetaCount.textContent = `${state.registros.length} etiqueta${state.registros.length > 1 ? 's' : ''}${modo}`;
}

function criarEtiquetaPorModelo(registro) {
    if (state.modeloEtiqueta === 'redeterminacao') return criarEtiquetaRedeterminacao(registro);
    if (state.modeloEtiqueta === 'redeterminacao-simples') return criarEtiquetaRedeterminacaoSimples(registro);
    return criarEtiqueta(registro);
}

function getModeloAtual() {
    const modelos = {
        padrao: { labelSuffix: '', fileName: 'etiquetas.pdf' },
        redeterminacao: { labelSuffix: ' de redeterminação', fileName: 'etiquetas_redeterminacao.pdf' },
        'redeterminacao-simples': { labelSuffix: ' de redeterminação simples', fileName: 'etiquetas_redeterminacao_simples.pdf' }
    };
    return modelos[state.modeloEtiqueta] || modelos.padrao;
}

function criarEtiqueta(registro) {
    const etiqueta = document.createElement('div');
    etiqueta.className = 'etiqueta';

    const colunaEsquerda = document.createElement('div');
    colunaEsquerda.className = 'coluna-esquerda';

    appendText(colunaEsquerda, 'div', 'evb', registro.evb);
    appendText(colunaEsquerda, 'div', 'familia', registro.familia);

    colunaEsquerda.appendChild(criarNomeCientifico(registro));

    const linhaColetor = document.createElement('div');
    linhaColetor.className = 'linha-coletor';
    appendText(linhaColetor, 'span', 'Coletor', registro.coletor ? `Col.: ${registro.coletor}` : '');
    if (registro.coletor && registro.numeroColeta) linhaColetor.appendChild(document.createTextNode(' '));
    appendText(linhaColetor, 'span', 'NumeroColeta', registro.numeroColeta);
    colunaEsquerda.appendChild(linhaColetor);
    appendText(colunaEsquerda, 'div', 'determinador', registro.determinador ? `Det.: ${registro.determinador}` : '');
    appendText(colunaEsquerda, 'span', 'data', formatCollectionDate(registro));
    appendText(colunaEsquerda, 'div', 'projeto', registro.projeto);

    const colunaDireita = document.createElement('div');
    colunaDireita.className = 'coluna-direita';

    const logo = document.createElement('img');
    logo.src = 'LogoEVB.png';
    logo.alt = 'Logo EVB';
    logo.className = 'etiqueta-logo';
    colunaDireita.appendChild(logo);

    if (registro.codigoBarras) {
        const barcode = document.createElement('img');
        barcode.src = getBarcodeImageSource(registro.codigoBarras);
        barcode.alt = 'Código de barras';
        barcode.className = 'codigo-barras';
        barcode.onerror = () => barcode.classList.add('codigo-barras-ausente');
        colunaDireita.appendChild(barcode);
    }

    etiqueta.appendChild(colunaEsquerda);
    etiqueta.appendChild(colunaDireita);
    return etiqueta;
}

function criarEtiquetaRedeterminacao(registro) {
    const etiqueta = document.createElement('div');
    etiqueta.className = 'etiqueta etiqueta-redeterminacao';

    const colunaEsquerda = document.createElement('div');
    colunaEsquerda.className = 'coluna-esquerda';

    appendText(colunaEsquerda, 'div', 'evb', registro.evb);
    appendText(colunaEsquerda, 'div', 'tipo-etiqueta', 'Redeterminação');
    appendText(colunaEsquerda, 'div', 'familia', registro.familia);

    colunaEsquerda.appendChild(criarNomeCientifico(registro));

    const linhaColetor = document.createElement('div');
    linhaColetor.className = 'linha-coletor';
    appendText(linhaColetor, 'span', 'Coletor', registro.coletor ? `Col.: ${registro.coletor}` : '');
    if (registro.coletor && registro.numeroColeta) linhaColetor.appendChild(document.createTextNode(' '));
    appendText(linhaColetor, 'span', 'NumeroColeta', registro.numeroColeta);
    colunaEsquerda.appendChild(linhaColetor);

    const blocoRedeterminacao = document.createElement('div');
    blocoRedeterminacao.className = 'redeterminacao-bloco';
    appendText(blocoRedeterminacao, 'div', 'redeterminador', registro.determinador ? `Redet.: ${registro.determinador}` : 'Redet.:');
    appendText(blocoRedeterminacao, 'div', 'data-redeterminacao', `Data: ${formatDeterminationDate(registro) || '____/____/____'}`);
    colunaEsquerda.appendChild(blocoRedeterminacao);

    const colunaDireita = document.createElement('div');
    colunaDireita.className = 'coluna-direita';

    const logo = document.createElement('img');
    logo.src = 'LogoEVB.png';
    logo.alt = 'Logo EVB';
    logo.className = 'etiqueta-logo';
    colunaDireita.appendChild(logo);

    if (registro.codigoBarras) {
        const barcode = document.createElement('img');
        barcode.src = getBarcodeImageSource(registro.codigoBarras);
        barcode.alt = 'Código de barras';
        barcode.className = 'codigo-barras';
        barcode.onerror = () => barcode.classList.add('codigo-barras-ausente');
        colunaDireita.appendChild(barcode);
    }

    etiqueta.appendChild(colunaEsquerda);
    etiqueta.appendChild(colunaDireita);
    return etiqueta;
}

function criarEtiquetaRedeterminacaoSimples(registro) {
    const etiqueta = document.createElement('div');
    etiqueta.className = 'etiqueta etiqueta-redeterminacao-simples';

    const conteudo = document.createElement('div');
    conteudo.className = 'redet-simples-conteudo';

    appendText(conteudo, 'div', 'evb', registro.evb);
    appendText(conteudo, 'div', 'nome-aceito-label', 'Nome aceito:');
    conteudo.appendChild(criarNomeCientifico(registro, 'nome-cientifico nome-cientifico-redet-simples'));
    appendText(conteudo, 'div', 'familia', registro.familia);

    const linhaColetor = document.createElement('div');
    linhaColetor.className = 'linha-coletor linha-coletor-redet-simples';
    appendText(linhaColetor, 'span', 'Coletor', registro.coletor ? `Col.: ${registro.coletor}` : 'Col.:');
    if (registro.coletor && registro.numeroColeta) linhaColetor.appendChild(document.createTextNode(' '));
    appendText(linhaColetor, 'span', 'NumeroColeta', registro.numeroColeta);
    conteudo.appendChild(linhaColetor);

    const determinadorTexto = registro.determinador
        ? `Det.: ${registro.determinador}${registro.numeroColeta ? ` ${registro.numeroColeta}` : ''}`
        : 'Det.:';
    appendText(conteudo, 'div', 'redeterminador', determinadorTexto);
    appendText(conteudo, 'div', 'data-redeterminacao', `Data: ${formatDeterminationDate(registro) || '____ / ____ / ____'}`);

    const logo = document.createElement('img');
    logo.src = 'LogoEVB.png';
    logo.alt = 'Logo EVB';
    logo.className = 'redet-simples-logo';

    etiqueta.appendChild(conteudo);
    etiqueta.appendChild(logo);
    return etiqueta;
}

async function gerarPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert('A biblioteca de PDF não foi carregada corretamente.');
        return;
    }

    const etiquetas = Array.from(document.querySelectorAll('.etiqueta'));
    if (etiquetas.length === 0) {
        alert('Nenhuma etiqueta encontrada para exportar.');
        return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const larguraEtiqueta = 105;
    const alturaEtiqueta = 29.7;
    const margemX = 0;
    const margemY = 10;
    const maxEtiquetasPorLinha = 2;

    let x = margemX;
    let y = margemY;

    show(elements.progressCard);
    elements.gerarPdfBtn.disabled = true;
    updateProgress(0, 'Preparando etiquetas...');

    try {
        for (let index = 0; index < etiquetas.length; index++) {
            updateProgress(
                Math.round((index / etiquetas.length) * 100),
                `Processando etiqueta ${index + 1} de ${etiquetas.length}...`
            );

            const canvas = await html2canvas(etiquetas[index], {
                scale: 4,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png', 1.0);
            doc.addImage(imgData, 'PNG', x, y, larguraEtiqueta, alturaEtiqueta);

            x += larguraEtiqueta;
            if ((index + 1) % maxEtiquetasPorLinha === 0) {
                x = margemX;
                y += alturaEtiqueta;
            }

            if (y + alturaEtiqueta > doc.internal.pageSize.getHeight() - margemY && index < etiquetas.length - 1) {
                doc.addPage();
                x = margemX;
                y = margemY;
            }
        }

        updateProgress(100, 'PDF gerado com sucesso!');
        doc.save(getModeloAtual().fileName);
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        updateProgress(0, 'Erro ao gerar PDF.');
        alert('Erro ao gerar o PDF. Verifique se todas as imagens foram carregadas corretamente.');
    } finally {
        elements.gerarPdfBtn.disabled = false;
        setTimeout(() => hide(elements.progressCard), 1800);
    }
}

function appendText(parent, tagName, className, value) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = value || '';
    parent.appendChild(element);
    return element;
}

function updateStatus(container, text, className) {
    const statusText = container.querySelector('.status-text');
    statusText.textContent = text;
    container.className = `status-indicator ${className}`;
}

function updateProgress(percent, detail) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${percent}%`;
    elements.progressDetail.textContent = detail;
}

function getBarcodeImageSource(fileName) {
    return state.imagens.get(fileName)
        || state.imagens.get(normalizeFileName(fileName))
        || `codigos_barras/${fileName}`;
}

function getBarcodeFileName(numtombo) {
    if (!numtombo) return '';
    const normalized = String(numtombo).replace(/^EVB/i, '').replace(/\D/g, '');
    return `EVB${normalized.padStart(6, '0')}.png`;
}

function criarNomeCientifico(registro, className = 'nome-cientifico') {
    const taxon = document.createElement('div');
    taxon.className = className;
    appendText(taxon, 'span', 'genero', registro.genero);
    if (registro.genero && registro.epiteto) taxon.appendChild(document.createTextNode(' '));
    appendText(taxon, 'span', 'epiteto', registro.epiteto);
    if ((registro.genero || registro.epiteto) && registro.autor) taxon.appendChild(document.createTextNode(' '));
    appendText(taxon, 'span', 'autor', registro.autor);
    return taxon;
}

function formatCollectionDate(registro) {
    return formatDateParts(registro.collDia, registro.collMes, registro.collAno);
}

function formatDeterminationDate(registro) {
    return formatDateParts(registro.detDia, registro.detMes, registro.detAno);
}

function formatDateParts(day, month, year) {
    return [day, monthToRoman(month), year].filter(Boolean).join(' / ');
}

function monthToRoman(value) {
    const romans = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const numeric = Number(String(value || '').trim().replace(/\D/g, ''));
    return numeric >= 1 && numeric <= 12 ? romans[numeric] : String(value || '').trim();
}

function normalizeFileName(fileName) {
    const match = String(fileName).match(/EVB\s*0*(\d+)\.png$/i);
    if (!match) return String(fileName).trim();
    return `EVB${match[1].padStart(6, '0')}.png`;
}

function normalizeHeader(value) {
    return String(value || '').trim().toLowerCase();
}

function cleanCell(value) {
    return String(value ?? '').trim();
}

function show(element) {
    if (element) element.style.display = '';
}

function hide(element) {
    if (element) element.style.display = 'none';
}
