const GOOGLE_SHEET_ID = "1Q61RoCbEy3MUB9pwqdvGXID11X0vcPuhpRpvF59QvlQ";
const GOOGLE_SHEETS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"];

let dadosCompletos = [];
let dadosFiltrados = [];
let pendingUrlSelection = null;

const elements = {
    fileInput: document.getElementById("csvFile"),
    loadGoogleSheet: document.getElementById("loadGoogleSheet"),
    sourceStatus: document.getElementById("sourceStatus"),
    fileSelected: document.getElementById("fileSelected"),
    fileName: document.getElementById("fileName"),
    filterButton: document.getElementById("filtrar"),
    generatePdfButton: document.getElementById("gerar-pdf"),
    labelsContainer: document.getElementById("etiquetas-container"),
    previewCard: document.getElementById("previewCard"),
    emptyPreview: document.getElementById("emptyPreview"),
    labelsCount: document.getElementById("etiquetasCount"),
    idsEspecificos: document.getElementById("idEspecificos"),
    idInicio: document.getElementById("idInicio"),
    idFim: document.getElementById("idFim")
};

document.addEventListener("DOMContentLoaded", initializeTool);

function initializeTool() {
    elements.fileInput?.addEventListener("change", handleFileChange);
    elements.loadGoogleSheet?.addEventListener("click", () => carregarMapaColecaoGoogle({ silent: false }));
    elements.filterButton?.addEventListener("click", filtrarEtiquetas);
    elements.generatePdfButton?.addEventListener("click", gerarPDF);

    const params = new URLSearchParams(window.location.search);
    const urlBoxes = params.get("boxes") || params.get("box");
    if (urlBoxes) {
        pendingUrlSelection = {
            boxes: parseIdsEspecificos(urlBoxes),
            autoPdf: params.get("auto") === "pdf"
        };
        if (elements.idsEspecificos) elements.idsEspecificos.value = pendingUrlSelection.boxes.join(", ");
        carregarMapaColecaoGoogle({ silent: true, fromUrl: true });
    }
}

async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        setSourceStatus("Lendo planilha local...");
        dadosCompletos = await carregarPlanilha(file);
        dadosFiltrados = [];
        limparPreview();
        updateSelectedFile(file.name);
        setSourceStatus(`Planilha local carregada: ${dadosCompletos.length} caixa(s) encontrada(s).`);
    } catch (error) {
        console.error("Erro ao ler a planilha:", error);
        setSourceStatus(error.message || "Erro ao ler a planilha.", "error");
        alert(error.message || "Erro ao ler a planilha.");
    }
}

async function carregarPlanilha(file) {
    const extension = file.name.split(".").pop().toLowerCase();

    if (extension === "csv") return carregarCSV(file);
    if (extension === "xls" || extension === "xlsx") return carregarExcel(file);

    throw new Error("Formato não aceito. Use .xls, .xlsx ou .csv.");
}

function carregarCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            delimiter: "",
            skipEmptyLines: true,
            complete(results) {
                if (results.errors.length > 0) {
                    reject(new Error("Erro ao processar o CSV. Verifique se a planilha possui cabeçalho."));
                    return;
                }
                resolve(normalizarLinhasPlanilha(results.data));
            },
            error(error) {
                reject(new Error("Erro ao ler o arquivo CSV: " + error.message));
            }
        });
    });
}

function carregarExcel(file) {
    if (!window.XLSX) throw new Error("A biblioteca de leitura de Excel não foi carregada.");

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
            try {
                const workbook = XLSX.read(event.target.result, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    reject(new Error("A planilha não possui abas."));
                    return;
                }

                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                resolve(normalizarLinhasPlanilha(rows));
            } catch (error) {
                reject(new Error("Erro ao processar Excel. Verifique se o arquivo está íntegro."));
            }
        };

        reader.onerror = () => reject(new Error("Erro ao ler o arquivo Excel."));
        reader.readAsArrayBuffer(file);
    });
}

