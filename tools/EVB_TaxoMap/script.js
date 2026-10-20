/* ==================================================================
   ANALISADOR ESTATÍSTICO DE COLEÇÕES — JABOT
   Suporte a modelo completo e modelo simplificado
   ================================================================== */

/* ---------------- 0) AJUDA CONTEXTUAL (tooltips) ---------------- */
let helpPopoverEl = null;
function escAttr(s){ return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;'); }
function getHelpPopover(){
  if (!helpPopoverEl){
    helpPopoverEl = document.createElement('div');
    helpPopoverEl.className = 'help-popover';
    helpPopoverEl.id = 'helpPopover';
    document.body.appendChild(helpPopoverEl);
  }
  return helpPopoverEl;
}
function showHelp(icon){
  const html = icon.getAttribute('data-help') || '';
  if (!html) return;
  const p = getHelpPopover();
  p.innerHTML = html;
  p.classList.add('show');
  const r = icon.getBoundingClientRect();
  const pr = p.getBoundingClientRect();
  let left = r.left + r.width / 2 - pr.width / 2;
  let top = r.bottom + 8;
  if (left < 10) left = 10;
  if (left + pr.width > window.innerWidth - 10) left = window.innerWidth - pr.width - 10;
  if (top + pr.height > window.innerHeight - 10) top = r.top - pr.height - 8;
  if (top < 10) top = 10;
  p.style.left = left + 'px';
  p.style.top = top + 'px';
}
function hideHelp(){ if (helpPopoverEl) helpPopoverEl.classList.remove('show'); }
function helpIcon(html){
  return `<span class="help-icon" tabindex="0" role="button" aria-label="Ajuda" data-help="${escAttr(html)}" onclick="event.stopPropagation(); event.preventDefault(); showHelp(this);">?</span>`;
}
document.addEventListener('mouseover', e => { const i = e.target.closest('.help-icon'); if (i) showHelp(i); });
document.addEventListener('mouseout', e => {
  const i = e.target.closest('.help-icon');
  if (i && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.help-icon'))) hideHelp();
});
document.addEventListener('focusin', e => { const i = e.target.closest('.help-icon'); if (i) showHelp(i); });
document.addEventListener('focusout', e => { if (e.target.closest && e.target.closest('.help-icon')) hideHelp(); });
document.addEventListener('click', e => { if (!e.target.closest('.help-popover')) hideHelp(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideHelp(); });

/* ---------------- 1) CONSTANTES ---------------- */
const REQUIRED_COMPLETE  = ['kingdom','phylum','class','order','family','genus','sp1'];
const REQUIRED_SIMPLIFIED= ['family','genus','sp1'];
// Mantido por compatibilidade (não é usado diretamente para validar)
const REQUIRED_COLS = REQUIRED_COMPLETE;

const GROUPS = ['Angiospermas','Gimnospermas','Samambaias e Licófitas','Briófitas','Algas','Fungos','Outros / Não classificado'];
const GROUP_COLORS = {
  'Angiospermas':'#16a34a','Gimnospermas':'#65a30d','Samambaias e Licófitas':'#0284c7',
  'Briófitas':'#7c3aed','Algas':'#0d9488','Fungos':'#ea580c','Outros / Não classificado':'#94a3b8'
};
const FILTER_LEVELS = ['group','kingdom','phylum','class','order','family','genus'];
const PALETTE = ['#166534','#0d9488','#0284c7','#7c3aed','#ea580c','#dc2626','#a16207','#475569','#be185d','#0891b2'];
const NF = new Intl.NumberFormat('pt-BR');
const PF = new Intl.NumberFormat('pt-BR', {minimumFractionDigits:1, maximumFractionDigits:2});

const state = {
  rawData:[], processed:[], filtered:[], columns:[],
  filters:{}, search:'', charts:{}, activeTab:'visao', dataPage:1,
  // NOVO — modelo detectado da planilha
  model:null,                 // 'complete' | 'simplified' | null
  missingComplete:[],         // colunas ausentes em relação ao modelo completo
  missingSimplified:[],       // colunas ausentes em relação ao modelo simplificado
  coberturaTopN:10,
  coberturaSort:'total_desc',
  coberturaTopNFam:10,
  cobFilters:{
    search:'', minTotal:'', minPctSpecies:'', maxPctSpecies:'',
    minPctGap:'', minGap:'',
    sortKey:'total', sortDir:'desc',
    view:'complete',
    exportScope:'all',
    topGapN:5
  },
  cobPdfScope:'complete',
  geoDraftMode:'parna', geoDraftText:'', geographicFilter:null
};

const GEOGRAPHIC_PRESET_TERMS = [
  'Parque Nacional do Iguaçu','Parque Nacional de Iguaçu','Parque Nacional Iguaçu',
  'Parque Nacional Iguacu','Parque Nacional do Iguacu','Parque Nacional de Iguacu',
  'Parque Nacional Iguassu','Parque Nacional do Iguassu','Parque Nacional de Iguassu',
  'PARNA Iguaçu','PARNA Iguacu','PARNA do Iguaçu','PARNA do Iguacu','PARNA Iguaçú',
  'PNI Iguaçu','PNI Iguacu','PNI - Iguaçu','PNI - Iguacu',
  'Parque Nac. do Iguaçu','Parque Nac. Iguacu','Pq. Nacional do Iguaçu','Pq. Nacional do Iguacu',
  'Parque Nacional Iguazu','Parque Nacional del Iguazú','Parque Nacional do Iguazú'
];
const GEOGRAPHIC_FIELD_NAMES = { gazetteer:'gazetteer', uc:'uc', locnotes:'locnotes' };

function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function showAlert(msg, type='ok'){
  const el = document.getElementById('alert');
  el.className = 'alert show ' + type; el.textContent = msg;
  if (type === 'ok') setTimeout(()=>{ el.className='alert'; }, 4000);
}
function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 100);
}

/* ==================================================================
   DETECÇÃO DE MODELO DA PLANILHA (NOVO)
   ------------------------------------------------------------------
   - 'complete'   : contém kingdom, phylum, class, order, family, genus, sp1
   - 'simplified' : contém family, genus, sp1 (as demais são opcionais)
   - 'invalid'    : falta alguma coluna essencial mínima (family/genus/sp1)
   A detecção compara APENAS a presença dos cabeçalhos (normalizados),
   nunca o conteúdo das células — colunas presentes porém vazias em
   algumas linhas continuam sendo consideradas presentes.
   ================================================================== */
function detectSpreadsheetModel(headers){
  const normSet = new Set(headers.map(normalizeHeader));
  const has = (c) => normSet.has(normalizeHeader(c));
  const missingComplete = REQUIRED_COMPLETE.filter(c => !has(c));
  const missingSimplified = REQUIRED_SIMPLIFIED.filter(c => !has(c));
  let model;
  if (missingComplete.length === 0) model = 'complete';
  else if (missingSimplified.length === 0) model = 'simplified';
  else model = 'invalid';
  return { model, missingComplete, missingSimplified };
}

/* Mensagem reutilizável para abas que dependem de colunas superiores */
function renderMissingColumnsNotice(sectionName, missing, reasonHtml){
  return `
    <h2>${esc(sectionName)}</h2>
    <div class="missing-cols-notice">
      <h3>⚠ Esta seção não está disponível para a planilha carregada</h3>
      <p>${reasonHtml}</p>
      <p>Coluna${missing.length > 1 ? 's' : ''} ausente${missing.length > 1 ? 's' : ''}:
        ${missing.map(c => `<code>${esc(c)}</code>`).join(', ')}.</p>
      <p class="small">
        A análise de
        <a href="#" onclick="switchTab('cobertura'); return false;">Cobertura Taxonômica</a>
        continua disponível, assim como as funcionalidades que dependem apenas de
        <code>family</code>, <code>genus</code> e <code>sp1</code>.
      </p>
    </div>`;
}

/* ---------------- 2) IMPORTAÇÃO ---------------- */
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try { await importSpreadsheet(file); } catch(err){
    console.error(err); showAlert('Erro ao ler a planilha: ' + err.message, 'err');
  }
});
async function importSpreadsheet(file){
  document.getElementById('fileInfo').textContent = `Carregando "${file.name}"...`;
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type:'array' });
  const sheetName = wb.SheetNames[0]; const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(ws, { defval:'', raw:false });
  if (!json.length) throw new Error('A planilha está vazia.');

  const headers = Object.keys(json[0]);
  const headerMap = {};
  for (const h of headers) headerMap[normalizeHeader(h)] = h;

  // --------- DETECÇÃO DE MODELO ---------
  const detected = detectSpreadsheetModel(headers);
  const manual = (document.getElementById('modelChoice')?.value) || 'auto';
  let effectiveModel = detected.model;

  // Validação manual (opcional — se o usuário escolheu explicitamente)
  if (manual === 'complete'){
    if (detected.missingComplete.length){
      showAlert(
        `Modelo "Completa" selecionado, mas as colunas obrigatórias não foram encontradas: ` +
        `${detected.missingComplete.join(', ')}.\n` +
        `Colunas encontradas: ${headers.join(', ')}.\n` +
        `Ajuste a seleção de modelo ou corrija a planilha.`, 'err');
      document.getElementById('fileInfo').textContent =
        'Modelo selecionado ("Completa") não corresponde aos cabeçalhos reais.';
      return;
    }
    effectiveModel = 'complete';
  } else if (manual === 'simplified'){
    if (detected.missingSimplified.length){
      showAlert(
        `Modelo "Simplificada" selecionado, mas faltam colunas essenciais: ` +
        `${detected.missingSimplified.join(', ')}.\n` +
        `Colunas encontradas: ${headers.join(', ')}.`, 'err');
      document.getElementById('fileInfo').textContent =
        'Modelo selecionado ("Simplificada") não corresponde aos cabeçalhos reais.';
      return;
    }
    effectiveModel = 'simplified';
  }

  // Modelo inválido — falta o mínimo essencial
  if (effectiveModel === 'invalid'){
    showAlert(
      `Colunas essenciais não encontradas: ${detected.missingSimplified.join(', ')}.\n` +
      `A ferramenta precisa ao menos de: family, genus e sp1.\n` +
      `Colunas encontradas: ${headers.join(', ')}.`, 'err');
    document.getElementById('fileInfo').textContent =
      'Planilha rejeitada — colunas essenciais ausentes.';
    return;
  }

  // --------- ESTADO ---------
  state.rawData = json;
  state.columns = headers;
  state.geographicFilter = null;
  state.geoDraftMode = 'parna'; state.geoDraftText = '';
  state.model = effectiveModel;
  state.missingComplete   = detected.missingComplete;
  state.missingSimplified = detected.missingSimplified;

  processData();

  // --------- FEEDBACK AO USUÁRIO ---------
  const modelBadge = effectiveModel === 'complete'
    ? `<span class="model-badge complete">✓ Modelo completo — classificações superiores disponíveis</span>`
    : `<span class="model-badge simplified">⚠ Modelo simplificado — cobertura taxonômica disponível</span>`;

  let extraInfo = '';
  if (effectiveModel === 'simplified' && detected.missingComplete.length){
    extraInfo = `<div style="color:var(--muted);font-size:11.5px;margin-top:4px;">
      Ausentes: ${detected.missingComplete.map(esc).join(', ')} · a hierarquia taxonômica completa
      e as abas Reino/Filo/Classe/Ordem foram desabilitadas.
    </div>`;
  }

  document.getElementById('fileInfo').innerHTML =
    `<b>${esc(file.name)}</b> — ${NF.format(json.length)} registros · ${headers.length} colunas · ` +
    `abas da planilha: ${wb.SheetNames.length} (usando "${esc(sheetName)}")<br>${modelBadge}${extraInfo}`;

  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('exportButtons').style.display = 'flex';

  if (effectiveModel === 'complete'){
    showAlert(`Planilha importada (modelo completo): ${NF.format(json.length)} registros.`, 'ok');
  } else {
    showAlert(`Planilha importada (modelo simplificado): ${NF.format(json.length)} registros. ` +
              `Cobertura taxonômica disponível; hierarquia completa desabilitada.`, 'warn');
  }

  // Reset de estado dependente
  state.filters = {}; state.search = ''; state.dataPage = 1;
  document.getElementById('searchBox').value = '';
  state.cobFilters = { search:'', minTotal:'', minPctSpecies:'', maxPctSpecies:'',
    minPctGap:'', minGap:'', sortKey:'total', sortDir:'desc', view:'complete',
    exportScope:'all', topGapN:5 };
  hierState.expanded = new Set(); hierState.selectedPath = null;
  hierState.searchTerm = ''; hierState.searchResults = []; hierState.searchIndex = -1;
  hierState._initialized = false;

  // Se estávamos em uma aba bloqueada, redireciona para cobertura
  if (effectiveModel === 'simplified' && ['reinos','filos','classes','ordens','hierarquia'].includes(state.activeTab)){
    state.activeTab = 'cobertura';
  }

  renderAll();
}

/* ---------------- 3) NORMALIZAÇÃO ---------------- */
function normalizeHeader(h){ return String(h ?? '').trim().toLowerCase(); }
function normalizeGeographicText(value){
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function geographicColumns(){
  const headers = state.columns || [];
  return Object.entries(GEOGRAPHIC_FIELD_NAMES).flatMap(([key, label]) => {
    const header = headers.find(h => String(h).trim().toLowerCase().replace(/\s+/g, '') === key);
    return header ? [{ key, label, header }] : [];
  });
}
function geographicTermMatches(text, term){
  const normalizedTerm = normalizeGeographicText(term);
  if (!normalizedTerm) return false;
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, ' ');
  return new RegExp(`(?:^| )${escaped}(?: |$)`).test(text);
}
function geographicMatches(row, filter=state.geographicFilter){
  if (!filter || !filter.terms?.length) return [];
  const matches = [];
  for (const field of geographicColumns()){
    const text = normalizeGeographicText(row[field.header]);
    if (!text) continue;
    for (const term of filter.terms){
      if (geographicTermMatches(text, term)) matches.push({ column:field.label, term });
    }
  }
  return matches;
}
function geographicRows(rows=state.processed){
  return state.geographicFilter ? rows.filter(row => geographicMatches(row).length > 0) : rows;
}
function renderGeographicFilterPanel(){
  const filter = state.geographicFilter;
  const fields = geographicColumns();
  const matched = filter ? state.processed.map((row, index) => ({ row, index, matches:geographicMatches(row) })).filter(x => x.matches.length) : [];
  const total = state.processed.length;
  const pct = total ? matched.length / total * 100 : 0;
  const filterName = filter?.mode === 'parna' ? 'Parque Nacional do Iguaçu (PARNA Iguaçu)' : 'Busca personalizada';
  const terms = filter?.terms || [];
  const fieldsText = fields.length ? fields.map(f => f.label).join(', ') : 'nenhuma coluna geográfica disponível';
  return `
    <section class="geo-filter-panel">
      <h3>Filtro geográfico</h3>
      <p class="hint">Seleção baseada em informações textuais de localidade; não confirma que o exemplar esteja dentro dos limites oficiais do Parque. Os termos são pesquisados nas colunas geográficas disponíveis: <b>${esc(fieldsText)}</b>. Na busca personalizada, separe os termos por ponto e vírgula; o registro entra se corresponder a pelo menos um deles.</p>
      <div class="geo-filter-controls">
        <label for="geoMode">Tipo de busca:</label>
        <select id="geoMode" onchange="geoSetDraftMode(this.value)">
          <option value="parna" ${state.geoDraftMode==='parna'?'selected':''}>Parque Nacional do Iguaçu (PARNA Iguaçu)</option>
          <option value="custom" ${state.geoDraftMode==='custom'?'selected':''}>Busca personalizada</option>
        </select>
        <input id="geoCustomTerms" type="text" value="${esc(state.geoDraftText)}" placeholder="Ex.: Céu Azul; Cataratas; Poço Preto" aria-label="Termos geográficos personalizados" style="display:${state.geoDraftMode==='custom'?'inline-block':'none'}" oninput="state.geoDraftText=this.value">
        <button class="btn secondary" onclick="applyGeographicFilter()">Aplicar filtro</button>
        <button class="btn ghost" onclick="clearGeographicFilter()">Limpar filtro geográfico</button>
      </div>
      ${!fields.length ? '<p class="geo-filter-warning">A planilha não contém as colunas <code>gazetteer</code>, <code>uc</code> ou <code>locnotes</code>; o filtro geográfico está indisponível.</p>' : ''}
      ${filter ? `<div class="geo-filter-result">
        <b>Filtro ativo:</b> ${esc(filterName)}<br>
        <b>Registros encontrados:</b> ${NF.format(matched.length)} de ${NF.format(total)} registros da coleção (${PF.format(pct)}%).<br>
        <b>Colunas pesquisadas:</b> ${esc(fieldsText)}<br>
        <b>Termos utilizados:</b> ${terms.map(esc).join('; ')}
        ${matched.length ? `<details class="geo-match-details"><summary>Rastreabilidade das correspondências (${NF.format(matched.length)} registros)</summary>
          <div class="table-wrap"><table><thead><tr><th>Linha na planilha</th><th>Coluna correspondente</th><th>Termo correspondente</th></tr></thead><tbody>
          ${matched.slice(0,200).map(x => x.matches.map(m => `<tr><td>${x.index+2}</td><td>${esc(m.column)}</td><td>${esc(m.term)}</td></tr>`).join('')).join('')}
          </tbody></table></div>${matched.length>200?`<p class="hint">Exibindo as primeiras 200 correspondências.</p>`:''}</details>`
          : '<p class="geo-filter-warning">Nenhum registro encontrado para os termos selecionados. Verifique as colunas geográficas e as grafias utilizadas na planilha.</p>'}
      </div>` : ''}
    </section>`;
}
function geoSetDraftMode(mode){
  state.geoDraftMode = mode;
  const input = document.getElementById('geoCustomTerms');
  if (input) input.style.display = mode === 'custom' ? 'inline-block' : 'none';
  if (mode === 'parna') applyGeographicFilter();
}
function applyGeographicFilter(){
  if (!geographicColumns().length){ showAlert('Não foram encontradas as colunas gazetteer, uc ou locnotes.', 'warn'); return; }
  const mode = state.geoDraftMode || 'parna';
  const terms = mode === 'parna' ? GEOGRAPHIC_PRESET_TERMS.slice()
    : state.geoDraftText.split(';').map(term => term.trim()).filter(Boolean);
  if (!terms.length){ showAlert('Informe ao menos um termo personalizado.', 'warn'); return; }
  state.geographicFilter = { mode, terms };
  applyFilters(); renderAll();
}
function clearGeographicFilter(){
  state.geographicFilter = null;
  applyFilters(); renderAll();
}
function norm(v){
  if (v === null || v === undefined) return '';
  let s = String(v).trim(); if (!s) return '';
  const low = s.toLowerCase();
  if (low === 'nan' || low === 'null' || low === 'undefined' || low === 'none') return '';
  return s;
}
function normKey(v){ return norm(v).toLowerCase(); }
function buildProcessedRow(raw){
  const row = { ...raw };
  // findCol cai de volta para o nome original quando a coluna não existe;
  // raw[nome] === undefined e norm(undefined) === '' — sem erro.
  row._kingdom = norm(raw[findCol('kingdom')]);
  row._phylum  = norm(raw[findCol('phylum')]);
  row._class   = norm(raw[findCol('class')]);
  row._order   = norm(raw[findCol('order')]);
  row._family  = norm(raw[findCol('family')]);
  row._genus   = norm(raw[findCol('genus')]);
  row._sp1     = norm(raw[findCol('sp1')]);
  row._sp2     = norm(raw[findCol('sp2')]);
  row._cf      = norm(raw[findCol('cf')]);
  row.Grupo = classifyGroup(row);
  const sp = buildSpeciesName(row);
  row.species_name = sp.name; row._species_status = sp.status;
  return row;
}
function findCol(name){ if (state._colMap && state._colMap[name]) return state._colMap[name]; return name; }

