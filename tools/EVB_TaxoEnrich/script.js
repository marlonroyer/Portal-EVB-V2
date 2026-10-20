/* ============================================================================
   CONFIGURAÇÃO
   ============================================================================ */
const GBIF_MATCH_V2 = 'https://api.gbif.org/v2/species/match';
const GBIF_MATCH_V1 = 'https://api.gbif.org/v1/species/match';
const COL_MATCH      = 'https://api.checklistbank.org/dataset/3LR/match/nameusage';
const DELAY_MS      = 350;
const MAX_RETRIES   = 3;
const TIMEOUT_MS    = 20000;

const TARGET_RANKS = [
  { rank: 'KINGDOM', field: 'kingdom' },
  { rank: 'PHYLUM',  field: 'phylum'  },
  { rank: 'CLASS',   field: 'class'   },
  { rank: 'ORDER',   field: 'order'   },
  { rank: 'FAMILY',  field: 'family'  },
  { rank: 'GENUS',   field: 'genus'   },
  { rank: 'SPECIES', field: 'species' }
];

const NAME_ALIASES = [
  'scientificname','scientific_name','nomecientifico','nome_cientifico',
  'nome científico','nome cientifico','taxon','táxon','taxonname'
];

/* ============================================================================
   ESTADO GLOBAL
   ============================================================================ */
let workbook    = null;
let sheetName   = null;
let rawData     = [];
let columns     = [];
let nameColumn  = null;
let familyCol   = null;
let genusCol    = null;
let sp1Col      = null;
let sp2Col      = null;
let author1Col  = null;
let splitMode   = false;
let enrichedData  = [];
let taxonomyData  = [];
let reviewData    = [];
let statisticsData= [];
let prontoGBIF    = [];
let prontoCOL     = [];
let prontoCons    = [];
let cache = new Map();
let processing = false;
let lastRunStamp = '';   // usado nos nomes de arquivo

/* ============================================================================
   DOM
   ============================================================================ */
const $ = id => document.getElementById(id);
const fileInput   = $('fileInput');
const cacheInput  = $('cacheInput');
const uploadArea  = $('uploadArea');
const fileInfo    = $('fileInfo');
const btnEnrich   = $('btnEnrich');
const btnClear    = $('btnClear');
const btnExportCache = $('btnExportCache');
const btnImportCache = $('btnImportCache');
const statusMsg   = $('statusMsg');
const progressWrap= $('progressWrap');
const progressBar = $('progressBar');
const progressText= $('progressText');
const logPanel    = $('logPanel');
const logEl       = $('log');
const colsInfo    = $('colsInfo');
const statsEl     = $('stats');
const tabsEl      = $('tabs');
const dlAudit     = $('dlAudit');
const dlPronto    = $('dlPronto');

/* ============================================================================
   UTILITÁRIOS
   ============================================================================ */
const normKey = s => String(s||'')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[\s_\-\.]+/g,'').trim();

const delay = ms => new Promise(r => setTimeout(r, ms));

function showStatus(msg, type='info'){
  statusMsg.textContent = msg;
  statusMsg.className = 'status-msg ' + type;
}
function hideStatus(){ statusMsg.className = 'status-msg'; statusMsg.style.display='none'; }
function setProgress(pct, text){
  progressWrap.style.display = 'block';
  progressBar.style.width = pct + '%';
  if (text) progressText.textContent = text;
}
function hideProgress(){ progressWrap.style.display='none'; progressBar.style.width='0%'; }
function log(msg, cls='info'){
  logPanel.style.display = 'block';
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logEl.appendChild(d);
  logEl.scrollTop = logEl.scrollHeight;
}
function clearLog(){ logEl.innerHTML=''; logPanel.style.display='none'; }
function pct(n, d){ return d ? (100*n/d).toFixed(1)+'%' : ''; }

function stampNow(){
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
}

/* ============================================================================
   INTERPRETAÇÃO EXPLÍCITA DO JABOT
   ============================================================================ */
function interpretJABOT(row){
  const familyRaw = familyCol  ? String(row[familyCol]  || '').trim() : '';
  const genusRaw  = genusCol   ? String(row[genusCol]   || '').trim() : '';
  const sp1Raw    = sp1Col     ? String(row[sp1Col]     || '').trim() : '';
  const sp2Raw    = sp2Col     ? String(row[sp2Col]     || '').trim() : '';
  const authorRaw = author1Col ? String(row[author1Col] || '').trim() : '';

  const normFlags = [];
  let sp1 = sp1Raw;
  let sp2 = sp2Raw;
  const prefixRegex = /^(cf\.|aff\.)\s*/i;

  if (prefixRegex.test(sp1)){
    const m = sp1.match(prefixRegex)[0].trim().toLowerCase();
    normFlags.push(m + ' removido de sp1');
    sp1 = sp1.replace(prefixRegex,'').trim();
  }
  if (prefixRegex.test(sp2)){
    const m = sp2.match(prefixRegex)[0].trim().toLowerCase();
    normFlags.push(m + ' removido de sp2');
    sp2 = sp2.replace(prefixRegex,'').trim();
  }

  let queryName = '';
  let queryLevel = 'NAO_CONSULTAVEL';
  let jabotLevel = 'NAO_CONSULTAVEL';

  if (genusRaw && sp1){
    queryName = [genusRaw, sp1, sp2].filter(Boolean).join(' ').replace(/\s+/g,' ');
    queryLevel = 'SPECIES';
    jabotLevel = 'ESPECIE';
  } else if (genusRaw){
    queryName = genusRaw;
    queryLevel = 'GENUS';
    jabotLevel = 'GENERO';
  } else if (familyRaw){
    queryName = familyRaw;
    queryLevel = 'FAMILY';
    jabotLevel = 'FAMILIA';
  } else {
    queryName = '';
    queryLevel = 'NAO_CONSULTAVEL';
    jabotLevel = 'NAO_CONSULTAVEL';
  }

  const contextGenus  = (queryLevel === 'SPECIES') ? genusRaw : '';
  const contextFamily = (queryLevel === 'SPECIES' || queryLevel === 'GENUS') ? familyRaw : '';

  return {
    familyRaw, genusRaw, sp1Raw, sp2Raw, authorRaw,
    sp1Query: sp1, sp2Query: sp2,
    contextGenus, contextFamily,
    queryName, queryLevel, jabotLevel,
    normalization: normFlags.join('; ')
  };
}