function normalizarLinhasPlanilha(rows) {
    return rows
        .filter(row => Object.values(row).some(value => String(value ?? "").trim() !== ""))
        .map(row => {
            const id = getRowId(row);
            const familia = getCell(row, ["Família", "Familia", "Famílias", "Familias", "Família(s)", "Familia(s)"]);
            const intervalos = getCell(row, ["Intervalos", "Intervalo", "Intervalo(s)", "Conteúdo", "Conteudo"]);
            return {
                ...row,
                ID: normalizarIdCaixa(id),
                "Família": String(familia || "").trim(),
                Intervalos: String(intervalos || "").trim()
            };
        })
        .filter(row => row.ID && (row["Família"] || row.Intervalos));
}

async function carregarMapaColecaoGoogle(options = {}) {
    if (!options.silent) setSourceStatus("Atualizando pelas abas A1-A8 do Google Sheets...");
    setGoogleButtonLoading(true);

    try {
        const records = await carregarCaixasDoGoogleSheets();
        if (records.length < 20) throw new Error("Poucas caixas foram encontradas. Verifique se a planilha publicada está acessível.");

        dadosCompletos = records;
        dadosFiltrados = [];
        limparPreview();
        updateSelectedFile("Google Sheets - Mapa da Coleção");
        setSourceStatus(`Mapa da coleção atualizado: ${records.length} etiqueta(s) disponível(is).`);

        if (pendingUrlSelection?.boxes?.length) {
            dadosFiltrados = filtrarPorIds(pendingUrlSelection.boxes);
            criarEtiquetas(dadosFiltrados);
            if (pendingUrlSelection.autoPdf && dadosFiltrados.length) {
                window.setTimeout(() => gerarPDF(), 500);
            }
            pendingUrlSelection = null;
        }
    } catch (error) {
        console.error("Falha ao carregar Google Sheets:", error);
        setSourceStatus("Não foi possível atualizar pelo Google Sheets. Use uma planilha local ou tente novamente.", "error");
    } finally {
        setGoogleButtonLoading(false);
    }
}

async function carregarCaixasDoGoogleSheets() {
    const tables = [];
    const errors = [];

    for (const sheetName of GOOGLE_SHEETS) {
        try {
            const table = await loadGoogleSheetTable(GOOGLE_SHEET_ID, sheetName);
            tables.push({ sheetName, rows: convertGoogleTableToRows(table) });
        } catch (error) {
            errors.push(`${sheetName}: ${error.message}`);
        }
    }

    if (tables.length === 0) {
        throw new Error(errors.join("; ") || "Nenhuma aba foi carregada.");
    }

    return buildLabelRowsFromSheetTables(tables);
}

function loadGoogleSheetTable(spreadsheetId, sheetName) {
    return new Promise((resolve, reject) => {
        const callbackName = `evbLabelsCollection_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error(`Tempo excedido ao carregar ${sheetName}.`));
        }, 12000);

        function cleanup() {
            window.clearTimeout(timeout);
            delete window[callbackName];
            script.remove();
        }

        window[callbackName] = payload => {
            cleanup();
            if (payload?.status === "error") {
                reject(new Error(payload.errors?.[0]?.detailed_message || `Erro ao carregar ${sheetName}.`));
                return;
            }
            resolve(payload.table);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error(`Erro de conexão ao carregar ${sheetName}.`));
        };

        const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq`;
        const params = new URLSearchParams({
            tqx: `out:json;responseHandler:${callbackName}`,
            sheet: sheetName,
            cacheBust: Date.now().toString()
        });
        script.src = `${base}?${params.toString()}`;
        document.head.appendChild(script);
    });
}

function convertGoogleTableToRows(table) {
    const columns = table?.cols || [];
    const rows = table?.rows || [];
    return rows.map(row => columns.map((column, index) => {
        const cell = row.c?.[index];
        return cell?.f ?? cell?.v ?? "";
    }));
}