/* ---------------- 4) CLASSIFICAÇÃO ---------------- */
function classifyGroup(row){
  const k = normKey(row._kingdom), p = normKey(row._phylum), c = normKey(row._class);
  if (k === 'fungi') return 'Fungos';
  if (k === 'plantae' && p === 'tracheophyta' && (c === 'magnoliopsida' || c === 'liliopsida')) return 'Angiospermas';
  if (k === 'plantae' && p === 'tracheophyta' && c === 'pinopsida') return 'Gimnospermas';
  if (c === 'lycopodiopsida' || c === 'polypodiopsida') return 'Samambaias e Licófitas';
  if (p === 'bryophyta' || p === 'marchantiophyta' || p === 'anthocerotophyta') return 'Briófitas';
  if (p === 'rhodophyta' || p === 'charophyta' || p === 'ochrophyta') return 'Algas';
  return 'Outros / Não classificado';
}

/* ---------------- 5) NOME CIENTÍFICO ---------------- */
const INVALID_EPITHETS = new Set(['','sp','sp.','spp','spp.','sp1','sp2','sp3','sp4','sp5','cf','cf.','aff','aff.','indet','indet.','undet','undet.','n.i.','ni','?','??']);
function buildSpeciesName(row){
  const g = norm(row._genus); const rawSp = norm(row._sp1);
  if (!g) return { name:'Espécie não determinada', status:'no_genus' };
  if (!rawSp) return { name:'Espécie não determinada', status:'sp_indet' };
  let sp = rawSp.replace(/^(cf\.?|aff\.?)\s+/i, '').trim();
  const key = sp.toLowerCase();
  if (INVALID_EPITHETS.has(key)) return { name:'Espécie não determinada', status:'sp_indet' };
  return { name:`${g} ${sp}`, status:'ok' };
}