/* ============================================================================
   LEITURA DA PLANILHA
   ============================================================================ */
fileInput.addEventListener('change', handleFile);
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.background='#e8f5e9'; });
uploadArea.addEventListener('dragleave', () => { uploadArea.style.background=''; });
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.style.background='';
  if (e.dataTransfer.files.length){ fileInput.files = e.dataTransfer.files; handleFile(); }
});

function handleFile(){
  if (processing){
    showStatus('Aguarde a validação atual terminar antes de carregar outra planilha.', 'warn');
    return;
  }
  const file = fileInput.files[0];
  if (!file) return;

  fileInfo.textContent = `📄 ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
  hideStatus(); clearLog(); resetResults();

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = new Uint8Array(e.target.result);
      workbook = XLSX.read(data, { type:'array', codepage:65001 });
      sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rawData = XLSX.utils.sheet_to_json(sheet, { defval:'', raw:false });
      columns = rawData.length ? Object.keys(rawData[0]) : [];

      if (!columns.length){ showStatus('⚠️ Planilha vazia ou sem cabeçalhos.', 'error'); return; }

      log(`Aba "${sheetName}" — ${rawData.length} registros, ${columns.length} colunas.`, 'ok');
      log(`Colunas detectadas: ${columns.join(' | ')}`, 'info');

      familyCol  = columns.find(c => normKey(c) === 'family')  || null;
      genusCol   = columns.find(c => normKey(c) === 'genus')   || null;
      sp1Col     = columns.find(c => normKey(c) === 'sp1')     || null;
      sp2Col     = columns.find(c => normKey(c) === 'sp2')     || null;
      author1Col = columns.find(c => normKey(c) === 'author1') || null;

      nameColumn = columns.find(c => NAME_ALIASES.includes(normKey(c))) || null;

      splitMode = !!(genusCol && sp1Col);
      if (!splitMode && !nameColumn){
        nameColumn = columns.find(c => /espec|nome|taxon|species/i.test(normKey(c))) || columns[0];
        splitMode = false;
      }

      const lines = [];
      const escapeHtml = value => String(value || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      if (splitMode){
        lines.push(`<strong>Modo JABOT (split):</strong> nome científico = <code>${escapeHtml(genusCol)}</code> + <code>${escapeHtml(sp1Col)}</code>${sp2Col ? ' + <code>'+escapeHtml(sp2Col)+'</code>' : ''}`);
        lines.push(`<strong>Família JABOT:</strong> <code>${escapeHtml(familyCol || 'não encontrada')}</code>`);
        lines.push(`<strong>Autor JABOT (preservado, não usado na consulta):</strong> <code>${escapeHtml(author1Col || 'não encontrado')}</code>`);
      } else {
        lines.push(`<strong>Modo coluna única:</strong> <code>${escapeHtml(nameColumn)}</code>`);
      }
      colsInfo.style.display = 'block';
      colsInfo.innerHTML = lines.join('<br>');

      log(splitMode
        ? `Modo JABOT split ativado. Nome = "${genusCol}" + "${sp1Col}"${sp2Col ? ' + "'+sp2Col+'"' : ''}`
        : `Modo coluna única: "${nameColumn}"`, 'ok');

      if (splitMode && rawData.length){
        log('--- Exemplos de interpretação (primeiras 3 linhas) ---', 'info');
        for (let i = 0; i < Math.min(3, rawData.length); i++){
          const it = interpretJABOT(rawData[i]);
          log(
            `L${i+1}: family="${it.familyRaw}" genus="${it.genusRaw}" sp1="${it.sp1Raw}" ` +
            `→ query="${it.queryName}" (${it.queryLevel})` +
            (it.normalization ? ` [${it.normalization}]` : ''),
            'info'
          );
        }
      }

      showStatus(`✅ ${rawData.length} registros carregados. Pronto para validar.`, 'success');

      renderTable('enriq', rawData, columns, new Set());
      tabsEl.style.display = 'flex';
      btnEnrich.disabled = false;
      btnClear.disabled = false;
      btnExportCache.disabled = false;
      btnImportCache.disabled = false;
      dlAudit.style.display = 'none';
      dlPronto.style.display = 'none';
    } catch(err){
      console.error(err);
      log('Erro ao ler arquivo: ' + err.message, 'err');
      showStatus('❌ Erro ao ler planilha: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
}

/* ============================================================================
   RENDERIZAÇÃO
   ============================================================================ */
function renderTable(tab, data, cols, filledSet = new Set()){
  const map = {
    enriq:['headEnriq','bodyEnriq','tableWrapEnriq'],
    taxo:['headTaxo','bodyTaxo','tableWrapTaxo'],
    rev:['headRev','bodyRev','tableWrapRev'],
    stat:['headStat','bodyStat','tableWrapStat'],
    prontoGBIF:['headProntoGBIF','bodyProntoGBIF','tableWrapProntoGBIF'],
    prontoCOL:['headProntoCOL','bodyProntoCOL','tableWrapProntoCOL'],
    prontoCons:['headProntoCons','bodyProntoCons','tableWrapProntoCons']
  };
  const [hId, bId, wId] = map[tab];
  const head = $(hId), body = $(bId), wrap = $(wId);
  head.innerHTML = ''; body.innerHTML = '';
  if (!data.length){ wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  const trh = document.createElement('tr');
  cols.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    if (filledSet.has(c)) th.classList.add('filled');
    trh.appendChild(th);
  });
  head.appendChild(trh);

  const frag = document.createDocumentFragment();
  const limit = 500;
  data.slice(0, limit).forEach(row => {
    const tr = document.createElement('tr');
    cols.forEach(c => {
      const td = document.createElement('td');
      const v = row[c];
      td.textContent = (v === undefined || v === null) ? '' : v;
      if (filledSet.has(c) && td.textContent) td.classList.add('filled');
      tr.appendChild(td);
    });
    frag.appendChild(tr);
  });
  body.appendChild(frag);

  if (data.length > limit){
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length;
    td.style.textAlign = 'center';
    td.style.color = '#666';
    td.textContent = `… exibindo ${limit} de ${data.length} linhas. Baixe o XLSX para ver tudo.`;
    tr.appendChild(td); body.appendChild(tr);
  }

  const valIdx = cols.indexOf('EVB_validation');
  if (valIdx >= 0){
    body.querySelectorAll('tr').forEach(tr => {
      const td = tr.children[valIdx];
      if (!td) return;
      const v = (td.textContent||'').toUpperCase();
      if (!v) return;
      td.innerHTML = '';
      const sp = document.createElement('span');
      sp.className = 'badge ' + (
        v === 'CONCORDANTE' ? 'b-conc' :
        v === 'PARCIAL'     ? 'b-parc' :
        v === 'DIVERGENTE'  ? 'b-div'  :
        v === 'ERRO'        ? 'b-erro' : 'b-nao'
      );
      sp.textContent = v;
      td.appendChild(sp);
    });
  }
}

document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    $(t.dataset.tab).classList.add('active');
  });
});

/* ============================================================================
   CHAMADA À API
   ============================================================================ */
async function fetchMatch(source, queryName, contextGenus, contextFamily){
  const g = contextGenus  || '';
  const f = contextFamily || '';
  const key = `${source}|${normKey(queryName)}|${normKey(g)}|${normKey(f)}`;
  if (cache.has(key)) return cache.get(key);

  const query = async (baseUrl, paramName) => {
    const params = new URLSearchParams({ [paramName]: queryName });
    if (g) params.set('genus',  g);
    if (f) params.set('family', f);
    const url = `${baseUrl}?${params.toString()}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++){
    try {
      let res;
      if (source === 'COL'){
        res = await query(COL_MATCH, 'q');
      } else {
        res = await query(GBIF_MATCH_V2, 'scientificName');
      }
      if (source === 'GBIF' && res.status === 404){
        res = await query(GBIF_MATCH_V1, 'name');
      }
      if (res.status === 429){
        const wait = 2000 * (attempt + 1);
        log(`⚠️ ${source} 429. Aguardando ${wait}ms…`, 'warn');
        await delay(wait); continue;
      }
      if (res.status >= 500){
        const wait = 1000 * (attempt + 1);
        log(`⚠️ ${source} erro ${res.status}. Retry em ${wait}ms…`, 'warn');
        await delay(wait); continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      cache.set(key, json);
      return json;
    } catch(err){
      lastErr = err;
      if (attempt < MAX_RETRIES){
        const wait = 800 * (attempt + 1);
        log(`⚠️ ${source} falha (${err.message}). Retry em ${wait}ms…`, 'warn');
        await delay(wait);
      }
    }
  }
  const errObj = { error: lastErr ? lastErr.message : 'desconhecido' };
  cache.set(key, errObj);
  return errObj;
}

