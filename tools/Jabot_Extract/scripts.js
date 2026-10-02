// ============================================
// JABOT Extract - Versão Híbrida Profissional
// Preserva a lógica original 100% funcional
// ============================================

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

const CDN = {
    quagga: 'https://cdn.jsdelivr.net/npm/quagga@0.12.1/dist/quagga.min.js',
    tesseract: 'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js'
};

// Estado Global
const state = {
    pdfDoc: null,
    allBarcodes: [],
    processingStartTime: null,
    processingTimer: null,
    ocrWorker: null,
    usedFileNames: new Set()
};

// Elementos DOM
const elements = {
    pdfInput: document.getElementById('pdfInput'),
    dropZone: document.getElementById('dropZone'),
    fileSelected: document.getElementById('fileSelected'),
    fileName: document.getElementById('fileName'),
    uploadCard: document.getElementById('uploadCard'),
    configCard: document.getElementById('configCard'),
    pagesCard: document.getElementById('pagesCard'),
    progressCard: document.getElementById('progressCard'),
    resultsCard: document.getElementById('resultsCard'),
    pageCheckboxes: document.getElementById('pageCheckboxes'),
    pageCount: document.getElementById('pageCount'),
    progressText: document.getElementById('progressText'),
    progressFill: document.getElementById('progressFill'),
    progressDetail: document.getElementById('progressDetail'),
    imageContainer: document.getElementById('imageContainer'),
    emptyResults: document.getElementById('emptyResults'),
    downloadAllBtn: document.getElementById('downloadAll'),
    downloadAllContainer: document.getElementById('downloadAllContainer'),
    processingStats: document.getElementById('processingStats'),
    readCount: document.getElementById('readCount'),
    unreadCount: document.getElementById('unreadCount'),
    elapsedTime: document.getElementById('elapsedTime'),
    selectPdfButton: document.getElementById('selectPdfButton'),
    changePdfButton: document.getElementById('changePdfButton'),
    selectAllPagesBtn: document.getElementById('selectAllPagesBtn'),
    deselectAllPagesBtn: document.getElementById('deselectAllPagesBtn'),
    invertSelectionBtn: document.getElementById('invertSelectionBtn'),
    clearResultsBtn: document.getElementById('clearResultsBtn')
};

const PDF_RENDER_SCALE = 9.0;
const BARCODE_GRID = {
    rows: 11,
    cols: 4,
    total: 44
};
const DEBUG = false;

function debugLog(...args) {
    if (DEBUG) console.log(...args);
}