/* ---------------- 6) PROCESSAMENTO ---------------- */
function processData(){
  const headerMap = {};
  for (const h of state.columns) headerMap[normalizeHeader(h)] = h;
  state._colMap = headerMap;
  state.processed = state.rawData.map(buildProcessedRow);
  applyFilters();
}
function applyFilters(){
  const f = state.filters; const q = state.search ? state.search.toLowerCase() : '';
  state.filtered = state.processed.filter(r => {
    if (state.geographicFilter && !geographicMatches(r).length) return false;
    if (f.group    && r.Grupo      !== f.group)    return false;
    if (f.kingdom  && r._kingdom   !== f.kingdom)  return false;
    if (f.phylum   && r._phylum    !== f.phylum)   return false;
    if (f.class    && r._class     !== f.class)    return false;
    if (f.order    && r._order     !== f.order)    return false;
    if (f.family   && r._family    !== f.family)   return false;
    if (f.genus    && r._genus     !== f.genus)    return false;
    if (q){
      const hay = [r._family, r._genus, r._order, r._class, r._phylum, r._kingdom, r.species_name].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
function computeStats(rows){
  const distinct = { kingdom:new Set(), phylum:new Set(), class:new Set(), order:new Set(), family:new Set(), genus:new Set(), species:new Set(), group:new Set() };
  for (const r of rows){
    if (r._kingdom) distinct.kingdom.add(r._kingdom);
    if (r._phylum)  distinct.phylum.add(r._phylum);
    if (r._class)   distinct.class.add(r._class);
    if (r._order)   distinct.order.add(r._order);
    if (r._family)  distinct.family.add(r._family);
    if (r._genus)   distinct.genus.add(r._genus);
    if (r._species_status === 'ok') distinct.species.add(r.species_name);
    distinct.group.add(r.Grupo);
  }
  return { records: rows.length,
    kingdoms: distinct.kingdom.size, phylums: distinct.phylum.size,
    classes: distinct.class.size, orders: distinct.order.size,
    families: distinct.family.size, genera: distinct.genus.size,
    species: distinct.species.size, groups: distinct.group.size };
}
function richnessOf(rows){
  const fams=new Set(), gens=new Set(), sps=new Set();
  for (const r of rows){
    if (r._family) fams.add(r._family);
    if (r._genus)  gens.add(r._genus);
    if (r._species_status === 'ok') sps.add(r.species_name);
  }
  return { families:fams.size, genera:gens.size, species:sps.size };
}
function aggregateBy(rows, keyFn, labelFn){
  const map = new Map();
  for (const r of rows){
    const k = keyFn(r); if (!k) continue;
    if (!map.has(k)) map.set(k, { key:k, label:labelFn(r), count:0, rows:[] });
    const e = map.get(k); e.count++; e.rows.push(r);
  }
  return [...map.values()];
}

/* ---------------- 7) FILTROS ---------------- */
function clearFilters(){
  state.filters = {}; state.search = '';
  document.getElementById('searchBox').value = '';
  applyFilters(); renderAll();
}
function applySearch(v){ state.search = (v || '').trim(); applyFilters(); renderAll(); }
function computeFilterOptions(){
  const f = state.filters; const out = {};
  for (const lvl of FILTER_LEVELS){
    const subset = state.processed.filter(r => {
      if (state.geographicFilter && !geographicMatches(r).length) return false;
      for (const other of FILTER_LEVELS){
        if (other === lvl) continue;
        if (f[other] && valueForLevel(r, other) !== f[other]) return false;
      }
      return true;
    });
    const set = new Set();
    for (const r of subset){ const v = valueForLevel(r, lvl); if (v) set.add(v); }
    out[lvl] = [...set].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  }
  return out;
}
function valueForLevel(r, lvl){ return r[lvl === 'group' ? 'Grupo' : '_'+lvl] || ''; }
function renderFilters(){
  const opts = computeFilterOptions();
  const grid = document.getElementById('filtersGrid');
  const labels = { group:'Grupo', kingdom:'Reino', phylum:'Filo', class:'Classe', order:'Ordem', family:'Família', genus:'Gênero' };
  // Em modelo simplificado, esconde filtros de níveis superiores
  const hideForSimplified = new Set(['kingdom','phylum','class','order','group']);
  grid.innerHTML = FILTER_LEVELS.map(lvl => {
    if (state.model === 'simplified' && hideForSimplified.has(lvl)){
      return `<div style="opacity:.45;pointer-events:none;">
        <label>${labels[lvl]}</label>
        <select disabled><option>Indisponível no modelo simplificado</option></select>
      </div>`;
    }
    const curr = state.filters[lvl] || ''; const list = opts[lvl] || [];
    const optionsHtml = `<option value="">Todos (${list.length})</option>` +
      list.map(v => `<option value="${esc(v)}" ${v===curr?'selected':''}>${esc(v)}</option>`).join('');
    return `<div><label>${labels[lvl]}</label><select onchange="onFilterChange('${lvl}', this.value)">${optionsHtml}</select></div>`;
  }).join('');
}
function onFilterChange(lvl, val){
  if (val) state.filters[lvl] = val; else delete state.filters[lvl];
  applyFilters(); renderAll();
}

/* ---------------- 8) RENDER GERAL ---------------- */
function renderAll(){ renderFilters(); renderCards(); renderTabs(); renderTabContent(); }
function renderCards(){
  const s = computeStats(state.filtered);
  const cards = [
    ['Total de registros', s.records],['Reinos', s.kingdoms],['Filos', s.phylums],
    ['Classes', s.classes],['Ordens', s.orders],['Famílias', s.families],
    ['Gêneros', s.genera],['Espécies', s.species],['Grupos', s.groups]
  ];
  // Em modelo simplificado, apenas Reinos/Filos/Classes/Ordens ficam como 0 — honesto.
  document.getElementById('cards').innerHTML = cards.map(([l,v]) =>
    `<div class="card"><div class="label">${l}</div><div class="value">${NF.format(v)}</div></div>`).join('');
}
const TABS = [
  ['visao','Visão geral'],['grupos','Grandes grupos'],['reinos','Reinos'],
  ['filos','Filos'],['classes','Classes'],['ordens','Ordens'],
  ['familias','Famílias'],['generos','Gêneros'],['especies','Espécies'],
  ['cobertura','Cobertura Taxonômica'],
  ['hierarquia','Hierarquia taxonômica'],['qualidade','Qualidade dos dados'],
  ['consistencia','Consistência'],['dados','Dados']
];
const SIMPLIFIED_DISABLED_TABS = new Set(['grupos','reinos','filos','classes','ordens','hierarquia']);
function renderTabs(){
  document.getElementById('tabs').innerHTML = TABS.map(([id,label]) => {
    const isDisabled = state.model === 'simplified' && SIMPLIFIED_DISABLED_TABS.has(id);
    const cls = 'tab-btn' + (state.activeTab===id?' active':'') + (isDisabled?' disabled':'');
    const title = isDisabled ? 'Indisponível no modelo simplificado (sem classificações superiores)' : '';
    return `<button class="${cls}" ${isDisabled?'aria-disabled="true"':''} title="${esc(title)}" onclick="switchTab('${id}')">${label}</button>`;
  }).join('');
}
function switchTab(id){
  if (state.model === 'simplified' && SIMPLIFIED_DISABLED_TABS.has(id)){
    showAlert('Esta seção depende das colunas de classificação superior (kingdom, phylum, class, order), ausentes na planilha simplificada.', 'warn');
    // Ainda assim permitimos abrir para que a mensagem explicativa apareça dentro da aba
  }
  state.activeTab = id; renderTabs(); renderTabContent();
  setTimeout(()=>{ Object.values(state.charts).forEach(c => c && c.resize()); }, 30);
}
function destroyCharts(){
  Object.values(state.charts).forEach(chart => {
    if (chart) chart.destroy();
  });
  state.charts = {};
}
function renderTabContent(){
  destroyCharts();
  const el = document.getElementById('tabContent');
  const fn = {
    visao:renderVisao, grupos:renderGrupos, reinos:renderReinos,
    filos:renderFilos, classes:renderClasses, ordens:renderOrdens,
    familias:renderFamilias, generos:renderGeneros, especies:renderEspecies,
    cobertura:renderCobertura,
    hierarquia:renderHierarquia,
    qualidade:renderQualidade,
    consistencia:renderConsistencia, dados:renderDados
  }[state.activeTab];
  if (fn) fn(el);
}

/* ---------------- 9) DEMAIS ABAS ---------------- */
function renderVisao(el){
  const rows = state.filtered; const s = computeStats(rows);
  // Em modelo simplificado, apenas mostra a parte de riqueza que faz sentido
  if (state.model === 'simplified'){
    el.innerHTML = `
      <h2>Visão geral da coleção filtrada</h2>
      <p class="hint">Números refletem o conjunto filtrado (${NF.format(s.records)} registros).</p>
      <div class="missing-cols-notice" style="margin-bottom:14px;">
        <h3>⚠ Modelo simplificado</h3>
        <p>A planilha carregada não contém as colunas de classificação superior
          (${state.missingComplete.map(c => `<code>${esc(c)}</code>`).join(', ')}).
          Os indicadores de reinos, filos, classes e ordens não estão disponíveis.</p>
      </div>
      <h3>Resumo de riqueza taxonômica disponível</h3>
      <div class="table-wrap"><table><thead><tr><th>Nível</th><th class="num">Táxons distintos</th></tr></thead><tbody>
        <tr><td>Famílias</td><td class="num">${NF.format(s.families)}</td></tr>
        <tr><td>Gêneros</td><td class="num">${NF.format(s.genera)}</td></tr>
        <tr><td>Espécies (determinadas)</td><td class="num">${NF.format(s.species)}</td></tr>
      </tbody></table></div>`;
    return;
  }
  const byGroup = aggregateBy(rows, r=>r.Grupo, r=>r.Grupo).sort((a,b)=>b.count-a.count);
  const gruposHtml = byGroup.map(g => {
    const rich = richnessOf(g.rows);
    const pct = s.records ? (g.count/s.records*100) : 0;
    return `<tr><td><span class="badge" style="background:${GROUP_COLORS[g.label]||'#999'}22;color:${GROUP_COLORS[g.label]||'#333'}">${esc(g.label)}</span></td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(rich.families)}</td><td class="num">${NF.format(rich.genera)}</td>
      <td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Visão geral da coleção filtrada</h2>
    <p class="hint">Números refletem o conjunto filtrado (${NF.format(s.records)} registros).</p>
    <h3>Composição por grandes grupos</h3>
    <div class="table-wrap"><table><thead><tr>
      <th>Grupo</th><th class="num">Registros</th><th class="num">% coleção</th>
      <th class="num">Famílias</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${gruposHtml || '<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div>
    <h3>Resumo de riqueza taxonômica</h3>
    <div class="table-wrap"><table><thead><tr><th>Nível</th><th class="num">Táxons distintos</th></tr></thead><tbody>
      <tr><td>Reinos</td><td class="num">${NF.format(s.kingdoms)}</td></tr>
      <tr><td>Filos</td><td class="num">${NF.format(s.phylums)}</td></tr>
      <tr><td>Classes</td><td class="num">${NF.format(s.classes)}</td></tr>
      <tr><td>Ordens</td><td class="num">${NF.format(s.orders)}</td></tr>
      <tr><td>Famílias</td><td class="num">${NF.format(s.families)}</td></tr>
      <tr><td>Gêneros</td><td class="num">${NF.format(s.genera)}</td></tr>
      <tr><td>Espécies (determinadas)</td><td class="num">${NF.format(s.species)}</td></tr>
    </tbody></table></div>`;
}
function renderGrupos(el){
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Grandes grupos',
      state.missingComplete,
      'A classificação em grandes grupos (Angiospermas, Gimnospermas, etc.) depende das colunas <code>kingdom</code>, <code>phylum</code> e <code>class</code>.');
    return;
  }
  const rows = state.filtered; const total = rows.length;
  const byGroup = GROUPS.map(g => {
    const sub = rows.filter(r => r.Grupo === g);
    const rich = richnessOf(sub);
    return { label:g, count:sub.length, ...rich };
  });
  const tableRows = byGroup.map(g => {
    const pct = total ? (g.count/total*100) : 0;
    return `<tr><td><span class="badge" style="background:${GROUP_COLORS[g.label]}22;color:${GROUP_COLORS[g.label]}">${esc(g.label)}</span></td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(g.families)}</td><td class="num">${NF.format(g.genera)}</td>
      <td class="num">${NF.format(g.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Composição da coleção por grandes grupos</h2>
    <p class="hint">Registros vs. riqueza taxonômica (famílias/gêneros/espécies distintas) por grupo.</p>
    <div class="table-wrap"><table><thead><tr>
      <th>Grupo</th><th class="num">Registros</th><th class="num">% da coleção</th>
      <th class="num">Famílias</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${tableRows}</tbody></table></div>
    <h3>Gráficos</h3>
    <div class="charts-grid">
      <div class="chart-box"><h4>Registros por grupo</h4><button class="dl" onclick="downloadChart('ch_grp_reg')">PNG</button>
        <div class="chart-canvas-wrap"><canvas id="ch_grp_reg"></canvas></div></div>
      <div class="chart-box"><h4>Percentual por grupo</h4><button class="dl" onclick="downloadChart('ch_grp_pct')">PNG</button>
        <div class="chart-canvas-wrap"><canvas id="ch_grp_pct"></canvas></div></div>
      <div class="chart-box" style="grid-column:1/-1;"><h4>Riqueza taxonômica por grupo</h4><button class="dl" onclick="downloadChart('ch_grp_rich')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_grp_rich"></canvas></div></div>
    </div>`;
  const labels = byGroup.map(g=>g.label);
  const colors = byGroup.map(g=>GROUP_COLORS[g.label]);
  makeChart('ch_grp_reg', { type:'bar',
    data:{ labels, datasets:[{ label:'Registros', data: byGroup.map(g=>g.count), backgroundColor:colors }]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
  makeChart('ch_grp_pct', { type:'doughnut',
    data:{ labels, datasets:[{ data: byGroup.map(g=>g.count), backgroundColor:colors }]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right' } } } });
  makeChart('ch_grp_rich', { type:'bar',
    data:{ labels, datasets:[
      { label:'Famílias', data: byGroup.map(g=>g.families), backgroundColor:'#166534' },
      { label:'Gêneros',  data: byGroup.map(g=>g.genera),   backgroundColor:'#0d9488' },
      { label:'Espécies', data: byGroup.map(g=>g.species),  backgroundColor:'#0284c7' }]},
    options:{ responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
}
function renderReinos(el){
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Estatísticas por Reino',
      state.missingComplete,
      'A análise por Reino requer a coluna <code>kingdom</code> (e idealmente também <code>phylum</code>, <code>class</code> e <code>order</code>).');
    return;
  }
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._kingdom.toLowerCase(), r=>r._kingdom).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows);
    const phylums = new Set(g.rows.map(r=>r._phylum).filter(Boolean)).size;
    const classes = new Set(g.rows.map(r=>r._class).filter(Boolean)).size;
    const orders  = new Set(g.rows.map(r=>r._order).filter(Boolean)).size;
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td class="num">${NF.format(g.count)}</td>
      <td class="num">${PF.format(pct)}%</td><td class="num">${NF.format(phylums)}</td>
      <td class="num">${NF.format(classes)}</td><td class="num">${NF.format(orders)}</td>
      <td class="num">${NF.format(rich.families)}</td><td class="num">${NF.format(rich.genera)}</td>
      <td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Estatísticas por Reino</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Reino</th><th class="num">Registros</th><th class="num">%</th>
      <th class="num">Filos</th><th class="num">Classes</th><th class="num">Ordens</th>
      <th class="num">Famílias</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="9">Sem dados.</td></tr>'}</tbody></table></div>
    <div class="charts-grid"><div class="chart-box">
      <h4>Registros por reino</h4><button class="dl" onclick="downloadChart('ch_reino')">PNG</button>
      <div class="chart-canvas-wrap"><canvas id="ch_reino"></canvas></div></div></div>`;
  makeChart('ch_reino', { type:'bar',
    data:{ labels:agg.map(g=>g.label), datasets:[{ label:'Registros', data:agg.map(g=>g.count), backgroundColor:PALETTE }]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ y:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
}
function renderFilos(el){
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Estatísticas por Filo',
      state.missingComplete,
      'A análise por Filo requer a coluna <code>phylum</code>.');
    return;
  }
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._phylum.toLowerCase(), r=>r._phylum).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows);
    const kingdoms = new Set(g.rows.map(r=>r._kingdom).filter(Boolean));
    const classes = new Set(g.rows.map(r=>r._class).filter(Boolean)).size;
    const orders  = new Set(g.rows.map(r=>r._order).filter(Boolean)).size;
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td>${esc([...kingdoms].join(', '))}</td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(classes)}</td><td class="num">${NF.format(orders)}</td>
      <td class="num">${NF.format(rich.families)}</td><td class="num">${NF.format(rich.genera)}</td>
      <td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Estatísticas por Filo</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Filo</th><th>Reino</th><th class="num">Registros</th><th class="num">%</th>
      <th class="num">Classes</th><th class="num">Ordens</th>
      <th class="num">Famílias</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="9">Sem dados.</td></tr>'}</tbody></table></div>`;
}
function renderClasses(el){
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Estatísticas por Classe',
      state.missingComplete,
      'A análise por Classe requer a coluna <code>class</code>.');
    return;
  }
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._class.toLowerCase(), r=>r._class).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows);
    const phylums = new Set(g.rows.map(r=>r._phylum).filter(Boolean));
    const orders  = new Set(g.rows.map(r=>r._order).filter(Boolean)).size;
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td>${esc([...phylums].join(', '))}</td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(orders)}</td><td class="num">${NF.format(rich.families)}</td>
      <td class="num">${NF.format(rich.genera)}</td><td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Estatísticas por Classe</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Classe</th><th>Filo</th><th class="num">Registros</th><th class="num">%</th>
      <th class="num">Ordens</th><th class="num">Famílias</th>
      <th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="8">Sem dados.</td></tr>'}</tbody></table></div>`;
}
function renderOrdens(el){
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Estatísticas por Ordem',
      state.missingComplete,
      'A análise por Ordem requer a coluna <code>order</code>.');
    return;
  }
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._order.toLowerCase(), r=>r._order).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows);
    const classes = new Set(g.rows.map(r=>r._class).filter(Boolean));
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td>${esc([...classes].join(', '))}</td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(rich.families)}</td><td class="num">${NF.format(rich.genera)}</td>
      <td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  el.innerHTML = `
    <h2>Estatísticas por Ordem</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Ordem</th><th>Classe</th><th class="num">Registros</th><th class="num">%</th>
      <th class="num">Famílias</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="7">Sem dados.</td></tr>'}</tbody></table></div>`;
}
function renderFamilias(el){
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._family.toLowerCase(), r=>r._family).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows); const grupo = g.rows[0]?.Grupo || '';
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td>
      <td><span class="badge" style="background:${GROUP_COLORS[grupo]||'#999'}22;color:${GROUP_COLORS[grupo]||'#333'}">${esc(grupo)}</span></td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(rich.genera)}</td><td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  const topReg = [...agg].slice(0,10);
  const topRich = [...agg].map(g => ({ label:g.label, sp: richnessOf(g.rows).species })).sort((a,b)=>b.sp-a.sp).slice(0,10);
  el.innerHTML = `
    <h2>Estatísticas por Família</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Família</th><th>Grupo</th><th class="num">Registros</th>
      <th class="num">% da coleção</th><th class="num">Gêneros</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div>
    <div class="charts-grid">
      <div class="chart-box"><h4>Top 10 famílias — registros</h4><button class="dl" onclick="downloadChart('ch_fam_reg')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_fam_reg"></canvas></div></div>
      <div class="chart-box"><h4>Top 10 famílias — riqueza de espécies</h4><button class="dl" onclick="downloadChart('ch_fam_rich')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_fam_rich"></canvas></div></div>
    </div>`;
  makeChart('ch_fam_reg', { type:'bar',
    data:{ labels:topReg.map(g=>g.label), datasets:[{ label:'Registros', data:topReg.map(g=>g.count), backgroundColor:'#166534' }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
  makeChart('ch_fam_rich', { type:'bar',
    data:{ labels:topRich.map(g=>g.label), datasets:[{ label:'Espécies', data:topRich.map(g=>g.sp), backgroundColor:'#0284c7' }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
}
function renderGeneros(el){
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r._genus.toLowerCase(), r=>r._genus).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const rich = richnessOf(g.rows);
    const fam = g.rows[0]?._family || ''; const grupo = g.rows[0]?.Grupo || '';
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td>${esc(fam)}</td>
      <td><span class="badge" style="background:${GROUP_COLORS[grupo]||'#999'}22;color:${GROUP_COLORS[grupo]||'#333'}">${esc(grupo)}</span></td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td>
      <td class="num">${NF.format(rich.species)}</td></tr>`;
  }).join('');
  const topReg = [...agg].slice(0,20);
  const topSp = [...agg].map(g => ({ label:g.label, sp: richnessOf(g.rows).species })).sort((a,b)=>b.sp-a.sp).slice(0,20);
  el.innerHTML = `
    <h2>Estatísticas por Gênero</h2>
    <div class="table-wrap"><table><thead><tr>
      <th>Gênero</th><th>Família</th><th>Grupo</th>
      <th class="num">Registros</th><th class="num">%</th><th class="num">Espécies</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div>
    <div class="charts-grid">
      <div class="chart-box"><h4>Top 20 gêneros — registros</h4><button class="dl" onclick="downloadChart('ch_gen_reg')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_gen_reg"></canvas></div></div>
      <div class="chart-box"><h4>Top 20 gêneros — riqueza de espécies</h4><button class="dl" onclick="downloadChart('ch_gen_sp')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_gen_sp"></canvas></div></div>
    </div>`;
  makeChart('ch_gen_reg', { type:'bar',
    data:{ labels:topReg.map(g=>g.label), datasets:[{ label:'Registros', data:topReg.map(g=>g.count), backgroundColor:'#0f766e' }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
  makeChart('ch_gen_sp', { type:'bar',
    data:{ labels:topSp.map(g=>g.label), datasets:[{ label:'Espécies', data:topSp.map(g=>g.sp), backgroundColor:'#7c3aed' }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
}
function renderEspecies(el){
  const rows = state.filtered; const total = rows.length;
  const agg = aggregateBy(rows, r=>r.species_name, r=>r.species_name).sort((a,b)=>b.count-a.count);
  const rowsHtml = agg.map(g => {
    const f = g.rows[0];
    const fam = f?._family || ''; const gen = f?._genus || ''; const grupo = f?.Grupo || '';
    const pct = total ? g.count/total*100 : 0;
    return `<tr><td>${esc(g.label)}</td><td>${esc(gen)}</td><td>${esc(fam)}</td>
      <td><span class="badge" style="background:${GROUP_COLORS[grupo]||'#999'}22;color:${GROUP_COLORS[grupo]||'#333'}">${esc(grupo)}</span></td>
      <td class="num">${NF.format(g.count)}</td><td class="num">${PF.format(pct)}%</td></tr>`;
  }).join('');
  const topSp = agg.filter(g => g.label !== 'Espécie não determinada').slice(0,20);
  const determined = agg.filter(g => g.label !== 'Espécie não determinada');
  const freq = new Map();
  for (const g of determined) freq.set(g.count, (freq.get(g.count)||0)+1);
  const freqSorted = [...freq.entries()].sort((a,b)=>a[0]-b[0]);
  const freqHtml = freqSorted.map(([n,cnt]) => `<tr><td>${NF.format(n)}</td><td class="num">${NF.format(cnt)}</td></tr>`).join('');
  const singletons = determined.filter(g => g.count === 1).length;
  const doubletons = determined.filter(g => g.count === 2).length;
  const tripletons = determined.filter(g => g.count === 3).length;
  el.innerHTML = `
    <h2>Estatísticas por Espécie</h2>
    <p class="hint">Espécies determinadas: <b>${NF.format(determined.length)}</b> ·
      Registros como <i>Espécie não determinada</i>: <b>${NF.format(agg.find(g=>g.label==='Espécie não determinada')?.count||0)}</b></p>
    <h3>Distribuição — espécies por número de registros</h3>
    <div class="table-wrap" style="max-height:320px;"><table><thead><tr>
      <th>Espécies representadas por…</th><th class="num">Nº de espécies</th>
    </tr></thead><tbody>${freqHtml || '<tr><td colspan="2">Sem dados.</td></tr>'}</tbody></table></div>
    <p class="hint" style="margin-top:10px;">
      Singletons: <b>${NF.format(singletons)}</b> · Dupletons: <b>${NF.format(doubletons)}</b> · Tripletons: <b>${NF.format(tripletons)}</b>.</p>
    <h3>Top 20 espécies mais representadas</h3>
    <div class="charts-grid"><div class="chart-box">
      <button class="dl" onclick="downloadChart('ch_sp_top')">PNG</button>
      <div class="chart-canvas-wrap tall"><canvas id="ch_sp_top"></canvas></div></div></div>
    <h3>Tabela completa de espécies</h3>
    <div class="table-wrap"><table><thead><tr>
      <th>Espécie</th><th>Gênero</th><th>Família</th><th>Grupo</th>
      <th class="num">Registros</th><th class="num">%</th>
    </tr></thead><tbody>${rowsHtml || '<tr><td colspan="6">Sem dados.</td></tr>'}</tbody></table></div>`;
  makeChart('ch_sp_top', { type:'bar',
    data:{ labels:topSp.map(g=>g.label), datasets:[{ label:'Registros', data:topSp.map(g=>g.count), backgroundColor:'#0891b2' }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v=>NF.format(v) } } } } });
}
function renderQualidade(el){
  const rows = state.filtered;
  const cols = ['_kingdom','_phylum','_class','_order','_family','_genus','_sp1'];
  const labels = { _kingdom:'Reino (kingdom)', _phylum:'Filo (phylum)', _class:'Classe (class)',
    _order:'Ordem (order)', _family:'Família (family)', _genus:'Gênero (genus)', _sp1:'Epíteto específico (sp1)' };
  const total = rows.length;
  const rowsHtml = cols.map(c => {
    const fieldName = c.replace(/^_/,'');
    const colExists = state.model === 'complete' || !['kingdom','phylum','class','order'].includes(fieldName);
    const filled = colExists ? rows.filter(r => r[c]).length : null;
    const empty = colExists ? total - filled : null;
    const pct = (colExists && total) ? filled/total*100 : null;
    if (!colExists){
      return `<tr style="opacity:.55;"><td>${labels[c]}</td><td class="num">—</td><td class="num">—</td>
        <td class="num"><span class="badge">coluna ausente</span></td></tr>`;
    }
    const cls = pct >= 95 ? 'ok' : pct >= 70 ? 'warn' : 'err';
    return `<tr><td>${labels[c]}</td><td class="num">${NF.format(filled)}</td>
      <td class="num">${NF.format(empty)}</td>
      <td class="num"><span class="badge ${cls}">${PF.format(pct)}%</span></td></tr>`;
  }).join('');
  const undet = rows.filter(r => r._species_status !== 'ok').length;
  el.innerHTML = `
    <h2>Qualidade / completude dos dados taxonômicos</h2>
    <p class="hint">Baseado em ${NF.format(total)} registros filtrados.</p>
    <div class="table-wrap"><table><thead><tr>
      <th>Campo</th><th class="num">Preenchidos</th><th class="num">Vazios</th><th class="num">% preenchido</th>
    </tr></thead><tbody>${rowsHtml}</tbody></table></div>
    <p class="hint" style="margin-top:10px;">
      Registros sem determinação específica (sp. / cf. / aff. / sem sp1):
      <b>${NF.format(undet)}</b> (${PF.format(total ? undet/total*100 : 0)}%).</p>`;
}
function renderConsistencia(el){
  const rows = state.filtered; const issues = [];
  const checkMap = (childField, parentField, childLabel, parentLabel) => {
    const map = new Map();
    for (const r of rows){
      const c = norm(r[childField]); const p = norm(r[parentField]);
      if (!c || !p) continue; const ck = c.toLowerCase();
      if (!map.has(ck)) map.set(ck, { label:c, parents:new Set() });
      map.get(ck).parents.add(p);
    }
    const conflicts = [];
    for (const [,v] of map) if (v.parents.size > 1) conflicts.push({ child:v.label, parents:[...v.parents] });
    if (conflicts.length) issues.push({ tipo:`${childLabel} associado a múltiplos ${parentLabel}s`, conflicts });
  };
  checkMap('_genus','_family','Gênero','família');
  if (state.model === 'complete'){
    checkMap('_family','_kingdom','Família','reino');
    checkMap('_genus','_phylum','Gênero','filo');
    checkMap('_family','_order','Família','ordem');
  }
  const spGen = new Map();
  for (const r of rows){
    if (r._species_status !== 'ok') continue;
    const sp = r.species_name.toLowerCase(); const g = norm(r._genus).toLowerCase();
    if (!spGen.has(sp)) spGen.set(sp, { label:r.species_name, gens:new Set() });
    spGen.get(sp).gens.add(g);
  }
  const spConflict = [];
  for (const [,v] of spGen) if (v.gens.size > 1) spConflict.push({ child:v.label, parents:[...v.gens] });
  if (spConflict.length) issues.push({ tipo:'Espécie associada a múltiplos gêneros', conflicts:spConflict });
  if (!issues.length){
    el.innerHTML = `<h2>Verificação de consistência taxonômica</h2>
      <ul class="issue-list"><li class="ok">Nenhuma inconsistência detectada nos registros filtrados.</li></ul>
      <p class="hint">O programa apenas sinaliza; não corrige nem altera a taxonomia da planilha.</p>`;
    return;
  }
  const blocks = issues.map(iss => {
    const items = iss.conflicts.slice(0, 200).map(c =>
      `<li><b>${esc(c.child)}</b> → ${c.parents.map(esc).join(' / ')}</li>`).join('');
    const extra = iss.conflicts.length > 200 ? `<li>… e mais ${iss.conflicts.length - 200} casos.</li>` : '';
    return `<h3>${esc(iss.tipo)} <span class="badge warn">${NF.format(iss.conflicts.length)} casos</span></h3>
      <ul class="issue-list">${items}${extra}</ul>`;
  }).join('');
  el.innerHTML = `<h2>Verificação de consistência taxonômica</h2>
    <p class="hint">Estas ocorrências <b>não significam automaticamente erro</b>.</p>${blocks}`;
}
function renderDados(el){
  const rows = state.filtered;
  const pageSize = 100; const maxPage = Math.max(1, Math.ceil(rows.length / pageSize));
  if (state.dataPage > maxPage) state.dataPage = 1;
  const start = (state.dataPage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);
  const origCols = state.columns;
  const calcCols = ['Grupo','species_name'];
  const header = ['#', ...origCols, ...calcCols];
  const body = pageRows.map((r, i) =>
    `<tr><td>${start + i + 1}</td>
      ${origCols.map(c => `<td>${esc(r[c] ?? '')}</td>`).join('')}
      <td>${esc(r.Grupo)}</td><td>${esc(r.species_name)}</td></tr>`).join('');
  el.innerHTML = `
    <h2>Dados originais e colunas calculadas</h2>
    <p class="hint">Mostrando ${NF.format(pageRows.length)} de ${NF.format(rows.length)} registros filtrados.</p>
    <div class="table-wrap" style="max-height:640px;"><table>
      <thead><tr>${header.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${body || `<tr><td colspan="${header.length}">Sem dados.</td></tr>`}</tbody>
    </table></div>
    <div class="pagination">
      <button onclick="gotoPage(1)" ${state.dataPage===1?'disabled':''}>« Primeira</button>
      <button onclick="gotoPage(${state.dataPage-1})" ${state.dataPage===1?'disabled':''}>‹ Anterior</button>
      <span>Página ${state.dataPage} de ${maxPage}</span>
      <button onclick="gotoPage(${state.dataPage+1})" ${state.dataPage>=maxPage?'disabled':''}>Próxima ›</button>
      <button onclick="gotoPage(${maxPage})" ${state.dataPage>=maxPage?'disabled':''}>Última »</button>
    </div>`;
}
function gotoPage(p){ state.dataPage = p; renderTabContent(); }
function makeChart(id, config){
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (state.charts[id]) state.charts[id].destroy();
  state.charts[id] = new Chart(canvas.getContext('2d'), config);
}
function downloadChart(id){
  const c = state.charts[id]; if (!c) return;
  const a = document.createElement('a');
  a.href = c.toBase64Image('image/png', 1);
  a.download = id + '.png'; a.click();
}

/* ==================================================================
   9.5) HIERARQUIA TAXONÔMICA — guard para modelo simplificado
   ================================================================== */
const HIER_LEVELS = [
  { key:'Grupo',        rank:'group',   label:'Grupo',   color:'#16a34a' },
  { key:'_kingdom',     rank:'kingdom', label:'Reino',   color:'#0d9488' },
  { key:'_phylum',      rank:'phylum',  label:'Filo',    color:'#0284c7' },
  { key:'_class',       rank:'class',   label:'Classe',  color:'#7c3aed' },
  { key:'_order',       rank:'order',   label:'Ordem',   color:'#a16207' },
  { key:'_family',      rank:'family',  label:'Família', color:'#ea580c' },
  { key:'_genus',       rank:'genus',   label:'Gênero',  color:'#be185d' },
  { key:'species_name', rank:'species', label:'Espécie', color:'#475569' }
];
const hierState = {
  root:null, index:new Map(), expanded:new Set(),
  selectedPath:null, searchTerm:'', searchResults:[], searchIndex:-1, _initialized:false
};
function hierEscAttr(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function hierEscHtml(s){ return String(s ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function hierBuildTree(){
  const rows = state.filtered;
  const root = { name:'(raiz)', rank:'root', rankLabel:'', color:'#000',
                 path:'', count:0, children:[], _map:new Map(), parent:null, depth:0 };
  for (const r of rows){
    let node = root; node.count++;
    for (let i = 0; i < HIER_LEVELS.length; i++){
      const lvl = HIER_LEVELS[i];
      const raw = norm(r[lvl.key]); const val = raw || '(não informado)';
      if (!node._map.has(val)){
        const path = (node.path ? node.path + ' › ' : '') + val;
        const child = { name: val, rank: lvl.rank, rankLabel: lvl.label, color: lvl.color,
          path, count:0, children:[], _map:new Map(), parent: node, depth: i + 1 };
        node._map.set(val, child); node.children.push(child);
      }
      node = node._map.get(val); node.count++;
    }
  }
  (function walk(n){
    delete n._map;
    let desc = 0;
    for (const c of n.children){ walk(c); desc += 1 + c._descendants; }
    n._descendants = desc;
    n._directChildren = n.children.length;
    n.children.sort((a,b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  })(root);
  hierState.root = root;
  hierState.index = new Map();
  (function idx(n){ if (n.depth >= 1) hierState.index.set(n.path, n); n.children.forEach(idx); })(root);
}
function hierAncestors(node){
  const chain = []; let p = node.parent;
  while (p && p.depth >= 1){ chain.unshift(p); p = p.parent; }
  return chain;
}
function hierExpandAncestors(node){ for (const a of hierAncestors(node)) hierState.expanded.add(a.path); }
function hierNodeInfo(node){
  const parts = [];
  if (node.children.length > 0){
    const childRankLabel = (node.children[0].rankLabel || '').toLowerCase();
    const plural = node.children.length !== 1 ? 's' : '';
    parts.push(`${NF.format(node.children.length)} ${childRankLabel}${plural}`);
  }
  parts.push(`${NF.format(node.count)} registro${node.count !== 1 ? 's' : ''}`);
  return parts.join(' · ');
}
function hierRenderNode(node){
  if (node.depth === 0) return node.children.map(hierRenderNode).join('');
  const expanded = hierState.expanded.has(node.path);
  const hasChildren = node.children.length > 0;
  const isSelected = hierState.selectedPath === node.path;
  const isHit = hierState.searchResults.some(n => n.path === node.path);
  const currentHit = hierState.searchResults[hierState.searchIndex];
  const isCurrentHit = currentHit && currentHit.path === node.path;
  let classes = 'hier-node';
  if (isSelected) classes += ' is-selected';
  if (isHit) classes += ' is-hit';
  if (isCurrentHit) classes += ' is-current-hit';
  classes += hasChildren ? ' has-children' : ' is-leaf';
  const toggleBtn = hasChildren
    ? `<button type="button" class="hier-toggle" data-path="${hierEscAttr(node.path)}"
              aria-expanded="${expanded ? 'true' : 'false'}"
              aria-label="${expanded ? 'Recolher' : 'Expandir'} ${hierEscAttr(node.name)}"
              title="${expanded ? 'Recolher' : 'Expandir'}">${expanded ? '▾' : '▸'}</button>`
    : `<span class="hier-toggle-placeholder" aria-hidden="true"></span>`;
  const info = hierNodeInfo(node);
  let html = `<div class="${classes}" data-path="${hierEscAttr(node.path)}">
      <div class="hier-row" data-rank="${node.rank}" style="--hier-color:${node.color}">
        ${toggleBtn}
        <span class="hier-badge" style="background:${node.color}1f;color:${node.color};border-color:${node.color}40">${hierEscHtml(node.rankLabel)}</span>
        <span class="hier-name" title="${hierEscAttr(node.name)}">${hierEscHtml(node.name)}</span>
        <span class="hier-info">${hierEscHtml(info)}</span>
      </div>`;
  if (hasChildren && expanded){
    html += `<div class="hier-children">${node.children.map(hierRenderNode).join('')}</div>`;
  }
  html += `</div>`;
  return html;
}
function hierRenderAll(){
  const host = document.getElementById('hierTree');
  if (!host) return;
  if (!hierState.root){ host.innerHTML = '<p class="hint">Nenhum dado carregado.</p>'; return; }
  host.innerHTML = hierState.root.children.length
    ? hierState.root.children.map(hierRenderNode).join('')
    : '<p class="hint">Nenhum registro no conjunto filtrado.</p>';
  const info = document.getElementById('hierStats');
  if (info) info.textContent = `${NF.format(hierState.index.size)} táxons · ${NF.format(hierState.expanded.size)} expandidos · ${NF.format(state.filtered.length)} registros`;
}
function hierToggleNode(event, path){
  if (event) event.stopPropagation();
  if (hierState.expanded.has(path)) hierState.expanded.delete(path);
  else hierState.expanded.add(path);
  hierRenderAll();
}
function hierSelectNode(path){
  if (!path) return;
  hierState.selectedPath = path;
  hierRenderAll(); hierUpdateBreadcrumb();
}
function hierAutoExpandInitial(){
  hierState.expanded.clear();
  if (hierState.root){ for (const g of hierState.root.children) hierState.expanded.add(g.path); }
}
function hierExpandAll(){
  if (!hierState.root) return;
  const total = hierState.index.size;
  if (total > 3000){
    const ok = confirm(`A árvore possui ${NF.format(total)} táxons. Expandir tudo pode deixar a visualização extensa e reduzir o desempenho.\n\nDeseja continuar?`);
    if (!ok) return;
  }
  hierState.expanded.clear();
  (function walk(n){ if (n.children.length > 0) hierState.expanded.add(n.path); n.children.forEach(walk); })(hierState.root);
  hierRenderAll();
}
function hierCollapseAll(){ hierState.expanded.clear(); hierRenderAll(); }
function hierExpandTo(rank){
  const targetDepth = { group:1, kingdom:2, phylum:3, class:4, order:5, family:6, genus:7, species:8 }[rank] || 6;
  hierState.expanded.clear();
  (function walk(n){
    if (n.depth >= 1 && n.depth < targetDepth && n.children.length > 0) hierState.expanded.add(n.path);
    n.children.forEach(walk);
  })(hierState.root);
  hierRenderAll();
}
function hierSearchInput(v){
  hierState.searchTerm = (v || '').trim().toLowerCase();
  hierState.searchResults = []; hierState.searchIndex = -1;
  if (!hierState.searchTerm || !hierState.root){ hierRenderAll(); hierUpdateSearchInfo(); return; }
  const matches = [];
  (function walk(n){
    if (n.depth >= 1 && n.name.toLowerCase().includes(hierState.searchTerm)) matches.push(n);
    n.children.forEach(walk);
  })(hierState.root);
  matches.sort((a,b) => a.depth - b.depth || b.count - a.count);
  hierState.searchResults = matches;
  if (matches.length){ hierState.searchIndex = 0; hierJumpToResult(0); }
  else { hierRenderAll(); hierUpdateSearchInfo(); }
}
function hierUpdateSearchInfo(){
  const el = document.getElementById('hierSearchInfo'); if (!el) return;
  if (!hierState.searchTerm){ el.textContent = ''; return; }
  if (!hierState.searchResults.length){ el.textContent = 'Nenhum resultado'; return; }
  el.textContent = `${hierState.searchIndex + 1} de ${hierState.searchResults.length}`;
}
function hierJumpToResult(idx){
  const node = hierState.searchResults[idx]; if (!node) return;
  hierExpandAncestors(node);
  hierState.selectedPath = node.path;
  hierRenderAll(); hierUpdateBreadcrumb(); hierUpdateSearchInfo();
  requestAnimationFrame(() => {
    const els = document.querySelectorAll('#hierTree .hier-node');
    for (const el of els){
      if (el.dataset.path === node.path){ el.scrollIntoView({ behavior:'smooth', block:'center' }); break; }
    }
  });
}
function hierNextResult(){
  if (!hierState.searchResults.length) return;
  hierState.searchIndex = (hierState.searchIndex + 1) % hierState.searchResults.length;
  hierJumpToResult(hierState.searchIndex);
}
function hierPrevResult(){
  if (!hierState.searchResults.length) return;
  hierState.searchIndex = (hierState.searchIndex - 1 + hierState.searchResults.length) % hierState.searchResults.length;
  hierJumpToResult(hierState.searchIndex);
}
function hierUpdateBreadcrumb(){
  const bcEl = document.getElementById('hierBreadcrumb'); if (!bcEl) return;
  if (!hierState.selectedPath){
    bcEl.innerHTML = '<span class="hier-bc-placeholder">Clique em um táxon para ver o caminho hierárquico.</span>'; return;
  }
  const node = hierState.index.get(hierState.selectedPath);
  if (!node){ bcEl.innerHTML = '<span class="hier-bc-placeholder">Táxon não encontrado.</span>'; return; }
  const chain = []; let n = node;
  while (n && n.depth >= 1){ chain.unshift(n); n = n.parent; }
  bcEl.innerHTML = '<span class="hier-bc-label">Caminho:</span> ' +
    chain.map((x, i) => {
      const sep = i < chain.length - 1 ? '<span class="hier-bc-sep">›</span>' : '';
      return `<a href="#" class="hier-bc-item" data-path="${hierEscAttr(x.path)}">${hierEscHtml(x.name)}</a>${sep}`;
    }).join(' ');
}
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('#hierTree .hier-toggle');
  if (toggle){ e.stopPropagation(); e.preventDefault(); hierToggleNode(null, toggle.getAttribute('data-path')); return; }
  const row = e.target.closest('#hierTree .hier-row');
  if (row){ const nodeEl = row.closest('.hier-node'); if (nodeEl) hierSelectNode(nodeEl.getAttribute('data-path')); return; }
  const bcItem = e.target.closest('#hierBreadcrumb .hier-bc-item');
  if (bcItem){ e.preventDefault(); hierSelectNode(bcItem.getAttribute('data-path')); }
});

function renderHierarquia(el){
  // NOVO — guarda para modelo simplificado
  if (state.model === 'simplified'){
    el.innerHTML = renderMissingColumnsNotice('Hierarquia taxonômica',
      state.missingComplete,
      'A hierarquia taxonômica completa (Grupo → Reino → Filo → Classe → Ordem → Família → Gênero → Espécie) depende das colunas de classificação superior.');
    return;
  }
  hierBuildTree();
  if (!hierState._initialized){ hierAutoExpandInitial(); hierState._initialized = true; }
  else {
    const still = new Set();
    for (const p of hierState.expanded) if (hierState.index.has(p)) still.add(p);
    hierState.expanded = still;
    if (hierState.selectedPath && !hierState.index.has(hierState.selectedPath)) hierState.selectedPath = null;
  }
  el.innerHTML = `
    <h2>Hierarquia taxonômica</h2>
    <p class="hint">Estrutura <b>Grupo → Reino → Filo → Classe → Ordem → Família → Gênero → Espécie</b>.
      Clique nos nós para expandir/recolher. Contagens refletem o conjunto filtrado.</p>
    <div class="hier-panel">
      <div class="hier-toolbar">
        <div class="hier-search-row">
          <input type="text" id="hierSearch" class="hier-search-input"
                 placeholder="🔎 Pesquisar táxon por nome (ex.: Fabaceae, Inga, Inga vera)..."
                 value="${hierEscAttr(hierState.searchTerm)}"
                 oninput="hierSearchInput(this.value)"
                 aria-label="Pesquisar táxon na hierarquia">
          <span id="hierSearchInfo" class="hier-search-info"></span>
          <button type="button" class="hier-btn-sm" onclick="hierPrevResult()" title="Resultado anterior">◀</button>
          <button type="button" class="hier-btn-sm" onclick="hierNextResult()" title="Próximo resultado">▶</button>
        </div>
        <div class="hier-controls-row">
          <span class="hier-controls-label">Expandir até:</span>
          <button type="button" class="hier-btn-sm" onclick="hierExpandTo('order')">Ordem</button>
          <button type="button" class="hier-btn-sm" onclick="hierExpandTo('family')">Família</button>
          <button type="button" class="hier-btn-sm" onclick="hierExpandTo('genus')">Gênero</button>
          <button type="button" class="hier-btn-sm" onclick="hierExpandAll()">Tudo</button>
          <span class="hier-controls-sep"></span>
          <button type="button" class="hier-btn-sm" onclick="hierCollapseAll()">Recolher tudo</button>
          <span class="hier-stats" id="hierStats"></span>
        </div>
      </div>
      <div class="hier-breadcrumb" id="hierBreadcrumb" aria-live="polite">
        <span class="hier-bc-placeholder">Clique em um táxon para ver o caminho hierárquico.</span>
      </div>
      <div class="hier-legend" aria-hidden="true">
        ${HIER_LEVELS.map(l => `<span class="hier-legend-item"><span class="hier-legend-dot" style="background:${l.color}"></span>${hierEscHtml(l.label)}</span>`).join('')}
      </div>
      <div class="hier-viewport" id="hierTree" role="tree" aria-label="Hierarquia taxonômica"></div>
    </div>`;
  hierRenderAll(); hierUpdateBreadcrumb(); hierUpdateSearchInfo();
}

/* ==================================================================
   9.6) COBERTURA TAXONÔMICA (inalterada — funciona nos 2 modelos)
   ================================================================== */
const TAXON_MARKERS = new Set(['','sp','sp.','spp','spp.','sp1','sp2','sp3','sp4','sp5',
  'indet','indet.','undet','undet.','n.i.','ni','?','??','-','--','n/d','nd']);
const COVERAGE_LEVELS = [
  { key:'species',      label:'Espécie',       color:'#2e7d5b' },
  { key:'genus',        label:'Gênero',        color:'#6ba3c9' },
  { key:'family',       label:'Família',       color:'#8fb8d8' },
  { key:'indetermined', label:'Indeterminada', color:'#a5c4dc' }
];
function normalizeEpithet(raw){
  let s = norm(raw).toLowerCase();
  s = s.replace(/^(cf\.?|aff\.?)\s+/i, '').trim();
  if (TAXON_MARKERS.has(s)) return '';
  return s;
}
function calculateIdentificationLevel(row){
  const genus  = norm(row._genus);
  const family = norm(row._family);
  const sp1    = normalizeEpithet(row._sp1);
  if (genus && sp1) return 'species';
  if (genus)        return 'genus';
  if (family)       return 'family';
  return 'indetermined';
}
function hasCfOrAff(row){
  const cf = norm(row._cf).toLowerCase();
  if (cf === 'cf' || cf === 'cf.' || cf === 'aff' || cf === 'aff.') return true;
  return /^(cf\.?|aff\.?)\s+/i.test(norm(row._sp1));
}
function calculateTaxonomicCoverage(rows){
  const counts = { species:0, genus:0, family:0, indetermined:0 };
  let cfAff = 0;
  for (const r of rows){
    counts[calculateIdentificationLevel(r)]++;
    if (hasCfOrAff(r)) cfAff++;
  }
  const total = rows.length;
  const entries = COVERAGE_LEVELS.map(l => ({
    key: l.key, label: l.label, color: l.color,
    count: counts[l.key], pct: total ? counts[l.key] / total * 100 : 0
  }));
  return { total, entries, cfAff };
}
function calculateFamilyDistribution(rows){
  const map = new Map(); let totalWithFamily = 0;
  for (const r of rows){
    const fam = norm(r._family); if (!fam) continue;
    totalWithFamily++;
    map.set(fam, (map.get(fam) || 0) + 1);
  }
  const sorted = [...map.entries()]
    .map(([name, count]) => ({ name, count, pct: totalWithFamily ? count / totalWithFamily * 100 : 0 }))
    .sort((a,b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'));
  return { sorted, totalWithFamily };
}
function calculateUniqueTaxa(rows){
  const speciesSet = new Set(), generaSet = new Set(), familiesSet = new Set();
  let noFamily = 0, noGenus = 0, noSp1 = 0;
  for (const r of rows){
    const fam = norm(r._family), gen = norm(r._genus), sp1 = normalizeEpithet(r._sp1);
    if (fam) familiesSet.add(fam); else noFamily++;
    if (gen) generaSet.add(gen);   else noGenus++;
    if (!sp1) noSp1++;
    if (gen && sp1) speciesSet.add((gen + ' ' + sp1).toLowerCase());
  }
  return { species:speciesSet.size, genera:generaSet.size, families:familiesSet.size, noFamily, noGenus, noSp1 };
}
function calculateFamilyCoverage(rows){
  const map = new Map();
  for (const r of rows){
    const fam = norm(r._family); if (!fam) continue;
    if (!map.has(fam)) map.set(fam, {
      family: fam, total:0, species:0, genus:0, familyLevel:0, indet:0,
      speciesWithReserve:0, speciesSet:new Set(), genusSet:new Set()
    });
    const e = map.get(fam);
    e.total++;
    const lvl = calculateIdentificationLevel(r);
    if (lvl === 'species') e.species++;
    else if (lvl === 'genus') e.genus++;
    else if (lvl === 'family') e.familyLevel++;
    else e.indet++;
    if (lvl === 'species' && hasCfOrAff(r)) e.speciesWithReserve++;
    const g = norm(r._genus), sp1 = normalizeEpithet(r._sp1);
    if (g) e.genusSet.add(g);
    if (g && sp1) e.speciesSet.add((g + ' ' + sp1).toLowerCase());
  }
  const out = [];
  for (const [, e] of map){
    const pct = (n) => e.total ? n / e.total * 100 : 0;
    const gap = e.total - e.species;
    out.push({
      family: e.family, total: e.total, species: e.species, genus: e.genus,
      familyLevel: e.familyLevel, indet: e.indet,
      speciesWithReserve: e.speciesWithReserve,
      distinctSpecies: e.speciesSet.size, distinctGenera: e.genusSet.size,
      gap: gap, pctSpecies: pct(e.species), pctGenus: pct(e.genus),
      pctFamily: pct(e.familyLevel), pctIndet: pct(e.indet),
      pctWithReserve: pct(e.speciesWithReserve), pctGap: pct(gap)
    });
  }
  return out;
}
const COB_SORT_MODES = {
  total_desc:       { label:'Maior total de registros',            fn:(a,b) => b.total - a.total || a.family.localeCompare(b.family) },
  species_desc:     { label:'Maior nº até espécie',                fn:(a,b) => b.species - a.species || a.family.localeCompare(b.family) },
  species_pct_desc: { label:'Maior % até espécie',                 fn:(a,b) => b.pctSpecies - a.pctSpecies || b.total - a.total },
  genus_desc:       { label:'Maior nº só até gênero',              fn:(a,b) => b.genus - a.genus || a.family.localeCompare(b.family) },
  family_desc:      { label:'Maior nº só até família',             fn:(a,b) => b.familyLevel - a.familyLevel || a.family.localeCompare(b.family) },
  indet_desc:       { label:'Maior nº indeterminado',              fn:(a,b) => b.indet - a.indet || a.family.localeCompare(b.family) },
  gap_desc:         { label:'Maior gap absoluto até espécie',      fn:(a,b) => b.gap - a.gap || a.family.localeCompare(b.family) },
  gap_pct_desc:     { label:'Maior % não identificado até espécie', fn:(a,b) => b.pctGap - a.pctGap || b.gap - a.gap },
  alpha:            { label:'Alfabética',                          fn:(a,b) => a.family.localeCompare(b.family, 'pt-BR') }
};
function sortFamilyCoverage(list, mode){
  const cfg = COB_SORT_MODES[mode] || COB_SORT_MODES.total_desc;
  return [...list].sort(cfg.fn);
}
function cobApplyFilters(famCov){
  const f = state.cobFilters;
  const num = (v) => v === '' || v === null || v === undefined ? null : Number(v);
  const minTotal = num(f.minTotal), minPctSpecies = num(f.minPctSpecies),
        maxPctSpecies = num(f.maxPctSpecies), minPctGap = num(f.minPctGap), minGap = num(f.minGap);
  const q = f.search ? f.search.toLowerCase() : '';
  let list = famCov.filter(x => {
    if (minTotal !== null && x.total < minTotal) return false;
    if (minPctSpecies !== null && x.pctSpecies < minPctSpecies) return false;
    if (maxPctSpecies !== null && x.pctSpecies > maxPctSpecies) return false;
    if (minPctGap !== null && x.pctGap < minPctGap) return false;
    if (minGap !== null && x.gap < minGap) return false;
    if (q && !x.family.toLowerCase().includes(q)) return false;
    return true;
  });
  const k = f.sortKey, dir = f.sortDir;
  list.sort((a,b) => {
    const va = a[k], vb = b[k];
    if (typeof va === 'number' && typeof vb === 'number') return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc' ? String(va).localeCompare(String(vb),'pt-BR')
                         : String(vb).localeCompare(String(va),'pt-BR');
  });
  return list;
}

/* ---- Textos de ajuda contextual ---- */
const HELP = {
  donut: 'Distribuição dos <b>registros</b> por nível de determinação taxonômica. As categorias são mutuamente exclusivas: cada registro entra em apenas uma delas. "Espécie" exige gênero + epíteto válido; "Gênero" tem gênero sem epíteto; "Família" tem família sem gênero; "Indeterminada" não tem família nem gênero. Registros com <b>cf./aff.</b> permanecem em "Espécie" mas são sinalizados abaixo do gráfico.',
  topFam: 'Famílias com maior número absoluto de registros no conjunto filtrado. O percentual é calculado sobre o total de registros que <b>possuem família informada</b> (registros sem família não entram neste denominador).',
  fig1: 'Cobertura taxonômica por família em valores absolutos. Cada família exibe 5 barras: <b>Total</b> (referência), <b>Até espécie</b>, <b>Só até gênero</b>, <b>Só até família</b> e <b>Indeterminado</b>. As quatro categorias de identificação são mutuamente exclusivas e somam o total. A série "Total" é apenas referência — não deve ser somada às demais.',
  fig2: 'Cobertura percentual por família (100% empilhado). Cada barra representa uma família e soma 100% — útil para comparar famílias de tamanhos muito diferentes. O percentual é calculado sobre o total de registros da própria família.',
  topAbs: 'Famílias com maior <b>quantidade absoluta</b> de registros não identificados até espécie (gap absoluto). Esta métrica favorece famílias grandes e não indica necessariamente pior cobertura proporcional.',
  topPct: 'Famílias com maior <b>percentual</b> de registros não identificados até espécie, considerando apenas famílias com 5 ou mais registros. Mostra onde a cobertura proporcional é mais baixa, independente do tamanho.',
  topGenus: 'Famílias com maior número absoluto de registros identificados <b>somente até gênero</b> — possuem gênero determinado, mas sem epíteto específico válido.',
  topFamilyLv: 'Famílias com maior número absoluto de registros identificados <b>somente até família</b> — não possuem gênero determinado.',
  topIndet: 'Registros classificados como <b>indeterminados</b> (sem família e sem gênero). Por definição, esta categoria não pode ser agrupada por família, pois registros indeterminados não possuem família associada. O valor exibido é a contagem global no conjunto filtrado.',
  sortSelect: 'Controla a <b>ordem</b> em que as famílias aparecem no gráfico e nas tabelas. Cada critério responde a uma pergunta diferente: alguns priorizam tamanho absoluto da coleção, outros a proporção de registros bem identificados. A ordenação não altera os valores, apenas a sequência de exibição.',
  filterPanel: 'Filtros que restringem as famílias <b>exibidas</b> nos gráficos e tabelas desta seção. Não alteram os indicadores gerais da coleção (cards no topo). Use "Limpar filtros das tabelas" para reverter.',
  colFamily: 'Nome da família taxonômica conforme registrado na coluna <b>family</b> da planilha JABOT. Clique para filtrar a análise por esta família.',
  colTotal: 'Número total de <b>registros</b> (espécimes) atribuídos à família. Não representa quantidade de espécies distintas.',
  colSpecies: 'Registros identificados até <b>espécie</b>: possuem gênero e epíteto específico válido em <b>sp1</b> (prefixos cf./aff. são removidos antes da validação).',
  colPctSpecies: 'Proporção de registros identificados até espécie em relação ao total de registros <b>da própria família</b>.',
  colGenus: 'Registros identificados <b>somente até gênero</b>: possuem gênero preenchido, mas sem epíteto específico válido (sp1 vazio ou contendo marcadores como "sp.", "spp.", "indet.").',
  colPctGenus: 'Proporção de registros identificados somente até gênero em relação ao total da família.',
  colFamilyLv: 'Registros identificados <b>somente até família</b>: possuem família preenchida, mas sem gênero identificável.',
  colPctFamily: 'Proporção de registros identificados somente até família em relação ao total da família.',
  colIndet: 'Registros <b>indeterminados</b>: sem família e sem gênero informados. <b>Atenção:</b> dentro da análise por família esta categoria é estruturalmente zero, pois todo registro aqui incluído possui família.',
  colPctIndet: 'Proporção de registros indeterminados em relação ao total da família. Como a categoria exige ausência de família, este valor é sempre 0 nesta tabela.',
  colReserve: 'Registros identificados até espécie que possuem marcadores de incerteza (<b>cf.</b> ou <b>aff.</b>) em sp1 ou na coluna cf. Não são excluídos de "Espécie" — apenas contabilizados em paralelo.',
  colPctReserve: 'Proporção de registros com ressalva (cf./aff.) em relação ao total da família.',
  colDistinctSp: 'Quantidade de <b>espécies distintas</b> reconhecidas na família, pela chave gênero + sp1 normalizado em minúsculas. Vários registros da mesma espécie contam como 1 espécie.',
  colDistinctGen: 'Quantidade de <b>gêneros distintos</b> representados na família.',
  colGap: 'Número de registros da família que <b>não</b> estão identificados até espécie sem ressalva. Equivale a: total − registros até espécie.',
  colPctGap: 'Percentual do gap absoluto em relação ao total da família.',
  figure1Title: 'Figura 1 — Cobertura por família (absoluta)',
  figure2Title: 'Figura 2 — Cobertura por família (100% empilhado)',
  clearSel: 'Remove o filtro de família aplicado por clique na tabela. Não apaga a planilha carregada, não recarrega os dados e não afeta outros filtros independentes.'
};

function renderCobertura(el){
  const rows = state.filtered;
  const geoPanel = renderGeographicFilterPanel();
  if (!rows.length){
    el.innerHTML = `
      <h2>Cobertura Taxonômica</h2>
      ${geoPanel}
      <p class="hint">Nenhum registro disponível. Importe uma planilha ou ajuste os filtros.</p>`;
    return;
  }
  const coverage = calculateTaxonomicCoverage(rows);
  const families = calculateFamilyDistribution(rows);
  const unique   = calculateUniqueTaxa(rows);
  const topN = state.coberturaTopN || 10;
  const topFamilies = families.sorted.slice(0, topN);
  const famCov = calculateFamilyCoverage(rows);
  const famWith100pct = famCov.filter(f => f.total > 0 && f.species === f.total).length;

  // Aviso discreto quando estamos em modelo simplificado
  const simplBanner = (state.model === 'simplified')
    ? `<div class="missing-cols-notice" style="margin-bottom:14px;">
        <h3>⚠ Modelo simplificado</h3>
        <p>A planilha não contém as colunas de classificação superior
          (${state.missingComplete.map(c=>`<code>${esc(c)}</code>`).join(', ')}).
          A análise de cobertura abaixo é calculada diretamente a partir de
          <code>family</code>, <code>genus</code> e <code>sp1</code>.</p>
      </div>` : '';

  el.innerHTML = `
    <h2>Cobertura Taxonômica</h2>
    ${geoPanel}
    <p class="hint">Nível de determinação dos registros e famílias mais representadas.
      Base: <b>${NF.format(coverage.total)}</b> registros
      ${Object.keys(state.filters).length ? '<i>(filtro ativo)</i>' : ''}.</p>

    ${simplBanner}

    <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:14px;">
      <div class="card"><div class="label">Registros analisados</div><div class="value">${NF.format(coverage.total)}</div></div>
      <div class="card"><div class="label">Espécies distintas</div><div class="value">${NF.format(unique.species)}</div></div>
      <div class="card"><div class="label">Gêneros distintos</div><div class="value">${NF.format(unique.genera)}</div></div>
      <div class="card"><div class="label">Famílias distintas</div><div class="value">${NF.format(unique.families)}</div></div>
      <div class="card"><div class="label">Registros sem família</div><div class="value">${NF.format(unique.noFamily)}</div></div>
      <div class="card"><div class="label">Registros sem gênero</div><div class="value">${NF.format(unique.noGenus)}</div></div>
      <div class="card"><div class="label">Famílias 100% até espécie</div><div class="value">${NF.format(famWith100pct)}</div></div>
    </div>

    <div class="charts-grid">
      <div class="chart-box">
        <h4>Nível de determinação taxonômica ${helpIcon(HELP.donut)}</h4>
        <button class="dl" onclick="downloadChart('ch_cob_donut')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_cob_donut"></canvas></div>
        <p class="hint" style="margin-top:8px;">
          Registros com <b>cf./aff.</b> (com ressalva): <b>${NF.format(coverage.cfAff)}</b>.</p>
      </div>
      <div class="chart-box">
        <h4>Famílias mais representadas ${helpIcon(HELP.topFam)}
          <select onchange="state.coberturaTopN=Number(this.value); renderTabContent();"
                  style="margin-left:8px;padding:3px 6px;border:1px solid var(--border);border-radius:5px;font-size:12px;">
            ${[10,15,20,30,50].map(n => `<option value="${n}" ${n===topN?'selected':''}>Top ${n}</option>`).join('')}
          </select>
        </h4>
        <button class="dl" onclick="downloadChart('ch_cob_fam')">PNG</button>
        <div class="chart-canvas-wrap tall"><canvas id="ch_cob_fam"></canvas></div>
        <p class="hint" style="margin-top:8px;">
          Denominador: <b>${NF.format(families.totalWithFamily)}</b> registros com família informada
          (${NF.format(unique.noFamily)} sem família).</p>
      </div>
    </div>

    <h3>Tabela detalhada — nível de determinação</h3>
    <div class="table-wrap" style="max-height:280px;">
      <table>
        <thead><tr><th>Nível</th><th class="num">Registros</th><th class="num">% do total</th></tr></thead>
        <tbody>
          ${coverage.entries.map(e => `<tr>
            <td><span class="badge" style="background:${e.color}22;color:${e.color}">${esc(e.label)}</span></td>
            <td class="num">${NF.format(e.count)}</td>
            <td class="num">${PF.format(e.pct)}%</td>
          </tr>`).join('')}
          <tr style="background:#f8fafc;font-weight:600;">
            <td>Total</td><td class="num">${NF.format(coverage.total)}</td><td class="num">100,00%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Tabela detalhada — famílias mais representadas</h3>
    <div class="table-wrap" style="max-height:420px;">
      <table>
        <thead><tr><th>#</th><th>Família</th><th class="num">Registros</th><th class="num">% (com família)</th></tr></thead>
        <tbody>${topFamilies.map((f,i) => `<tr>
            <td>${i+1}</td><td>${esc(f.name)}</td>
            <td class="num">${NF.format(f.count)}</td>
            <td class="num">${PF.format(f.pct)}%</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div id="cob-family-analysis"></div>`;

  makeChart('ch_cob_donut', {
    type:'doughnut',
    data:{ labels: coverage.entries.map(e => e.label),
      datasets:[{ data: coverage.entries.map(e => e.count),
        backgroundColor: coverage.entries.map(e => e.color), borderColor:'#fff', borderWidth:2 }]},
    options:{ responsive:true, maintainAspectRatio:false, cutout:'55%',
      plugins:{ legend:{ position:'right' }, tooltip:{ callbacks:{ label:(ctx) => {
        const v = ctx.parsed; const p = coverage.total ? (v / coverage.total * 100) : 0;
        return `${ctx.label}: ${NF.format(v)} (${PF.format(p)}%)`;
      }}}}
    }
  });
  makeChart('ch_cob_fam', {
    type:'bar',
    data:{ labels: topFamilies.map(f => f.name),
      datasets:[{ label:'Registros', data: topFamilies.map(f => f.count),
        backgroundColor: topFamilies.map((_,i) => PALETTE[i % PALETTE.length]), borderWidth:0 }]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:(ctx) => {
        const f = topFamilies[ctx.dataIndex];
        return `${NF.format(f.count)} registros (${PF.format(f.pct)}% com família)`;
      }}}},
      scales:{ x:{ beginAtZero:true, ticks:{ callback:v => NF.format(v) } } }
    }
  });
  renderCoberturaFamilies();
}

function renderCoberturaFamilies(){
  const host = document.getElementById('cob-family-analysis');
  if (!host) return;
  const rows = state.filtered;
  const famCov = calculateFamilyCoverage(rows);
  if (!famCov.length){
    host.innerHTML = `<h3>Análise por família</h3>
      <p class="hint">Nenhum registro com família informada no conjunto filtrado.</p>`;
    return;
  }
  const sorted = sortFamilyCoverage(famCov, state.coberturaSort);
  const topN = state.coberturaTopNFam;
  const display = topN === 'all' ? sorted : sorted.slice(0, topN);
  const filtered = cobApplyFilters(famCov);
  const f = state.cobFilters;
  const N = f.topGapN || 5;
  const topBy = (key, n=N) => [...famCov].sort((a,b) => b[key] - a[key] || a.family.localeCompare(b.family)).slice(0, n);
  const topGapAbs   = topBy('gap');
  const topGapPct   = [...famCov].filter(x=>x.total>=5).sort((a,b)=>b.pctGap-a.pctGap || b.gap-a.gap).slice(0, N);
  const topGenus    = topBy('genus');
  const topFamilyLv = topBy('familyLevel');
  const topIndet    = topBy('indet');
  const hasIndetValues = topIndet.some(x => x.indet > 0);
  const globalIndet = calculateTaxonomicCoverage(rows).entries.find(e => e.key === 'indetermined').count;

  const famLinkCount = (name, count) =>
    `<span class="fam-name" onclick="cobFilterByFamily('${esc(name).replace(/'/g,"&#39;")}')">${esc(name)}</span>
     <span class="fam-count">— ${NF.format(count)} registros</span>`;
  const famLinkPct = (name, pct, base) =>
    `<span class="fam-name" onclick="cobFilterByFamily('${esc(name).replace(/'/g,"&#39;")}')">${esc(name)}</span>
     <span class="fam-count">— ${PF.format(pct)}% (base: ${NF.format(base)} registros)</span>`;
  const listHtmlCount = (arr, valFn) => arr.length
    ? `<ol>${arr.map(x => `<li>${famLinkCount(x.family, valFn(x))}</li>`).join('')}</ol>`
    : `<p class="empty">Nenhuma família atende aos critérios deste indicador.</p>`;
  const listHtmlPct = (arr, pctFn, baseFn) => arr.length
    ? `<ol>${arr.map(x => `<li>${famLinkPct(x.family, pctFn(x), baseFn(x))}</li>`).join('')}</ol>`
    : `<p class="empty">Nenhuma família atende aos critérios deste indicador.</p>`;
  const thSort = (key, label, cls='', helpText='') => {
    const isSorted = f.sortKey === key;
    const clsFull = 'sortable' + (isSorted ? (f.sortDir === 'asc' ? ' sorted-asc' : ' sorted-desc') : '');
    const helpHtml = helpText ? helpIcon(helpText) : '';
    return `<th class="${clsFull} ${cls}" onclick="cobSortBy('${key}')">${label}${helpHtml}</th>`;
  };
  const totalBase = famCov.length;
  const totalFiltered = filtered.length;

  host.innerHTML = `
    <h3>Análise por família — cobertura e gaps de identificação</h3>
    <p class="hint">As quatro categorias de identificação (Espécie, Gênero, Família, Indeterminado) são
      <b>mutuamente exclusivas</b> — somam o total da família. A coluna <b>Espécie com ressalva</b>
      é um indicador paralelo (intersecção com "Espécie"; não soma). O <b>Gap até espécie</b>
      é o total menos "Espécie" sem ressalva.</p>

    <div class="cob-controls">
      <label>Ordenar por ${helpIcon(HELP.sortSelect)}:
        <select onchange="state.coberturaSort=this.value; renderCoberturaFamilies();">
          ${Object.entries(COB_SORT_MODES).map(([k,cfg]) =>
            `<option value="${k}" ${k===state.coberturaSort?'selected':''}>${cfg.label}</option>`).join('')}
        </select>
      </label>
      <label>Exibir famílias:
        <select onchange="state.coberturaTopNFam = this.value==='all' ? 'all' : Number(this.value); renderCoberturaFamilies();">
          ${[10,15,20,30,50].map(n =>
            `<option value="${n}" ${n===state.coberturaTopNFam?'selected':''}>Top ${n}</option>`).join('')}
          <option value="all" ${state.coberturaTopNFam==='all'?'selected':''}>Todas (${NF.format(famCov.length)})</option>
        </select>
      </label>
      ${state.filters.family ? `
        <span class="cob-selection-badge">
          Filtro de família ativo: <b>${esc(state.filters.family)}</b>
          <button type="button" class="clear-btn" onclick="cobClearFamilySelection()" title="Remover filtro de família">Limpar seleção</button>
        </span>` : ''}
      <span class="hint" style="margin:0;flex:1;text-align:right;">
        Gráfico: <b>${NF.format(display.length)}</b> de <b>${NF.format(totalBase)}</b> famílias.
      </span>
    </div>

    <div class="charts-grid">
      <div class="chart-box" style="grid-column:1/-1;">
        <h4>Figura 1 — Cobertura por família (absoluta) ${helpIcon(HELP.fig1)}</h4>
        <button class="dl" onclick="downloadChart('ch_cob_fam_grouped')">PNG</button>
        <div class="chart-canvas-wrap dynamic" id="cob_chart_grouped_wrap">
          <canvas id="ch_cob_fam_grouped"></canvas>
        </div>
      </div>
      <div class="chart-box" style="grid-column:1/-1;">
        <h4>Figura 2 — Cobertura por família (100% empilhado) ${helpIcon(HELP.fig2)}</h4>
        <button class="dl" onclick="downloadChart('ch_cob_fam_stacked')">PNG</button>
        <div class="chart-canvas-wrap dynamic" id="cob_chart_stacked_wrap">
          <canvas id="ch_cob_fam_stacked"></canvas>
        </div>
      </div>
    </div>

    <h3 style="margin-top:22px;">Top ${N} — gaps de identificação
      <select onchange="state.cobFilters.topGapN=Number(this.value); renderCoberturaFamilies();"
              style="margin-left:8px;padding:3px 6px;border:1px solid var(--border);border-radius:5px;font-size:12px;font-family:inherit;">
        ${[5,10,15].map(n => `<option value="${n}" ${n===N?'selected':''}>Top ${n}</option>`).join('')}
      </select>
    </h3>
    <p class="cob-gap-intro">
      Esta seção destaca famílias com lacunas de identificação segundo <b>critérios distintos</b>.
      Alguns indicadores usam <b>quantidade absoluta</b> (favorecem famílias maiores), outros usam
      <b>percentual</b> (proporção dentro da própria família). Os resultados <b>dependem do critério</b>:
      uma família com muitos registros pendentes não é necessariamente a com pior cobertura proporcional.
      Um gap de identificação <b>não significa automaticamente erro taxonômico</b> — pode refletir limitações do material.
    </p>
    <div class="cob-gap-grid">
      <div class="cob-gap-card">
        <h5>Maior gap absoluto até espécie ${helpIcon(HELP.topAbs)}</h5>
        ${listHtmlCount(topGapAbs, x => x.gap)}
      </div>
      <div class="cob-gap-card">
        <h5>Maior % não identificado até espécie (≥ 5 reg.) ${helpIcon(HELP.topPct)}</h5>
        ${listHtmlPct(topGapPct, x => x.pctGap, x => x.total)}
      </div>
      <div class="cob-gap-card">
        <h5>Mais registros só até gênero ${helpIcon(HELP.topGenus)}</h5>
        ${listHtmlCount(topGenus, x => x.genus)}
      </div>
      <div class="cob-gap-card">
        <h5>Mais registros só até família ${helpIcon(HELP.topFamilyLv)}</h5>
        ${listHtmlCount(topFamilyLv, x => x.familyLevel)}
      </div>
      <div class="cob-gap-card">
        <h5>Registros indeterminados (total) ${helpIcon(HELP.topIndet)}</h5>
        ${hasIndetValues
          ? listHtmlCount(topIndet, x => x.indet)
          : `<p style="font-size:22px;font-weight:700;color:var(--primary);margin:4px 0 6px;">${NF.format(globalIndet)}</p>
             <p class="empty">Registro${globalIndet !== 1 ? 's' : ''} sem família e sem gênero no conjunto filtrado. Por definição, esta categoria não pode ser agrupada por família — registros indeterminados <b>não possuem</b> família associada.</p>`}
      </div>
    </div>

    <h3>Tabelas analíticas por família ${helpIcon(HELP.filterPanel)}</h3>
    <div class="cob-controls" style="background:#fff;border-color:var(--border);">
      <label>🔎 Buscar família:
        <input type="text" value="${esc(f.search)}" placeholder="Nome da família..."
               oninput="cobSetFilter('search', this.value)" style="min-width:160px;">
      </label>
      <label>Total mínimo:
        <input type="number" min="0" value="${esc(f.minTotal)}" placeholder="ex.: 10"
               oninput="cobSetFilter('minTotal', this.value)" style="width:90px;">
      </label>
      <label>% espécie mínima:
        <input type="number" min="0" max="100" value="${esc(f.minPctSpecies)}"
               oninput="cobSetFilter('minPctSpecies', this.value)" style="width:80px;">
      </label>
      <label>% espécie máxima:
        <input type="number" min="0" max="100" value="${esc(f.maxPctSpecies)}"
               oninput="cobSetFilter('maxPctSpecies', this.value)" style="width:80px;">
      </label>
      <label>% gap mínimo:
        <input type="number" min="0" max="100" value="${esc(f.minPctGap)}"
               oninput="cobSetFilter('minPctGap', this.value)" style="width:80px;">
      </label>
      <label>Gap absoluto mínimo:
        <input type="number" min="0" value="${esc(f.minGap)}"
               oninput="cobSetFilter('minGap', this.value)" style="width:90px;">
      </label>
      <button class="btn-sm" onclick="cobClearFilters()">Limpar filtros das tabelas</button>
      <span class="cob-export-info">
        Exibindo <b>${NF.format(totalFiltered)}</b> de <b>${NF.format(totalBase)}</b> famílias
        ${totalFiltered < totalBase ? '(filtros ativos)' : ''}
      </span>
    </div>

    <div class="cob-view-tabs">
      ${[
        ['complete','Tabela completa'],
        ['absolute','Distribuição absoluta'],
        ['percent','Distribuição percentual'],
        ['indicators','Indicadores gerais']
      ].map(([k,label]) =>
        `<button class="cob-view-btn ${f.view===k?'active':''}" onclick="cobSetView('${k}')">${label}</button>`).join('')}
    </div>

    <div class="cob-table-toolbar">
      <label style="font-size:12px;color:var(--muted);">Escopo de exportação:</label>
      <select onchange="state.cobFilters.exportScope=this.value;"
              style="padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;">
        <option value="all" ${f.exportScope==='all'?'selected':''}>Todos os dados (ignora filtros)</option>
        <option value="filtered" ${f.exportScope==='filtered'?'selected':''}>Somente filtrados</option>
      </select>
      <button class="btn-sm" onclick="cobCopyCurrentTable()">📋 Copiar (TSV)</button>
      <button class="btn-sm" onclick="cobExportCurrentCSV()">⬇ Baixar CSV</button>
      <button class="btn-sm" onclick="cobExportXLSXAll()">📊 Exportar todas as tabelas (XLSX)</button>
      <span style="flex:1"></span>
      <label style="font-size:12px;color:var(--muted);">Universo do PDF:</label>
      <select onchange="state.cobPdfScope=this.value;"
              style="padding:5px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;">
        <option value="complete" ${state.cobPdfScope==='complete'?'selected':''}>Base completa</option>
        <option value="filtered" ${state.cobPdfScope==='filtered'?'selected':''}>Somente filtrados na interface</option>
      </select>
      <button class="btn-sm primary" onclick="generateCoveragePDFReport()">📄 Gerar relatório PDF</button>
    </div>
    <div class="cob-loading" id="cobLoading">Gerando relatório... por favor aguarde.</div>

    <div id="cobTableView">${renderCobTableView(f.view, filtered, thSort)}</div>`;

  const rowH = 28;
  const dynamicH = Math.max(420, display.length * rowH + 120);
  const gWrap = document.getElementById('cob_chart_grouped_wrap');
  const sWrap = document.getElementById('cob_chart_stacked_wrap');
  if (gWrap) gWrap.style.height = dynamicH + 'px';
  if (sWrap) sWrap.style.height = dynamicH + 'px';

  const labels = display.map(x => x.family);
  const CAT_COLORS = { total:'#166534', species:'#2e7d5b', genus:'#6ba3c9', family:'#8fb8d8', indet:'#cbd5e1' };
  makeChart('ch_cob_fam_grouped', {
    type:'bar',
    data:{ labels,
      datasets:[
        { label:'Total de registros', data: display.map(x => x.total),      backgroundColor: CAT_COLORS.total },
        { label:'Até espécie',        data: display.map(x => x.species),    backgroundColor: CAT_COLORS.species },
        { label:'Só até gênero',      data: display.map(x => x.genus),      backgroundColor: CAT_COLORS.genus },
        { label:'Só até família',     data: display.map(x => x.familyLevel), backgroundColor: CAT_COLORS.family },
        { label:'Indeterminado',      data: display.map(x => x.indet),      backgroundColor: CAT_COLORS.indet }
      ]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      categoryPercentage: 0.92, barPercentage: 0.9,
      layout: { padding: { top: 6, right: 12, bottom: 4, left: 4 } },
      plugins:{
        legend:{ position:'bottom', labels:{ font:{ size:12 }, padding:14, boxWidth:18, boxHeight:12 } },
        tooltip:{ callbacks:{ label:(ctx) => `${ctx.dataset.label}: ${NF.format(ctx.parsed.x)}` } }
      },
      scales:{
        x:{ beginAtZero:true, ticks:{ font:{ size:11 }, callback:v => NF.format(v) } },
        y:{ ticks:{ font:{ size:12 }, autoSkip:false } }
      }
    }
  });
  makeChart('ch_cob_fam_stacked', {
    type:'bar',
    data:{ labels,
      datasets:[
        { label:'Até espécie',    data: display.map(x => x.pctSpecies),  rawCounts: display.map(x => x.species),     backgroundColor: CAT_COLORS.species },
        { label:'Só até gênero',  data: display.map(x => x.pctGenus),    rawCounts: display.map(x => x.genus),       backgroundColor: CAT_COLORS.genus },
        { label:'Só até família', data: display.map(x => x.pctFamily),   rawCounts: display.map(x => x.familyLevel), backgroundColor: CAT_COLORS.family },
        { label:'Indeterminado',  data: display.map(x => x.pctIndet),    rawCounts: display.map(x => x.indet),       backgroundColor: CAT_COLORS.indet }
      ]},
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false,
      categoryPercentage: 0.92, barPercentage: 0.9,
      layout: { padding: { top: 6, right: 12, bottom: 4, left: 4 } },
      plugins:{
        legend:{ position:'bottom', labels:{ font:{ size:12 }, padding:14, boxWidth:18, boxHeight:12 } },
        tooltip:{ callbacks:{ label:(ctx) => {
          const raw = (ctx.dataset.rawCounts && ctx.dataset.rawCounts[ctx.dataIndex]) || 0;
          return `${ctx.dataset.label}: ${PF.format(ctx.parsed.x)}% (${NF.format(raw)} registros)`;
        }}}
      },
      scales:{
        x:{ stacked:true, min:0, max:100, ticks:{ font:{ size:11 }, callback:v => v + '%' } },
        y:{ stacked:true, ticks:{ font:{ size:12 }, autoSkip:false } }
      }
    }
  });
}

function renderCobTableView(view, filtered, thSort){
  if (typeof thSort !== 'function'){
    const f = state.cobFilters;
    thSort = (key, label, cls='', helpText='') => {
      const isSorted = f.sortKey === key;
      const clsFull = 'sortable' + (isSorted ? (f.sortDir === 'asc' ? ' sorted-asc' : ' sorted-desc') : '');
      const helpHtml = helpText ? helpIcon(helpText) : '';
      return `<th class="${clsFull} ${cls}" onclick="cobSortBy('${key}')">${label}${helpHtml}</th>`;
    };
  }
  if (!filtered.length){
    return `<p class="hint">Nenhuma família corresponde aos filtros aplicados.</p>`;
  }
  const famCell = (name) => `<td class="fam-link" onclick="cobFilterByFamily('${esc(name).replace(/'/g,"&#39;")}')" title="Filtrar por ${esc(name)}">${esc(name)}</td>`;
  const num = (v) => `<td class="num">${NF.format(v)}</td>`;
  const pct = (v) => `<td class="num">${PF.format(v)}%</td>`;

  if (view === 'complete'){
    return `<div class="table-wrap" style="max-height:600px;">
      <table class="cob-table"><thead><tr>
        ${thSort('family','Família','', HELP.colFamily)}
        ${thSort('total','Total','num', HELP.colTotal)}
        ${thSort('species','Espécie','num', HELP.colSpecies)}
        ${thSort('pctSpecies','% Espécie','num', HELP.colPctSpecies)}
        ${thSort('genus','Gênero','num', HELP.colGenus)}
        ${thSort('pctGenus','% Gênero','num', HELP.colPctGenus)}
        ${thSort('familyLevel','Família','num', HELP.colFamilyLv)}
        ${thSort('pctFamily','% Família','num', HELP.colPctFamily)}
        ${thSort('indet','Indet.','num', HELP.colIndet)}
        ${thSort('pctIndet','% Indet.','num', HELP.colPctIndet)}
        ${thSort('speciesWithReserve','Com ressalva','num', HELP.colReserve)}
        ${thSort('pctWithReserve','% Ressalva','num', HELP.colPctReserve)}
        ${thSort('distinctSpecies','Espécies distintas','num', HELP.colDistinctSp)}
        ${thSort('distinctGenera','Gêneros distintos','num', HELP.colDistinctGen)}
        ${thSort('gap','Gap (nº)','num', HELP.colGap)}
        ${thSort('pctGap','Gap (%)','num', HELP.colPctGap)}
      </tr></thead><tbody>
        ${filtered.map(x => `<tr>
          ${famCell(x.family)}${num(x.total)}${num(x.species)}
          <td class="num"><span class="pct-bar"><span style="width:${x.pctSpecies.toFixed(1)}%"></span></span>${PF.format(x.pctSpecies)}%</td>
          ${num(x.genus)}${pct(x.pctGenus)}${num(x.familyLevel)}${pct(x.pctFamily)}
          ${num(x.indet)}${pct(x.pctIndet)}
          <td class="num">${x.speciesWithReserve ? NF.format(x.speciesWithReserve) : '—'}</td>
          <td class="num">${x.speciesWithReserve ? PF.format(x.pctWithReserve)+'%' : '—'}</td>
          ${num(x.distinctSpecies)}${num(x.distinctGenera)}
          <td class="num"><b>${NF.format(x.gap)}</b></td>${pct(x.pctGap)}
        </tr>`).join('')}
      </tbody></table></div>`;
  }
  if (view === 'absolute'){
    return `<div class="table-wrap" style="max-height:600px;">
      <table class="cob-table"><thead><tr>
        ${thSort('family','Família','', HELP.colFamily)}
        ${thSort('total','Total','num', HELP.colTotal)}
        ${thSort('species','Espécie','num', HELP.colSpecies)}
        ${thSort('genus','Gênero','num', HELP.colGenus)}
        ${thSort('familyLevel','Família','num', HELP.colFamilyLv)}
        ${thSort('indet','Indeterminado','num', HELP.colIndet)}
        ${thSort('speciesWithReserve','Com ressalva','num', HELP.colReserve)}
      </tr></thead><tbody>
        ${filtered.map(x => `<tr>
          ${famCell(x.family)}${num(x.total)}${num(x.species)}${num(x.genus)}${num(x.familyLevel)}${num(x.indet)}
          <td class="num">${x.speciesWithReserve ? NF.format(x.speciesWithReserve) : '—'}</td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }
  if (view === 'percent'){
    return `<div class="table-wrap" style="max-height:600px;">
      <table class="cob-table"><thead><tr>
        ${thSort('family','Família','', HELP.colFamily)}
        ${thSort('total','Total','num', HELP.colTotal)}
        ${thSort('pctSpecies','% Espécie','num', HELP.colPctSpecies)}
        ${thSort('pctGenus','% Gênero','num', HELP.colPctGenus)}
        ${thSort('pctFamily','% Família','num', HELP.colPctFamily)}
        ${thSort('pctIndet','% Indeterminado','num', HELP.colPctIndet)}
        ${thSort('pctWithReserve','% Com ressalva','num', HELP.colPctReserve)}
      </tr></thead><tbody>
        ${filtered.map(x => `<tr>
          ${famCell(x.family)}${num(x.total)}
          ${pct(x.pctSpecies)}${pct(x.pctGenus)}${pct(x.pctFamily)}${pct(x.pctIndet)}
          <td class="num">${x.speciesWithReserve ? PF.format(x.pctWithReserve)+'%' : '—'}</td>
        </tr>`).join('')}
      </tbody></table></div>`;
  }
  const rowsBase = state.filtered;
  const cov = calculateTaxonomicCoverage(rowsBase);
  const uniq = calculateUniqueTaxa(rowsBase);
  const pctOf = (n) => cov.total ? (n / cov.total * 100) : 0;
  const items = [
    ['Total de registros analisados', NF.format(cov.total), '—'],
    ['Famílias distintas representadas', NF.format(uniq.families), '—'],
    ['Gêneros distintos', NF.format(uniq.genera), '—'],
    ['Espécies distintas', NF.format(uniq.species), '—'],
    ['Registros até espécie', NF.format(cov.entries.find(e=>e.key==='species').count), PF.format(pctOf(cov.entries.find(e=>e.key==='species').count))+'%'],
    ['Registros só até gênero', NF.format(cov.entries.find(e=>e.key==='genus').count), PF.format(pctOf(cov.entries.find(e=>e.key==='genus').count))+'%'],
    ['Registros só até família', NF.format(cov.entries.find(e=>e.key==='family').count), PF.format(pctOf(cov.entries.find(e=>e.key==='family').count))+'%'],
    ['Registros indeterminados', NF.format(cov.entries.find(e=>e.key==='indetermined').count), PF.format(pctOf(cov.entries.find(e=>e.key==='indetermined').count))+'%'],
    ['Registros com ressalva (cf./aff.)', NF.format(cov.cfAff), PF.format(pctOf(cov.cfAff))+'%'],
    ['Registros sem família informada', NF.format(uniq.noFamily), PF.format(pctOf(uniq.noFamily))+'%'],
    ['Registros sem gênero informado', NF.format(uniq.noGenus), PF.format(pctOf(uniq.noGenus))+'%']
  ];
  return `<div class="table-wrap">
    <table class="cob-table"><thead><tr>
      <th>Indicador</th><th class="num">Valor</th><th class="num">Percentual</th>
    </tr></thead><tbody>
      ${items.map(([k,v,p]) => `<tr><td>${esc(k)}</td><td class="num">${esc(v)}</td><td class="num">${esc(p)}</td></tr>`).join('')}
    </tbody></table>
    <p class="hint" style="margin:10px 12px;">
      A base deste quadro é o conjunto <b>filtrado</b> na interface (${NF.format(rowsBase.length)} registros).</p>
  </div>`;
}

function cobSetFilter(key, val){ state.cobFilters[key] = val; renderCoberturaFamilies(); }
function cobClearFilters(){
  state.cobFilters.search = ''; state.cobFilters.minTotal = '';
  state.cobFilters.minPctSpecies = ''; state.cobFilters.maxPctSpecies = '';
  state.cobFilters.minPctGap = ''; state.cobFilters.minGap = '';
  renderCoberturaFamilies();
}
function cobSetView(v){ state.cobFilters.view = v; renderCoberturaFamilies(); }
function cobSortBy(key){
  const f = state.cobFilters;
  if (f.sortKey === key) f.sortDir = (f.sortDir === 'desc' ? 'asc' : 'desc');
  else { f.sortKey = key; f.sortDir = (key === 'family' ? 'asc' : 'desc'); }
  renderCoberturaFamilies();
}
function cobFilterByFamily(fam){
  if (!fam) return;
  state.filters.family = fam;
  applyFilters();
  renderAll();
  switchTab('cobertura');
  showAlert(`Filtro aplicado: família = ${fam}. Use "Limpar seleção" para remover.`, 'ok');
}
function cobClearFamilySelection(){
  if (!state.filters.family) return;
  delete state.filters.family;
  applyFilters();
  renderAll();
  showAlert('Seleção de família removida.', 'ok');
}
function cobBuildTableData(view, scope){
  const rows = (scope === 'filtered') ? state.filtered : geographicRows();
  const famCov = calculateFamilyCoverage(rows);
  const f = state.cobFilters;
  const list = (scope === 'filtered') ? cobApplyFilters(famCov) : sortFamilyCoverage(famCov, state.coberturaSort);
  if (view === 'complete'){
    const headers = ['Família','Total','Espécie','% Espécie','Gênero','% Gênero','Família','% Família',
      'Indeterminado','% Indeterminado','Com ressalva','% Com ressalva',
      'Espécies distintas','Gêneros distintos','Gap (nº)','Gap (%)'];
    const body = list.map(x => [ x.family, x.total, x.species, +x.pctSpecies.toFixed(2),
      x.genus, +x.pctGenus.toFixed(2), x.familyLevel, +x.pctFamily.toFixed(2),
      x.indet, +x.pctIndet.toFixed(2), x.speciesWithReserve, +x.pctWithReserve.toFixed(2),
      x.distinctSpecies, x.distinctGenera, x.gap, +x.pctGap.toFixed(2) ]);
    return { headers, body };
  }
  if (view === 'absolute'){
    const headers = ['Família','Total','Espécie','Gênero','Família','Indeterminado','Com ressalva'];
    const body = list.map(x => [ x.family, x.total, x.species, x.genus, x.familyLevel, x.indet, x.speciesWithReserve ]);
    return { headers, body };
  }
  if (view === 'percent'){
    const headers = ['Família','Total','% Espécie','% Gênero','% Família','% Indeterminado','% Com ressalva'];
    const body = list.map(x => [ x.family, x.total,
      +x.pctSpecies.toFixed(2), +x.pctGenus.toFixed(2), +x.pctFamily.toFixed(2),
      +x.pctIndet.toFixed(2), +x.pctWithReserve.toFixed(2) ]);
    return { headers, body };
  }
  const cov = calculateTaxonomicCoverage(rows);
  const uniq = calculateUniqueTaxa(rows);
  const pctOf = (n) => cov.total ? (n / cov.total * 100) : 0;
  const headers = ['Indicador','Valor','Percentual'];
  const body = [
    ['Total de registros analisados', cov.total, ''],
    ['Famílias distintas', uniq.families, ''],
    ['Gêneros distintos', uniq.genera, ''],
    ['Espécies distintas', uniq.species, ''],
    ['Registros até espécie', cov.entries.find(e=>e.key==='species').count, +pctOf(cov.entries.find(e=>e.key==='species').count).toFixed(2)],
    ['Registros só até gênero', cov.entries.find(e=>e.key==='genus').count, +pctOf(cov.entries.find(e=>e.key==='genus').count).toFixed(2)],
    ['Registros só até família', cov.entries.find(e=>e.key==='family').count, +pctOf(cov.entries.find(e=>e.key==='family').count).toFixed(2)],
    ['Registros indeterminados', cov.entries.find(e=>e.key==='indetermined').count, +pctOf(cov.entries.find(e=>e.key==='indetermined').count).toFixed(2)],
    ['Registros com ressalva (cf./aff.)', cov.cfAff, +pctOf(cov.cfAff).toFixed(2)],
    ['Registros sem família', uniq.noFamily, +pctOf(uniq.noFamily).toFixed(2)],
    ['Registros sem gênero', uniq.noGenus, +pctOf(uniq.noGenus).toFixed(2)]
  ];
  return { headers, body };
}
async function cobCopyCurrentTable(){
  try {
    const view = state.cobFilters.view;
    const scope = state.cobFilters.exportScope;
    const data = cobBuildTableData(view, scope);
    const tsv = [data.headers.join('\t')]
      .concat(data.body.map(row => row.map(cell => (cell === null || cell === undefined) ? '' : String(cell)).join('\t')))
      .join('\n');
    let ok = false;
    if (navigator.clipboard && window.isSecureContext){
      try { await navigator.clipboard.writeText(tsv); ok = true; } catch(e){ ok = false; }
    }
    if (!ok){
      const ta = document.createElement('textarea');
      ta.value = tsv; ta.style.position = 'fixed'; ta.style.left = '-10000px';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
      ta.remove();
    }
    if (ok) showAlert(`Tabela copiada (${data.body.length} linhas, formato TSV).`, 'ok');
    else showAlert('Não foi possível copiar automaticamente. Use "Baixar CSV" ou exporte XLSX.', 'warn');
  } catch(err){ console.error(err); showAlert('Erro ao copiar tabela: ' + err.message, 'err'); }
}
function cobCSVEscape(v){
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[;"\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
function cobExportCurrentCSV(){
  try {
    const view = state.cobFilters.view;
    const scope = state.cobFilters.exportScope;
    const data = cobBuildTableData(view, scope);
    const lines = [data.headers.map(cobCSVEscape).join(';')]
      .concat(data.body.map(row => row.map(cobCSVEscape).join(';')));
    const csv = '\ufeff' + lines.join('\r\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8' });
    const fname = `cobertura_${view}_${scope === 'filtered' ? 'filtrado' : 'completo'}_${new Date().toISOString().slice(0,10)}.csv`;
    downloadBlob(blob, fname);
    showAlert(`CSV gerado: ${fname} (separador ";", UTF-8 com BOM).`, 'ok');
  } catch(err){ console.error(err); showAlert('Erro ao exportar CSV: ' + err.message, 'err'); }
}
function cobExportXLSXAll(){
  try {
    const rowsAll = geographicRows();
    const famCov = sortFamilyCoverage(calculateFamilyCoverage(rowsAll), 'total_desc');
    const cov = calculateTaxonomicCoverage(rowsAll);
    const uniq = calculateUniqueTaxa(rowsAll);
    const wb = XLSX.utils.book_new();
    const sheetFam = [
      ['Família','Total','Espécie','% Espécie','Gênero','% Gênero','Família','% Família',
       'Indeterminado','% Indeterminado','Com ressalva','% Com ressalva',
       'Espécies distintas','Gêneros distintos','Gap (nº)','Gap (%)'],
      ...famCov.map(x => [ x.family, x.total, x.species, +x.pctSpecies.toFixed(2),
        x.genus, +x.pctGenus.toFixed(2), x.familyLevel, +x.pctFamily.toFixed(2),
        x.indet, +x.pctIndet.toFixed(2), x.speciesWithReserve, +x.pctWithReserve.toFixed(2),
        x.distinctSpecies, x.distinctGenera, x.gap, +x.pctGap.toFixed(2) ])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetFam), 'Cobertura_Familias');
    const sheetAbs = [
      ['Família','Total','Espécie','Gênero','Família','Indeterminado','Com ressalva'],
      ...famCov.map(x => [ x.family, x.total, x.species, x.genus, x.familyLevel, x.indet, x.speciesWithReserve ])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetAbs), 'Cobertura_Absoluta');
    const sheetPct = [
      ['Família','Total','% Espécie','% Gênero','% Família','% Indeterminado','% Com ressalva'],
      ...famCov.map(x => [ x.family, x.total, +x.pctSpecies.toFixed(2), +x.pctGenus.toFixed(2),
        +x.pctFamily.toFixed(2), +x.pctIndet.toFixed(2), +x.pctWithReserve.toFixed(2) ])
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetPct), 'Cobertura_Percentual');
    const pctOf = (n) => cov.total ? +((n / cov.total) * 100).toFixed(2) : 0;
    const sheetInd = [
      ['Indicador','Valor','Percentual'],
      ['Total de registros', cov.total, ''],
      ['Famílias distintas', uniq.families, ''],
      ['Gêneros distintos', uniq.genera, ''],
      ['Espécies distintas', uniq.species, ''],
      ['Até espécie', cov.entries.find(e=>e.key==='species').count, pctOf(cov.entries.find(e=>e.key==='species').count)],
      ['Só até gênero', cov.entries.find(e=>e.key==='genus').count, pctOf(cov.entries.find(e=>e.key==='genus').count)],
      ['Só até família', cov.entries.find(e=>e.key==='family').count, pctOf(cov.entries.find(e=>e.key==='family').count)],
      ['Indeterminado', cov.entries.find(e=>e.key==='indetermined').count, pctOf(cov.entries.find(e=>e.key==='indetermined').count)],
      ['Com ressalva (cf./aff.)', cov.cfAff, pctOf(cov.cfAff)],
      ['Sem família', uniq.noFamily, pctOf(uniq.noFamily)],
      ['Sem gênero', uniq.noGenus, pctOf(uniq.noGenus)]
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetInd), 'Indicadores_Cobertura');
    const fname = `cobertura_taxonomica_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fname);
    showAlert(`XLSX gerado: ${fname} (4 planilhas adicionadas).`, 'ok');
  } catch(err){ console.error(err); showAlert('Erro ao exportar XLSX: ' + err.message, 'err'); }
}

async function generateCoveragePDFReport(){
  const loading = document.getElementById('cobLoading');
  const scope = state.cobPdfScope || 'complete';
  const rows = scope === 'filtered' ? state.filtered : geographicRows();
  if (!rows.length){ showAlert('Nenhum registro disponível para gerar o relatório.', 'err'); return; }
  if (!window.jspdf || !window.jspdf.jsPDF){
    showAlert('Biblioteca jsPDF indisponível. Verifique a conexão e recarregue a página.', 'err');
    return;
  }
  loading?.classList.add('show');
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const PAGE_W = doc.internal.pageSize.getWidth();
    const PAGE_H = doc.internal.pageSize.getHeight();
    const M = 40;
    const cov    = calculateTaxonomicCoverage(rows);
    const uniq   = calculateUniqueTaxa(rows);
    const famCov = sortFamilyCoverage(calculateFamilyCoverage(rows), 'total_desc');

    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, PAGE_W, 8, 'F');
    doc.setFontSize(22); doc.setTextColor(20,83,45);
    doc.text('Relatório de Cobertura Taxonômica', M, 120);
    doc.setFontSize(14); doc.setTextColor(60);
    doc.text('Herbário Evaldo Buttura (EVB/UNILA)', M, 148);
    doc.setFontSize(11); doc.setTextColor(110);
    doc.text('Análise da completude de identificação dos espécimes', M, 176);
    doc.setDrawColor(220); doc.line(M, 200, PAGE_W - M, 200);
    doc.setTextColor(40); doc.setFontSize(11);
    const gerado = new Date().toLocaleString('pt-BR');
    const scopeLabel = scope === 'filtered' ? 'Conjunto filtrado na interface'
      : (state.geographicFilter ? 'Registros selecionados pelo filtro geográfico' : 'Base completa carregada');
    doc.text(`Data de geração: ${gerado}`, M, 230);
    doc.text(`Universo analisado: ${scopeLabel}`, M, 250);
    doc.text(`Modelo detectado: ${state.model === 'simplified' ? 'Simplificado (sem classificações superiores)' : 'Completo'}`, M, 270);
    doc.text(`Total de registros analisados: ${NF.format(cov.total)}`, M, 290);
    doc.text(`Famílias representadas: ${NF.format(uniq.families)}`, M, 310);
    doc.text(`Gêneros distintos: ${NF.format(uniq.genera)}`, M, 330);
    doc.text(`Espécies distintas: ${NF.format(uniq.species)}`, M, 350);
    doc.setTextColor(120); doc.setFontSize(9);
    doc.text('Documento gerado automaticamente pelo Analisador Estatístico de Coleções — JABOT.', M, PAGE_H - 40);
    doc.text('Não contém consultas externas a GBIF/COL; baseado exclusivamente na planilha JABOT carregada.', M, PAGE_H - 26);

    doc.addPage();
    let y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('1. Sumário executivo', M, y); y += 22;
    const pctOf = (n) => cov.total ? (n / cov.total * 100) : 0;
    const get = (k) => cov.entries.find(e => e.key === k).count;
    const summary = [
      ['Registros analisados',        NF.format(cov.total), '—'],
      ['Famílias distintas',          NF.format(uniq.families), '—'],
      ['Gêneros distintos',           NF.format(uniq.genera), '—'],
      ['Espécies distintas',          NF.format(uniq.species), '—'],
      ['Identificados até espécie',   NF.format(get('species')),      PF.format(pctOf(get('species')))+'%'],
      ['Identificados só até gênero', NF.format(get('genus')),        PF.format(pctOf(get('genus')))+'%'],
      ['Identificados só até família',NF.format(get('family')),       PF.format(pctOf(get('family')))+'%'],
      ['Indeterminados',              NF.format(get('indetermined')), PF.format(pctOf(get('indetermined')))+'%'],
      ['Espécies com ressalva (cf./aff.)', NF.format(cov.cfAff), PF.format(pctOf(cov.cfAff))+'%'],
      ['Sem família informada',       NF.format(uniq.noFamily), PF.format(pctOf(uniq.noFamily))+'%']
    ];
    doc.autoTable({
      startY: y, margin:{ left:M, right:M }, theme:'grid',
      head: [['Indicador','Valor','Percentual']], body: summary,
      headStyles:{ fillColor:[22,101,52], textColor:255, fontSize:10 },
      bodyStyles:{ fontSize:10 },
      columnStyles:{ 1:{ halign:'right' }, 2:{ halign:'right' } }
    });
    y = doc.lastAutoTable.finalY + 20;
    const pctSp  = pctOf(get('species')), pctGen = pctOf(get('genus')),
          pctFam = pctOf(get('family')), pctInd = pctOf(get('indetermined'));
    const texto = `A coleção analisada contém ${NF.format(cov.total)} registros distribuídos entre ${NF.format(uniq.families)} famílias. ` +
      `${PF.format(pctSp)}% dos registros estão identificados até espécie, enquanto ${PF.format(pctGen)}% estão identificados somente até gênero, ` +
      `${PF.format(pctFam)}% somente até família e ${PF.format(pctInd)}% permanecem indeterminados. ` +
      `O acervo reúne ${NF.format(uniq.genera)} gêneros distintos e ${NF.format(uniq.species)} espécies distintas identificáveis. ` +
      `Registros com ressalva (cf./aff.) totalizam ${NF.format(cov.cfAff)} (${PF.format(pctOf(cov.cfAff))}%).`;
    doc.setFontSize(10); doc.setTextColor(40);
    const lines = doc.splitTextToSize(texto, PAGE_W - 2*M);
    doc.text(lines, M, y); y += lines.length * 13 + 8;

    doc.addPage(); y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('2. Gráficos', M, y); y += 26;
    const donutDataUrl = await renderChartToImage('doughnut', {
      labels: cov.entries.map(e => e.label),
      datasets: [{ data: cov.entries.map(e => e.count),
        backgroundColor: cov.entries.map(e => e.color), borderColor:'#fff', borderWidth:2 }]
    }, 720, 420);
    if (donutDataUrl){
      doc.setFontSize(12); doc.setTextColor(20,83,45);
      doc.text('Figura 1 — Distribuição geral dos níveis de identificação', M, y); y += 8;
      doc.addImage(donutDataUrl, 'PNG', M, y, 480, 280); y += 290;
      doc.setFontSize(9); doc.setTextColor(100);
      doc.text('Fonte: planilha JABOT carregada e processada pelo programa.', M, y); y += 18;
    }
    const top20 = famCov.slice(0, 20);
    const groupedDataUrl = await renderChartToImage('bar', {
      labels: top20.map(x => x.family),
      datasets: [
        { label:'Total',        data: top20.map(x => x.total),      backgroundColor:'#166534' },
        { label:'Até espécie',  data: top20.map(x => x.species),    backgroundColor:'#2e7d5b' },
        { label:'Só até gênero',data: top20.map(x => x.genus),      backgroundColor:'#6ba3c9' },
        { label:'Só até família', data: top20.map(x => x.familyLevel), backgroundColor:'#8fb8d8' },
        { label:'Indeterminado',data: top20.map(x => x.indet),      backgroundColor:'#cbd5e1' }
      ]
    }, 1100, 700, { indexAxis:'y', legend:true });
    if (groupedDataUrl){
      if (y > PAGE_H - 400){ doc.addPage(); y = M + 10; }
      doc.setFontSize(12); doc.setTextColor(20,83,45);
      doc.text('Figura 2 — Cobertura por família (top 20 por total)', M, y); y += 8;
      const h2 = 380;
      doc.addImage(groupedDataUrl, 'PNG', M, y, PAGE_W - 2*M, h2); y += h2 + 10;
      doc.setFontSize(9); doc.setTextColor(100);
      doc.text('Legenda: Total (referência) + categorias exclusivas por nível.', M, y); y += 12;
      doc.text('Fonte: planilha JABOT carregada e processada pelo programa.', M, y); y += 20;
    }

    doc.addPage(); y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('3. Cobertura taxonômica por família', M, y); y += 10;
    doc.setFontSize(9); doc.setTextColor(100);
    doc.text(`Total de ${famCov.length} famílias. Tabela completa abaixo.`, M, y + 8); y += 18;
    const bodyAll = famCov.map(x => [
      x.family, x.total, x.species, x.pctSpecies.toFixed(1)+'%',
      x.genus, x.pctGenus.toFixed(1)+'%',
      x.familyLevel, x.pctFamily.toFixed(1)+'%',
      x.indet, x.pctIndet.toFixed(1)+'%',
      x.speciesWithReserve, x.gap, x.pctGap.toFixed(1)+'%'
    ]);
    doc.autoTable({
      startY: y, margin:{ left:M, right:M }, theme:'grid',
      head: [['Família','Total','Esp.','% Esp.','Gên.','% Gên.','Fam.','% Fam.','Ind.','% Ind.','Ress.','Gap','% Gap']],
      body: bodyAll,
      styles:{ fontSize:8, cellPadding:4, overflow:'linebreak' },
      headStyles:{ fillColor:[22,101,52], textColor:255, fontSize:8 },
      alternateRowStyles:{ fillColor:[246,250,247] },
      columnStyles:{
        0:{ cellWidth:90 }, 1:{ halign:'right', cellWidth:32 }, 2:{ halign:'right', cellWidth:32 },
        3:{ halign:'right', cellWidth:40 }, 4:{ halign:'right', cellWidth:32 }, 5:{ halign:'right', cellWidth:40 },
        6:{ halign:'right', cellWidth:32 }, 7:{ halign:'right', cellWidth:40 }, 8:{ halign:'right', cellWidth:32 },
        9:{ halign:'right', cellWidth:40 }, 10:{ halign:'right', cellWidth:36 },
        11:{ halign:'right', cellWidth:36 }, 12:{ halign:'right', cellWidth:44 }
      },
      didDrawPage: () => {
        doc.setFontSize(8); doc.setTextColor(120);
        doc.text(`Fonte: planilha JABOT. Universo: ${scopeLabel}.`, M, PAGE_H - 20);
      }
    });

    doc.addPage(); y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('4. Principais lacunas de identificação', M, y); y += 18;
    doc.setFontSize(12); doc.setTextColor(20,83,45);
    doc.text('4.1 — Famílias com maior gap absoluto até espécie', M, y); y += 6;
    const topGapAbs = [...famCov].sort((a,b)=>b.gap-a.gap).slice(0,10);
    doc.autoTable({
      startY: y, margin:{ left:M, right:M }, theme:'striped',
      head: [['Família','Total','Espécie','Gap (nº)','% Gap']],
      body: topGapAbs.map(x => [x.family, x.total, x.species, x.gap, x.pctGap.toFixed(1)+'%']),
      headStyles:{ fillColor:[180,83,9], textColor:255, fontSize:10 },
      styles:{ fontSize:9, cellPadding:5 },
      columnStyles:{ 1:{ halign:'right' }, 2:{ halign:'right' }, 3:{ halign:'right' }, 4:{ halign:'right' } }
    });
    y = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(12); doc.setTextColor(20,83,45);
    doc.text('4.2 — Famílias com maior % de gap (≥ 5 registros)', M, y); y += 6;
    const topGapPct = [...famCov].filter(x=>x.total>=5).sort((a,b)=>b.pctGap-a.pctGap).slice(0,10);
    doc.autoTable({
      startY: y, margin:{ left:M, right:M }, theme:'striped',
      head: [['Família','Total','Espécie','Gap (nº)','% Gap']],
      body: topGapPct.map(x => [x.family, x.total, x.species, x.gap, x.pctGap.toFixed(1)+'%']),
      headStyles:{ fillColor:[180,83,9], textColor:255, fontSize:10 },
      styles:{ fontSize:9, cellPadding:5 },
      columnStyles:{ 1:{ halign:'right' }, 2:{ halign:'right' }, 3:{ halign:'right' }, 4:{ halign:'right' } }
    });

    doc.addPage(); y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('5. Interpretação automática', M, y); y += 22;
    const topByTotal = [...famCov].sort((a,b)=>b.total-a.total).slice(0,5);
    const topByGap   = [...famCov].sort((a,b)=>b.gap-a.gap).slice(0,5);
    const topByGapP  = [...famCov].filter(x=>x.total>=5).sort((a,b)=>b.pctGap-a.pctGap).slice(0,5);
    const topByGenus = [...famCov].sort((a,b)=>b.genus-a.genus).slice(0,5);
    const topByFamLv = [...famCov].sort((a,b)=>b.familyLevel-a.familyLevel).slice(0,5);
    const topByIndet = [...famCov].sort((a,b)=>b.indet-a.indet).slice(0,5);
    const bullets = [
      `Famílias mais representadas em número total de registros: ${topByTotal.map(x=>`${x.family} (${NF.format(x.total)})`).join('; ')}.`,
      `Maiores gaps absolutos até espécie: ${topByGap.map(x=>`${x.family} (${NF.format(x.gap)} registros, ${PF.format(x.pctGap)}%)`).join('; ')}.`,
      `Maiores gaps proporcionais (≥ 5 registros): ${topByGapP.map(x=>`${x.family} (${PF.format(x.pctGap)}%)`).join('; ')}.`,
      `Maior número absoluto de registros identificados apenas até gênero: ${topByGenus.map(x=>`${x.family} (${NF.format(x.genus)})`).join('; ')}.`,
      `Maior número absoluto de registros identificados apenas até família: ${topByFamLv.map(x=>`${x.family} (${NF.format(x.familyLevel)})`).join('; ')}.`,
      `Maior número absoluto de registros indeterminados: ${topByIndet.map(x=>`${x.family} (${NF.format(x.indet)})`).join('; ')}.`
    ];
    doc.setFontSize(10); doc.setTextColor(40);
    for (const b of bullets){
      const lines = doc.splitTextToSize('• ' + b, PAGE_W - 2*M);
      doc.text(lines, M, y); y += lines.length * 13 + 4;
      if (y > PAGE_H - 80){ doc.addPage(); y = M + 10; }
    }
    y += 6;
    doc.setFontSize(9); doc.setTextColor(110);
    const nota = 'Nota: o nível de identificação registrado na base não representa necessariamente um erro taxonômico. ' +
      'Identificações até gênero ou família podem ser legítimas em função das condições do material, da disponibilidade de caracteres diagnósticos e das limitações do próprio acervo. ' +
      'Os indicadores distinguem quantidade absoluta de proporção: uma família com muitos registros não identificados até espécie não é automaticamente a família com pior cobertura proporcional.';
    doc.text(doc.splitTextToSize(nota, PAGE_W - 2*M), M, y);

    doc.addPage(); y = M + 10;
    doc.setFillColor(22,101,52); doc.rect(0, 0, PAGE_W, 4, 'F');
    doc.setFontSize(16); doc.setTextColor(20,83,45);
    doc.text('6. Metodologia', M, y); y += 22;
    const metodologia = [
      'Origem dos dados: planilha padrão do JABOT carregada pelo usuário e processada localmente no navegador.',
      'Colunas utilizadas: family, genus, sp1 e sp2 (quando presente). Autoria não é utilizada para classificar o nível.',
      'Nível "Espécie": gênero + epíteto específico válido em sp1 (prefixos cf./aff. removidos antes da validação).',
      'Nível "Gênero": gênero presente, mas sp1 vazio ou contendo marcadores (sp., spp., indet., ?).',
      'Nível "Família": sem gênero, mas com família.',
      'Nível "Indeterminado": sem família e sem gênero.',
      'cf./aff. mantêm seu nível original e são contados separadamente como "Espécie com ressalva".',
      'Percentuais: cada categoria é dividida pelo total de registros da respectiva família.',
      'Gap absoluto = total − espécie (sem ressalva). Gap percentual = gap absoluto ÷ total da família × 100.',
      'Registros sem família não são contabilizados como família botânica.',
      'Táxons únicos (espécies, gêneros, famílias) são calculados como conjuntos distintos.',
      'Nenhuma consulta externa (GBIF, COL XR) é realizada para produzir este relatório.'
    ];
    doc.setFontSize(10); doc.setTextColor(40);
    for (let i = 0; i < metodologia.length; i++){
      const lines = doc.splitTextToSize(`${i+1}. ${metodologia[i]}`, PAGE_W - 2*M);
      doc.text(lines, M, y); y += lines.length * 13 + 3;
      if (y > PAGE_H - 80){ doc.addPage(); y = M + 10; }
    }
    y += 10;
    doc.setFontSize(9); doc.setTextColor(110);
    doc.text(`Relatório gerado em ${gerado}.`, M, y);

    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++){
      doc.setPage(p);
      doc.setFontSize(8); doc.setTextColor(150);
      doc.text(`Página ${p} de ${totalPages}`, PAGE_W - M, PAGE_H - 20, { align:'right' });
      doc.text('Analisador Estatístico JABOT — Cobertura Taxonômica', M, PAGE_H - 20);
    }
    const filename = `Relatorio_Cobertura_Taxonomica_EVB_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
    showAlert(`Relatório PDF gerado: ${filename}`, 'ok');
  } catch(err){
    console.error(err); showAlert('Erro ao gerar relatório PDF: ' + err.message, 'err');
  } finally {
    loading?.classList.remove('show');
  }
}
function renderChartToImage(type, data, width, height, extraOptions = {}){
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.style.position = 'fixed'; canvas.style.left = '-10000px';
      document.body.appendChild(canvas);
      const cfg = {
        type, data,
        options: Object.assign({
          responsive:false, animation:false, maintainAspectRatio:false,
          plugins:{
            legend:{ display: extraOptions.legend !== false, position:'right', labels:{ font:{ size:11 } } },
            tooltip:{ enabled:false }
          },
          scales: type === 'bar' ? {
            x:{ beginAtZero:true, ticks:{ callback:v => NF.format(v), color:'#555' } },
            y:{ ticks:{ color:'#555' } }
          } : undefined,
          indexAxis: extraOptions.indexAxis || 'x',
          devicePixelRatio: 2
        }, extraOptions.opts || {})
      };
      const chart = new Chart(canvas.getContext('2d'), cfg);
      setTimeout(() => {
        try {
          const url = chart.toBase64Image('image/png', 1);
          chart.destroy(); canvas.remove();
          resolve(url);
        } catch(e){ chart.destroy(); canvas.remove(); resolve(null); }
      }, 60);
    } catch(e){ console.error(e); resolve(null); }
  });
}