/* ============================================================================
   EXTRAÇÃO DA CLASSIFICAÇÃO
   ============================================================================ */
function extractClassification(response){
  const out = {
    taxonKey:'', name:'', canonicalName:'', acceptedName:'', rank:'', status:'',
    matchType:'', confidence:'', note:'',
    kingdom:'', phylum:'', class:'', order:'', family:'', genus:'', species:''
  };
  if (!response || response.error){
    out.matchType = 'ERROR';
    out.note = response && response.error ? response.error : 'sem resposta';
    return out;
  }

  if (response.usage){
    const u = response.usage;
    out.taxonKey      = u.key != null ? String(u.key) : (u.id != null ? String(u.id) : '');
    out.name          = u.name || u.scientificName || '';
    out.canonicalName = u.canonicalName || '';
    out.rank          = u.rank || '';
    out.status        = u.status || '';

    const diag = response.diagnostics || {};
    out.matchType  = diag.matchType || response.matchType || response.match_type || (response.match ? 'MATCH' : '');
    out.confidence = diag.confidence != null ? String(diag.confidence) : (response.confidence != null ? String(response.confidence) : '');
    out.note       = diag.note || diag.status || '';

    const arr = Array.isArray(response.classification) ? response.classification : (Array.isArray(u.classification) ? u.classification : []);
    arr.forEach(item => {
      const r = (item.rank || '').toUpperCase();
      const t = TARGET_RANKS.find(x => x.rank === r);
      if (t) out[t.field] = item.name || item.scientificName || '';
    });

    const ownRank = TARGET_RANKS.find(x => x.rank === String(u.rank || '').toUpperCase());
    if (ownRank && !out[ownRank.field]) out[ownRank.field] = u.name || u.scientificName || '';

    if (response.acceptedUsage && response.acceptedUsage.name){
      out.acceptedName = response.acceptedUsage.name;
    }
    return out;
  }

  out.taxonKey      = response.usageKey != null ? String(response.usageKey) : '';
  out.name          = response.scientificName || '';
  out.canonicalName = response.canonicalName || '';
  out.rank          = response.rank || '';
  out.status        = response.status || '';
  out.matchType     = response.matchType || '';
  out.confidence    = response.confidence != null ? String(response.confidence) : '';
  out.note          = response.note || '';

  out.kingdom = response.kingdom || '';
  out.phylum  = response.phylum  || '';
  out.class   = response.class   || '';
  out.order   = response.order   || '';
  out.family  = response.family  || '';
  out.genus   = response.genus   || '';
  out.species = response.species || '';

  if (response.acceptedUsageKey && response.acceptedScientificName){
    out.acceptedName = response.acceptedScientificName;
  }
  return out;
}

/* ============================================================================
   CONSOLIDAÇÃO GBIF × COL
   ============================================================================ */
function consolidate(gbif, col){
  const fields = ['kingdom','phylum','class','order','family','genus','species'];
  const consolidated = {};
  const checks = {};
  const conflicts = [];

  fields.forEach(f => {
    const g = (gbif[f] || '').trim();
    const c = (col[f]  || '').trim();

    if (g && c){
      if (normKey(g) === normKey(c)){
        consolidated[f] = g; checks[f] = 'CONCORDANTE';
      } else {
        consolidated[f] = ''; checks[f] = 'DIVERGENTE';
        conflicts.push(`${f.toUpperCase()}: GBIF=${g} | COL=${c}`);
      }
    } else if (g && !c){
      consolidated[f] = g; checks[f] = 'APENAS_GBIF';
    } else if (!g && c){
      consolidated[f] = c; checks[f] = 'APENAS_COL';
    } else {
      consolidated[f] = ''; checks[f] = 'AUSENTE';
    }
  });

  const hasGbif = gbif.matchType && gbif.matchType !== 'NONE' && gbif.matchType !== 'ERROR';
  const hasCol  = col.matchType  && col.matchType  !== 'NONE' && col.matchType  !== 'ERROR';
  const anyConc = Object.values(checks).some(v => v === 'CONCORDANTE');
  const anyDiv  = Object.values(checks).some(v => v === 'DIVERGENTE');
  const anyParc = Object.values(checks).some(v => v === 'APENAS_GBIF' || v === 'APENAS_COL');

  let validation = 'NAO_ENCONTRADO';
  if (!hasGbif && !hasCol) validation = 'NAO_ENCONTRADO';
  else if (anyDiv) validation = 'DIVERGENTE';
  else if (hasGbif && hasCol && anyConc) validation = 'CONCORDANTE';
  else if (anyParc || hasGbif || hasCol) validation = 'PARCIAL';

  return { consolidated, checks, conflicts, validation };
}