function buildLabelRowsFromSheetTables(sheetTables) {
    const labels = [];

    sheetTables.forEach(({ sheetName, rows }) => {
        const spaceCount = getCollectionSpaceCount(sheetName);
        const contentStartRowIndex = detectCollectionContentStartRow(rows, spaceCount);

        for (let shelfNumber = 1; shelfNumber <= 6; shelfNumber += 1) {
            const contentRowIndex = contentStartRowIndex + ((shelfNumber - 1) * 2);
            const locationRowIndex = contentRowIndex + 1;
            const shelfId = cleanCell(rows[locationRowIndex]?.[0]) || `P${shelfNumber}`;

            for (let spaceIndex = 1; spaceIndex <= spaceCount; spaceIndex += 1) {
                const startColumnIndex = 1 + ((spaceIndex - 1) * 5);
                const box = normalizarIdCaixa(cleanCell(rows[contentRowIndex]?.[startColumnIndex]));
                if (!box) continue;

                const families = splitLines(rows[contentRowIndex]?.[startColumnIndex + 1], { keepBlank: true });
                const intervals = splitLines(rows[contentRowIndex]?.[startColumnIndex + 2], { keepBlank: true });
                const pairs = buildContentPairs(families, intervals);

                labels.push({
                    ID: box,
                    "Família": pairs.map(pair => pair.displayFamily).join("\n"),
                    Intervalos: pairs.map(pair => pair.content).join("\n"),
                    Localização: `${sheetName}-${shelfId}-E${spaceIndex}`,
                    Armário: sheetName,
                    Prateleira: shelfId,
                    Espaço: `E${spaceIndex}`
                });
            }
        }
    });

    return labels.sort((a, b) => normalizarIdCaixa(a.ID).localeCompare(normalizarIdCaixa(b.ID), "pt-BR", { numeric: true }));
}

function buildContentPairs(families, intervals) {
    const length = Math.max(families.length, intervals.length);
    const rows = [];
    let currentFamily = "";

    for (let index = 0; index < length; index += 1) {
        const family = cleanCell(families[index]);
        const content = cleanCell(intervals[index]);
        if (family) currentFamily = family;
        if (!currentFamily && !content) continue;

        rows.push({
            family: currentFamily,
            displayFamily: family || "",
            content
        });
    }

    return rows;
}

function getCollectionSpaceCount(cabinetId) {
    const cabinetNumber = Number(String(cabinetId).replace(/\D/g, ""));
    return cabinetNumber >= 6 ? 2 : 4;
}

function detectCollectionContentStartRow(rows, spaceCount) {
    for (const rowIndex of [0, 1, 2]) {
        const row = rows[rowIndex] || [];
        const hasBox = Array.from({ length: spaceCount }, (_, index) => 1 + (index * 5))
            .some(columnIndex => /^CX-\d+/i.test(cleanCell(row[columnIndex])));
        if (hasBox) return rowIndex;
    }
    return 1;
}

function filtrarEtiquetas() {
    if (dadosCompletos.length === 0) {
        alert("Carregue uma planilha ou atualize pelo mapa da coleção primeiro.");
        return;
    }

    const idsEspecificos = parseIdsEspecificos(elements.idsEspecificos?.value || "");
    let idInicio = elements.idInicio?.value.trim() || "";
    let idFim = elements.idFim?.value.trim() || "";

    if (idsEspecificos.length > 0) {
        dadosFiltrados = filtrarPorIds(idsEspecificos);
        finalizarFiltro(dadosFiltrados, `Nenhum registro encontrado para: ${idsEspecificos.join(", ")}`);
        return;
    }

    if (!idInicio && !idFim) {
        alert("Informe uma caixa específica ou um intervalo inicial/final.");
        return;
    }

    if (idInicio && !idFim) {
        const idUnico = normalizarIdCaixa(idInicio);
        dadosFiltrados = filtrarPorIds([idUnico]);
        finalizarFiltro(dadosFiltrados, `Nenhum registro encontrado para ${idUnico}`);
        return;
    }

    if (!idInicio || !idFim) {
        alert("Para filtrar por intervalo, informe o ID inicial e final.");
        return;
    }

    idInicio = normalizarIdCaixa(idInicio);
    idFim = normalizarIdCaixa(idFim);
    dadosFiltrados = dadosCompletos.filter(row => {
        const id = normalizarIdCaixa(getRowId(row));
        return id >= idInicio && id <= idFim;
    });

    finalizarFiltro(dadosFiltrados, `Nenhum registro encontrado entre ${idInicio} e ${idFim}`);
}