/* ---------------- 10) EXPORTAÇÕES EXCEL/PDF GERAIS ---------------- */
function exportStatsExcel(){
  const rows = state.filtered; const total = rows.length; const s = computeStats(rows);
  const wb = XLSX.utils.book_new();
  const resumo = [
    ['Analisador Estatístico JABOT — Resumo'],
    ['Gerado em', new Date().toLocaleString('pt-BR')],
    ['Modelo da planilha', state.model === 'simplified' ? 'Simplificado (sem classificações superiores)' : 'Completo'],
    ['Total de registros', s.records],['Reinos', s.kingdoms],['Filos', s.phylums],
    ['Classes', s.classes],['Ordens', s.orders],['Famílias', s.families],
    ['Gêneros', s.genera],['Espécies (determinadas)', s.species]
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Resumo');
  const grupos = GROUPS.map(g => {
    const sub = rows.filter(r => r.Grupo === g); const rich = richnessOf(sub);
    return { Grupo:g, Registros:sub.length, '% da coleção': total ? +(sub.length/total*100).toFixed(2) : 0,
      Famílias:rich.families, Gêneros:rich.genera, Espécies:rich.species };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(grupos), 'Grupos');
  // Blocos que dependem das colunas superiores: só inclui se modelo completo
  if (state.model === 'complete'){
    const reinosAgg = aggregateBy(rows, r=>r._kingdom.toLowerCase(), r=>r._kingdom).sort((a,b)=>b.count-a.count);
    const reinos = reinosAgg.map(g => {
      const rich = richnessOf(g.rows);
      return { Reino:g.label, Registros:g.count, '%':total ? +(g.count/total*100).toFixed(2) : 0,
        Filos:new Set(g.rows.map(r=>r._phylum).filter(Boolean)).size,
        Classes:new Set(g.rows.map(r=>r._class).filter(Boolean)).size,
        Ordens:new Set(g.rows.map(r=>r._order).filter(Boolean)).size,
        Famílias:rich.families, Gêneros:rich.genera, Espécies:rich.species };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(reinos), 'Reinos');
    const filosAgg = aggregateBy(rows, r=>r._phylum.toLowerCase(), r=>r._phylum).sort((a,b)=>b.count-a.count);
    const filos = filosAgg.map(g => {
      const rich = richnessOf(g.rows);
      return { Filo:g.label, Reino:[...new Set(g.rows.map(r=>r._kingdom).filter(Boolean))].join(' / '),
        Registros:g.count, '%':total ? +(g.count/total*100).toFixed(2) : 0,
        Classes:new Set(g.rows.map(r=>r._class).filter(Boolean)).size,
        Ordens:new Set(g.rows.map(r=>r._order).filter(Boolean)).size,
        Famílias:rich.families, Gêneros:rich.genera, Espécies:rich.species };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filos), 'Filos');
    const classAgg = aggregateBy(rows, r=>r._class.toLowerCase(), r=>r._class).sort((a,b)=>b.count-a.count);
    const classes = classAgg.map(g => {
      const rich = richnessOf(g.rows);
      return { Classe:g.label, Filo:[...new Set(g.rows.map(r=>r._phylum).filter(Boolean))].join(' / '),
        Registros:g.count, '%':total ? +(g.count/total*100).toFixed(2) : 0,
        Ordens:new Set(g.rows.map(r=>r._order).filter(Boolean)).size,
        Famílias:rich.families, Gêneros:rich.genera, Espécies:rich.species };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classes), 'Classes');
    const ordAgg = aggregateBy(rows, r=>r._order.toLowerCase(), r=>r._order).sort((a,b)=>b.count-a.count);
    const ordens = ordAgg.map(g => {
      const rich = richnessOf(g.rows);
      return { Ordem:g.label, Classe:[...new Set(g.rows.map(r=>r._class).filter(Boolean))].join(' / '),
        Registros:g.count, '%':total ? +(g.count/total*100).toFixed(2) : 0,
        Famílias:rich.families, Gêneros:rich.genera, Espécies:rich.species };
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ordens), 'Ordens');
  }
  const famAgg = aggregateBy(rows, r=>r._family.toLowerCase(), r=>r._family).sort((a,b)=>b.count-a.count);
  const familias = famAgg.map(g => {
    const rich = richnessOf(g.rows);
    return { Família:g.label, Grupo:g.rows[0]?.Grupo || '', Registros:g.count,
      '%':total ? +(g.count/total*100).toFixed(2) : 0,
      Gêneros:rich.genera, Espécies:rich.species };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(familias), 'Famílias');
  const genAgg = aggregateBy(rows, r=>r._genus.toLowerCase(), r=>r._genus).sort((a,b)=>b.count-a.count);
  const generos = genAgg.map(g => {
    const rich = richnessOf(g.rows);
    return { Gênero:g.label, Família:g.rows[0]?._family || '', Grupo:g.rows[0]?.Grupo || '',
      Registros:g.count, '%':total ? +(g.count/total*100).toFixed(2) : 0,
      Espécies:rich.species };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generos), 'Gêneros');
  const spAgg = aggregateBy(rows, r=>r.species_name, r=>r.species_name).sort((a,b)=>b.count-a.count);
  const especies = spAgg.map(g => {
    const f = g.rows[0];
    return { Espécie:g.label, Gênero:f?._genus || '', Família:f?._family || '',
      Grupo:f?.Grupo || '', Registros:g.count,
      '%':total ? +(g.count/total*100).toFixed(2) : 0 };
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(especies), 'Espécies');
  const dadosProc = rows.map(r => {
    const obj = {};
    for (const c of state.columns) obj[c] = r[c];
    obj.Grupo = r.Grupo; obj.species_name = r.species_name;
    return obj;
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(dadosProc), 'Dados processados');
  XLSX.writeFile(wb, 'estatisticas_jabot.xlsx');
}
function exportDataExcel(){
  const rows = state.filtered.map(r => {
    const obj = {};
    for (const c of state.columns) obj[c] = r[c];
    obj.Grupo = r.Grupo; obj.species_name = r.species_name;
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados processados');
  XLSX.writeFile(wb, 'dados_processados_jabot.xlsx');
}
async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  const rows = state.filtered; const s = computeStats(rows);
  let y = 60;
  doc.setFontSize(18); doc.text('Analisador Estatístico de Coleções — JABOT', 40, y); y += 24;
  doc.setFontSize(11); doc.setTextColor(100);
  doc.text('Análise taxonômica de coleções botânicas e micológicas', 40, y); y += 20;
  doc.text('Gerado em: ' + new Date().toLocaleString('pt-BR'), 40, y); y += 20;
  doc.text('Modelo: ' + (state.model === 'simplified' ? 'Simplificado' : 'Completo'), 40, y); y += 24;
  doc.setTextColor(0); doc.setFontSize(14);
  doc.text('Resumo', 40, y); y += 18; doc.setFontSize(11);
  const resumo = [
    ['Total de registros', NF.format(s.records)],
    ['Famílias', NF.format(s.families)],['Gêneros', NF.format(s.genera)],
    ['Espécies', NF.format(s.species)]
  ];
  if (state.model === 'complete'){
    resumo.unshift(['Reinos', NF.format(s.kingdoms)],['Filos', NF.format(s.phylums)]);
    resumo.splice(3, 0, ['Classes', NF.format(s.classes)],['Ordens', NF.format(s.orders)]);
  }
  for (const [k,v] of resumo){ doc.text(`${k}:`, 40, y); doc.text(v, 200, y); y += 16;
    if (y > 760){ doc.addPage(); y = 60; } }
  if (state.model === 'complete'){
    y += 12; doc.setFontSize(14);
    doc.text('Composição por grandes grupos', 40, y); y += 18; doc.setFontSize(11);
    for (const g of GROUPS){
      const sub = rows.filter(r => r.Grupo === g);
      const pct = s.records ? (sub.length/s.records*100) : 0;
      const rich = richnessOf(sub);
      doc.text(`${g}: ${NF.format(sub.length)} registros (${PF.format(pct)}%) — ${rich.families} famílias, ${rich.genera} gêneros, ${rich.species} espécies`, 40, y);
      y += 16; if (y > 760){ doc.addPage(); y = 60; }
    }
  }
  doc.save('relatorio_jabot.pdf');
}

/* ---------------- 11) SELF-TESTS ---------------- */
function runSelfTest(){
  const cases = [
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Magnoliopsida'}, expect:'Angiospermas'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Liliopsida'},    expect:'Angiospermas'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Pinopsida'},     expect:'Gimnospermas'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Lycopodiopsida'},expect:'Samambaias e Licófitas'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Polypodiopsida'},expect:'Samambaias e Licófitas'},
    {row:{kingdom:'Plantae',phylum:'Bryophyta'},                          expect:'Briófitas'},
    {row:{kingdom:'Plantae',phylum:'Marchantiophyta'},                    expect:'Briófitas'},
    {row:{kingdom:'Plantae',phylum:'Anthocerotophyta'},                   expect:'Briófitas'},
    {row:{kingdom:'Plantae',phylum:'Rhodophyta'},                         expect:'Algas'},
    {row:{kingdom:'Plantae',phylum:'Charophyta'},                         expect:'Algas'},
    {row:{kingdom:'Chromista',phylum:'Ochrophyta'},                       expect:'Algas'},
    {row:{kingdom:'Fungi',phylum:'Basidiomycota'},                        expect:'Fungos'},
    {row:{kingdom:'Fungi',phylum:'Ascomycota'},                           expect:'Fungos'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Magnoliopsida',genus:'Solanum',sp1:'sp.'}, expect:'Angiospermas', spExpect:'Espécie não determinada'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Magnoliopsida',genus:'Inga',sp1:'marginata',cf:'cf.'}, expect:'Angiospermas', spExpect:'Inga marginata'},
    {row:{kingdom:'Plantae',phylum:'Tracheophyta',class:'Magnoliopsida',genus:'Inga',sp1:'marginata',cf:'aff.'}, expect:'Angiospermas', spExpect:'Inga marginata'}
  ];
  let ok = 0, fail = 0;
  for (const c of cases){
    const r = { ...c.row };
    r._kingdom = c.row.kingdom; r._phylum = c.row.phylum; r._class = c.row.class;
    r._order = c.row.order; r._family = c.row.family; r._genus = c.row.genus;
    r._sp1 = c.row.sp1; r._cf = c.row.cf;
    const got = classifyGroup(r);
    let passed = got === c.expect;
    if (c.spExpect){ const sp = buildSpeciesName(r); passed = passed && sp.name === c.spExpect; }
    if (passed) ok++; else { fail++; console.warn('Falhou', c, '→', got); }
  }
  console.log(`Self-test grupos/espécies: ${ok} ok, ${fail} falhas`);
}
function runCoverageSelfTest(){
  const fake = [
    { _family:'Fabaceae', _genus:'Inga',  _sp1:'marginata', _cf:'' },
    { _family:'Fabaceae', _genus:'Inga',  _sp1:'marginata', _cf:'' },
    { _family:'Fabaceae', _genus:'Inga',  _sp1:'sp.',       _cf:'' },
    { _family:'Fabaceae', _genus:'',      _sp1:'',          _cf:'' },
    { _family:'',         _genus:'',      _sp1:'',          _cf:'' },
    { _family:'Fabaceae', _genus:'Inga',  _sp1:'cf. marginata', _cf:'' },
    { _family:'Fabaceae', _genus:'Inga',  _sp1:'aff. marginata', _cf:'' }
  ];
  const cov = calculateTaxonomicCoverage(fake);
  const fam = calculateFamilyDistribution(fake);
  const uniq = calculateUniqueTaxa(fake);
  const okCov = cov.entries.find(e=>e.key==='species').count === 4 &&
                cov.entries.find(e=>e.key==='genus').count   === 1 &&
                cov.entries.find(e=>e.key==='family').count  === 1 &&
                cov.entries.find(e=>e.key==='indetermined').count === 1;
  const okCf  = cov.cfAff === 2;
  const okFam = fam.sorted.length === 1 && fam.sorted[0].name === 'Fabaceae' && fam.sorted[0].count === 6;
  const okUni = uniq.species === 1 && uniq.genera === 1 && uniq.families === 1 &&
                uniq.noFamily === 1 && uniq.noGenus === 2;
  console.log('Cobertura self-test:',
    okCov ? '✓ níveis' : '✗ níveis',
    okCf  ? '✓ cf/aff' : '✗ cf/aff',
    okFam ? '✓ famílias' : '✗ famílias',
    okUni ? '✓ táxons únicos' : '✗ táxons únicos');
}
function runFamilyCoverageSelfTest(){
  const fake = [
    { _family:'FamA', _genus:'g1', _sp1:'sp1', _cf:'' },
    { _family:'FamA', _genus:'g1', _sp1:'sp1', _cf:'' },
    { _family:'FamA', _genus:'g2', _sp1:'sp2', _cf:'' },
    { _family:'FamA', _genus:'g3', _sp1:'sp.', _cf:'' },
    { _family:'FamA', _genus:'g3', _sp1:'sp.', _cf:'' },
    { _family:'FamA', _genus:'',   _sp1:'',    _cf:'' },
    { _family:'FamA', _genus:'',   _sp1:'',    _cf:'' },
    { _family:'FamB', _genus:'g4', _sp1:'sp4', _cf:'' },
    { _family:'FamB', _genus:'g4', _sp1:'sp4', _cf:'' },
    { _family:'FamB', _genus:'g4', _sp1:'sp4', _cf:'' },
    { _family:'FamB', _genus:'g5', _sp1:'sp5', _cf:'' },
    { _family:'FamB', _genus:'g5', _sp1:'sp5', _cf:'' }
  ];
  const cov = calculateFamilyCoverage(fake);
  const A = cov.find(f => f.family === 'FamA');
  const B = cov.find(f => f.family === 'FamB');
  const okA = A && A.total===7 && A.species===3 && A.genus===2 && A.familyLevel===2 && A.indet===0 && A.gap===4;
  const okB = B && B.total===5 && B.species===5 && B.genus===0 && B.familyLevel===0 && B.indet===0;
  const pctSumA = A ? (A.pctSpecies + A.pctGenus + A.pctFamily + A.pctIndet) : 0;
  const pctOkA = Math.abs(pctSumA - 100) < 0.01;
  console.log('Cobertura por família self-test:',
    okA ? '✓ FamA' : '✗ FamA',
    okB ? '✓ FamB' : '✗ FamB',
    pctOkA ? '✓ % soma 100' : '✗ % soma 100');
}
function runHierarchySelfTest(){
  const fake = [
    { Grupo:'Angiospermas', _kingdom:'Plantae', _phylum:'Tracheophyta', _class:'Magnoliopsida', _order:'Fabales', _family:'Fabaceae', _genus:'Inga',  species_name:'Inga vera' },
    { Grupo:'Angiospermas', _kingdom:'Plantae', _phylum:'Tracheophyta', _class:'Magnoliopsida', _order:'Fabales', _family:'Fabaceae', _genus:'Inga',  species_name:'Inga marginata' },
    { Grupo:'Angiospermas', _kingdom:'Plantae', _phylum:'Tracheophyta', _class:'Magnoliopsida', _order:'Fabales', _family:'Fabaceae', _genus:'Mimosa', species_name:'Mimosa bimucronata' }
  ];
  const prev = state.filtered;
  state.filtered = fake;
  hierBuildTree();
  const idx = hierState.index;
  const hasAngio = [...idx.values()].some(n => n.name === 'Angiospermas' && n.rank === 'group');
  const hasFab    = [...idx.values()].some(n => n.name === 'Fabaceae' && n.rank === 'family');
  const hasInga   = [...idx.values()].some(n => n.name === 'Inga' && n.rank === 'genus');
  const hasSp     = [...idx.values()].some(n => n.name === 'Inga vera' && n.rank === 'species');
  const rootCount = hierState.root.count;
  state.filtered = prev;
  console.log('Hierarquia self-test:',
    hasAngio ? '✓ Grupo' : '✗ Grupo',
    hasFab   ? '✓ Família' : '✗ Família',
    hasInga  ? '✓ Gênero' : '✗ Gênero',
    hasSp    ? '✓ Espécie' : '✗ Espécie',
    rootCount === 3 ? '✓ total=3' : `✗ total=${rootCount}`);
}
function runFixesSelfTest(){
  const fake = [
    { _family:'FamA', _genus:'g1', _sp1:'sp1', _cf:'' },
    { _family:'FamA', _genus:'g2', _sp1:'sp.', _cf:'' }
  ];
  const cov = calculateFamilyCoverage(fake);
  const A = cov.find(f => f.family === 'FamA');
  const hasNaN = Number.isNaN(A.pctGap) || Number.isNaN(A.pctSpecies);
  const indetAlwaysZero = cov.every(x => x.indet === 0);
  console.log('Correções self-test:',
    !hasNaN ? '✓ sem NaN' : '✗ NaN detectado',
    indetAlwaysZero ? '✓ indet=0 por design' : '✗ indet != 0');
}
/* NOVO — detecção de modelo (testável no console) */
function runModelDetectionSelfTest(){
  const completeHeaders = ['codbarras','kingdom','phylum','class','order','family','genus','sp1'];
  const simplifiedHeaders = ['numtombo','family','genus','sp1','collector','number'];
  const invalidHeaders = ['collector','number','country'];
  const r1 = detectSpreadsheetModel(completeHeaders);
  const r2 = detectSpreadsheetModel(simplifiedHeaders);
  const r3 = detectSpreadsheetModel(invalidHeaders);
  console.log('Modelo self-test:',
    r1.model === 'complete'   ? '✓ completo detectado'   : '✗ completo NÃO detectado',
    r2.model === 'simplified' ? '✓ simplificado detectado' : '✗ simplificado NÃO detectado',
    r3.model === 'invalid'    ? '✓ inválido detectado'    : '✗ inválido NÃO detectado');
}

function runGeographicFilterSelfTest(){
  const keys = ['rawData','processed','filtered','columns','filters','search','_colMap','geographicFilter','geoDraftMode','geoDraftText'];
  const saved = Object.fromEntries(keys.map(key => [key, state[key]]));
  const checks = [];
  const check = (name, ok) => { checks.push({ name, ok:!!ok }); if (!ok) throw new Error(name); };
  try {
    state.columns = ['Family','Genus','sp1','Gazetteer','UC','LocNotes'];
    state.rawData = [
      {Family:'FamA',Genus:'GenusA',sp1:'alpha',Gazetteer:'Parque Nacional - Iguaçu',UC:'PARNA Iguacu',LocNotes:''},
      {Family:'FamA',Genus:'GenusB',sp1:'beta',Gazetteer:'',UC:'Parque Nacional do Iguacu',LocNotes:''},
      {Family:'FamB',Genus:'GenusC',sp1:'gamma',Gazetteer:'',UC:'',LocNotes:'PARNA Iguaçu'},
      {Family:'FamB',Genus:'GenusD',sp1:'delta',Gazetteer:'Iguaçu',UC:'PNI',LocNotes:''},
      {Family:'FamC',Genus:'GenusE',sp1:'epsilon',Gazetteer:'',UC:'',LocNotes:'Céu Azul'},
      {Family:'FamC',Genus:'GenusF',sp1:'zeta',Gazetteer:'',UC:'',LocNotes:'Cataratas'}
    ];
    state.filters = {}; state.search = ''; state.geographicFilter = { mode:'parna', terms:GEOGRAPHIC_PRESET_TERMS };
    processData();
    check('correspondência nas três colunas, acentos e hífen', state.filtered.length === 3);
    check('registro correspondente em várias colunas contado uma vez', state.filtered.filter(r => r._genus === 'GenusA').length === 1);
    check('Iguaçu e PNI isolados não ativam o filtro predefinido', !geographicMatches(state.processed[3]).length);
    check('indicadores recebem apenas os registros selecionados', calculateTaxonomicCoverage(state.filtered).total === 3);
    const panel = renderGeographicFilterPanel();
    check('painel informa total encontrado, base e campos consultados', panel.includes('3 de 6') && panel.includes('gazetteer, uc, locnotes'));

    state.geographicFilter = { mode:'custom', terms:['Céu Azul'] }; applyFilters();
    check('busca personalizada com um termo', state.filtered.length === 1 && state.filtered[0]._genus === 'GenusE');
    state.geographicFilter = { mode:'custom', terms:['Céu Azul','Cataratas'] }; applyFilters();
    check('busca personalizada com múltiplos termos', state.filtered.length === 2);

    state.geographicFilter = { mode:'parna', terms:GEOGRAPHIC_PRESET_TERMS }; state.filters.family = 'FamA'; applyFilters();
    check('filtro geográfico combina com filtro taxonômico existente', state.filtered.length === 2);
    state.geographicFilter = null; applyFilters();
    check('limpar seleção geográfica preserva filtro taxonômico', state.filtered.length === 2 && state.filters.family === 'FamA');

    state.columns = ['Family','Genus','sp1','LocNotes']; state.geographicFilter = { mode:'parna', terms:GEOGRAPHIC_PRESET_TERMS };
    state.filters = {};
    processData();
    check('planilha com apenas uma coluna geográfica disponível continua filtrando', state.filtered.length === 1 && state.filtered[0]._genus === 'GenusC');
    state.columns = ['Family','Genus','sp1'];
    check('planilha sem colunas geográficas não gera erro nem correspondências', geographicColumns().length === 0 && geographicMatches(state.rawData[0]).length === 0);
    state.columns = ['Family','Genus','sp1',' gazetteer ',' u c ',' Loc Notes '];
    check('cabeçalhos com capitalização e espaços são identificados', geographicColumns().length === 3);
    return { passed:checks.length, checks };
  } finally {
    Object.assign(state, saved);
  }
}
runSelfTest();
runCoverageSelfTest();
runFamilyCoverageSelfTest();
runHierarchySelfTest();
runFixesSelfTest();
runModelDetectionSelfTest();