/* ============================================================================
   COMPARAÇÃO JABOT × CONSOLIDADO
   ============================================================================ */
function checkJabotConsolidated(interp, consolidated){
  const out = {
    kingdom:'SEM_DADO', phylum:'SEM_DADO', class:'SEM_DADO', order:'SEM_DADO',
    family:'SEM_DADO', genus:'SEM_DADO', species:'SEM_DADO'
  };
  const cmp = (j, c) => {
    if (!j) return 'SEM_DADO';
    if (!c) return 'SEM_DADO';
    return normKey(j) === normKey(c) ? 'CONCORDANTE' : 'DIVERGENTE';
  };

  out.family = cmp(interp.familyRaw, consolidated.family);
  out.genus  = cmp(interp.genusRaw,  consolidated.genus);
  if (interp.queryLevel === 'SPECIES'){
    out.species = cmp(interp.queryName, consolidated.species);
  }
  return out;
}

/* ============================================================================
   PROCESSO PRINCIPAL
   ============================================================================ */
btnEnrich.addEventListener('click', async () => {
  if (processing || !rawData.length) return;
  if (!splitMode && !nameColumn){ showStatus('⚠️ Nenhuma coluna de nome científico detectada.', 'error'); return; }

  processing = true;
  btnEnrich.disabled = true;
  btnClear.disabled = true;
  btnExportCache.disabled = true;
  btnImportCache.disabled = true;
  fileInput.disabled = true;
  setDownloadButtons(false);
  hideStatus(); clearLog(); resetResults();
  setProgress(0, 'Iniciando…');

  const uniqueMap = new Map();
  rawData.forEach((row, idx) => {
    const interp = splitMode
      ? interpretJABOT(row)
      : (function(){
          const nm = nameColumn ? String(row[nameColumn] || '').trim() : '';
          const lvl = nm ? 'SPECIES' : 'NAO_CONSULTAVEL';
          return {
            familyRaw:'', genusRaw:'', sp1Raw:'', sp2Raw:'', authorRaw:'',
            contextGenus:'', contextFamily:'',
            queryName:nm, queryLevel:lvl,
            jabotLevel: lvl === 'SPECIES' ? 'ESPECIE' : 'NAO_CONSULTAVEL',
            normalization: ''
          };
        })();

    if (!interp.queryName) return;

    const sig = `${interp.queryLevel}|${interp.queryName}|${interp.contextGenus}|${interp.contextFamily}`;
    if (!uniqueMap.has(sig)){
      uniqueMap.set(sig, { interp, registros: [] });
    }
    uniqueMap.get(sig).registros.push(idx);
  });

  const uniqueList = Array.from(uniqueMap.values());
  const totalUnique = uniqueList.length;
  const naoConsultaveis = rawData.length - Array.from(uniqueMap.values()).reduce((s,u)=>s+u.registros.length,0);

  if (!totalUnique && !naoConsultaveis){
    showStatus('⚠️ Nenhum nome válido para consultar.', 'error');
    processing = false; btnEnrich.disabled = false; hideProgress();
    return;
  }

  log(`Registros: ${rawData.length} | Consultas únicas: ${totalUnique} | Não consultáveis: ${naoConsultaveis}`, 'info');
  log(`Primeiros exemplos: ${uniqueList.slice(0,5).map(x=>`"${x.interp.queryName}"(${x.interp.queryLevel})`).join(', ')}`, 'info');

  statsEl.style.display = 'flex';
  ['stUnique','stDone','stConc','stDiv','stNone','stErr'].forEach(id => $(id).textContent = '0');
  $('stUnique').textContent = totalUnique;

  const taxonomyRows = [];
  let done=0, concCount=0, divCount=0, noneCount=0, errCount=0;

  for (let i = 0; i < totalUnique; i++){
    const { interp } = uniqueList[i];
    const { queryName, queryLevel, contextGenus, contextFamily } = interp;

    // As fontes são independentes: consultar as duas em paralelo reduz o tempo total
    // sem aumentar a frequência de requisições para uma mesma API.
    const [gbifResp, colResp] = await Promise.all([
      fetchMatch('GBIF', queryName, contextGenus, contextFamily),
      fetchMatch('COL', queryName, contextGenus, contextFamily)
    ]);
    await delay(DELAY_MS);

    const gbif = extractClassification(gbifResp);
    const col  = extractClassification(colResp);

    const { consolidated, checks, conflicts, validation } = consolidate(gbif, col);
    const jabotChecks = checkJabotConsolidated(interp, consolidated);

    const jabotDivergence = Object.entries(jabotChecks)
      .filter(([k,v]) => v === 'DIVERGENTE')
      .map(([k]) => k.toUpperCase());

    if (validation === 'DIVERGENTE')       divCount++;
    else if (validation === 'CONCORDANTE') concCount++;
    else if (validation === 'NAO_ENCONTRADO') noneCount++;
    if (gbif.matchType === 'ERROR' || col.matchType === 'ERROR') errCount++;

    const logCls = validation === 'DIVERGENTE' || jabotDivergence.length ? 'warn'
                 : validation === 'CONCORDANTE' ? 'ok'
                 : validation === 'NAO_ENCONTRADO' ? 'warn' : 'info';
    log(`"${queryName}" (${queryLevel}) → ${validation} [GBIF:${gbif.matchType||'—'} COL:${col.matchType||'—'}]` +
        (interp.normalization ? ` [${interp.normalization}]` : '') +
        (conflicts.length ? ` | GBIF×COL: ${conflicts.join('; ')}` : '') +
        (jabotDivergence.length ? ` | JABOT≠API: ${jabotDivergence.join(',')}` : ''), logCls);

    taxonomyRows.push({
      scientificName_original: interp.sp1Raw
        ? [interp.genusRaw, interp.sp1Raw, interp.sp2Raw].filter(Boolean).join(' ')
        : (interp.genusRaw || interp.familyRaw),
      nomeConsulta: queryName,
      EVB_queryLevel: queryLevel,
      EVB_nivelIdentificacao_JABOT: interp.jabotLevel,
      EVB_normalizationApplied: interp.normalization,
      JABOT_family: interp.familyRaw,
      JABOT_genus:  interp.genusRaw,
      JABOT_sp1:    interp.sp1Raw,
      JABOT_sp2:    interp.sp2Raw,
      JABOT_author1: interp.authorRaw,
      GBIF_name: gbif.name,
      GBIF_canonicalName: gbif.canonicalName,
      GBIF_acceptedName:  gbif.acceptedName,
      GBIF_taxonKey: gbif.taxonKey,
      GBIF_rank: gbif.rank,
      GBIF_status: gbif.status,
      GBIF_matchType: gbif.matchType,
      GBIF_confidence: gbif.confidence,
      GBIF_kingdom: gbif.kingdom,
      GBIF_phylum: gbif.phylum,
      GBIF_class: gbif.class,
      GBIF_order: gbif.order,
      GBIF_family: gbif.family,
      GBIF_genus: gbif.genus,
      GBIF_species: gbif.species,
      COL_name: col.name,
      COL_canonicalName: col.canonicalName,
      COL_acceptedName:  col.acceptedName,
      COL_taxonKey: col.taxonKey,
      COL_rank: col.rank,
      COL_status: col.status,
      COL_matchType: col.matchType,
      COL_confidence: col.confidence,
      COL_kingdom: col.kingdom,
      COL_phylum: col.phylum,
      COL_class: col.class,
      COL_order: col.order,
      COL_family: col.family,
      COL_genus: col.genus,
      COL_species: col.species,
      EVB_kingdom: consolidated.kingdom,
      EVB_phylum: consolidated.phylum,
      EVB_class: consolidated.class,
      EVB_order: consolidated.order,
      EVB_family: consolidated.family,
      EVB_genus: consolidated.genus,
      EVB_species: consolidated.species,
      EVB_validation: validation,
      EVB_conflicts: conflicts.join(' | '),
      EVB_check_kingdom: checks.kingdom,
      EVB_check_phylum: checks.phylum,
      EVB_check_class: checks.class,
      EVB_check_order: checks.order,
      EVB_check_family: checks.family,
      EVB_check_genus: checks.genus,
      EVB_check_species: checks.species,
      EVB_check_JABOT_kingdom: jabotChecks.kingdom,
      EVB_check_JABOT_phylum:  jabotChecks.phylum,
      EVB_check_JABOT_class:   jabotChecks.class,
      EVB_check_JABOT_order:   jabotChecks.order,
      EVB_check_JABOT_family:  jabotChecks.family,
      EVB_check_JABOT_genus:   jabotChecks.genus,
      EVB_check_JABOT_species: jabotChecks.species
    });

    done++;
    const p = Math.round((done / totalUnique) * 100);
    setProgress(p, `Processando ${done}/${totalUnique} — "${queryName}"`);
    $('stDone').textContent = done;
    $('stConc').textContent = concCount;
    $('stDiv').textContent  = divCount;
    $('stNone').textContent = noneCount;
    $('stErr').textContent  = errCount;
  }

  taxonomyData = taxonomyRows;

  const taxoBySig = new Map();
  uniqueList.forEach((u, i) => {
    const sig = `${u.interp.queryLevel}|${u.interp.queryName}|${u.interp.contextGenus}|${u.interp.contextFamily}`;
    taxoBySig.set(sig, taxonomyRows[i]);
  });

  enrichedData = rawData.map(row => {
    const enriched = { ...row };
    const interp = splitMode
      ? interpretJABOT(row)
      : (function(){
          const nm = nameColumn ? String(row[nameColumn] || '').trim() : '';
          const lvl = nm ? 'SPECIES' : 'NAO_CONSULTAVEL';
          return {
            familyRaw:'', genusRaw:'', sp1Raw:'', sp2Raw:'', authorRaw:'',
            contextGenus:'', contextFamily:'',
            queryName:nm, queryLevel:lvl,
            jabotLevel: lvl === 'SPECIES' ? 'ESPECIE' : 'NAO_CONSULTAVEL',
            normalization:''
          };
        })();

    enriched['EVB_queryLevel'] = interp.queryLevel;
    enriched['EVB_nivelIdentificacao_JABOT'] = interp.jabotLevel;
    enriched['EVB_normalizationApplied'] = interp.normalization;
    enriched['EVB_nomeConsulta'] = interp.queryName;

    if (!interp.queryName) return enriched;

    const sig = `${interp.queryLevel}|${interp.queryName}|${interp.contextGenus}|${interp.contextFamily}`;
    const t = taxoBySig.get(sig);
    if (!t) return enriched;

    enriched['EVB_GBIF_name']           = t.GBIF_name;
    enriched['EVB_GBIF_canonicalName']  = t.GBIF_canonicalName;
    enriched['EVB_GBIF_acceptedName']   = t.GBIF_acceptedName;
    enriched['EVB_GBIF_taxonKey']       = t.GBIF_taxonKey;
    enriched['EVB_GBIF_rank']           = t.GBIF_rank;
    enriched['EVB_GBIF_status']         = t.GBIF_status;
    enriched['EVB_GBIF_matchType']      = t.GBIF_matchType;
    enriched['EVB_GBIF_confidence']     = t.GBIF_confidence;
    enriched['EVB_GBIF_kingdom']        = t.GBIF_kingdom;
    enriched['EVB_GBIF_phylum']         = t.GBIF_phylum;
    enriched['EVB_GBIF_class']          = t.GBIF_class;
    enriched['EVB_GBIF_order']          = t.GBIF_order;
    enriched['EVB_GBIF_family']         = t.GBIF_family;
    enriched['EVB_GBIF_genus']          = t.GBIF_genus;
    enriched['EVB_GBIF_species']        = t.GBIF_species;

    enriched['EVB_COL_name']            = t.COL_name;
    enriched['EVB_COL_canonicalName']   = t.COL_canonicalName;
    enriched['EVB_COL_acceptedName']    = t.COL_acceptedName;
    enriched['EVB_COL_taxonKey']        = t.COL_taxonKey;
    enriched['EVB_COL_rank']            = t.COL_rank;
    enriched['EVB_COL_status']          = t.COL_status;
    enriched['EVB_COL_matchType']       = t.COL_matchType;
    enriched['EVB_COL_confidence']      = t.COL_confidence;
    enriched['EVB_COL_kingdom']         = t.COL_kingdom;
    enriched['EVB_COL_phylum']          = t.COL_phylum;
    enriched['EVB_COL_class']           = t.COL_class;
    enriched['EVB_COL_order']           = t.COL_order;
    enriched['EVB_COL_family']          = t.COL_family;
    enriched['EVB_COL_genus']           = t.COL_genus;
    enriched['EVB_COL_species']         = t.COL_species;

    enriched['EVB_kingdom'] = t.EVB_kingdom;
    enriched['EVB_phylum']  = t.EVB_phylum;
    enriched['EVB_class']   = t.EVB_class;
    enriched['EVB_order']   = t.EVB_order;
    enriched['EVB_family']  = t.EVB_family;
    enriched['EVB_genus']   = t.EVB_genus;
    enriched['EVB_species'] = t.EVB_species;

    enriched['EVB_validation'] = t.EVB_validation;
    enriched['EVB_conflicts']  = t.EVB_conflicts;

    enriched['EVB_check_kingdom'] = t.EVB_check_kingdom;
    enriched['EVB_check_phylum']  = t.EVB_check_phylum;
    enriched['EVB_check_class']   = t.EVB_check_class;
    enriched['EVB_check_order']   = t.EVB_check_order;
    enriched['EVB_check_family']  = t.EVB_check_family;
    enriched['EVB_check_genus']   = t.EVB_check_genus;
    enriched['EVB_check_species'] = t.EVB_check_species;

    enriched['EVB_check_JABOT_kingdom'] = t.EVB_check_JABOT_kingdom;
    enriched['EVB_check_JABOT_phylum']  = t.EVB_check_JABOT_phylum;
    enriched['EVB_check_JABOT_class']   = t.EVB_check_JABOT_class;
    enriched['EVB_check_JABOT_order']   = t.EVB_check_JABOT_order;
    enriched['EVB_check_JABOT_family']  = t.EVB_check_JABOT_family;
    enriched['EVB_check_JABOT_genus']   = t.EVB_check_JABOT_genus;
    enriched['EVB_check_JABOT_species'] = t.EVB_check_JABOT_species;

    return enriched;
  });

  reviewData = [];
  taxonomyRows.forEach(t => {
    const probs = [];
    if (t.EVB_validation === 'DIVERGENTE')     probs.push('DIVERGENCIA_GBIF_COL');
    if (t.EVB_validation === 'NAO_ENCONTRADO') probs.push('NAO_ENCONTRADO');
    if (t.GBIF_matchType === 'FUZZY')          probs.push('MATCH_FUZZY_GBIF');
    if (t.COL_matchType === 'FUZZY')           probs.push('MATCH_FUZZY_COL');
    if (t.GBIF_matchType === 'ERROR' || t.COL_matchType === 'ERROR') probs.push('ERRO_API');
    if (!t.EVB_family) probs.push('SEM_FAMILIA_CONSOLIDADA');
    if (!t.EVB_genus)  probs.push('SEM_GENERO_CONSOLIDADO');
    if (t.EVB_conflicts) probs.push('CONFLITO_RANK: ' + t.EVB_conflicts);
    if (t.EVB_check_JABOT_family  === 'DIVERGENTE') probs.push('DIVERGENCIA_JABOT_FAMILY');
    if (t.EVB_check_JABOT_genus   === 'DIVERGENTE') probs.push('DIVERGENCIA_JABOT_GENUS');
    if (t.EVB_check_JABOT_species === 'DIVERGENTE') probs.push('DIVERGENCIA_JABOT_SPECIES');

    if (probs.length){
      reviewData.push({
        Nome_original_JABOT: t.scientificName_original,
        Nome_consulta:       t.nomeConsulta,
        Nivel_consulta:      t.EVB_queryLevel,
        Nivel_JABOT:         t.EVB_nivelIdentificacao_JABOT,
        Normalizacao:        t.EVB_normalizationApplied,
        JABOT_family:        t.JABOT_family,
        JABOT_genus:         t.JABOT_genus,
        JABOT_sp1:           t.JABOT_sp1,
        JABOT_sp2:           t.JABOT_sp2,
        GBIF_matchType:      t.GBIF_matchType,
        GBIF_family:         t.GBIF_family,
        GBIF_genus:          t.GBIF_genus,
        GBIF_species:        t.GBIF_species,
        COL_matchType:       t.COL_matchType,
        COL_family:          t.COL_family,
        COL_genus:           t.COL_genus,
        COL_species:         t.COL_species,
        EVB_family:          t.EVB_family,
        EVB_genus:           t.EVB_genus,
        EVB_species:         t.EVB_species,
        EVB_validation:      t.EVB_validation,
        EVB_conflicts:       t.EVB_conflicts,
        Check_JABOT_family:  t.EVB_check_JABOT_family,
        Check_JABOT_genus:   t.EVB_check_JABOT_genus,
        Check_JABOT_species: t.EVB_check_JABOT_species,
        Motivos_revisao:     probs.join(' | ')
      });
    }
  });

  statisticsData = computeStatistics(taxonomyRows);

  prontoGBIF = buildCleanSheet(enrichedData, 'GBIF');
  prontoCOL  = buildCleanSheet(enrichedData, 'COL');
  prontoCons = buildCleanSheet(enrichedData, 'Consolidado');

  const enriqCols = Object.keys(enrichedData[0] || {});
  const taxoCols  = taxonomyData.length ? Object.keys(taxonomyData[0]) : [];
  const revCols   = reviewData.length   ? Object.keys(reviewData[0])   : [];
  const statCols  = statisticsData.length ? Object.keys(statisticsData[0]) : [];
  const pgCols    = prontoGBIF.length ? Object.keys(prontoGBIF[0]) : [];
  const pcCols    = prontoCOL.length  ? Object.keys(prontoCOL[0])  : [];
  const pccCols   = prontoCons.length ? Object.keys(prontoCons[0]) : [];

  const filled = new Set(enriqCols.filter(c => c.startsWith('EVB_')));
  const filledClean = new Set(['kingdom','phylum','class','order']);
  renderTable('enriq', enrichedData, enriqCols, filled);
  renderTable('taxo', taxonomyData, taxoCols, new Set(['EVB_validation']));
  renderTable('rev',  reviewData,   revCols,  new Set());
  renderTable('stat', statisticsData, statCols, new Set());
  renderTable('prontoGBIF', prontoGBIF, pgCols,  filledClean);
  renderTable('prontoCOL',  prontoCOL,  pcCols,  filledClean);
  renderTable('prontoCons', prontoCons, pccCols, filledClean);

  processing = false;
  btnEnrich.disabled = false;
  btnClear.disabled = false;
  btnExportCache.disabled = false;
  btnImportCache.disabled = false;
  fileInput.disabled = false;
  setDownloadButtons(true);
  dlAudit.style.display = 'block';
  dlPronto.style.display = 'block';
  hideProgress();

  lastRunStamp = stampNow();
  const resumo = `✅ Concluído — Registros: ${rawData.length} | Consultas: ${totalUnique} | Concordantes: ${concCount} | Divergentes: ${divCount} | Não encontrados: ${noneCount} | Erros: ${errCount} | Revisão: ${reviewData.length}`;
  log(resumo, concCount > 0 ? 'ok' : 'warn');
  showStatus(resumo + ' — Use os botões de download individuais abaixo.', divCount > 0 ? 'warn' : (concCount > 0 ? 'success' : 'info'));
});