function filtrarPorIds(ids) {
    const set = new Set(ids.map(normalizarIdCaixa));
    return dadosCompletos.filter(row => set.has(normalizarIdCaixa(getRowId(row))));
}

function parseIdsEspecificos(value) {
    return String(value || "")
        .split(/[;,\s]+/)
        .map(item => normalizarIdCaixa(item))
        .filter(Boolean);
}

function normalizarIdCaixa(value) {
    const raw = String(value ?? "").trim().toUpperCase();
    if (!raw) return "";
    const numberMatch = raw.match(/\d+/);
    if (!numberMatch) return raw;
    return "CX-" + numberMatch[0].padStart(3, "0");
}

function getRowId(row) {
    return getCell(row, ["ID", "Id", "id", "Caixa", "caixa", "CAIXA"]);
}

function getCell(row, names) {
    for (const name of names) {
        if (row[name] !== undefined && row[name] !== null && String(row[name]).trim() !== "") {
            return row[name];
        }
    }

    const normalizedNames = names.map(normalizeColumnName);
    const matchedKey = Object.keys(row).find(key => normalizedNames.includes(normalizeColumnName(key)));
    return matchedKey ? row[matchedKey] : "";
}

function normalizeColumnName(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase();
}

function cleanCell(value) {
    return String(value ?? "").trim();
}

function splitLines(value, options = {}) {
    const lines = cleanCell(value)
        .split(/\r?\n/)
        .map(item => item.trim());
    return options.keepBlank ? lines : lines.filter(Boolean);
}

function finalizarFiltro(dados, mensagemVazia) {
    if (dados.length === 0) {
        limparPreview();
        alert(mensagemVazia);
        return;
    }
    criarEtiquetas(dados);
}

function limparPreview() {
    if (elements.labelsContainer) elements.labelsContainer.innerHTML = "";
    if (elements.previewCard) elements.previewCard.style.display = "none";
    if (elements.emptyPreview) elements.emptyPreview.style.display = "block";
    if (elements.labelsCount) elements.labelsCount.textContent = "";
}

function criarEtiquetas(dados) {
    if (!elements.labelsContainer) return;

    elements.labelsContainer.innerHTML = "";

    dados.forEach(row => {
        const familia = getCell(row, ["Família", "Familia", "Famílias", "Familias", "Família(s)", "Familia(s)"]);
        const intervalos = getCell(row, ["Intervalos", "Intervalo", "Intervalo(s)"]);
        const id = normalizarIdCaixa(getRowId(row));

        const etiqueta = document.createElement("div");
        etiqueta.className = "etiqueta-herbario";
        etiqueta.innerHTML = `
            <div class="coluna-familia">
                <div class="cabecalho">
                    <div class="id">ID: ${escapeHTML(id)}</div>
                </div>
                <div class="titulo-coluna">FAMÍLIA(S)</div>
                <div class="conteudo-familia">${formatarTextoMultiLinha(familia)}</div>
            </div>
            <div class="coluna-intervalos">
                <div class="cabecalho">
                    <div class="id" style="visibility: hidden;">ID: ${escapeHTML(id)}</div>
                </div>
                <div class="titulo-coluna">INTERVALO(S)</div>
                <div class="conteudo-intervalos">${formatarTextoMultiLinha(intervalos)}</div>
                <img src="LogoEVB.png" alt="Logo" class="logo-canto">
            </div>
        `;

        elements.labelsContainer.appendChild(etiqueta);
        ajustarFonteParaConteudo(etiqueta);
    });

    atualizarPreview(dados.length);
}

function atualizarPreview(count) {
    if (elements.previewCard) elements.previewCard.style.display = "block";
    if (elements.emptyPreview) elements.emptyPreview.style.display = count > 0 ? "none" : "block";
    if (elements.labelsCount) elements.labelsCount.textContent = `${count} etiqueta${count === 1 ? "" : "s"}`;
}

function formatarTextoMultiLinha(texto) {
    if (!texto) return "—";
    return escapeHTML(texto).replace(/\r?\n/g, "<br>");
}