function loadExternalScript(src, globalName) {
    if (window[globalName]) return Promise.resolve(window[globalName]);

    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector(`script[data-loader="${globalName}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window[globalName]), { once: true });
            existingScript.addEventListener('error', reject, { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.dataset.loader = globalName;
        script.onload = () => resolve(window[globalName]);
        script.onerror = () => reject(new Error(`Não foi possível carregar ${globalName}.`));
        document.head.appendChild(script);
    });
}

function ensureQuagga() {
    return loadExternalScript(CDN.quagga, 'Quagga');
}

function ensureTesseract() {
    return loadExternalScript(CDN.tesseract, 'Tesseract');
}

// ============================================
// Inicialização
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload de arquivo tradicional
    elements.pdfInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            handleFileSelect(file);
        } else {
            alert('Por favor, selecione um arquivo PDF válido.');
        }
    });

    if (elements.selectPdfButton) {
        elements.selectPdfButton.addEventListener('click', openFilePicker);
    }

    if (elements.changePdfButton) {
        elements.changePdfButton.addEventListener('click', openFilePicker);
    }

    if (elements.selectAllPagesBtn) {
        elements.selectAllPagesBtn.addEventListener('click', selectAllPages);
    }

    if (elements.deselectAllPagesBtn) {
        elements.deselectAllPagesBtn.addEventListener('click', deselectAllPages);
    }

    if (elements.invertSelectionBtn) {
        elements.invertSelectionBtn.addEventListener('click', invertSelection);
    }

    if (elements.clearResultsBtn) {
        elements.clearResultsBtn.addEventListener('click', clearResults);
    }
    
    // Drag and Drop
    if (elements.dropZone) {
        elements.dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.add('drag-over');
        });
        
        elements.dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
        });
        
        elements.dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        });
        
        elements.dropZone.addEventListener('click', function() {
            elements.pdfInput.click();
        });
    }
    
    // Download All
    if (elements.downloadAllBtn) {
        elements.downloadAllBtn.addEventListener('click', handleDownloadAll);
    }
}

function handleFileSelect(file) {
    debugLog('PDF carregado:', file.name);
    
    // Mostrar arquivo selecionado
    if (elements.dropZone) elements.dropZone.style.display = 'none';
    if (elements.fileSelected) {
        elements.fileSelected.style.display = 'flex';
        elements.fileName.textContent = file.name;
    }
    
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedArray = new Uint8Array(this.result);
        loadPDF(typedArray);
    };
    fileReader.onerror = function(error) {
        console.error('Erro ao ler arquivo:', error);
        alert('Erro ao carregar o arquivo PDF');
    };
    fileReader.readAsArrayBuffer(file);
}

// ============================================
// Carregamento do PDF (LÓGICA ORIGINAL)
// ============================================
function loadPDF(data) {
    debugLog('Iniciando carregamento do PDF...');
    const loadingTask = pdfjsLib.getDocument({ data });
    
    loadingTask.promise.then(function(pdf) {
        debugLog('PDF carregado com sucesso. Total de páginas:', pdf.numPages);
        state.pdfDoc = pdf;
        showPageSelection(pdf.numPages);
    }).catch(function(error) {
        console.error('Erro ao carregar o PDF:', error);
        alert('Erro ao carregar o PDF: ' + error.message);
    });
}

function showPageSelection(totalPages) {
    const pageCheckboxes = elements.pageCheckboxes;
    pageCheckboxes.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const label = document.createElement('label');
        label.innerHTML = `<input type="checkbox" name="page" value="${i}" checked> Página ${i}`;
        pageCheckboxes.appendChild(label);
    }
    
    // Mostrar cards
    if (elements.configCard) elements.configCard.style.display = 'block';
    if (elements.pagesCard) elements.pagesCard.style.display = 'block';
    if (elements.pageCount) elements.pageCount.textContent = `${totalPages} páginas`;
    
    // Configurar botão de processamento
    const processBtn = document.getElementById('processPages');
    if (processBtn) {
        const newBtn = processBtn.cloneNode(true);
        processBtn.parentNode.replaceChild(newBtn, processBtn);
        
        newBtn.addEventListener('click', function() {
            const selectedPages = [];
            document.querySelectorAll('input[name="page"]:checked').forEach(function(checkbox) {
                selectedPages.push(parseInt(checkbox.value));
            });
            
            if (selectedPages.length === 0) {
                alert('Por favor, selecione pelo menos uma página.');
                return;
            }
            
            debugLog('Páginas selecionadas:', selectedPages);
            processSelectedPages(selectedPages);
        });
    }
}

// ============================================
// Processamento (LÓGICA ORIGINAL - 100% FUNCIONAL)
// ============================================
async function processSelectedPages(pages) {
    debugLog('Iniciando processamento das páginas:', pages);
    
    // Resetar estado
    state.allBarcodes = [];
    state.usedFileNames = new Set();
    state.processingStartTime = Date.now();
    
    // Mostrar cards de progresso e resultados
    if (elements.progressCard) elements.progressCard.style.display = 'block';
    if (elements.resultsCard) elements.resultsCard.style.display = 'block';
    if (elements.processingStats) elements.processingStats.style.display = 'none';
    
    const imageContainer = elements.imageContainer;
    imageContainer.innerHTML = '';
    if (elements.emptyResults) elements.emptyResults.style.display = 'none';
    
    const progressText = elements.progressText;
    const progressFill = elements.progressFill;
    
    if (progressText) progressText.textContent = '0%';
    if (progressFill) progressFill.style.width = '0%';
    if (elements.progressDetail) elements.progressDetail.textContent = 'Preparando PDF...';
    
    let imageCounter = 1;
    let totalRead = 0;
    let totalUnread = 0;
    let totalBlank = 0;
    
    // Iniciar timer
    if (state.processingTimer) clearInterval(state.processingTimer);
    state.processingTimer = setInterval(updateElapsedTime, 1000);
    
    try {
        for (let i = 0; i < pages.length; i++) {
            const pageNumber = pages[i];
            debugLog(`Processando página ${pageNumber}...`);
            if (elements.progressDetail) {
                elements.progressDetail.textContent = `Página ${i + 1} de ${pages.length}`;
            }
            
            try {
                const page = await state.pdfDoc.getPage(pageNumber);
                const codesFromText = await extractCodesFromPage(page);
                const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                debugLog(`Renderizando página ${pageNumber}...`);
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;
                
                debugLog(`Extraindo códigos de barras da página ${pageNumber}...`);
                const barcodes = extractBarcodes(canvas);
                totalBlank += barcodes.blankCount || 0;
                debugLog(`Encontrados ${barcodes.length} códigos de barras`);
                debugLog(`Códigos obtidos do texto do PDF: ${codesFromText.length}`);
                
                for (let j = 0; j < barcodes.length; j++) {
                    const barcode = barcodes[j];
                    const resultItem = createResultItem(barcode);
                    imageContainer.appendChild(resultItem.container);

                    try {
                        let finalText = codesFromText[barcode.gridIndex] || null;

                        if (!finalText) {
                            const barcodeText = await readBarcodeFromImage(barcode);
                            debugLog(`Código ${j + 1} (Quagga):`, barcodeText || 'Não lido');
                            finalText = barcodeText;

                            if (!finalText) {
                                resultItem.infoText.textContent = 'Lendo com OCR...';
                                const ocrText = await readTextWithOCR(barcode);
                                debugLog(`Código ${j + 1} (OCR):`, ocrText || 'Não lido');
                                finalText = ocrText;
                            }
                        } else {
                            debugLog(`Código ${j + 1} (PDF):`, finalText);
                        }
                        
                        if (finalText) {
                            finalText = applyBasicCorrections(finalText);
                            debugLog(`Código ${j + 1} (Corrigido):`, finalText);
                        }
                        
                        let fileName;
                        if (finalText && isValidCode(finalText)) {
                            fileName = createUniqueFilename(generateSafeFilename(finalText));
                            markBarcodeRead(resultItem, finalText);
                            totalRead++;
                        } else {
                            fileName = createFallbackFilename(imageCounter);
                            imageCounter++;
                            markBarcodeUnread(resultItem, 'Código não lido');
                            totalUnread++;
                        }
                        
                        resultItem.downloadButton.style.display = 'inline-flex';
                        resultItem.downloadButton.onclick = function() {
                            downloadImage(barcode.src, fileName);
                        };
                        
                        state.allBarcodes.push({
                            src: barcode.src,
                            name: fileName,
                            text: finalText || `sequencial_${imageCounter}`
                        });
                        
                    } catch (readError) {
                        console.error('Erro na leitura do código:', readError);
                        const fileName = createFallbackFilename(imageCounter);
                        imageCounter++;
                        
                        markBarcodeUnread(resultItem, 'Erro na leitura');
                        resultItem.downloadButton.style.display = 'inline-flex';
                        resultItem.downloadButton.onclick = function() {
                            downloadImage(barcode.src, fileName);
                        };
                        
                        state.allBarcodes.push({
                            src: barcode.src,
                            name: fileName,
                            text: `erro_${imageCounter}`
                        });
                        totalUnread++;
                    }
                }
                
                // Atualiza progresso
                const progress = ((i + 1) / pages.length) * 100;
                if (progressText) progressText.textContent = `${Math.round(progress)}%`;
                if (progressFill) progressFill.style.width = `${progress}%`;
                
            } catch (pageError) {
                console.error(`Erro ao processar página ${pageNumber}:`, pageError);
            }
        }
        
        // Finalizar
        if (progressText) progressText.textContent = 'Concluído!';
        if (elements.progressDetail) {
            const blankInfo = totalBlank > 0 ? `; ${totalBlank} espa\u00e7o${totalBlank > 1 ? 's' : ''} em branco ignorado${totalBlank > 1 ? 's' : ''}` : '';
            elements.progressDetail.textContent = `${state.allBarcodes.length} c\u00f3digos processados${blankInfo}`;
        }
        if (elements.downloadAllContainer) elements.downloadAllContainer.style.display = state.allBarcodes.length > 0 ? 'block' : 'none';
        if (elements.emptyResults) elements.emptyResults.style.display = state.allBarcodes.length > 0 ? 'none' : 'block';
        
        // Atualizar stats
        if (elements.processingStats) elements.processingStats.style.display = 'grid';
        if (elements.readCount) elements.readCount.textContent = totalRead;
        if (elements.unreadCount) elements.unreadCount.textContent = totalUnread;
        
        debugLog('Processamento concluído. Total de códigos:', state.allBarcodes.length);
        debugLog(`Lidos: ${totalRead}, Não lidos: ${totalUnread}`);
        
    } catch (error) {
        console.error('Erro no processamento:', error);
        if (progressText) progressText.textContent = 'Erro!';
        alert('Ocorreu um erro durante o processamento: ' + error.message);
    } finally {
        clearInterval(state.processingTimer);
        state.processingTimer = null;
        await terminateOCRWorker();
    }
}

function openFilePicker(event) {
    if (event) event.stopPropagation();
    elements.pdfInput.click();
}

// ============================================
// Leitura rápida de códigos a partir do texto do PDF
// ============================================
async function extractCodesFromPage(page) {
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1 });
    const codesByValue = new Map();

    textContent.items.forEach((item, index) => {
        const matches = item.str.match(/EVB\s*0*\d+/gi);
        if (!matches) return;

        matches.forEach(match => {
            const value = normalizeEVBCode(match);
            if (!value) return;

            const current = codesByValue.get(value);
            const score = match.includes(' ') ? 1 : 2;
            const next = {
                value,
                x: item.transform[4] || 0,
                y: item.transform[5] || 0,
                score,
                index
            };

            if (!current || next.score > current.score) {
                codesByValue.set(value, next);
            }
        });
    });

    return sortCodesByGrid([...codesByValue.values()], viewport.height)
        .slice(0, BARCODE_GRID.total)
        .map(item => item.value);
}

function normalizeEVBCode(text) {
    const match = String(text).toUpperCase().replace(/\s+/g, '').match(/^EVB0*(\d+)$/);
    if (!match) return null;
    return `EVB${match[1].padStart(6, '0')}`;
}

function sortCodesByGrid(items, pageHeight) {
    if (items.length === 0) return [];

    const rowTolerance = pageHeight / (BARCODE_GRID.rows * 2);
    const rows = [];

    items
        .sort((a, b) => b.y - a.y || a.x - b.x || a.index - b.index)
        .forEach(item => {
            let row = rows.find(group => Math.abs(group.y - item.y) <= rowTolerance);
            if (!row) {
                row = { y: item.y, items: [] };
                rows.push(row);
            }
            row.items.push(item);
        });

    return rows
        .sort((a, b) => b.y - a.y)
        .flatMap(row => row.items.sort((a, b) => a.x - b.x || a.index - b.index));
}

function createResultItem(barcode) {
    const container = document.createElement('div');
    container.className = 'result-item';

    const barcodeWrapper = document.createElement('div');
    barcodeWrapper.className = 'barcode-wrapper barcode-unread';
    barcodeWrapper.appendChild(barcode.image);
    container.appendChild(barcodeWrapper);

    const infoText = document.createElement('div');
    infoText.className = 'barcode-info';
    infoText.textContent = 'Lendo código...';
    container.appendChild(infoText);

    const downloadButton = document.createElement('button');
    downloadButton.className = 'btn btn-sm download-btn';
    downloadButton.type = 'button';
    downloadButton.textContent = 'Baixar';
    downloadButton.style.display = 'none';
    container.appendChild(downloadButton);

    return { container, barcodeWrapper, infoText, downloadButton };
}

function markBarcodeRead(resultItem, text) {
    resultItem.barcodeWrapper.className = 'barcode-wrapper barcode-read';
    resultItem.infoText.classList.add('is-read');
    resultItem.infoText.textContent = text;
}

function markBarcodeUnread(resultItem, message) {
    resultItem.barcodeWrapper.className = 'barcode-wrapper barcode-unread';
    resultItem.infoText.classList.remove('is-read');
    resultItem.infoText.innerHTML = '';

    const error = document.createElement('span');
    error.className = 'barcode-error';
    error.textContent = message;
    resultItem.infoText.appendChild(error);
}

// ============================================
// Extração de Códigos de Barras (ORIGINAL)
// ============================================
function extractBarcodes(canvas) {
    const barcodes = [];
    const pageWidth = canvas.width;
    const pageHeight = canvas.height;
    let blankCount = 0;
    
    const barcodeWidth = (pageWidth / BARCODE_GRID.cols) * 0.8;
    const barcodeHeight = (pageHeight / BARCODE_GRID.rows) * 0.8;
    
    const offsets = [
        [
            { offsetX: 240, offsetY: 210 }, { offsetX: 240, offsetY: 200 }, { offsetX: 240, offsetY: 190 },
            { offsetX: 240, offsetY: 180 }, { offsetX: 240, offsetY: 170 }, { offsetX: 240, offsetY: 160 },
            { offsetX: 240, offsetY: 150 }, { offsetX: 240, offsetY: 140 }, { offsetX: 240, offsetY: 130 },
            { offsetX: 240, offsetY: 120 }, { offsetX: 240, offsetY: 110 }
        ],
        [
            { offsetX: 140, offsetY: 215 }, { offsetX: 140, offsetY: 205 }, { offsetX: 140, offsetY: 195 },
            { offsetX: 140, offsetY: 185 }, { offsetX: 140, offsetY: 175 }, { offsetX: 140, offsetY: 165 },
            { offsetX: 140, offsetY: 155 }, { offsetX: 140, offsetY: 145 }, { offsetX: 140, offsetY: 135 },
            { offsetX: 140, offsetY: 125 }, { offsetX: 140, offsetY: 115 }
        ],
        [
            { offsetX: 30, offsetY: 205 }, { offsetX: 30, offsetY: 195 }, { offsetX: 30, offsetY: 185 },
            { offsetX: 30, offsetY: 175 }, { offsetX: 30, offsetY: 165 }, { offsetX: 30, offsetY: 155 },
            { offsetX: 30, offsetY: 145 }, { offsetX: 30, offsetY: 135 }, { offsetX: 30, offsetY: 125 },
            { offsetX: 30, offsetY: 115 }, { offsetX: 30, offsetY: 105 }
        ],
        [
            { offsetX: -80, offsetY: 210 }, { offsetX: -80, offsetY: 200 }, { offsetX: -80, offsetY: 190 },
            { offsetX: -80, offsetY: 180 }, { offsetX: -80, offsetY: 170 }, { offsetX: -80, offsetY: 160 },
            { offsetX: -80, offsetY: 150 }, { offsetX: -80, offsetY: 140 }, { offsetX: -80, offsetY: 130 },
            { offsetX: -80, offsetY: 120 }, { offsetX: -80, offsetY: 110 }
        ]
    ];
    
    for (let row = 0; row < BARCODE_GRID.rows; row++) {
        for (let col = 0; col < BARCODE_GRID.cols; col++) {
            const { offsetX, offsetY } = offsets[col][row];
            const x = col * (pageWidth / BARCODE_GRID.cols) + offsetX;
            const y = row * (pageHeight / BARCODE_GRID.rows) + offsetY;
            
            const barcodeCanvas = document.createElement('canvas');
            barcodeCanvas.width = barcodeWidth;
            barcodeCanvas.height = barcodeHeight;
            const barcodeContext = barcodeCanvas.getContext('2d');
            
            barcodeContext.drawImage(
                canvas,
                x, y, barcodeWidth, barcodeHeight,
                0, 0, barcodeWidth, barcodeHeight
            );

            if (isMostlyBlankCanvas(barcodeCanvas)) {
                blankCount++;
                continue;
            }
            
            const src = barcodeCanvas.toDataURL('image/png');
            const barcodeImage = new Image();
            barcodeImage.src = src;
            barcodeImage.alt = `Código de barras ${barcodes.length + 1}`;

            barcodes.push({
                canvas: barcodeCanvas,
                image: barcodeImage,
                src,
                gridIndex: row * BARCODE_GRID.cols + col
            });
        }
    }
    
    barcodes.blankCount = blankCount;
    return barcodes;
}

function isMostlyBlankCanvas(canvas) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    const step = 4;
    let sampled = 0;
    let inkPixels = 0;
    let darkPixels = 0;

    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3];
            if (a < 10) continue;

            sampled++;
            const average = (r + g + b) / 3;
            if (r < 245 || g < 245 || b < 245) inkPixels++;
            if (average < 210) darkPixels++;
        }
    }

    if (sampled === 0) return true;

    const inkRatio = inkPixels / sampled;
    const darkRatio = darkPixels / sampled;
    return inkRatio < 0.004 && darkRatio < 0.0015;
}

// ============================================
// Leitura Quagga (ORIGINAL)
// ============================================
async function readBarcodeFromImage(image) {
    const Quagga = await ensureQuagga();

    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            debugLog('Timeout na leitura do código de barras');
            resolve(null);
        }, 1200);
        
        try {
            Quagga.decodeSingle({
                decoder: {
                    readers: ['code_128_reader', 'code_39_reader']
                },
                locate: true,
                src: image.src,
                numOfWorkers: 0,
                inputStream: {
                    size: 800
                }
            }, function(result) {
                clearTimeout(timeout);
                if (result && result.codeResult) {
                    resolve(result.codeResult.code);
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            clearTimeout(timeout);
            console.error('Erro no Quagga:', error);
            resolve(null);
        }
    });
}

// ============================================
// OCR Tesseract (fallback reutilizável)
// ============================================
async function getOCRWorker() {
    if (state.ocrWorker) return state.ocrWorker;

    const Tesseract = await ensureTesseract();
    const worker = await Tesseract.createWorker({
        logger: progress => {
            if (progress.status === 'recognizing text') {
                debugLog(`Progresso OCR: ${Math.round(progress.progress * 100)}%`);
            }
        }
    });

    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    await worker.setParameters({
        tessedit_char_whitelist: 'EVB0123456789 evb'
    });

    state.ocrWorker = worker;
    return worker;
}

async function readTextWithOCR(image) {
    try {
        const worker = await getOCRWorker();
        const { data: { text } } = await worker.recognize(image.canvas);
        debugLog('Texto detectado pelo OCR:', text);

        const cleanedText = cleanOCRText(text);
        debugLog('Texto limpo:', cleanedText);
        return cleanedText;
    } catch (error) {
        console.error('Erro no Tesseract OCR:', error);
        return null;
    }
}

async function terminateOCRWorker() {
    if (!state.ocrWorker) return;

    try {
        await state.ocrWorker.terminate();
    } catch (error) {
        console.warn('Não foi possível encerrar o OCR:', error);
    } finally {
        state.ocrWorker = null;
    }
}

// ============================================
// Limpeza OCR (ORIGINAL)
// ============================================
function cleanOCRText(text) {
    if (!text) return null;
    
    let cleaned = text.replace(/\s+/g, ' ').trim();
    
    const evbPatterns = [
        /EVB\s*\d+/i,
        /EVB\d+/i,
        /[Ee]VB\s*\d+/i,
    ];
    
    for (const pattern of evbPatterns) {
        const match = cleaned.match(pattern);
        if (match) {
            let result = match[0];
            result = result.replace(/\s/g, '');
            result = result.replace(/^eVB/i, 'EVB');
            return result.toUpperCase();
        }
    }
    
    const generalPatterns = [
        /[A-Z]{3}\s*\d+/i,
        /\b[A-Z0-9]{6,10}\b/i,
        /[A-Z]{2,3}\d{4,7}/i,
    ];
    
    for (const pattern of generalPatterns) {
        const matches = cleaned.match(pattern);
        if (matches) {
            let result = matches[0];
            result = result.replace(/\s/g, '');
            
            if (!result.startsWith('EVB') && result.length >= 6) {
                if (/^[A-Z]{2,3}\d+$/.test(result)) {
                    return result.toUpperCase();
                }
            }
            return result.toUpperCase();
        }
    }
    
    const finalResult = cleaned.replace(/\s/g, '').substring(0, 20);
    return finalResult || null;
}

// ============================================
// Correções (ORIGINAL)
// ============================================
function applyBasicCorrections(text) {
    if (!text) return null;
    
    let corrected = text.toUpperCase().replace(/\s+/g, '');
    
    const rejectedPatterns = [
        'IIIIIIM', 'IIIIIII', 'IIIIII', 'IIIII', 'IIII', 'III',
        'EVB00', 'EVB0', 'EVB'
    ];
    
    if (rejectedPatterns.includes(corrected)) {
        return null;
    }
    
    // CORREÇÃO: Remover letras entre EVB e números
    if (corrected.startsWith('EVB') && corrected.length > 3) {
        const afterEVB = corrected.substring(3);
        let numbersStartIndex = 0;
        
        for (let i = 0; i < afterEVB.length; i++) {
            if (!isNaN(afterEVB[i]) && afterEVB[i] !== ' ') {
                numbersStartIndex = i;
                break;
            }
        }
        
        if (numbersStartIndex > 0) {
            const numbers = afterEVB.substring(numbersStartIndex);
            corrected = 'EVB' + numbers;
        }
    }
    
    const evbWithLettersPattern = /^EVB([A-Z]+)(\d+)$/;
    const match = corrected.match(evbWithLettersPattern);
    if (match) {
        corrected = 'EVB' + match[2];
    }
    
    if (corrected.startsWith('EVB') && corrected.length > 3) {
        const prefix = corrected.substring(0, 3);
        const numbers = corrected.substring(3).replace(/O/g, '0');
        corrected = prefix + numbers;
    }
    
    if (corrected.startsWith('VB') && corrected.length >= 6) {
        corrected = 'E' + corrected;
    }
    
    if (corrected.startsWith('EVB') && corrected.length >= 9) {
        const numbersPart = corrected.substring(3);
        if (/[A-Z]/.test(numbersPart)) {
            const numbersOnly = numbersPart.replace(/[A-Z]/g, '');
            if (numbersOnly.length >= 6) {
                corrected = 'EVB' + numbersOnly;
            }
        }
    }

    const normalized = normalizeEVBCode(corrected);
    if (normalized) return normalized;
    
    return corrected;
}

function isValidCode(code) {
    if (!code || code.length < 6) return false;
    
    const invalidPatterns = [
        /^IIIIIIM/i,
        /^EVB00$/,
        /^[A-Z]*$/,
        /^\d*$/,
    ];
    
    for (const pattern of invalidPatterns) {
        if (pattern.test(code)) return false;
    }
    
    if (code.startsWith('EVB') && code.length > 3) return true;
    if (code.length >= 6 && code.length <= 20) return true;
    
    return false;
}

function generateSafeFilename(barcodeText) {
    if (!barcodeText) return null;
    
    const safeName = barcodeText
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 100);
    
    return safeName + '.png';
}

function createUniqueFilename(fileName) {
    if (!fileName) return createFallbackFilename(state.allBarcodes.length + 1);

    const extIndex = fileName.lastIndexOf('.');
    const ext = extIndex >= 0 ? fileName.substring(extIndex) : '';
    const base = extIndex >= 0 ? fileName.substring(0, extIndex) : fileName;
    let finalFileName = fileName;
    let counter = 1;

    while (state.usedFileNames.has(finalFileName)) {
        finalFileName = `${base}_${counter}${ext}`;
        counter++;
    }

    state.usedFileNames.add(finalFileName);
    return finalFileName;
}

function createFallbackFilename(index) {
    const prefixInput = document.getElementById('prefixInput');
    const prefix = (prefixInput?.value || 'EVB').replace(/[^a-zA-Z0-9_-]/g, '') || 'EVB';
    return createUniqueFilename(`${prefix}${String(index).padStart(4, '0')}.png`);
}

function downloadImage(imageSrc, fileName) {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// Download All e Utilitários
// ============================================
function handleDownloadAll() {
    if (state.allBarcodes.length === 0) {
        alert('Nenhum código de barras para baixar.');
        return;
    }
    
    const zip = new JSZip();
    const folder = zip.folder("codigos_de_barras");
    
    const totalBarcodes = state.allBarcodes.length;
    const readBarcodes = state.allBarcodes.filter(b => b.text && !b.text.startsWith('sequencial_') && !b.text.startsWith('erro_')).length;
    
    state.allBarcodes.forEach((barcode) => {
        const base64Data = barcode.src.split(',')[1];
        folder.file(barcode.name, base64Data, { base64: true });
    });
    
    zip.generateAsync({ type: "blob" }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `codigos_de_barras_${readBarcodes}_lidos_de_${totalBarcodes}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`Download concluído!\nCódigos lidos: ${readBarcodes}/${totalBarcodes} (${Math.round((readBarcodes/totalBarcodes)*100)}%)`);
    });
}

function updateElapsedTime() {
    if (state.processingStartTime && elements.elapsedTime) {
        const elapsed = Math.floor((Date.now() - state.processingStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        elements.elapsedTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Funções auxiliares para UI
function selectAllPages() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = true);
}

function deselectAllPages() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = false);
}

function invertSelection() {
    document.querySelectorAll('input[name="page"]').forEach(cb => cb.checked = !cb.checked);
}

function clearResults() {
    elements.imageContainer.innerHTML = '';
    if (elements.emptyResults) elements.emptyResults.style.display = 'block';
    if (elements.downloadAllContainer) elements.downloadAllContainer.style.display = 'none';
    if (elements.processingStats) elements.processingStats.style.display = 'none';
    state.allBarcodes = [];
}