/* ============================================================================
   ESTATÍSTICAS
   ============================================================================ */
function computeStatistics(taxoRows){
  const stats = [];
  const push = (grupo, metrica, valor, percentual = '') => {
    stats.push({ Grupo: grupo, Metrica: metrica, Valor: valor, Percentual: percentual });
  };

  const totalRec = rawData.length;
  const totalQueries = taxoRows.length;
  const nomesUnicos = new Set(taxoRows.map(t => normKey(t.nomeConsulta))).size;

  push('Geral', 'Total de registros (exsicatas)', totalRec);
  push('Geral', 'Total de consultas únicas (query+contexto)', totalQueries);
  push('Geral', 'Total de nomes únicos (queryName distintos)', nomesUnicos);

  const famSet = new Set(), genSet = new Set(), spcSet = new Set();
  let semGen = 0, semFam = 0;
  rawData.forEach(r => {
    const f = familyCol ? String(r[familyCol] || '').trim() : '';
    const g = genusCol  ? String(r[genusCol]  || '').trim() : '';
    const s1 = sp1Col   ? String(r[sp1Col]    || '').trim() : '';
    if (f) famSet.add(normKey(f));
    if (g) genSet.add(normKey(g));
    if (g && s1) spcSet.add(normKey(g + ' ' + s1));
    if (!g) semGen++;
    if (!f) semFam++;
  });
  push('Geral', 'Famílias informadas no JABOT (únicas)', famSet.size);
  push('Geral', 'Gêneros informados no JABOT (únicos)', genSet.size);
  push('Geral', 'Espécies identificadas no JABOT (únicas)', spcSet.size);
  push('Geral', 'Registros sem gênero', semGen, pct(semGen, totalRec));
  push('Geral', 'Registros sem família', semFam, pct(semFam, totalRec));

  const levelsRec = { ESPECIE:0, GENERO:0, FAMILIA:0, NAO_CONSULTAVEL:0 };
  enrichedData.forEach(r => {
    const l = r.EVB_nivelIdentificacao_JABOT;
    if (levelsRec[l] !== undefined) levelsRec[l]++;
  });
  Object.entries(levelsRec).forEach(([k,v]) => push('Nível JABOT (por registro)', k, v, pct(v, totalRec)));

  const levelsTax = { ESPECIE:0, GENERO:0, FAMILIA:0, NAO_CONSULTAVEL:0 };
  taxoRows.forEach(t => {
    const l = t.EVB_nivelIdentificacao_JABOT;
    if (levelsTax[l] !== undefined) levelsTax[l]++;
  });
  Object.entries(levelsTax).forEach(([k,v]) => push('Nível JABOT (por consulta única)', k, v, pct(v, totalQueries)));

  const gbifMT = {};
  taxoRows.forEach(t => { const k = t.GBIF_matchType || 'VAZIO'; gbifMT[k] = (gbifMT[k]||0)+1; });
  Object.entries(gbifMT).forEach(([k,v]) => push('Resultado GBIF (consulta única)', k, v, pct(v, totalQueries)));

  const colMT = {};
  taxoRows.forEach(t => { const k = t.COL_matchType || 'VAZIO'; colMT[k] = (colMT[k]||0)+1; });
  Object.entries(colMT).forEach(([k,v]) => push('Resultado COL (consulta única)', k, v, pct(v, totalQueries)));

  const valid = {};
  taxoRows.forEach(t => { const k = t.EVB_validation || 'VAZIO'; valid[k] = (valid[k]||0)+1; });
  Object.entries(valid).forEach(([k,v]) => push('Validação GBIF×COL (consulta única)', k, v, pct(v, totalQueries)));

  const ranks = ['kingdom','phylum','class','order','family','genus','species'];
  const div = {}, conc = {}, aus = {}, ag = {}, ac = {};
  ranks.forEach(r => { div[r]=0; conc[r]=0; aus[r]=0; ag[r]=0; ac[r]=0; });
  taxoRows.forEach(t => {
    ranks.forEach(r => {
      const v = t['EVB_check_' + r];
      if (v === 'DIVERGENTE') div[r]++;
      else if (v === 'CONCORDANTE') conc[r]++;
      else if (v === 'AUSENTE') aus[r]++;
      else if (v === 'APENAS_GBIF') ag[r]++;
      else if (v === 'APENAS_COL') ac[r]++;
    });
  });
  ranks.forEach(r => push('Concordância GBIF×COL por rank', r.toUpperCase(), conc[r], pct(conc[r], totalQueries)));
  ranks.forEach(r => push('Divergência GBIF×COL por rank', r.toUpperCase(), div[r], pct(div[r], totalQueries)));
  ranks.forEach(r => push('Ausente em ambas as fontes por rank', r.toUpperCase(), aus[r], pct(aus[r], totalQueries)));

  const jRanks = [
    { k:'family',  f:'EVB_check_JABOT_family' },
    { k:'genus',   f:'EVB_check_JABOT_genus'  },
    { k:'species', f:'EVB_check_JABOT_species'}
  ];
  jRanks.forEach(({ k, f }) => {
    const c = { CONCORDANTE:0, DIVERGENTE:0, SEM_DADO:0 };
    taxoRows.forEach(t => { const v = t[f]; if (v && c[v] !== undefined) c[v]++; });
    Object.entries(c).forEach(([kk,v]) => {
      push(`JABOT×Consolidado — ${k.toUpperCase()} (consulta única)`, kk, v, pct(v, totalQueries));
    });
  });

  return stats;
}