async function gerarPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        alert("A biblioteca jsPDF não foi carregada.");
        return;
    }

    const etiquetas = Array.from(document.querySelectorAll(".etiqueta-herbario"));
    if (etiquetas.length === 0) {
        alert("Nenhuma etiqueta para gerar.");
        return;
    }

    const larguraEtiqueta = 140;
    const alturaEtiqueta = 100;
    const margemX = 5;
    const margemY = 5;
    const espacamentoX = 0;
    const espacamentoY = 0;

    const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
    const alturaPagina = doc.internal.pageSize.getHeight();

    let x = margemX;
    let y = margemY;
    let contador = 0;

    for (const etiqueta of etiquetas) {
        const canvas = await html2canvas(etiqueta, { scale: 2, backgroundColor: "#ffffff" });
        const imgData = canvas.toDataURL("image/png", 0.92);
        doc.addImage(imgData, "PNG", x, y, larguraEtiqueta, alturaEtiqueta);

        contador += 1;
        if (contador === 2) {
            contador = 0;
            x = margemX;
            y += alturaEtiqueta + espacamentoY;
            if (y + alturaEtiqueta > alturaPagina - margemY) {
                doc.addPage();
                y = margemY;
            }
        } else {
            x += larguraEtiqueta + espacamentoX;
        }
    }

    const suffix = etiquetas.length === 1 ? normalizarIdCaixa(getRowId(dadosFiltrados[0] || {})).toLowerCase() : "selecionadas";
    doc.save(`etiquetas_colecao_${suffix || "evb"}.pdf`);
}

function ajustarFonteParaConteudo(etiqueta) {
    const contentBlocks = [
        etiqueta.querySelector(".conteudo-familia"),
        etiqueta.querySelector(".conteudo-intervalos")
    ].filter(Boolean);

    if (contentBlocks.length === 0) return;

    const headers = Array.from(etiqueta.querySelectorAll(".id"));
    const titles = Array.from(etiqueta.querySelectorAll(".titulo-coluna"));
    const fontSizes = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3];
    const compactTitleSizes = [18, 16, 14, 12, 11, 10, 9, 8, 7, 6];
    const originalOverflow = contentBlocks.map(block => block.style.overflowY);

    contentBlocks.forEach(block => {
        block.style.overflowY = "visible";
    });

    let fitted = false;
    for (const size of fontSizes) {
        setContentFontSize(contentBlocks, size, Math.max(size * 1.12, size + 1));
        if (!hasOverflow(contentBlocks)) {
            fitted = true;
            break;
        }
    }

    etiqueta.classList.toggle("is-label-compact", !fitted);

    if (!fitted) {
        for (const size of compactTitleSizes) {
            titles.forEach(title => {
                title.style.fontSize = `${size}px`;
                title.style.lineHeight = `${Math.max(size * 1.1, size + 1)}px`;
            });
            headers.forEach(header => {
                header.style.fontSize = `${Math.max(size - 2, 3)}px`;
                header.style.lineHeight = `${Math.max(size, 9)}px`;
            });
            if (!hasOverflow(contentBlocks)) break;
        }
    }

    contentBlocks.forEach((block, index) => {
        block.style.overflowY = originalOverflow[index] || "hidden";
    });
}

function setContentFontSize(blocks, fontSize, lineHeight) {
    blocks.forEach(block => {
        block.style.fontSize = `${fontSize}px`;
        block.style.lineHeight = `${lineHeight}px`;
    });
}

function hasOverflow(blocks) {
    return blocks.some(block => block.scrollHeight > block.clientHeight + 1 || block.scrollWidth > block.clientWidth + 1);
}

function setSourceStatus(message, type = "info") {
    if (!elements.sourceStatus) return;
    elements.sourceStatus.textContent = message;
    elements.sourceStatus.dataset.status = type;
}

function setGoogleButtonLoading(isLoading) {
    if (!elements.loadGoogleSheet) return;
    elements.loadGoogleSheet.disabled = isLoading;
    elements.loadGoogleSheet.innerHTML = isLoading
        ? '<i class="fas fa-spinner fa-spin"></i> Atualizando...'
        : '<i class="fas fa-rotate"></i> Atualizar pelo mapa da coleção';
}

function updateSelectedFile(name) {
    if (elements.fileName) elements.fileName.textContent = name;
    if (elements.fileSelected) elements.fileSelected.style.display = "flex";
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