/* ============================================================================
   PLANILHA PRONTA PARA USO
   ============================================================================ */
function findInsertIndex(originalCols){
  const nk = c => String(c||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[\s_\-\.]+/g,'').trim();
  const sufixoIdx = originalCols.findIndex(c => nk(c) === 'sufixo');
  if (sufixoIdx >= 0) return sufixoIdx + 1;
  const familyIdx = originalCols.findIndex(c => nk(c) === 'family');
  if (familyIdx >= 0) return familyIdx;
  return originalCols.length;
}

function buildCleanSheet(data, source){
  if (!data.length) return [];
  const prefix = source === 'GBIF' ? 'EVB_GBIF_'
               : source === 'COL'  ? 'EVB_COL_'
               : 'EVB_';
  const newCols = ['kingdom','phylum','class','order'];
  const originalCols = Object.keys(data[0]).filter(c => !c.startsWith('EVB_'));
  const insertIdx = findInsertIndex(originalCols);

  const finalCols = [
    ...originalCols.slice(0, insertIdx),
    ...newCols,
    ...originalCols.slice(insertIdx)
  ];

  return data.map(row => {
    const out = {};
    finalCols.forEach(col => {
      if (newCols.includes(col)){
        out[col] = row[prefix + col] || '';
      } else {
        out[col] = row[col];
      }
    });
    return out;
  });
}

/* ============================================================================
   DOWNLOADS INDIVIDUAIS
   ============================================================================ */
function setDownloadButtons(enabled){
  document.querySelectorAll('button[data-dl]').forEach(b => { b.disabled = !enabled; });
}

function pickData(name){
  switch(name){
    case 'Enriquecido':         return { data: enrichedData,   aba: 'Enriquecido',   prefixo: 'EVB_taxonomia' };
    case 'Taxonomia':           return { data: taxonomyData,   aba: 'Taxonomia',     prefixo: 'EVB_taxonomia' };
    case 'Revisao':             return { data: reviewData,     aba: 'Revisao',       prefixo: 'EVB_taxonomia' };
    case 'Estatisticas':        return { data: statisticsData, aba: 'Estatisticas',  prefixo: 'EVB_taxonomia' };
    case 'Pronto_GBIF':         return { data: prontoGBIF,     aba: 'Pronto_GBIF',   prefixo: 'EVB_pronto' };
    case 'Pronto_COL':          return { data: prontoCOL,      aba: 'Pronto_COL',    prefixo: 'EVB_pronto' };
    case 'Pronto_Consolidado':  return { data: prontoCons,     aba: 'Pronto_Consolidado', prefixo: 'EVB_pronto' };
    default: return null;
  }
}

document.querySelectorAll('button[data-dl]').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.dl;
    const info = pickData(name);
    if (!info || !info.data || !info.data.length){
      showStatus(`⚠️ Nada para baixar em "${name}".`, 'warn');
      return;
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(info.data);
    XLSX.utils.book_append_sheet(wb, ws, info.aba);
    const stamp = lastRunStamp || stampNow();
    const fname = `${info.prefixo}_${stamp}_${name}.xlsx`;
    XLSX.writeFile(wb, fname);
    showStatus(`📥 Baixado: ${fname} (${info.data.length} linhas)`, 'success');
    log(`Download: ${fname}`, 'ok');
  });
});

/* ============================================================================
   CACHE
   ============================================================================ */
btnExportCache.addEventListener('click', () => {
  const obj = {};
  cache.forEach((v, k) => { obj[k] = v; });
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cache_taxonomia_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  showStatus('💾 Cache exportado.', 'success');
});

btnImportCache.addEventListener('click', () => cacheInput.click());
cacheInput.addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const obj = JSON.parse(ev.target.result);
      let n = 0;
      Object.entries(obj).forEach(([k, v]) => { cache.set(k, v); n++; });
      showStatus(`📥 Cache importado: ${n} entradas.`, 'success');
    } catch(err){ showStatus('❌ Cache inválido: ' + err.message, 'error'); }
  };
  r.readAsText(f);
  cacheInput.value = '';
});

/* ============================================================================
   LIMPAR
   ============================================================================ */
btnClear.addEventListener('click', resetAll);
function resetResults(){
  enrichedData = []; taxonomyData = []; reviewData = []; statisticsData = [];
  prontoGBIF = []; prontoCOL = []; prontoCons = [];
  ['Enriq','Taxo','Rev','Stat','ProntoGBIF','ProntoCOL','ProntoCons'].forEach(t => {
    const body = $('body'+t), head = $('head'+t), wrap = $('tableWrap'+t);
    if (body) body.innerHTML = '';
    if (head) head.innerHTML = '';
    if (wrap) wrap.style.display = 'none';
  });
  statsEl.style.display = 'none';
}
function resetAll(){
  if (processing){
    showStatus('A validação está em andamento. Aguarde sua conclusão antes de limpar.', 'warn');
    return;
  }
  workbook = null; sheetName = null; rawData = []; columns = [];
  nameColumn = null; familyCol = null; genusCol = null;
  sp1Col = null; sp2Col = null; author1Col = null; splitMode = false;
  enrichedData = []; taxonomyData = []; reviewData = []; statisticsData = [];
  prontoGBIF = []; prontoCOL = []; prontoCons = [];
  cache.clear();
  lastRunStamp = '';
  fileInput.value = ''; fileInfo.textContent = '';
  colsInfo.style.display = 'none';
  tabsEl.style.display = 'none';
  dlAudit.style.display = 'none';
  dlPronto.style.display = 'none';
  setDownloadButtons(false);
  document.querySelectorAll('.table-wrap').forEach(w => w.style.display = 'none');
  btnEnrich.disabled = true; btnClear.disabled = true; fileInput.disabled = false;
  btnExportCache.disabled = true; btnImportCache.disabled = true;
  hideProgress(); hideStatus(); clearLog(); resetResults();
  showStatus('Limpo.', 'info');
}

/* ============================================================================
   INICIALIZAÇÃO
   ============================================================================ */
log('Programa v6 carregado.', 'info');
log('Detecção JABOT: family / genus / sp1 / [sp2] / author1.', 'info');
log('Consulta independente: GBIF Backbone × Catalogue of Life XR.', 'info');
log('Downloads individuais: 7 arquivos XLSX separados (um por aba).', 'info');
