const APP_VERSION = "20260702g";
const SESSION_VERSION = Date.now().toString(36);
const LANGUAGE_STORAGE_KEY = "evbPortalLanguage";
const EVB_GBIF_DATASET_KEY = "0638cd34-da37-48f0-8dbe-2a2999905bc5";
const EVB_IPT_DWCA_URL = "https://ipt.jbrj.gov.br/jabot/archive.do?r=hevb";

const siteData = window.EVB_SITE_DATA || {};
const fallbackCollectionMapData = window.EVB_COLLECTION_MAP || null;
let collectionMapData = fallbackCollectionMapData;
let collectionTaxonIndex = null;
let collectionSearchHistory = [];
const COLLECTION_SEARCH_HISTORY_LIMIT = 12;
let coordinateConversionHistory = [];
const baseTools = siteData.tools || [];
const baseInfoPages = siteData.infoPages || [];
const localizedData = siteData.localized || {};
const languageLabels = { pt: "PT", en: "EN", es: "ES" };
const languages = ["pt", ...Object.keys(localizedData)]
    .filter((code, index, array) => array.indexOf(code) === index)
    .reduce((acc, code) => ({ ...acc, [code]: languageLabels[code] || code.toUpperCase() }), {});
const uiText = {
    pt: {
        ready: "Pronto",
        tools: "Ferramentas",
        information: "Informações",
        tool: "Ferramenta",
        selectedTool: "Ferramenta selecionada",
        openTool: "Abrir ferramenta",
        moreAbout: "Mais sobre",
        lessAbout: "Recolher",
        openToolNewTab: "Abrir ferramenta em nova aba",
        acceptedFiles: "Arquivos aceitos",
        generatedOutput: "Resultado gerado",
        defaultExample: "Baixar exemplo",
        defaultStatus: "Em uso",
        defaultAcceptedFiles: "Arquivos definidos conforme a rotina da ferramenta.",
        defaultOutput: "Resultado processado pela ferramenta selecionada.",
        dataConfig: "Configuração",
        dataErrorTitle: "Arquivo de dados não carregado",
        dataErrorBody: "O portal não conseguiu carregar o arquivo <strong>data/site-data.js</strong>. Verifique se a pasta <strong>data</strong> foi enviada junto com o site e se o caminho está correto.",
        homeEyebrow: "Ambiente integrado",
        homeTitle: "Escolha uma ferramenta para iniciar",
        homeSummary: "Este portal organiza os programas do EVB em uma interface comum, com navegação padronizada e espaço de trabalho adaptável ao monitor.",
        mobileToolNotice: "No celular, esta ferramenta funciona melhor em tela cheia. Use o botão ao lado para abrir em nova aba.",
        optionalImage: "Imagem opcional",
        optionalImageHint: "Coloque uma foto em img/ e edite o campo image no data/site-data.js",
        helpAria: "Ajuda das ferramentas",
        toolsHelpTitle: "Ajuda das ferramentas",
        toolsHelpSummary: "Fluxo recomendado, entradas esperadas, exemplos e erros comuns para usar as ferramentas do Portal EVB.",
        guideAria: "Guias de orientações e procedimentos",
        guideSummary: "Sumário",
        guideImagePlaceholder: "Espaço para foto da etapa",
        expectedInput: "Entrada esperada",
        stepByStep: "Passo a passo",
        commonErrors: "Erros comuns",
        instagramAria: "Instagram do Herbário Evaldo Buttura",
        instagramTitle: "Herbário Evaldo Buttura no Instagram",
        instagramFallback: "Acompanhe as novidades do herbário pelo Instagram.",
        openProfile: "Abrir perfil",
        qrCaption: "Aponte a câmera do celular para acessar o perfil.",
        qrAlt: "QR Code do Instagram",
        instagramPost: "Publicação",
        viewOnInstagram: "Ver no Instagram",
        mapTitle: "Mapa",
        repositoryAria: "Repositório de trabalhos",
        search: "Buscar",
        titleOrAuthor: "Título ou autor",
        year: "Ano",
        all: "Todos",
        type: "Tipo",
        publication: "Publicação",
        abstract: "Resumo",
        externalLink: "Link externo",
        noRepositoryResults: "Nenhum trabalho encontrado para os filtros selecionados.",
        servicesAria: "Orientações e procedimentos do herbário",
        infoFallback: "Informação",
        teamAria: "Equipe do Herbário Evaldo Buttura",
        photoAlt: "Foto do herbário",
        showPhoto: "Mostrar foto",
        galleryAria: "Galeria de fotos do herbário",
        gallery: "Galeria",
        galleryTitle: "Fotos do herbário",
        previousPhoto: "Foto anterior",
        nextPhoto: "Próxima foto",
        footerCredit: "Desenvolvido por Marlon Royer de Morais"
    },
    en: {
        ready: "Ready",
        tools: "Tools",
        information: "Information",
        tool: "Tool",
        selectedTool: "Selected tool",
        openTool: "Open tool",
        moreAbout: "More about",
        lessAbout: "Collapse",
        openToolNewTab: "Open tool in a new tab",
        acceptedFiles: "Accepted files",
        generatedOutput: "Generated output",
        defaultExample: "Download example",
        defaultStatus: "In use",
        defaultAcceptedFiles: "Files defined according to the tool workflow.",
        defaultOutput: "Output processed by the selected tool.",
        dataConfig: "Configuration",
        dataErrorTitle: "Data file not loaded",
        dataErrorBody: "The portal could not load the <strong>data/site-data.js</strong> file. Check whether the <strong>data</strong> folder was uploaded with the site and whether the path is correct.",
        homeEyebrow: "Integrated environment",
        homeTitle: "Choose a tool to begin",
        homeSummary: "This portal organizes EVB programs in a common interface, with standardized navigation and a workspace that adapts to the screen.",
        mobileToolNotice: "On mobile, this tool works better in full screen. Use the button beside it to open it in a new tab.",
        optionalImage: "Optional image",
        optionalImageHint: "Place an image in img/ and edit the image field in data/site-data.js",
        helpAria: "Tool help",
        toolsHelpTitle: "Tool help",
        toolsHelpSummary: "Recommended workflow, expected inputs, examples and common errors for using the EVB Portal tools.",
        guideAria: "Guidelines and procedure guides",
        guideSummary: "Summary",
        guideImagePlaceholder: "Space for a step photo",
        expectedInput: "Expected input",
        stepByStep: "Step by step",
        commonErrors: "Common errors",
        instagramAria: "Herbário Evaldo Buttura Instagram",
        instagramTitle: "Herbário Evaldo Buttura on Instagram",
        instagramFallback: "Follow herbarium updates on Instagram.",
        openProfile: "Open profile",
        qrCaption: "Point your phone camera at the QR Code to access the profile.",
        qrAlt: "Instagram QR Code",
        instagramPost: "Post",
        viewOnInstagram: "View on Instagram",
        mapTitle: "Map",
        repositoryAria: "Works repository",
        search: "Search",
        titleOrAuthor: "Title or author",
        year: "Year",
        all: "All",
        type: "Type",
        publication: "Publication",
        abstract: "Abstract",
        externalLink: "External link",
        noRepositoryResults: "No work found for the selected filters.",
        servicesAria: "Herbarium guidelines and procedures",
        infoFallback: "Information",
        teamAria: "Herbário Evaldo Buttura team",
        photoAlt: "Herbarium photo",
        showPhoto: "Show photo",
        galleryAria: "Herbarium photo gallery",
        gallery: "Gallery",
        galleryTitle: "Herbarium photos",
        previousPhoto: "Previous photo",
        nextPhoto: "Next photo",
        footerCredit: "Developed by Marlon Royer de Morais"
    },
    es: {
        ready: "Listo",
        tools: "Herramientas",
        information: "Información",
        tool: "Herramienta",
        selectedTool: "Herramienta seleccionada",
        openTool: "Abrir herramienta",
        moreAbout: "Más sobre",
        lessAbout: "Contraer",
        openToolNewTab: "Abrir herramienta en una nueva pestaña",
        acceptedFiles: "Archivos aceptados",
        generatedOutput: "Resultado generado",
        defaultExample: "Descargar ejemplo",
        defaultStatus: "En uso",
        defaultAcceptedFiles: "Archivos definidos según el flujo de trabajo de la herramienta.",
        defaultOutput: "Resultado procesado por la herramienta seleccionada.",
        dataConfig: "Configuración",
        dataErrorTitle: "Archivo de datos no cargado",
        dataErrorBody: "El portal no pudo cargar el archivo <strong>data/site-data.js</strong>. Verifique si la carpeta <strong>data</strong> fue enviada junto con el sitio y si la ruta es correcta.",
        homeEyebrow: "Ambiente integrado",
        homeTitle: "Elija una herramienta para comenzar",
        homeSummary: "Este portal organiza los programas del EVB en una interfaz común, con navegación estandarizada y un espacio de trabajo adaptable a la pantalla.",
        mobileToolNotice: "En celular, esta herramienta funciona mejor en pantalla completa. Use el botón al lado para abrirla en una nueva pestaña.",
        optionalImage: "Imagen opcional",
        optionalImageHint: "Coloque una imagen en img/ y edite el campo image en data/site-data.js",
        helpAria: "Ayuda de las herramientas",
        toolsHelpTitle: "Ayuda de las herramientas",
        toolsHelpSummary: "Flujo recomendado, entradas esperadas, ejemplos y errores comunes para usar las herramientas del Portal EVB.",
        guideAria: "Guías de orientaciones y procedimientos",
        guideSummary: "Sumario",
        guideImagePlaceholder: "Espacio para foto de la etapa",
        expectedInput: "Entrada esperada",
        stepByStep: "Paso a paso",
        commonErrors: "Errores comunes",
        instagramAria: "Instagram del Herbário Evaldo Buttura",
        instagramTitle: "Herbário Evaldo Buttura en Instagram",
        instagramFallback: "Acompañe las novedades del herbário en Instagram.",
        openProfile: "Abrir perfil",
        qrCaption: "Apunte la cámara del celular al QR Code para acceder al perfil.",
        qrAlt: "QR Code de Instagram",
        instagramPost: "Publicación",
        viewOnInstagram: "Ver en Instagram",
        mapTitle: "Mapa",
        repositoryAria: "Repositorio de trabajos",
        search: "Buscar",
        titleOrAuthor: "Título o autor",
        year: "Año",
        all: "Todos",
        type: "Tipo",
        publication: "Publicación",
        abstract: "Resumen",
        externalLink: "Enlace externo",
        noRepositoryResults: "No se encontraron trabajos para los filtros seleccionados.",
        servicesAria: "Orientaciones y procedimientos del herbário",
        infoFallback: "Información",
        teamAria: "Equipo del Herbário Evaldo Buttura",
        photoAlt: "Foto del herbário",
        showPhoto: "Mostrar foto",
        galleryAria: "Galería de fotos del herbário",
        gallery: "Galería",
        galleryTitle: "Fotos del herbário",
        previousPhoto: "Foto anterior",
        nextPhoto: "Siguiente foto",
        footerCredit: "Desarrollado por Marlon Royer de Morais"
    }
};
let currentLanguage = getInitialLanguage();
let tools = [];
let infoPages = [];
let toolHelpData = {};

const elements = {
    infoNavList: document.getElementById("infoNavList"),
    navList: document.getElementById("toolNavList"),
    toolCards: document.getElementById("toolCards"),
    toolHelpPanel: document.getElementById("toolHelpPanel"),
    homeView: document.getElementById("homeView"),
    infoView: document.getElementById("infoView"),
    infoPageContainer: document.getElementById("infoPageContainer"),
    toolView: document.getElementById("toolView"),
    toolFrame: document.getElementById("toolFrame"),
    pageTitle: document.getElementById("pageTitle"),
    toolStatus: document.getElementById("toolStatus"),
    openToolButton: document.getElementById("openToolButton"),
    activeToolCategory: document.getElementById("activeToolCategory"),
    activeToolName: document.getElementById("activeToolName"),
    activeToolDescription: document.getElementById("activeToolDescription"),
    currentYear: document.getElementById("currentYear"),
    languageSwitcher: document.getElementById("languageSwitcher"),
    homeEyebrow: document.getElementById("homeEyebrow"),
    homeTitle: document.getElementById("homeTitle"),
    homeSummary: document.getElementById("homeSummary"),
    mobileToolNotice: document.querySelector(".mobile-tool-notice"),
    footerCredit: document.getElementById("footerCredit")
};

let activeTool = null;
let carouselAutoplayTimer = null;

document.addEventListener("DOMContentLoaded", () => {
    refreshLocalizedData();
    if (!validateSiteData()) return;

    renderLanguageSwitcher();
    renderStaticText();
    renderInfoTabs();
    renderNavigation();
    renderToolCards();
    elements.currentYear.textContent = new Date().getFullYear();
    elements.openToolButton.addEventListener("click", openActiveToolInNewTab);
    elements.infoPageContainer.addEventListener("click", handleInfoPageClick);
    elements.infoPageContainer.addEventListener("input", handleInfoPageInput);
    elements.infoPageContainer.addEventListener("change", handleInfoPageInput);
    window.addEventListener("hashchange", routeFromHash);
    routeFromHash();
});

function getInitialLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage && (storedLanguage === "pt" || localizedData[storedLanguage])) return storedLanguage;
    return "pt";
}

function t(key) {
    return (uiText[currentLanguage] && uiText[currentLanguage][key]) || uiText.pt[key] || key;
}

function refreshLocalizedData() {
    const languageData = localizedData[currentLanguage] || {};
    tools = mergeLocalizedArray(baseTools, languageData.tools || []);
    const photoGallery = mergeLocalizedArray(siteData.photoGallery || [], languageData.photoGallery || [], "src");
    const teamMembers = mergeLocalizedArray(siteData.teamMembers || [], languageData.teamMembers || [], "name");
    const repositoryItems = mergeLocalizedArray(siteData.repositoryItems || [], languageData.repositoryItems || [], "title");
    const serviceItems = mergeLocalizedArray(siteData.serviceItems || [], languageData.serviceItems || [], "title");
    const orientationGuides = mergeLocalizedArray(siteData.orientationGuides || [], languageData.orientationGuides || [], "id");
    const instagramInfo = mergeLocalizedObject(siteData.instagramInfo || {}, languageData.instagramInfo || {});
    if (siteData.instagramInfo?.posts || languageData.instagramInfo?.posts) {
        instagramInfo.posts = mergeLocalizedArray(siteData.instagramInfo?.posts || [], languageData.instagramInfo?.posts || [], "title");
    }
    const toolHelp = localizeToolHelp(siteData.toolHelp || {}, languageData.toolHelp || {});
    toolHelpData = toolHelp;

    infoPages = mergeLocalizedArray(baseInfoPages, languageData.infoPages || []).map(page => {
        const nextPage = { ...page };
        if (nextPage.gallery) nextPage.gallery = photoGallery;
        if (nextPage.team) nextPage.team = teamMembers;
        if (nextPage.repository) nextPage.repository = repositoryItems;
        if (nextPage.services) nextPage.services = serviceItems;
        if (nextPage.guides) nextPage.guides = orientationGuides;
        if (nextPage.instagram) nextPage.instagram = instagramInfo;
        if (nextPage.help) nextPage.help = toolHelp;
        return nextPage;
    }).filter(page => page.id !== "ajuda");
}

function mergeLocalizedArray(baseArray, localizedArray, key = "id") {
    const translations = new Map((localizedArray || []).map(item => [item[key], item]));
    return (baseArray || []).map((item, index) => {
        const translatedItem = translations.get(item[key]) || localizedArray[index] || {};
        return mergeLocalizedObject(item, translatedItem);
    });
}

function mergeLocalizedObject(baseObject, localizedObject) {
    const merged = { ...baseObject, ...localizedObject };
    Object.entries(baseObject || {}).forEach(([key, value]) => {
        if (Array.isArray(value) && !Object.prototype.hasOwnProperty.call(localizedObject, key)) {
            merged[key] = value;
        }
    });
    return merged;
}

function localizeToolHelp(baseHelp, translatedHelp) {
    const translatedGuides = new Map((translatedHelp.tools || []).map(item => [item.toolId, item]));
    return {
        ...baseHelp,
        ...translatedHelp,
        flow: translatedHelp.flow || baseHelp.flow || [],
        tools: (baseHelp.tools || []).map(item => mergeLocalizedObject(item, translatedGuides.get(item.toolId) || {}))
    };
}

function renderLanguageSwitcher() {
    if (!elements.languageSwitcher) return;
    elements.languageSwitcher.innerHTML = Object.entries(languages).map(([code, label]) => `
        <button class="language-button${currentLanguage === code ? " is-active" : ""}" type="button" data-language="${escapeHTML(code)}" aria-pressed="${currentLanguage === code ? "true" : "false"}">
            <span class="language-flag language-flag--${escapeHTML(code)}" aria-hidden="true"></span>
            <span class="language-code">${escapeHTML(label)}</span>
        </button>
    `).join("");
    elements.languageSwitcher.querySelectorAll("[data-language]").forEach(button => {
        button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
}

function setLanguage(language) {
    if (language === currentLanguage || (language !== "pt" && !localizedData[language])) return;
    currentLanguage = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    refreshLocalizedData();
    renderStaticText();
    renderLanguageSwitcher();
    renderInfoTabs();
    renderNavigation();
    renderToolCards();
    routeFromHash();
}

function renderStaticText() {
    document.documentElement.lang = currentLanguage === "en" ? "en" : currentLanguage === "es" ? "es" : "pt-BR";
    document.title = currentLanguage === "en" ? "EVB Portal - Digital Tools" : currentLanguage === "es" ? "Portal EVB - Herramientas Digitales" : "Portal EVB - Ferramentas Digitais";
    if (elements.homeEyebrow) elements.homeEyebrow.textContent = t("homeEyebrow");
    if (elements.homeTitle) elements.homeTitle.textContent = t("homeTitle");
    if (elements.homeSummary) elements.homeSummary.textContent = t("homeSummary");
    if (elements.mobileToolNotice) elements.mobileToolNotice.textContent = t("mobileToolNotice");
    if (elements.footerCredit) elements.footerCredit.textContent = t("footerCredit");
    elements.openToolButton.title = t("openToolNewTab");
    elements.openToolButton.setAttribute("aria-label", t("openToolNewTab"));
}

function validateSiteData() {
    if (tools.length > 0 && infoPages.length > 0) return true;

    elements.homeView.hidden = true;
    elements.infoView.hidden = false;
    elements.toolView.hidden = true;
    elements.infoPageContainer.innerHTML = `
        <article class="info-page info-page--error">
            <div class="info-copy">
                <p class="eyebrow">${escapeHTML(t("dataConfig"))}</p>
                <h2>${escapeHTML(t("dataErrorTitle"))}</h2>
                <div class="info-body">
                    <p>${t("dataErrorBody")}</p>
                </div>
            </div>
        </article>
    `;
    return false;
}

function renderInfoTabs() {
    elements.infoNavList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    let toolsTabAdded = false;

    const appendToolsTab = () => {
        if (toolsTabAdded) return;
        const toolsTab = document.createElement("button");
        toolsTab.className = "tab-button";
        toolsTab.type = "button";
        toolsTab.dataset.target = "tools";
        toolsTab.textContent = t("tools");
        toolsTab.addEventListener("click", () => navigateTo("home"));
        fragment.appendChild(toolsTab);
        toolsTabAdded = true;
    };

    infoPages.forEach(page => {
        if (page.id === "ajuda") appendToolsTab();

        const button = document.createElement("button");
        button.className = "tab-button";
        button.type = "button";
        button.dataset.target = page.id;
        button.textContent = page.label;
        button.addEventListener("click", () => navigateToInfo(page.id));
        fragment.appendChild(button);
    });

    appendToolsTab();

    elements.infoNavList.appendChild(fragment);
}

function renderNavigation() {
    elements.navList.innerHTML = "";
    const fragment = document.createDocumentFragment();

    tools.forEach(tool => {
        const link = document.createElement("a");
        link.className = "nav-button";
        link.href = withVersion(tool.path);
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.dataset.target = tool.id;
        link.title = t("openToolNewTab");
        link.setAttribute("aria-label", `${t("openToolNewTab")}: ${tool.name}`);
        link.innerHTML = `<strong>${tool.name}</strong><small>${tool.category}</small>`;
        fragment.appendChild(link);
    });

    elements.navList.appendChild(fragment);
}

function renderToolCards() {
    elements.toolCards.innerHTML = "";
    if (elements.toolHelpPanel) elements.toolHelpPanel.innerHTML = "";
    const fragment = document.createDocumentFragment();

    tools.forEach(tool => {
        const card = document.createElement("article");
        card.className = "tool-card";
        const statusClass = normalizeStatusClass(tool.status);
        const exampleButton = tool.exampleUrl
            ? `<a class="tool-example-link" href="${escapeHTML(tool.exampleUrl)}" download>${escapeHTML(tool.exampleLabel || t("defaultExample"))}</a>`
            : "";
        const longDescription = tool.longDescriptionHtml
            ? `
                <button class="tool-more-button" type="button" aria-expanded="false">
                    <span data-more-label>${escapeHTML(t("moreAbout"))}</span>
                    <span aria-hidden="true">+</span>
                </button>
                <div class="tool-long-description" hidden>
                    ${tool.longDescriptionHtml}
                </div>
            `
            : "";
        card.innerHTML = `
            <span class="tool-card-topline">
                <span class="category">${tool.category}</span>
                <span class="tool-status-badge ${statusClass}">${tool.status || t("defaultStatus")}</span>
            </span>
            <span class="tool-card-heading">
                <h3>${tool.name}</h3>
                <span class="tool-version">v${tool.version || "2.0"}</span>
            </span>
            <p>${tool.description}</p>
            <span class="tool-details">
                <span>
                    <strong>${escapeHTML(t("acceptedFiles"))}</strong>
                    <small>${tool.accepts || t("defaultAcceptedFiles")}</small>
                </span>
                <span>
                    <strong>${escapeHTML(t("generatedOutput"))}</strong>
                    <small>${tool.output || t("defaultOutput")}</small>
                </span>
            </span>
            ${longDescription}
            <span class="tool-card-footer">
                <button class="tool-open-inline" type="button">
                    <span class="open-label">${escapeHTML(t("openTool"))}</span>
                    <span aria-hidden="true">&rarr;</span>
                </button>
                ${exampleButton}
            </span>
        `;
        card.querySelector(".tool-open-inline").addEventListener("click", () => {
            window.open(withVersion(tool.path), "_blank", "noopener,noreferrer");
        });
        const moreButton = card.querySelector(".tool-more-button");
        if (moreButton) {
            moreButton.addEventListener("click", () => toggleToolCardDetails(card, moreButton));
        }
        fragment.appendChild(card);
    });

    elements.toolCards.appendChild(fragment);
    if (elements.toolHelpPanel) {
        elements.toolHelpPanel.innerHTML = `
            <section class="tools-help-block">
                <div class="tools-help-heading">
                    <p class="eyebrow">${escapeHTML(t("tools"))}</p>
                    <h2>${escapeHTML(t("toolsHelpTitle"))}</h2>
                    <p>${escapeHTML(t("toolsHelpSummary"))}</p>
                </div>
                ${buildHelpHTML(toolHelpData)}
            </section>
        `;
    }
}

function toggleToolCardDetails(card, button) {
    const details = card.querySelector(".tool-long-description");
    const label = button.querySelector("[data-more-label]");
    const icon = button.querySelector("[aria-hidden='true']");
    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    card.classList.toggle("is-expanded", !isExpanded);
    if (details) details.hidden = isExpanded;
    if (label) label.textContent = isExpanded ? t("moreAbout") : t("lessAbout");
    if (icon) icon.textContent = isExpanded ? "+" : "-";
}

function normalizeStatusClass(status) {
    return String(status || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function navigateTo(target) {
    window.location.hash = target === "home" ? "home" : `tool=${target}`;
}

function navigateToInfo(target) {
    window.location.hash = `page=${target}`;
}

function routeFromHash() {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));

    if (!hash) {
        showInfoPage(infoPages[0]);
        return;
    }

    if (hash === "home" || hash === "tools") {
        showHome();
        return;
    }

    if (hash.startsWith("page=")) {
        const pageId = hash.slice(5);
        if (pageId === "ajuda") {
            showHome();
            return;
        }
        const page = infoPages.find(item => item.id === pageId);
        if (page) {
            showInfoPage(page);
            return;
        }
    }

    const toolId = hash.startsWith("tool=") ? hash.slice(5) : hash;
    const tool = tools.find(item => item.id === toolId);

    if (!tool) {
        showInfoPage(infoPages[0]);
        return;
    }

    showTool(tool);
}

function showHome() {
    activeTool = null;
    stopCarouselAutoplay();
    document.body.classList.remove("is-tool-open");
    elements.homeView.hidden = false;
    elements.infoView.hidden = true;
    elements.toolView.hidden = true;
    elements.toolFrame.removeAttribute("src");
    elements.pageTitle.textContent = t("tools");
    elements.toolStatus.textContent = t("tools");
    elements.openToolButton.disabled = true;
    setActiveNav("home");
    setActiveTab("tools");
}

function showInfoPage(page) {
    activeTool = null;
    stopCarouselAutoplay();
    document.body.classList.remove("is-tool-open");
    elements.homeView.hidden = true;
    elements.infoView.hidden = false;
    elements.toolView.hidden = true;
    elements.toolFrame.removeAttribute("src");
    elements.pageTitle.textContent = page.title;
    elements.toolStatus.textContent = t("information");
    elements.openToolButton.disabled = true;
    elements.infoPageContainer.innerHTML = buildInfoPageHTML(page);
    if (page.utility === "collectionMap") {
        refreshCollectionMapFromGoogle(page.collectionMap || {}, { silent: true });
    }
    startCarouselAutoplay();
    setActiveNav("");
    setActiveTab(page.id);
}

function showTool(tool) {
    activeTool = tool;
    stopCarouselAutoplay();
    document.body.classList.add("is-tool-open");
    elements.homeView.hidden = true;
    elements.infoView.hidden = true;
    elements.toolView.hidden = false;
    elements.pageTitle.textContent = tool.name;
    elements.toolStatus.textContent = tool.category;
    elements.activeToolCategory.textContent = tool.category;
    elements.activeToolName.textContent = tool.name;
    elements.activeToolDescription.textContent = tool.description;
    elements.openToolButton.disabled = false;
    setActiveNav(tool.id);
    setActiveTab("");

    const versionedPath = withVersion(tool.path);

    if (elements.toolFrame.getAttribute("src") !== versionedPath) {
        elements.toolFrame.src = versionedPath;
    }
}

function setActiveNav(target) {
    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("is-active");
    });
}

function setActiveTab(target) {
    document.querySelectorAll(".tab-button").forEach(button => {
        button.classList.toggle("is-active", button.dataset.target === target);
    });
}

function buildInfoPageHTML(page) {
    const paragraphs = page.bodyHtml || page.body.map(text => buildInfoParagraphHTML(text)).join("");
    const imageMode = page.imageMode ? ` ${escapeHTML(page.imageMode).split(" ").map(name => `is-${name}`).join(" ")}` : "";
    const team = buildTeamHTML(page.team || []);
    const map = buildMapHTML(page.map);
    const repository = buildRepositoryHTML(page.repository || []);
    const services = buildServicesHTML(page.services || []);
    const guides = buildOrientationGuidesHTML(page.guides || []);
    const instagram = buildInstagramHTML(page.instagram);
    const help = buildHelpHTML(page.help);
    const utility = buildUtilityHTML(page);
    const mediaGallery = buildPhotoCarouselHTML(page.gallery || [], { compact: true });
    const image = page.image
        ? `<img class="info-image${imageMode}" src="${escapeHTML(page.image)}" alt="${escapeHTML(page.imageAlt || page.title)}">`
        : `<div class="info-image-placeholder">${escapeHTML(t("optionalImage"))}<br><span>${escapeHTML(t("optionalImageHint"))}</span></div>`;
    const media = team || map || repository || guides || services || instagram || help || utility || mediaGallery || image;
    const action = page.actionLabel
        ? `<a class="info-action ${page.actionUrl ? "" : "is-disabled"}" href="${escapeHTML(page.actionUrl || "#")}" target="_blank" rel="noopener noreferrer">${escapeHTML(page.actionLabel)}</a>`
        : "";
    const pageClass = [
        team ? "info-page--with-team" : "",
        map ? "info-page--with-map" : "",
        repository ? "info-page--with-repository" : "",
        guides ? "info-page--with-guides" : "",
        services ? "info-page--with-services" : "",
        instagram ? "info-page--with-instagram" : "",
        help ? "info-page--with-help" : "",
        utility ? "info-page--with-utility" : "",
        mediaGallery ? "info-page--with-gallery" : ""
    ].filter(Boolean).join(" ");

    return `
        <article class="info-page${pageClass ? ` ${pageClass}` : ""}">
            <div class="info-copy">
                <p class="eyebrow">${escapeHTML(page.eyebrow)}</p>
                <h2>${escapeHTML(page.title)}</h2>
                <p class="info-summary">${escapeHTML(page.summary)}</p>
                <div class="info-body">${paragraphs}</div>
                ${action}
            </div>
            <div class="info-media">${media}</div>
        </article>
    `;
}

function buildUtilityHTML(page) {
    if (page.utility === "collectionMap") return buildCollectionMapHTML(page.collectionMap || {});
    if (page.utility === "tombSorter") return buildTombSorterHTML(page.tombSorter || {});
    if (page.utility === "coordinateConverter") return buildCoordinateConverterHTML(page.coordinateConverter || {});
    return "";
}

function buildCollectionMapHTML(config) {
    if (!collectionMapData || !Array.isArray(collectionMapData.cabinets)) {
        return `
            <section class="collection-map-panel">
                <p class="repository-empty">${escapeHTML(config.noData || "Dados do mapa da coleção não carregados.")}</p>
            </section>
        `;
    }

    const stats = collectionMapData.stats || {};
    const firstCabinet = collectionMapData.cabinets[0]?.id || "";

    return `
        <section class="collection-map-panel" data-collection-map>
            <div class="collection-toolbar">
                <label>
                    <span>${escapeHTML(config.searchLabel || "Buscar no acervo")}</span>
                    <input type="search" data-collection-search placeholder="${escapeHTML(config.searchPlaceholder || "")}">
                </label>
                <label>
                    <span>${escapeHTML(config.statusLabel || "Status")}</span>
                    <select data-collection-status>
                        <option value="">${escapeHTML(config.allStatus || "Todos")}</option>
                        <option value="occupied">${escapeHTML(config.occupiedStatus || "Ocupados")}</option>
                        <option value="free">${escapeHTML(config.freeStatus || "Livres")}</option>
                    </select>
                </label>
                <button class="collection-refresh-button" type="button" data-collection-refresh>
                    <i class="fas fa-rotate" aria-hidden="true"></i>
                    ${escapeHTML(config.refreshLabel || "Atualizar mapa")}
                </button>
                <button class="collection-refresh-button is-secondary" type="button" data-collection-external-search>
                    <i class="fas fa-cloud-arrow-down" aria-hidden="true"></i>
                    ${escapeHTML(config.externalSearchLabel || "Buscar tombo online")}
                </button>
                <a class="collection-refresh-button is-secondary" href="${escapeHTML(config.dwcaDownloadUrl || EVB_IPT_DWCA_URL)}" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-download" aria-hidden="true"></i>
                    ${escapeHTML(config.dwcaDownloadLabel || "Baixar base JABOT/HEVB")}
                </a>
                <label class="collection-refresh-button is-secondary collection-file-button">
                    <i class="fas fa-file-zipper" aria-hidden="true"></i>
                    ${escapeHTML(config.dwcaLoadLabel || "Carregar base DwC-A")}
                    <input type="file" data-collection-dwca-file accept=".zip">
                </label>
            </div>
            <div class="collection-stats">
                ${buildCollectionStatHTML(config.boxesLabel || "Caixas", stats.boxes || 0)}
                ${buildCollectionStatHTML(config.spacesLabel || "Espaços", stats.spaces || 0)}
                ${buildCollectionStatHTML(config.occupiedLabel || "Ocupados", stats.occupied || 0)}
                ${buildCollectionStatHTML(config.freeLabel || "Livres", stats.free || 0)}
                <div class="collection-source">
                    <span>${escapeHTML(config.sourceLabel || "Fonte")}</span>
                    <strong>${escapeHTML(collectionMapData.sourceFile || "")}</strong>
                </div>
            </div>
            <p class="collection-sync-status">
                <span data-collection-sync-status>${escapeHTML(getCollectionSourceStatus(config))}</span>
                <span aria-hidden="true">|</span>
                <span data-collection-taxonomy-status>${escapeHTML(getCollectionTaxonomyStatus(config))}</span>
            </p>
            <div class="collection-search-feedback" data-collection-search-feedback hidden></div>
            <section class="collection-search-history" data-collection-history ${collectionSearchHistory.length ? "" : "hidden"}>
                <header>
                    <strong>Histórico da sessão</strong>
                    <button type="button" data-collection-history-clear>Limpar</button>
                </header>
                <div class="collection-history-list" data-collection-history-list>${buildCollectionHistoryHTML()}</div>
            </section>
            <div class="collection-cabinet-tabs" role="tablist">
                ${collectionMapData.cabinets.map(cabinet => `
                    <button type="button" class="collection-cabinet-tab${cabinet.id === firstCabinet ? " is-active" : ""}" data-collection-cabinet-target="${escapeHTML(cabinet.id)}">
                        ${escapeHTML(cabinet.id)}
                    </button>
                `).join("")}
            </div>
            <div class="collection-workspace">
                <div class="collection-cabinets">
                    ${collectionMapData.cabinets.map(cabinet => buildCollectionCabinetHTML(cabinet, cabinet.id === firstCabinet)).join("")}
                </div>
                <aside class="collection-detail" data-collection-detail>
                    <h3>${escapeHTML(config.detailTitle || "Detalhes do espaço")}</h3>
                    <p>${escapeHTML(config.emptyDetail || "Selecione uma caixa ou espaco no mapa para ver os detalhes.")}</p>
                </aside>
            </div>
            <p class="collection-empty" data-collection-empty hidden>${escapeHTML(config.noResults || "Nenhum espaço encontrado para os filtros aplicados.")}</p>
        </section>
    `;
}

function buildCollectionStatHTML(label, value) {
    return `
        <div class="collection-stat">
            <strong>${escapeHTML(value)}</strong>
            <span>${escapeHTML(label)}</span>
        </div>
    `;
}

function buildCollectionCabinetHTML(cabinet, isActive) {
    return `
        <section class="collection-cabinet" data-collection-cabinet="${escapeHTML(cabinet.id)}" ${isActive ? "" : "hidden"}>
            <header>
                <span>Armario</span>
                <strong>${escapeHTML(cabinet.id)}</strong>
            </header>
            <div class="collection-shelves">
                ${(cabinet.shelves || []).map(shelf => buildCollectionShelfHTML(shelf)).join("")}
            </div>
        </section>
    `;
}

function buildCollectionShelfHTML(shelf) {
    return `
        <article class="collection-shelf">
            <h3>${escapeHTML(shelf.id)}</h3>
            <div class="collection-spaces">
                ${(shelf.spaces || []).map(space => buildCollectionSpaceHTML(space)).join("")}
            </div>
        </article>
    `;
}

function buildCollectionSpaceHTML(space) {
    const rows = buildCollectionContentPairs(space).slice(0, 5);
    const search = normalizeText([
        space.location,
        space.box,
        ...(space.families || []),
        ...(space.content || []),
        space.notes
    ].join(" "));

    return `
        <button type="button"
            class="collection-space is-${escapeHTML(space.status)}"
            data-collection-card
            data-location="${escapeHTML(space.location)}"
            data-status="${escapeHTML(space.status)}"
            data-search="${escapeHTML(search)}">
            <span class="collection-location">${escapeHTML(space.location)}</span>
            <strong>${escapeHTML(space.box || "Livre")}</strong>
            ${rows.length ? `
                <span class="collection-box-lines">
                    ${rows.map(row => `
                        <span class="collection-box-line">
                            ${row.displayFamily ? `<b>${escapeHTML(row.displayFamily)}</b>` : "<b></b>"}
                            <em>${escapeHTML(row.content)}</em>
                        </span>
                    `).join("")}
                </span>
            ` : ""}
        </button>
    `;
}

function buildCollectionContentPairs(space) {
    const families = space.families || [];
    const content = space.content || [];
    const length = Math.max(families.length, content.length);
    const rows = [];
    let currentFamily = "";

    for (let index = 0; index < length; index += 1) {
        const family = families[index] || "";
        if (family) currentFamily = family;
        rows.push({
            family: currentFamily,
            displayFamily: family,
            content: content[index] || (family && !content[index] ? "" : "")
        });
    }

    return rows.filter(row => row.family || row.content).map(row => ({
        family: row.family,
        displayFamily: row.displayFamily,
        content: row.content
    }));
}

function buildTombSorterHTML(config) {
    return `
        <section class="tomb-sorter-panel" data-tomb-sorter aria-label="${escapeHTML(config.title || "Organizador de tombos")}">
            <div class="tomb-sorter-grid">
                <label class="tomb-sorter-field">
                    <span>${escapeHTML(config.inputLabel || "Números de entrada")}</span>
                    <textarea data-tomb-input rows="12" placeholder="${escapeHTML(config.inputHint || "")}"></textarea>
                    <small>${escapeHTML(config.inputHint || "")}</small>
                </label>
                <label class="tomb-sorter-field">
                    <span>${escapeHTML(config.outputLabel || "Resultado ordenado")}</span>
                    <textarea data-tomb-output rows="12" readonly></textarea>
                    <small>${escapeHTML(config.outputHint || "")}</small>
                </label>
            </div>
            <div class="tomb-sorter-actions">
                <button class="tomb-sorter-button is-primary" type="button" data-tomb-action="sort">
                    <i class="fas fa-arrow-down-1-9" aria-hidden="true"></i>
                    ${escapeHTML(config.sortLabel || "Ordenar tombos")}
                </button>
                <button class="tomb-sorter-button" type="button" data-tomb-action="copy">
                    <i class="fas fa-copy" aria-hidden="true"></i>
                    ${escapeHTML(config.copyLabel || "Copiar resultado")}
                </button>
                <button class="tomb-sorter-button" type="button" data-tomb-action="clear">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                    ${escapeHTML(config.clearLabel || "Limpar")}
                </button>
            </div>
            <p class="tomb-sorter-status" data-tomb-status>${escapeHTML(config.emptyStatus || "Cole os números para iniciar.")}</p>
        </section>
    `;
}

function buildCoordinateConverterHTML(config) {
    return `
        <section class="coordinate-converter-panel" data-coordinate-converter aria-label="${escapeHTML(config.title || "Conversor de coordenadas")}">
            <div class="coordinate-converter-grid">
                <section class="coordinate-card">
                    <header>
                        <i class="fas fa-location-crosshairs" aria-hidden="true"></i>
                        <h3>${escapeHTML(config.singleTitle || "Conversor individual")}</h3>
                    </header>
                    <div class="coordinate-field-grid">
                        <label>
                            <span>${escapeHTML(config.latitudeDecimalLabel || "Latitude decimal")}</span>
                            <input type="text" data-coordinate-lat-decimal placeholder="-25.5401">
                        </label>
                        <label>
                            <span>${escapeHTML(config.longitudeDecimalLabel || "Longitude decimal")}</span>
                            <input type="text" data-coordinate-lng-decimal placeholder="-54.5852">
                        </label>
                    </div>
                    <div class="coordinate-actions">
                        <button type="button" class="coordinate-button is-primary" data-coordinate-action="decimal-to-dms">
                            <i class="fas fa-right-left" aria-hidden="true"></i>
                            ${escapeHTML(config.decimalToDmsLabel || "Decimal para GMS")}
                        </button>
                    </div>
                    <div class="coordinate-field-grid">
                        <label>
                            <span>${escapeHTML(config.latitudeDmsLabel || "Latitude GMS")}</span>
                            <input type="text" data-coordinate-lat-dms placeholder="25° 32' 24.36&quot; S">
                        </label>
                        <label>
                            <span>${escapeHTML(config.longitudeDmsLabel || "Longitude GMS")}</span>
                            <input type="text" data-coordinate-lng-dms placeholder="54° 35' 6.72&quot; W">
                        </label>
                    </div>
                    <div class="coordinate-actions">
                        <button type="button" class="coordinate-button is-primary" data-coordinate-action="dms-to-decimal">
                            <i class="fas fa-right-left" aria-hidden="true"></i>
                            ${escapeHTML(config.dmsToDecimalLabel || "GMS para decimal")}
                        </button>
                        <button type="button" class="coordinate-button" data-coordinate-action="copy-single">
                            <i class="fas fa-copy" aria-hidden="true"></i>
                            ${escapeHTML(config.copySingleLabel || "Copiar")}
                        </button>
                    </div>
                    <p class="coordinate-status" data-coordinate-status>${escapeHTML(config.emptyStatus || "Informe uma coordenada para iniciar.")}</p>
                </section>

                <section class="coordinate-card">
                    <header>
                        <i class="fas fa-table-cells" aria-hidden="true"></i>
                        <h3>${escapeHTML(config.batchTitle || "Conversão em lote")}</h3>
                    </header>
                    <p class="coordinate-hint">${escapeHTML(config.batchHint || "Cole uma coordenada por linha. Pode ser decimal separado por vírgula/ponto e vírgula ou GMS com hemisfério.")}</p>
                    <textarea data-coordinate-batch-input rows="8" placeholder="-25.5401, -54.5852&#10;25° 32' 24.36&quot; S, 54° 35' 6.72&quot; W"></textarea>
                    <div class="coordinate-actions">
                        <button type="button" class="coordinate-button is-primary" data-coordinate-action="convert-batch">
                            <i class="fas fa-table" aria-hidden="true"></i>
                            ${escapeHTML(config.convertBatchLabel || "Converter lote")}
                        </button>
                        <button type="button" class="coordinate-button" data-coordinate-action="copy-batch">
                            <i class="fas fa-copy" aria-hidden="true"></i>
                            ${escapeHTML(config.copyBatchLabel || "Copiar tabela")}
                        </button>
                    </div>
                    <div class="coordinate-table-wrap" data-coordinate-batch-results hidden></div>
                </section>
            </div>

            <section class="coordinate-history" data-coordinate-history hidden>
                <header>
                    <h3>${escapeHTML(config.historyTitle || "Histórico da sessão")}</h3>
                    <div class="coordinate-actions">
                        <button type="button" class="coordinate-button" data-coordinate-action="copy-history">
                            <i class="fas fa-copy" aria-hidden="true"></i>
                            ${escapeHTML(config.copyHistoryLabel || "Copiar histórico")}
                        </button>
                        <button type="button" class="coordinate-button" data-coordinate-action="clear-history">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                            ${escapeHTML(config.clearHistoryLabel || "Limpar")}
                        </button>
                    </div>
                </header>
                <div class="coordinate-table-wrap" data-coordinate-history-table></div>
            </section>
        </section>
    `;
}

function buildInfoParagraphHTML(text) {
    const escaped = escapeHTML(text);
    const emailPattern = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

    if (!emailPattern.test(text)) {
        return `<p>${escaped}</p>`;
    }

    return `<p class="highlight-contact">${escaped.replace(emailPattern, '<a href="mailto:$1">$1</a>')}</p>`;
}

function buildOrientationGuidesHTML(guides) {
    if (!guides || guides.length === 0) return "";

    return `
        <section class="orientation-guides" aria-label="${escapeHTML(t("guideAria"))}">
            ${guides.map((guide, guideIndex) => {
                const sections = Array.isArray(guide.sections) ? guide.sections : [];
                return `
                    <details class="orientation-guide" ${guideIndex === 0 ? "open" : ""}>
                        <summary>
                            <span>
                                <small>${escapeHTML(guide.status || t("infoFallback"))}</small>
                                <strong>${escapeHTML(guide.title || "")}</strong>
                            </span>
                            <em>${escapeHTML(guide.summary || "")}</em>
                        </summary>
                        <div class="orientation-guide-content">
                            ${sections.length ? `
                                <nav class="orientation-summary" aria-label="${escapeHTML(t("guideSummary"))}">
                                    <strong>${escapeHTML(t("guideSummary"))}</strong>
                                    <ol>
                                        ${sections.map((section, sectionIndex) => `
                                            <li><a href="#${escapeHTML(buildGuideSectionId(guide, sectionIndex))}">${escapeHTML(section.title || "")}</a></li>
                                        `).join("")}
                                    </ol>
                                </nav>
                            ` : ""}
                            <div class="orientation-chapters">
                                ${sections.map((section, sectionIndex) => buildOrientationSectionHTML(guide, section, sectionIndex)).join("")}
                            </div>
                            ${guide.actionUrl ? `<a class="service-action orientation-action" href="${escapeHTML(guide.actionUrl)}" download>${escapeHTML(guide.actionLabel || t("defaultExample"))}</a>` : ""}
                        </div>
                    </details>
                `;
            }).join("")}
        </section>
    `;
}

function buildOrientationSectionHTML(guide, section, sectionIndex) {
    const paragraphs = Array.isArray(section.body) ? section.body : [];
    const bullets = Array.isArray(section.items) ? section.items : [];
    const image = section.image
        ? `<figure class="orientation-image"><img src="${escapeHTML(section.image)}" alt="${escapeHTML(section.imageAlt || section.title || "")}">${section.caption ? `<figcaption>${escapeHTML(section.caption)}</figcaption>` : ""}</figure>`
        : `<div class="orientation-image-placeholder">${escapeHTML(t("guideImagePlaceholder"))}</div>`;

    return `
        <article id="${escapeHTML(buildGuideSectionId(guide, sectionIndex))}" class="orientation-chapter">
            <div class="orientation-chapter-copy">
                <span class="orientation-step">${String(sectionIndex + 1).padStart(2, "0")}</span>
                <h3>${escapeHTML(section.title || "")}</h3>
                ${paragraphs.map(text => `<p>${escapeHTML(text)}</p>`).join("")}
                ${bullets.length ? `<ul>${bullets.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}
            </div>
            ${image}
        </article>
    `;
}

function buildGuideSectionId(guide, index) {
    return `orientacao-${normalizeStatusClass(guide.id || guide.title || "guia")}-${index + 1}`;
}

function buildHelpHTML(help) {
    if (!help) return "";

    const flow = Array.isArray(help.flow) ? help.flow : [];
    const guides = Array.isArray(help.tools) ? help.tools : [];

    return `
        <section class="help-panel" aria-label="${escapeHTML(t("helpAria"))}">
            ${flow.length ? `
                <div class="help-flow">
                    ${flow.map(item => `
                        <article class="help-step">
                            <span>${escapeHTML(item.step || "")}</span>
                            <div>
                                <p>${escapeHTML(item.tool || t("tool"))}</p>
                                <h3>${escapeHTML(item.title || "")}</h3>
                                <small>${escapeHTML(item.text || "")}</small>
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : ""}
            <div class="help-guides">
                ${guides.map(item => {
                    const tool = tools.find(candidate => candidate.id === item.toolId) || {};
                    return `
                        <article class="help-card">
                            <div class="help-card-header">
                                <span>${escapeHTML(tool.category || t("tool"))}</span>
                                <strong>${escapeHTML(tool.name || item.toolId || t("tool"))}</strong>
                            </div>
                            <div class="help-card-section">
                                <h4>${escapeHTML(t("expectedInput"))}</h4>
                                <p>${escapeHTML(item.expectedInput || "")}</p>
                            </div>
                            <div class="help-card-section">
                                <h4>${escapeHTML(t("stepByStep"))}</h4>
                                <ol>
                                    ${(item.steps || []).map(step => `<li>${escapeHTML(step)}</li>`).join("")}
                                </ol>
                            </div>
                            <div class="help-card-section">
                                <h4>${escapeHTML(t("commonErrors"))}</h4>
                                <ul>
                                    ${(item.commonErrors || []).map(error => `<li>${escapeHTML(error)}</li>`).join("")}
                                </ul>
                            </div>
                            ${item.exampleUrl ? `<a class="help-download" href="${escapeHTML(item.exampleUrl)}" download>${escapeHTML(item.exampleLabel || t("defaultExample"))}</a>` : ""}
                        </article>
                    `;
                }).join("")}
            </div>
        </section>
    `;
}

function buildInstagramHTML(info) {
    if (!info || !info.profileUrl) return "";

    const posts = Array.isArray(info.posts) ? info.posts : [];

    return `
        <section class="instagram-panel" aria-label="${escapeHTML(t("instagramAria"))}">
            <div class="instagram-main">
                <div>
                    <span class="instagram-handle">${escapeHTML(info.handle || "@herbario.unila")}</span>
                    <h3>${escapeHTML(t("instagramTitle"))}</h3>
                    <p>${escapeHTML(info.callout || t("instagramFallback"))}</p>
                    <a class="instagram-button" href="${escapeHTML(info.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("openProfile"))}</a>
                </div>
                <figure class="instagram-qr">
                    <img src="${escapeHTML(info.qrCodeUrl || "")}" alt="${escapeHTML(info.qrCodeAlt || t("qrAlt"))}">
                    <figcaption>${escapeHTML(t("qrCaption"))}</figcaption>
                </figure>
            </div>
            ${posts.length ? `
                <div class="instagram-posts">
                    ${posts.map(post => `
                        <article class="instagram-post">
                            <span>${escapeHTML(post.tag || "Instagram")}</span>
                            <h4>${escapeHTML(post.title || t("instagramPost"))}</h4>
                            <p>${escapeHTML(post.text || "")}</p>
                            ${post.link ? `<a href="${escapeHTML(post.link)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t("viewOnInstagram"))}</a>` : ""}
                        </article>
                    `).join("")}
                </div>
            ` : ""}
        </section>
    `;
}

function buildMapHTML(map) {
    if (!map || !map.src) return "";

    return `
        <div class="map-panel">
            <iframe
                title="${escapeHTML(map.title || t("mapTitle"))}"
                src="${escapeHTML(map.src)}"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen>
            </iframe>
        </div>
    `;
}

function buildRepositoryHTML(items) {
    if (!items || items.length === 0) return "";
    const sortedItems = [...items].sort((first, second) => Number(second.year || 0) - Number(first.year || 0));
    const years = [...new Set(sortedItems.map(item => item.year).filter(Boolean))];
    const locale = currentLanguage === "en" ? "en" : "pt-BR";
    const types = [...new Set(sortedItems.map(item => item.type).filter(Boolean))].sort((first, second) => first.localeCompare(second, locale));

    return `
        <section class="repository-panel" aria-label="${escapeHTML(t("repositoryAria"))}">
            <div class="repository-filters" aria-label="Filtros do repositório">
                <label>
                    <span>${escapeHTML(t("search"))}</span>
                    <input type="search" data-repository-search placeholder="${escapeHTML(t("titleOrAuthor"))}">
                </label>
                <label>
                    <span>${escapeHTML(t("year"))}</span>
                    <select data-repository-year>
                        <option value="">${escapeHTML(t("all"))}</option>
                        ${years.map(year => `<option value="${escapeHTML(year)}">${escapeHTML(year)}</option>`).join("")}
                    </select>
                </label>
                <label>
                    <span>${escapeHTML(t("type"))}</span>
                    <select data-repository-type>
                        <option value="">${escapeHTML(t("all"))}</option>
                        ${types.map(type => `<option value="${escapeHTML(type)}">${escapeHTML(type)}</option>`).join("")}
                    </select>
                </label>
            </div>
            <div class="repository-list">
            ${sortedItems.map(item => `
                <article class="repository-item" data-repository-item data-year="${escapeHTML(item.year || "")}" data-type="${escapeHTML(item.type || "")}" data-search="${escapeHTML(`${item.title || ""} ${item.author || ""}`.toLowerCase())}">
                    <div class="repository-year">${escapeHTML(item.year || "s/d")}</div>
                    <div class="repository-content">
                        <p class="repository-meta">${escapeHTML(item.type || t("publication"))}</p>
                        <h3>${escapeHTML(item.title)}</h3>
                        <p>${escapeHTML(item.author)}</p>
                        <div class="repository-actions">
                            ${buildRepositoryLinkHTML("PDF", item.pdfUrl || item.url)}
                            ${buildRepositoryLinkHTML(t("abstract"), item.abstractUrl)}
                            ${buildRepositoryLinkHTML(t("externalLink"), item.externalUrl)}
                        </div>
                    </div>
                </article>
            `).join("")}
            </div>
            <p class="repository-empty" data-repository-empty hidden>${escapeHTML(t("noRepositoryResults"))}</p>
        </section>
    `;
}

function buildRepositoryLinkHTML(label, url) {
    if (!url) return "";
    return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`;
}

function buildServicesHTML(items) {
    if (!items || items.length === 0) return "";

    return `
        <section class="services-list" aria-label="${escapeHTML(t("servicesAria"))}">
            ${items.map(item => `
                <article class="service-item">
                    <span class="service-status">${escapeHTML(item.status || t("infoFallback"))}</span>
                    <h3>${escapeHTML(item.title)}</h3>
                    <p>${escapeHTML(item.description)}</p>
                    ${item.actionUrl ? `<a class="service-action" href="${escapeHTML(item.actionUrl)}" download>${escapeHTML(item.actionLabel || t("defaultExample"))}</a>` : ""}
                </article>
            `).join("")}
        </section>
    `;
}

function buildTeamHTML(members) {
    if (!members || members.length === 0) return "";

    const groups = members.reduce((acc, member) => {
        if (!acc.has(member.group)) acc.set(member.group, []);
        acc.get(member.group).push(member);
        return acc;
    }, new Map());

    const sections = Array.from(groups.entries()).map(([group, groupMembers]) => `
        <section class="team-group">
            <h3>${escapeHTML(group)}</h3>
            <div class="team-grid">
                ${groupMembers.map(member => buildTeamCardHTML(member)).join("")}
            </div>
        </section>
    `).join("");

    return `
        <section class="team-section" aria-label="${escapeHTML(t("teamAria"))}">
            ${sections}
        </section>
    `;
}

function buildTeamCardHTML(member) {
    const email = member.email
        ? `<a href="mailto:${escapeHTML(member.email)}">${escapeHTML(member.email)}</a>`
        : "";

    return `
        <article class="team-card">
            <img class="team-photo" src="${escapeHTML(member.photo)}" alt="${escapeHTML(t("photoAlt"))}: ${escapeHTML(member.name)}">
            <div class="team-info">
                <h4>${escapeHTML(member.name)}</h4>
                <p>${escapeHTML(member.role)}</p>
                ${email}
            </div>
        </article>
    `;
}

function buildPhotoCarouselHTML(photos, options = {}) {
    if (!photos || photos.length === 0) return "";
    const compactClass = options.compact ? " photo-carousel--compact" : "";

    const slides = photos.map((photo, index) => `
        <figure class="carousel-slide${index === 0 ? " is-active" : ""}">
            <img src="${escapeHTML(photo.src)}" alt="${escapeHTML(photo.alt || photo.caption || t("photoAlt"))}">
            ${photo.caption ? `<figcaption>${formatCaptionHTML(photo.caption)}</figcaption>` : ""}
        </figure>
    `).join("");

    const dots = photos.map((_, index) => `
        <button class="carousel-dot${index === 0 ? " is-active" : ""}" type="button" data-carousel-index="${index}" aria-label="${escapeHTML(t("showPhoto"))} ${index + 1}"></button>
    `).join("");

    return `
        <section class="photo-carousel${compactClass}" data-active-index="0" aria-label="${escapeHTML(t("galleryAria"))}">
            <div class="carousel-header">
                <div>
                    <p class="eyebrow">${escapeHTML(t("gallery"))}</p>
                    <h3>${escapeHTML(t("galleryTitle"))}</h3>
                </div>
                <div class="carousel-controls">
                    <button class="carousel-button" type="button" data-carousel-prev aria-label="${escapeHTML(t("previousPhoto"))}">‹</button>
                    <button class="carousel-button" type="button" data-carousel-next aria-label="${escapeHTML(t("nextPhoto"))}">›</button>
                </div>
            </div>
            <div class="carousel-track">${slides}</div>
            <div class="carousel-dots">${dots}</div>
        </section>
    `;
}

function handleInfoPageClick(event) {
    const collectionRefresh = event.target.closest("[data-collection-refresh]");
    if (collectionRefresh) {
        refreshCollectionMapFromGoogle(getActiveCollectionConfig());
        return;
    }

    const collectionExternalSearch = event.target.closest("[data-collection-external-search]");
    if (collectionExternalSearch) {
        lookupCollectionRecordOnline(getActiveCollectionConfig());
        return;
    }

    const historyRun = event.target.closest("[data-collection-history-run]");
    if (historyRun) {
        rerunCollectionHistoryItem(historyRun.dataset.collectionHistoryRun || "");
        return;
    }

    const historyCopy = event.target.closest("[data-collection-history-copy]");
    if (historyCopy) {
        copyCollectionHistoryItem(historyCopy.dataset.collectionHistoryCopy || "");
        return;
    }

    const historyClear = event.target.closest("[data-collection-history-clear]");
    if (historyClear) {
        clearCollectionSearchHistory();
        return;
    }

    const cabinetTab = event.target.closest("[data-collection-cabinet-target]");
    if (cabinetTab) {
        showCollectionCabinet(cabinetTab.dataset.collectionCabinetTarget);
        return;
    }

    const collectionCard = event.target.closest("[data-collection-card]");
    if (collectionCard) {
        showCollectionDetail(collectionCard.dataset.location);
        return;
    }

    const tombButton = event.target.closest("[data-tomb-action]");
    if (tombButton) {
        handleTombSorterAction(tombButton.dataset.tombAction);
        return;
    }

    const coordinateButton = event.target.closest("[data-coordinate-action]");
    if (coordinateButton) {
        handleCoordinateConverterAction(coordinateButton.dataset.coordinateAction);
        return;
    }

    const summaryLink = event.target.closest(".orientation-summary a[href^='#']");
    if (summaryLink) {
        event.preventDefault();
        const target = elements.infoPageContainer.querySelector(summaryLink.getAttribute("href"));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
    }

    const carousel = event.target.closest(".photo-carousel");
    if (!carousel) return;

    if (event.target.matches("[data-carousel-next]")) {
        moveCarousel(carousel, 1);
        restartCarouselAutoplay();
    }

    if (event.target.matches("[data-carousel-prev]")) {
        moveCarousel(carousel, -1);
        restartCarouselAutoplay();
    }

    const dot = event.target.closest("[data-carousel-index]");
    if (dot) {
        setCarouselIndex(carousel, Number(dot.dataset.carouselIndex));
        restartCarouselAutoplay();
    }
}

function handleInfoPageInput(event) {
    if (event.target.matches("[data-collection-dwca-file]")) {
        loadCollectionDwcaFile(event.target.files?.[0], getActiveCollectionConfig());
        event.target.value = "";
        return;
    }

    if (event.target.matches("[data-collection-search], [data-collection-status]")) {
        filterCollectionMap();
        return;
    }

    if (event.target.matches("[data-tomb-input]")) {
        updateTombSorter();
        return;
    }

    if (!event.target.matches("[data-repository-search], [data-repository-year], [data-repository-type]")) return;

    const panel = event.target.closest(".repository-panel");
    if (panel) {
        filterRepository(panel);
    }
}

function showCollectionCabinet(cabinetId, options = {}) {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel) return;

    setActiveCollectionCabinet(panel, cabinetId);

    if (!options.skipFilter) {
        filterCollectionMap();
    }
}

function setActiveCollectionCabinet(panel, cabinetId) {
    panel.querySelectorAll("[data-collection-cabinet-target]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.collectionCabinetTarget === cabinetId);
    });

    panel.querySelectorAll("[data-collection-cabinet]").forEach(cabinet => {
        cabinet.hidden = cabinet.dataset.collectionCabinet !== cabinetId;
    });
}

function filterCollectionMap() {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel) return;

    const search = normalizeText(panel.querySelector("[data-collection-search]")?.value || "");
    const rawSearch = panel.querySelector("[data-collection-search]")?.value || "";
    const taxonHint = resolveCollectionTaxonHint(rawSearch);
    const status = panel.querySelector("[data-collection-status]")?.value || "";
    const hasActiveFilter = Boolean(search || status);
    const currentActiveCabinetId = panel.querySelector("[data-collection-cabinet]:not([hidden])")?.dataset.collectionCabinet || "";
    const visibleByCabinet = new Map();
    const directMatches = [];
    const estimatedMatches = [];
    let firstMatchCabinetId = "";
    let visibleCount = 0;

    panel.querySelectorAll("[data-collection-card]").forEach(card => {
        const matchesSearch = !search || (card.dataset.search || "").includes(search);
        const matchesStatus = !status || card.dataset.status === status;
        const isVisible = matchesSearch && matchesStatus;
        const cabinetId = card.closest("[data-collection-cabinet]")?.dataset.collectionCabinet || "";

        card.hidden = !isVisible;
        card.classList.remove("is-estimated-match");
        card.dataset.estimateLabel = "";
        card.dataset.estimateType = "";
        card.dataset.estimateFamily = "";
        if (isVisible) {
            visibleCount += 1;
            directMatches.push(card);
            visibleByCabinet.set(cabinetId, (visibleByCabinet.get(cabinetId) || 0) + 1);
            if (!firstMatchCabinetId) firstMatchCabinetId = cabinetId;
        }
    });

    if (search && directMatches.length === 0) {
        visibleByCabinet.clear();
        visibleCount = 0;
        firstMatchCabinetId = "";

        panel.querySelectorAll("[data-collection-card]").forEach(card => {
            const record = findCollectionRecord(card.dataset.location);
            const matchesStatus = !status || card.dataset.status === status;
            const estimate = matchesStatus ? getCollectionEstimateMatch(record, rawSearch, taxonHint) : null;
            const isVisible = Boolean(estimate);
            const cabinetId = card.closest("[data-collection-cabinet]")?.dataset.collectionCabinet || "";

            card.hidden = !isVisible;
            card.classList.toggle("is-estimated-match", isVisible);
            card.dataset.estimateReason = estimate?.reason || "";
            card.dataset.estimateLabel = getCollectionEstimateLabel(estimate?.type);
            card.dataset.estimateType = estimate?.type || "";
            card.dataset.estimateFamily = estimate?.taxonFamily || "";

            if (isVisible) {
                visibleCount += 1;
                estimatedMatches.push({ card, estimate });
                visibleByCabinet.set(cabinetId, (visibleByCabinet.get(cabinetId) || 0) + 1);
                if (!firstMatchCabinetId) firstMatchCabinetId = cabinetId;
            }
        });

        const bestEstimateRank = Math.max(...estimatedMatches.map(item => getCollectionEstimateRank(item.estimate?.type)));
        if (bestEstimateRank > getCollectionEstimateRank("family")) {
            visibleByCabinet.clear();
            visibleCount = 0;
            firstMatchCabinetId = "";

            for (let index = estimatedMatches.length - 1; index >= 0; index -= 1) {
                const item = estimatedMatches[index];
                const keep = getCollectionEstimateRank(item.estimate?.type) === bestEstimateRank;
                const cabinetId = item.card.closest("[data-collection-cabinet]")?.dataset.collectionCabinet || "";

                item.card.hidden = !keep;
                item.card.classList.toggle("is-estimated-match", keep);
                item.card.dataset.estimateLabel = keep ? getCollectionEstimateLabel(item.estimate?.type) : "";
                item.card.dataset.estimateType = keep ? (item.estimate?.type || "") : "";
                item.card.dataset.estimateFamily = keep ? (item.estimate?.taxonFamily || "") : "";

                if (keep) {
                    visibleCount += 1;
                    visibleByCabinet.set(cabinetId, (visibleByCabinet.get(cabinetId) || 0) + 1);
                    if (!firstMatchCabinetId) firstMatchCabinetId = cabinetId;
                } else {
                    estimatedMatches.splice(index, 1);
                }
            }
        }
    }

    panel.querySelectorAll("[data-collection-cabinet-target]").forEach(button => {
        const count = visibleByCabinet.get(button.dataset.collectionCabinetTarget) || 0;
        button.dataset.matchCount = hasActiveFilter && count ? String(count) : "";
        button.classList.toggle("has-search-results", hasActiveFilter && count > 0);
    });

    if (visibleCount > 0 && !visibleByCabinet.has(currentActiveCabinetId) && firstMatchCabinetId) {
        setActiveCollectionCabinet(panel, firstMatchCabinetId);
    }

    const empty = panel.querySelector("[data-collection-empty]");
    if (empty) empty.hidden = visibleCount > 0;

    panel.classList.toggle("has-compact-results", hasActiveFilter && visibleCount > 0);
    updateCollectionSearchFeedback(panel, rawSearch, directMatches.length, estimatedMatches, taxonHint);
}

function showCollectionDetail(location) {
    const record = findCollectionRecord(location);
    const detail = elements.infoPageContainer.querySelector("[data-collection-detail]");
    if (!record || !detail) return;
    const contentRows = buildCollectionContentPairs(record);

    elements.infoPageContainer.querySelectorAll("[data-collection-card]").forEach(card => {
        card.classList.toggle("is-selected", card.dataset.location === location);
    });

    detail.innerHTML = `
        <h3>${escapeHTML(record.box || "Espaco livre")}</h3>
        ${buildCollectionPrintLabelLink(record)}
        <dl>
            ${buildCollectionDetailRow("Localizacao", record.location)}
            ${buildCollectionDetailRow("Armario", record.cabinet)}
            ${buildCollectionDetailRow("Prateleira", record.shelf)}
            ${buildCollectionDetailRow("Espaco", record.space)}
            ${buildCollectionDetailRow("Status", record.status === "occupied" ? "Ocupado" : "Livre")}
            ${contentRows.length ? `
                <div>
                    <dt>Conteúdo da caixa</dt>
                    <dd>
                        <span class="collection-detail-lines">
                            ${contentRows.map(row => `
                                <span>
                                    ${row.displayFamily ? `<b>${escapeHTML(row.displayFamily)}</b>` : "<b></b>"}
                                    <em>${escapeHTML(row.content)}</em>
                                </span>
                            `).join("")}
                        </span>
                    </dd>
                </div>
            ` : ""}
            ${buildCollectionDetailRow("Observacoes", record.notes)}
        </dl>
    `;
}

function buildCollectionPrintLabelLink(record) {
    if (!record?.box || record.status !== "occupied") return "";
    const box = encodeURIComponent(record.box);
    return `
        <a class="collection-print-label" href="tools/EVB_Labels_Collection/index.html?box=${box}&auto=pdf" target="_blank" rel="noopener noreferrer">
            <i class="fas fa-print" aria-hidden="true"></i>
            Imprimir etiqueta
        </a>
    `;
}

function buildCollectionDetailRow(label, value) {
    if (!value) return "";
    return `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`;
}

function findCollectionRecord(location) {
    if (!collectionMapData?.cabinets) return null;

    for (const cabinet of collectionMapData.cabinets) {
        for (const shelf of cabinet.shelves || []) {
            const found = (shelf.spaces || []).find(space => space.location === location);
            if (found) return found;
        }
    }

    return null;
}

function getCollectionEstimateMatch(record, rawSearch, taxonHint = null) {
    if (!record || record.status !== "occupied") return null;
    if (!taxonHint?.family) return null;

    const queryGenus = taxonHint?.genus || getCollectionQueryGenus(rawSearch);
    const queryBinomial = getCollectionQueryBinomial(taxonHint?.scientificName || rawSearch);
    if (!queryGenus) return null;

    const rows = buildCollectionContentPairs(record);
    let familyCandidate = null;

    for (const row of rows) {
        if (normalizeText(row.family || "") !== normalizeText(taxonHint.family)) continue;
        familyCandidate = row.family || taxonHint.family;

        if (queryBinomial && collectionContentHasExactBinomial(row.content, queryBinomial)) {
            return {
                type: "species",
                reason: `${row.family ? `${row.family}: ` : ""}${queryBinomial} aparece explicitamente na caixa`,
                taxonFamily: taxonHint?.family || ""
            };
        }
    }

    for (const row of rows) {
        if (normalizeText(row.family || "") !== normalizeText(taxonHint.family)) continue;
        familyCandidate = row.family || taxonHint.family;

        if (collectionContentHasExactGenus(row.content, queryGenus)) {
            return {
                type: "exact",
                reason: `${row.family ? `${row.family}: ` : ""}${queryGenus} aparece explicitamente na caixa`,
                taxonFamily: taxonHint?.family || ""
            };
        }

        const range = parseCollectionContentRange(row.content);
        if (!range) continue;

        const normalizedQuery = normalizeText(queryGenus);
        if (normalizedQuery >= range.start && normalizedQuery <= range.end) {
            return {
                type: "range",
                reason: `${row.family ? `${row.family}: ` : ""}${range.labelStart} - ${range.labelEnd}`,
                taxonFamily: taxonHint?.family || ""
            };
        }
    }

    if (familyCandidate) {
        return {
            type: "family",
            reason: `${familyCandidate}: família encontrada, mas o intervalo da etiqueta não cobre o gênero ${queryGenus}`,
            taxonFamily: taxonHint.family
        };
    }

    return null;
}

function getCollectionEstimateRank(type) {
    return { species: 4, exact: 3, range: 2, family: 1 }[type] || 0;
}

function getCollectionEstimateLabel(type) {
    return {
        direct: "correspondência direta",
        exact: "gênero na caixa",
        range: "provável por intervalo",
        family: "provável por família"
    }[type] || "";
}

function getCollectionEstimateConfidence(type, matchCount = 0) {
    if (type === "direct") {
        return matchCount <= 1
            ? { level: "Alta", className: "is-high", explanation: "texto encontrado diretamente no conteúdo ou na posição da caixa." }
            : { level: "Alta", className: "is-high", explanation: "texto encontrado diretamente em mais de uma caixa; confira o conjunto físico." };
    }

    if (type === "species") {
        return matchCount <= 1
            ? { level: "Alta", className: "is-high", explanation: "família confirmada e binômio citado explicitamente na caixa." }
            : { level: "Alta", className: "is-high", explanation: "família confirmada e binômio citado explicitamente em mais de uma caixa; confira o conjunto físico." };
    }

    if (type === "exact") {
        return matchCount <= 1
            ? { level: "Alta", className: "is-high", explanation: "família confirmada e gênero citado explicitamente na caixa." }
            : { level: "Alta", className: "is-high", explanation: "família confirmada e gênero citado explicitamente em mais de uma caixa; conferir o conjunto físico." };
    }

    if (type === "range") {
        return matchCount <= 1
            ? { level: "Alta", className: "is-high", explanation: "família confirmada e gênero dentro do intervalo alfabético indicado." }
            : { level: "Média", className: "is-medium", explanation: "família confirmada e gênero dentro de intervalos compatíveis em mais de uma caixa." };
    }

    if (type === "family") {
        return { level: "Baixa", className: "is-low", explanation: "família encontrada, mas sem confirmação direta pelo gênero ou pelo intervalo da etiqueta." };
    }

    return { level: "Conferir", className: "is-review", explanation: "resultado aproximado; confira fisicamente antes de concluir." };
}

function summarizeCollectionEstimates(estimatedMatches = []) {
    if (!estimatedMatches.length) return null;
    const bestType = estimatedMatches[0]?.estimate?.type || "";
    const confidence = getCollectionEstimateConfidence(bestType, estimatedMatches.length);
    return {
        count: estimatedMatches.length,
        bestType,
        confidence,
        firstReason: estimatedMatches[0]?.estimate?.reason || "",
        taxonFamily: estimatedMatches[0]?.estimate?.taxonFamily || ""
    };
}

function collectionContentHasExactGenus(content, queryGenus) {
    const normalizedQuery = normalizeText(queryGenus);
    if (!normalizedQuery) return false;

    const terms = String(content || "")
        .split(/\s+-\s+|[,;|/]/)
        .map(part => getCollectionRangeTerm(part))
        .map(term => normalizeText(term))
        .filter(Boolean);

    return terms.includes(normalizedQuery);
}

function collectionContentHasExactBinomial(content, queryBinomial) {
    const normalizedQuery = normalizeText(queryBinomial)
        .replace(/[^\p{L}\s-]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!normalizedQuery || normalizedQuery.split(" ").length < 2) return false;

    const normalizedContent = ` ${normalizeText(content)
        .replace(/[^\p{L}\s-]/gu, " ")
        .replace(/\s+-\s+/g, " ")
        .replace(/\s+/g, " ")
        .trim()} `;

    return normalizedContent.includes(` ${normalizedQuery} `);
}

function resolveCollectionTaxonHint(rawSearch) {
    if (!collectionTaxonIndex) return null;

    const query = String(rawSearch || "").trim();
    const normalized = normalizeText(query);
    const numeric = query.match(/\d+/)?.[0] || "";
    const keys = [
        normalized,
        numeric ? normalizeText(numeric) : "",
        numeric ? normalizeText(`EVB${numeric}`) : "",
        numeric ? normalizeText(`EVB ${numeric}`) : "",
        numeric ? normalizeText(`EVB-${numeric}`) : ""
    ].filter(Boolean);

    for (const key of keys) {
        const byCatalog = collectionTaxonIndex.byCatalog.get(key);
        if (byCatalog) return byCatalog;

        const byName = collectionTaxonIndex.byName.get(key);
        if (byName) return byName;
    }

    const genus = getCollectionQueryGenus(query);
    return genus ? collectionTaxonIndex.byGenus.get(normalizeText(genus)) || null : null;
}

function getCollectionQueryGenus(value) {
    const words = String(value || "")
        .replace(/[^\p{L}\s-]/gu, " ")
        .split(/\s+/)
        .map(item => item.trim())
        .filter(Boolean);

    return words.find(word => normalizeText(word).length >= 3) || "";
}

function getCollectionQueryBinomial(value) {
    const words = String(value || "")
        .replace(/[^\p{L}\s-]/gu, " ")
        .split(/\s+/)
        .map(item => item.trim())
        .filter(Boolean);
    const genusIndex = words.findIndex(word => normalizeText(word).length >= 3);
    if (genusIndex < 0 || !words[genusIndex + 1]) return "";

    const genus = words[genusIndex];
    const epithet = words[genusIndex + 1];
    if (normalizeText(epithet).length < 2) return "";

    return `${genus} ${epithet}`;
}

function parseCollectionContentRange(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text.includes("-")) return null;

    const parts = text.split(/\s+-\s+/).map(item => item.trim()).filter(Boolean);
    if (parts.length < 2) return null;

    const start = getCollectionRangeTerm(parts[0]);
    const end = getCollectionRangeTerm(parts[parts.length - 1]);
    if (!start || !end) return null;

    const hasIndeterminateLead = isCollectionIndeterminateRangeTerm(start);
    const normalizedStart = hasIndeterminateLead ? "" : normalizeText(start);
    const normalizedEnd = normalizeText(end);
    if (!normalizedEnd || (!hasIndeterminateLead && !normalizedStart)) return null;

    if (hasIndeterminateLead) {
        return {
            start: "",
            end: normalizedEnd,
            labelStart: start,
            labelEnd: end,
            isIndeterminateLead: true
        };
    }

    const ordered = normalizedStart <= normalizedEnd
        ? { start: normalizedStart, end: normalizedEnd, labelStart: start, labelEnd: end }
        : { start: normalizedEnd, end: normalizedStart, labelStart: end, labelEnd: start };

    return ordered;
}

function getCollectionRangeTerm(value) {
    const match = String(value || "").match(/[\p{L}][\p{L}'-]*/u);
    return match ? match[0] : "";
}

function isCollectionIndeterminateRangeTerm(value) {
    const normalized = normalizeText(value);
    return normalized === "ind"
        || normalized.startsWith("indeterminad")
        || normalized.startsWith("indetermin");
}

function updateCollectionSearchFeedback(panel, rawSearch, directCount, estimatedMatches, taxonHint = null) {
    const feedback = panel.querySelector("[data-collection-search-feedback]");
    if (!feedback) return;

    const query = String(rawSearch || "").trim();
    if (!query) {
        feedback.hidden = true;
        feedback.textContent = "";
        return;
    }

    if (directCount > 0) {
        feedback.hidden = false;
        feedback.classList.remove("is-estimate");
        feedback.innerHTML = formatCollectionSearchResultHTML({
            title: "Resultado direto no mapa",
            rows: [["Busca", query], ["Correspondências", String(directCount)]],
            note: "A busca encontrou texto correspondente diretamente no mapa físico.",
            confidence: { level: "Direto", className: "is-high", explanation: "correspondência textual direta no conteúdo ou na posição da caixa." }
        });
        return;
    }

    if (estimatedMatches.length > 0) {
        feedback.hidden = false;
        feedback.classList.add("is-estimate");
        const summary = summarizeCollectionEstimates(estimatedMatches);
        const bestType = summary?.bestType || "";
        const methodText = {
            species: "esp?cie citada explicitamente no conte?do da caixa",
            exact: "gênero citado explicitamente no conteúdo da caixa",
            range: "família confirmada e intervalo alfabético compatível",
            family: "família compatível, sem confirmação exata pelo gênero"
        }[bestType] || "por estimativa";
        const note = `${summary?.firstReason ? `${summary.firstReason}. ` : ""}Confira fisicamente a caixa antes de concluir.`;
        if (taxonHint) {
            feedback.innerHTML = formatCollectionTaxonSummaryHTML(taxonHint, note, getCollectionSearchMode(rawSearch), summary);
        } else {
            feedback.innerHTML = formatCollectionSearchResultHTML({
                title: "Localização provável",
                rows: [
                    ["Busca", query],
                    ["Família", summary?.taxonFamily || ""],
                    ["Critério", methodText],
                    ["Caixas prováveis", String(summary?.count || estimatedMatches.length)]
                ].filter(([, value]) => value),
                note,
                confidence: summary?.confidence
            });
        }
        return;
    }

    feedback.hidden = true;
    feedback.textContent = "";
}

async function lookupCollectionRecordOnline(config = {}) {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel) return;

    const input = panel.querySelector("[data-collection-search]");
    const query = String(input?.value || "").trim();
    if (!query) {
        setCollectionSearchFeedbackMessage(panel, config.externalEmptyQuery || "Digite um número de tombo ou nome antes de buscar online.", "is-estimate");
        return;
    }

    setCollectionSearchFeedbackMessage(panel, config.externalLoading || "Buscando registro na base do herbário...");

    try {
        const searchMode = getCollectionSearchMode(query);
        const localRecord = resolveCollectionTaxonHint(query);
        if (localRecord?.catalogNumber || localRecord?.scientificName || localRecord?.family) {
            const suggestedSearch = localRecord.scientificName || localRecord.genus || localRecord.family || query;
            if (input) input.value = suggestedSearch;
            filterCollectionMap();
            const estimateSummary = getVisibleCollectionEstimateSummary(panel);
            setCollectionSearchFeedbackMessage(
                panel,
                formatCollectionTaxonSummaryHTML(localRecord, "A localização física abaixo é estimada pelo mapa de caixas.", searchMode, estimateSummary),
                "is-estimate",
                true
            );
            addCollectionSearchHistory({
                query,
                mode: searchMode,
                result: formatCollectionTaxonSummary(localRecord),
                confidence: estimateSummary?.confidence?.level || "Conferir",
                locations: getVisibleCollectionLocations(panel),
                summary: estimateSummary
            });
            return;
        }

        const record = await fetchCollectionOccurrenceFromGbif(query);
        if (!record) {
            setCollectionSearchFeedbackMessage(panel, config.externalNoResults || "Nenhum registro foi encontrado na base do herbário para esta busca.", "is-estimate");
            return;
        }

        const suggestedSearch = record.scientificName || record.genus || record.family || query;
        if (input) input.value = suggestedSearch;
        filterCollectionMap();
        const estimateSummary = getVisibleCollectionEstimateSummary(panel);
        setCollectionSearchFeedbackMessage(
            panel,
            formatCollectionTaxonSummaryHTML(record, "A localização física abaixo é estimada pelo mapa de caixas.", searchMode, estimateSummary),
            "is-estimate",
            true
        );
        addCollectionSearchHistory({
            query,
            mode: searchMode,
            result: formatCollectionTaxonSummary(record),
            confidence: estimateSummary?.confidence?.level || "Conferir",
            locations: getVisibleCollectionLocations(panel),
            summary: estimateSummary
        });
    } catch (error) {
        setCollectionSearchFeedbackMessage(panel, config.externalError || "Não foi possível consultar a base do herbário agora. A busca local continua disponível.", "is-estimate");
    }
}

function setCollectionSearchFeedbackMessage(panel, message, className = "", isHTML = false) {
    const feedback = panel.querySelector("[data-collection-search-feedback]");
    if (!feedback) return;

    feedback.hidden = false;
    feedback.classList.toggle("is-estimate", className === "is-estimate");
    if (isHTML) {
        feedback.innerHTML = message;
    } else {
        feedback.textContent = message;
    }
}

function addCollectionSearchHistory(item) {
    const normalizedQuery = normalizeText(item.query || "");
    if (!normalizedQuery) return;

    const entry = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        query: item.query || "",
        mode: item.mode || "taxon",
        result: item.result || "",
        confidence: item.confidence || "Conferir",
        locations: item.locations || "",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    collectionSearchHistory = [
        entry,
        ...collectionSearchHistory.filter(previous => normalizeText(previous.query) !== normalizedQuery)
    ].slice(0, COLLECTION_SEARCH_HISTORY_LIMIT);

    renderCollectionSearchHistory();
}

function buildCollectionHistoryHTML() {
    return collectionSearchHistory.map(item => {
        const parts = [
            item.result || item.query,
            item.locations ? `Caixas: ${item.locations}` : "",
            item.confidence ? `Confiança ${item.confidence}` : ""
        ].filter(Boolean);
        const copyText = `${item.query} -> ${parts.join(" | ")}`;

        return `
            <article class="collection-history-item">
                <button type="button" class="collection-history-main" data-collection-history-run="${escapeHTML(item.id)}">
                    <span>${escapeHTML(item.query)}</span>
                    <small>${escapeHTML(parts.join(" | "))}</small>
                </button>
                <span class="collection-history-time">${escapeHTML(item.timestamp || "")}</span>
                <button type="button" class="collection-history-copy" data-collection-history-copy="${escapeHTML(item.id)}" data-copy-text="${escapeHTML(copyText)}" title="Copiar busca">
                    <i class="fas fa-copy" aria-hidden="true"></i>
                </button>
            </article>
        `;
    }).join("");
}

function renderCollectionSearchHistory() {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    const history = panel?.querySelector("[data-collection-history]");
    const list = panel?.querySelector("[data-collection-history-list]");
    if (!history || !list) return;

    history.hidden = collectionSearchHistory.length === 0;
    list.innerHTML = buildCollectionHistoryHTML();
}

function rerunCollectionHistoryItem(id) {
    const item = collectionSearchHistory.find(entry => entry.id === id);
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    const input = panel?.querySelector("[data-collection-search]");
    if (!item || !panel || !input) return;

    input.value = item.query;
    filterCollectionMap();
}

async function copyCollectionHistoryItem(id) {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    const button = [...(panel?.querySelectorAll("[data-collection-history-copy]") || [])]
        .find(element => element.dataset.collectionHistoryCopy === id);
    const text = button?.dataset.copyText || "";
    if (!text) return;

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
    }
}

function clearCollectionSearchHistory() {
    collectionSearchHistory = [];
    renderCollectionSearchHistory();
}

async function loadCollectionDwcaFile(file, config = {}) {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel || !file) return;

    if (!window.JSZip) {
        setCollectionTaxonomyStatus(config.dwcaZipError || "Não foi possível ler ZIP neste ambiente. Verifique a conexão para carregar a biblioteca JSZip.");
        return;
    }

    setCollectionTaxonomyStatus(config.dwcaLoading || "Lendo base DwC-A do EVB...");

    try {
        const zip = await window.JSZip.loadAsync(file);
        const occurrenceEntry = Object.values(zip.files).find(entry => /(^|\/)occurrence\.txt$/i.test(entry.name));
        if (!occurrenceEntry) throw new Error("occurrence-not-found");

        const text = await occurrenceEntry.async("string");
        const records = parseCollectionOccurrenceTable(text);
        collectionTaxonIndex = buildCollectionTaxonIndex(records);

        setCollectionTaxonomyStatus(
            `${records.length} registro(s) carregado(s) da base EVB. A busca estimada agora usa família e gênero para reduzir as caixas prováveis.`
        );
        filterCollectionMap();
    } catch (error) {
        collectionTaxonIndex = null;
        setCollectionTaxonomyStatus(config.dwcaError || "Não foi possível ler a base DwC-A. Confira se o arquivo carregado é o ZIP baixado do IPT/JABOT HEVB.");
    }
}

function parseCollectionOccurrenceTable(text) {
    const lines = String(text || "").split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return [];

    const delimiter = lines[0].includes("\t") ? "\t" : ",";
    const headers = splitDelimitedLine(lines[0], delimiter).map(header => normalizeDwcaHeader(header));
    const records = [];

    for (const line of lines.slice(1)) {
        const values = splitDelimitedLine(line, delimiter);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        const record = {
            catalogNumber: row.catalognumber || row.occurrenceid || row.id || "",
            scientificName: row.scientificname || row.acceptednameusage || "",
            genus: row.genus || getCollectionQueryGenus(row.scientificname || ""),
            family: row.family || "",
            recordedBy: row.recordedby || "",
            recordNumber: row.recordnumber || "",
            identifiedBy: row.identifiedby || ""
        };

        if (record.catalogNumber || record.scientificName || record.genus || record.family) {
            records.push(record);
        }
    }

    return records;
}

function splitDelimitedLine(line, delimiter) {
    if (delimiter === "\t") return line.split("\t").map(value => value.trim());

    const result = [];
    let current = "";
    let quoted = false;

    for (const char of line) {
        if (char === '"') {
            quoted = !quoted;
            continue;
        }
        if (char === delimiter && !quoted) {
            result.push(current.trim());
            current = "";
            continue;
        }
        current += char;
    }

    result.push(current.trim());
    return result;
}

function normalizeDwcaHeader(header) {
    return String(header || "")
        .split(/[\/#]/)
        .pop()
        .replace(/[^a-zA-Z]/g, "")
        .toLowerCase();
}

function buildCollectionTaxonIndex(records) {
    const index = {
        byCatalog: new Map(),
        byName: new Map(),
        byGenus: new Map(),
        recordCount: records.length,
        loadedAt: new Date()
    };

    records.forEach(record => {
        const normalized = {
            catalogNumber: record.catalogNumber,
            scientificName: record.scientificName,
            genus: record.genus,
            family: record.family,
            recordedBy: record.recordedBy,
            recordNumber: record.recordNumber,
            identifiedBy: record.identifiedBy
        };
        const catalogKeys = buildCollectionCatalogKeys(record.catalogNumber || "");
        catalogKeys.forEach(key => index.byCatalog.set(normalizeText(key), normalized));

        if (record.scientificName) index.byName.set(normalizeText(record.scientificName), normalized);
        const canonicalName = getCollectionCanonicalName(record.scientificName);
        if (canonicalName) index.byName.set(normalizeText(canonicalName), normalized);
        if (record.genus && !index.byGenus.has(normalizeText(record.genus))) {
            index.byGenus.set(normalizeText(record.genus), normalized);
        }
    });

    return index;
}

function getCollectionCanonicalName(scientificName) {
    const words = String(scientificName || "")
        .replace(/[^\p{L}\s-]/gu, " ")
        .split(/\s+/)
        .filter(Boolean);
    return words.slice(0, 2).join(" ");
}

function getCollectionTaxonomyStatus(config = {}) {
    if (collectionTaxonIndex) {
        const count = collectionTaxonIndex.recordCount || 0;
        return `Base EVB carregada: ${count} registro(s). Exemplares recentes podem não estar presentes até a próxima atualização pública.`;
    }
    return config.dwcaEmptyStatus || "Base taxonômica opcional não carregada. Carregue a base DwC-A para estimar caixas por família e intervalo alfabético.";
}

function formatCollectionTaxonSummary(record) {
    const collector = [getPrimaryCollector(record.recordedBy), record.recordNumber].filter(Boolean).join(" ");
    return [
        record.catalogNumber ? `tombo ${record.catalogNumber}` : "",
        record.family || "",
        record.scientificName || record.genus || "",
        collector ? `coleta ${collector}` : ""
    ].filter(Boolean).join(" - ");
}

function formatCollectionTaxonSummaryHTML(record, note = "A localização física abaixo é estimada pelo mapa de caixas.", mode = "taxon", estimateSummary = null) {
    const collector = [getPrimaryCollector(record.recordedBy), record.recordNumber].filter(Boolean).join(" ");
    const isCatalogSearch = mode === "catalog";
    const rows = isCatalogSearch
        ? [
            ["Tombo", record.catalogNumber, false],
            ["Família", record.family, false],
            ["Espécie", formatScientificNameHTML(record.scientificName || record.genus), true],
            ["Coletor", collector, false]
        ]
        : [
            ["Família", record.family, false],
            ["Nome científico", formatScientificNameHTML(record.scientificName || record.genus), true],
            ["Gênero usado", record.genus || getCollectionQueryGenus(record.scientificName || ""), false]
        ];

    const confidence = estimateSummary?.confidence || getCollectionEstimateConfidence(estimateSummary?.bestType || "", estimateSummary?.count || 0);
    const extraRows = estimateSummary
        ? [["Caixas prováveis", String(estimateSummary.count)], ["Critério", getCollectionEstimateLabel(estimateSummary.bestType)]]
        : [];

    return formatCollectionSearchResultHTML({
        title: isCatalogSearch ? "Exemplar encontrado na base do herbário" : "Táxon encontrado na base do herbário",
        rows: [...rows, ...extraRows].filter(([, value]) => value),
        note,
        confidence
    });
}

function formatCollectionSearchResultHTML({ title, rows = [], note = "", confidence = null }) {
    const confidenceData = confidence || getCollectionEstimateConfidence("", 0);
    return `
        <div class="collection-result-card">
            <div class="collection-result-header">
                <strong>${escapeHTML(title || "Resultado da busca")}</strong>
                <span class="collection-confidence ${escapeHTML(confidenceData.className || "is-review")}">
                    Confiança ${escapeHTML(confidenceData.level || "Conferir")}
                </span>
            </div>
            <dl class="collection-record-summary">
                ${rows.map(([label, value, isHTML]) => `
                    <div>
                        <dt>${escapeHTML(label)}:</dt>
                        <dd>${isHTML ? value : escapeHTML(value)}</dd>
                    </div>
                `).join("")}
            </dl>
            ${confidenceData.explanation ? `<p class="collection-confidence-note">${escapeHTML(confidenceData.explanation)}</p>` : ""}
            ${note ? `<p class="collection-result-note">${escapeHTML(note)}</p>` : ""}
        </div>
    `;
}

function getVisibleCollectionEstimateSummary(panel) {
    const matches = [...panel.querySelectorAll("[data-collection-card].is-estimated-match:not([hidden])")].map(card => ({
        card,
        estimate: {
            type: card.dataset.estimateType || "",
            reason: card.dataset.estimateReason || "",
            taxonFamily: card.dataset.estimateFamily || ""
        }
    }));
    const estimatedSummary = summarizeCollectionEstimates(matches);
    if (estimatedSummary) return estimatedSummary;

    const directCards = [...panel.querySelectorAll("[data-collection-card]:not([hidden])")];
    if (!directCards.length) return null;
    return {
        count: directCards.length,
        bestType: "direct",
        confidence: getCollectionEstimateConfidence("direct", directCards.length),
        firstReason: "",
        taxonFamily: ""
    };
}

function getVisibleCollectionLocations(panel) {
    const labels = [...panel.querySelectorAll("[data-collection-card]:not([hidden])")]
        .map(card => {
            const record = findCollectionRecord(card.dataset.location);
            return record?.box || record?.location || "";
        })
        .filter(Boolean);
    const uniqueLabels = [...new Set(labels)];
    if (uniqueLabels.length <= 4) return uniqueLabels.join(", ");
    return `${uniqueLabels.slice(0, 4).join(", ")} +${uniqueLabels.length - 4}`;
}

function formatScientificNameHTML(scientificName) {
    const cleanName = String(scientificName || "").replace(/\s+/g, " ").trim();
    if (!cleanName) return "";

    const words = cleanName.split(" ");
    const genus = words[0] || "";
    const epithet = words[1] || "";
    const authorship = words.slice(2).join(" ");
    const formattedGenus = genus ? `${genus.charAt(0).toUpperCase()}${genus.slice(1)}` : "";
    const italicPart = [formattedGenus, epithet].filter(Boolean).join(" ");

    return `${italicPart ? `<em>${escapeHTML(italicPart)}</em>` : ""}${authorship ? ` ${escapeHTML(authorship)}` : ""}`;
}

function getPrimaryCollector(value) {
    return String(value || "")
        .split(/[;|]/)
        .map(item => item.trim())
        .filter(Boolean)[0] || "";
}

function getCollectionSearchMode(value) {
    const text = String(value || "").trim();
    const hasLetters = /[A-Za-zÀ-ÿ]/.test(text.replace(/\bEVB\b/gi, ""));
    const numeric = text.match(/\d+/)?.[0] || "";
    return numeric && !hasLetters ? "catalog" : "taxon";
}

function buildCollectionCatalogKeys(value) {
    const cleanValue = String(value || "").trim();
    const numeric = cleanValue.match(/\d+/)?.[0] || "";
    const numericPlain = numeric ? numeric.replace(/^0+/, "") || "0" : "";
    const padded6 = numericPlain ? numericPlain.padStart(6, "0") : "";
    const padded9 = numericPlain ? numericPlain.padStart(9, "0") : "";

    return [...new Set([
        cleanValue,
        numeric,
        numericPlain,
        numeric ? `EVB${numeric}` : "",
        numericPlain ? `EVB${numericPlain}` : "",
        padded6 ? `EVB${padded6}` : "",
        padded9 ? `EVB${padded9}` : "",
        numeric ? `EVB ${numeric}` : "",
        numericPlain ? `EVB ${numericPlain}` : "",
        padded6 ? `EVB ${padded6}` : "",
        padded9 ? `EVB ${padded9}` : "",
        numeric ? `EVB-${numeric}` : "",
        numericPlain ? `EVB-${numericPlain}` : "",
        padded6 ? `EVB-${padded6}` : "",
        padded9 ? `EVB-${padded9}` : ""
    ].filter(Boolean))];
}

function setCollectionTaxonomyStatus(message) {
    const status = elements.infoPageContainer.querySelector("[data-collection-taxonomy-status]");
    if (status) status.textContent = message;
}

async function fetchCollectionOccurrenceFromGbif(query) {
    const terms = buildCollectionGbifQueries(query);

    for (const term of terms) {
        const params = new URLSearchParams({
            datasetKey: EVB_GBIF_DATASET_KEY,
            catalogNumber: term,
            limit: "1"
        });
        const response = await fetch(`https://api.gbif.org/v1/occurrence/search?${params.toString()}`);
        if (!response.ok) continue;
        const data = await response.json();
        const result = data.results?.[0];
        if (result) return normalizeCollectionGbifRecord(result);
    }

    const fallbackParams = new URLSearchParams({
        datasetKey: EVB_GBIF_DATASET_KEY,
        q: query,
        limit: "1"
    });
    const fallbackResponse = await fetch(`https://api.gbif.org/v1/occurrence/search?${fallbackParams.toString()}`);
    if (!fallbackResponse.ok) return null;
    const fallbackData = await fallbackResponse.json();
    return fallbackData.results?.[0] ? normalizeCollectionGbifRecord(fallbackData.results[0]) : null;
}

function buildCollectionGbifQueries(query) {
    const cleanQuery = String(query || "").trim();
    const numeric = cleanQuery.match(/\d+/)?.[0] || "";
    return numeric ? buildCollectionCatalogKeys(cleanQuery) : [cleanQuery].filter(Boolean);
}

function normalizeCollectionGbifRecord(record) {
    return {
        catalogNumber: record.catalogNumber || record.occurrenceID || "",
        scientificName: record.scientificName || record.acceptedScientificName || "",
        genus: record.genus || "",
        family: record.family || "",
        recordedBy: record.recordedBy || "",
        recordNumber: record.recordNumber || "",
        identifiedBy: record.identifiedBy || "",
        key: record.key || ""
    };
}

async function refreshCollectionMapFromGoogle(config, options = {}) {
    if (!config?.googleSheetId || !Array.isArray(config.sheets) || config.sheets.length === 0) return;

    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel) return;

    if (!options.silent) setCollectionSyncStatus(config.loadingStatus || "Carregando dados do Google Sheets...");

    try {
        const data = await loadCollectionMapFromGoogleSheets(config.googleSheetId, config.sheets);
        if (!isValidCollectionMap(data)) throw new Error("invalid-collection-map");
        collectionMapData = data;
        rerenderCollectionMap(config, config.liveStatus || "Dados atualizados a partir do Google Sheets.");
    } catch (error) {
        collectionMapData = fallbackCollectionMapData || collectionMapData;
        rerenderCollectionMap(config, config.errorStatus || config.fallbackStatus || "Usando copia local do mapa.");
        setCollectionSyncStatus(config.errorStatus || config.fallbackStatus || "Usando copia local do mapa.");
    }
}

async function loadCollectionMapFromGoogleSheets(spreadsheetId, sheetNames) {
    const sheetTables = [];
    const errors = [];

    for (const sheetName of sheetNames) {
        try {
            const table = await loadGoogleSheetTable(spreadsheetId, sheetName);
            sheetTables.push({ sheetName, rows: convertGoogleTableToRows(table) });
        } catch (error) {
            errors.push({ sheetName, error });
            console.warn(`Falha ao carregar aba ${sheetName} do Google Sheets`, error);
        }
    }

    if (sheetTables.length === 0) {
        throw new Error(errors.map(item => `${item.sheetName}: ${item.error?.message || "erro"}`).join("; ") || "google-sheets-empty");
    }

    return buildCollectionMapFromSheetTables(sheetTables);
}

function loadGoogleSheetTable(spreadsheetId, sheetName) {
    return new Promise((resolve, reject) => {
        const callbackName = `evbCollectionSheet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const script = document.createElement("script");
        const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error(`sheet-${sheetName}-timeout`));
        }, 12000);
        const cleanup = () => {
            window.clearTimeout(timeout);
            delete window[callbackName];
            script.remove();
        };

        window[callbackName] = payload => {
            cleanup();
            if (payload?.status === "error") {
                reject(new Error(payload.errors?.[0]?.detailed_message || `sheet-${sheetName}-error`));
                return;
            }
            resolve(payload.table);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error(`sheet-${sheetName}-load-error`));
        };

        script.src = buildGoogleSheetJsonpUrl(spreadsheetId, sheetName, callbackName);
        document.head.appendChild(script);
    });
}

function buildGoogleSheetJsonpUrl(spreadsheetId, sheetName, callbackName) {
    const base = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(spreadsheetId)}/gviz/tq`;
    const params = new URLSearchParams({
        tqx: `out:json;responseHandler:${callbackName}`,
        sheet: sheetName,
        cacheBust: Date.now().toString()
    });
    return `${base}?${params.toString()}`;
}

function convertGoogleTableToRows(table) {
    const columns = table?.cols || [];
    const rows = table?.rows || [];
    return rows.map(row => columns.map((column, index) => {
        const cell = row.c?.[index];
        return cell?.f ?? cell?.v ?? "";
    }));
}

function buildCollectionMapFromSheetTables(sheetTables) {
    const cabinets = [];
    const boxes = [];
    let totalSpaces = 0;
    let occupiedSpaces = 0;
    let freeSpaces = 0;

    sheetTables.forEach(({ sheetName, rows }) => {
        const shelves = [];
        const spaceCount = getCollectionSpaceCount(sheetName);
        const contentStartRowIndex = detectCollectionContentStartRow(rows, spaceCount);

        for (let shelfNumber = 1; shelfNumber <= 6; shelfNumber += 1) {
            const contentRowIndex = contentStartRowIndex + ((shelfNumber - 1) * 2);
            const locationRowIndex = contentRowIndex + 1;
            const shelfId = cleanCollectionCell(rows[locationRowIndex]?.[0]) || `P${shelfNumber}`;
            const spaces = [];

            for (let spaceIndex = 1; spaceIndex <= spaceCount; spaceIndex += 1) {
                const startColumnIndex = 1 + ((spaceIndex - 1) * 5);
                const spaceId = `E${spaceIndex}`;
                const location = `${sheetName}-${shelfId}-${spaceId}`;
                const box = cleanCollectionCell(rows[contentRowIndex]?.[startColumnIndex]);
                const families = splitCollectionLines(rows[contentRowIndex]?.[startColumnIndex + 1], { keepBlank: true });
                const content = splitCollectionLines(rows[contentRowIndex]?.[startColumnIndex + 2]);
                const notes = cleanCollectionCell(rows[contentRowIndex]?.[startColumnIndex + 3]);
                const freeMarker = [0, 1, 2, 3].some(offset => cleanCollectionCell(rows[contentRowIndex]?.[startColumnIndex + offset]).toLowerCase() === "livre");
                const hasLocation = cleanCollectionCell(rows[locationRowIndex]?.[startColumnIndex + 1]) || cleanCollectionCell(rows[locationRowIndex]?.[startColumnIndex + 2]);

                if (!box && families.length === 0 && content.length === 0 && !notes && !freeMarker && !hasLocation) continue;

                const status = box ? "occupied" : "free";
                const record = {
                    id: location,
                    cabinet: sheetName,
                    shelf: shelfId,
                    space: spaceId,
                    location,
                    box,
                    families,
                    content,
                    notes,
                    status,
                    source: {
                        sheet: sheetName,
                        contentRow: contentRowIndex + 1,
                        locationRow: locationRowIndex + 1,
                        startColumn: startColumnIndex + 1
                    }
                };

                spaces.push(record);
                totalSpaces += 1;
                if (status === "occupied") {
                    occupiedSpaces += 1;
                    boxes.push(record);
                } else {
                    freeSpaces += 1;
                }
            }

            shelves.push({ id: shelfId, spaces });
        }

        cabinets.push({ id: sheetName, shelves });
    });

    return {
        sourceFile: "Google Sheets",
        generatedAt: new Date().toISOString(),
        sourceMode: "live",
        stats: {
            cabinets: cabinets.length,
            spaces: totalSpaces,
            occupied: occupiedSpaces,
            free: freeSpaces,
            boxes: boxes.length
        },
        cabinets,
        boxes
    };
}

function getCollectionSpaceCount(cabinetId) {
    const cabinetNumber = Number(String(cabinetId).replace(/\D/g, ""));
    return cabinetNumber >= 6 ? 2 : 4;
}

function detectCollectionContentStartRow(rows, spaceCount) {
    const candidateRows = [0, 1, 2];
    for (const rowIndex of candidateRows) {
        const row = rows[rowIndex] || [];
        const hasBox = Array.from({ length: spaceCount }, (_, index) => 1 + (index * 5))
            .some(columnIndex => /^CX-\d+/i.test(cleanCollectionCell(row[columnIndex])));
        if (hasBox) return rowIndex;
    }

    return 1;
}

function isValidCollectionMap(data) {
    if (!data?.cabinets?.length) return false;
    const boxes = data.boxes || [];
    const validBoxCount = boxes.filter(item => /^CX-\d+/i.test(item.box || "")).length;
    return validBoxCount >= 20;
}

function cleanCollectionCell(value) {
    return String(value ?? "").trim();
}

function splitCollectionLines(value, options = {}) {
    const lines = cleanCollectionCell(value)
        .split(/\r?\n/)
        .map(item => item.trim());
    return options.keepBlank ? lines : lines.filter(Boolean);
}

function rerenderCollectionMap(config, statusMessage) {
    const panel = elements.infoPageContainer.querySelector("[data-collection-map]");
    if (!panel) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildCollectionMapHTML(config).trim();
    panel.replaceWith(wrapper.firstElementChild);
    setCollectionSyncStatus(statusMessage);
}

function getActiveCollectionConfig() {
    const activeTab = document.querySelector(".tab-button.is-active");
    const page = infoPages.find(item => item.id === activeTab?.dataset.target);
    return page?.collectionMap || {};
}

function getCollectionSourceStatus(config) {
    if (collectionMapData?.sourceMode === "live") return config.liveStatus || "Dados atualizados a partir do Google Sheets.";
    return config.fallbackStatus || "Usando copia local do mapa.";
}

function setCollectionSyncStatus(message) {
    const status = elements.infoPageContainer.querySelector("[data-collection-sync-status]");
    if (status) status.textContent = message;
}

function handleTombSorterAction(action) {
    if (action === "sort") {
        updateTombSorter();
        return;
    }

    if (action === "clear") {
        const panel = elements.infoPageContainer.querySelector("[data-tomb-sorter]");
        if (!panel) return;
        panel.querySelector("[data-tomb-input]").value = "";
        panel.querySelector("[data-tomb-output]").value = "";
        setTombSorterStatus(getTombSorterConfig().emptyStatus || "Cole os números para iniciar.");
        return;
    }

    if (action === "copy") {
        copyTombSorterOutput();
    }
}

function updateTombSorter() {
    const panel = elements.infoPageContainer.querySelector("[data-tomb-sorter]");
    if (!panel) return;

    const input = panel.querySelector("[data-tomb-input]");
    const output = panel.querySelector("[data-tomb-output]");
    const config = getTombSorterConfig();
    const result = parseTombNumbers(input.value);

    output.value = result.values.join(", ");

    if (result.values.length === 0) {
        setTombSorterStatus(config.emptyStatus || "Cole os números para iniciar.");
        return;
    }

    const message = (config.readyStatus || "{count} número(s) organizado(s). {duplicates} repetido(s) removido(s).")
        .replace("{count}", result.values.length)
        .replace("{duplicates}", result.duplicateCount);
    setTombSorterStatus(message);
}

function parseTombNumbers(value) {
    const numbers = (String(value || "").match(/\d+/g) || [])
        .map(item => Number(item))
        .filter(Number.isFinite);
    const values = [...new Set(numbers)].sort((first, second) => first - second);

    return {
        values,
        duplicateCount: Math.max(0, numbers.length - values.length)
    };
}

function getTombSorterConfig() {
    const activeTab = document.querySelector(".tab-button.is-active");
    const page = infoPages.find(item => item.id === activeTab?.dataset.target);
    return page?.tombSorter || {};
}

function setTombSorterStatus(message) {
    const status = elements.infoPageContainer.querySelector("[data-tomb-status]");
    if (status) status.textContent = message;
}

async function copyTombSorterOutput() {
    const output = elements.infoPageContainer.querySelector("[data-tomb-output]");
    if (!output || !output.value.trim()) return;

    const config = getTombSorterConfig();

    try {
        await navigator.clipboard.writeText(output.value);
        setTombSorterStatus(config.copiedStatus || "Resultado copiado para a ?rea de transferencia.");
    } catch (error) {
        output.focus();
        output.select();
        try {
            document.execCommand("copy");
            setTombSorterStatus(config.copiedStatus || "Resultado copiado para a ?rea de transferencia.");
        } catch (fallbackError) {
            setTombSorterStatus(config.copyErrorStatus || "Não foi possível copiar automaticamente. Selecione o resultado e copie manualmente.");
        }
    }
}

function handleCoordinateConverterAction(action) {
    if (action === "decimal-to-dms") {
        convertPortalDecimalToDms();
        return;
    }

    if (action === "dms-to-decimal") {
        convertPortalDmsToDecimal();
        return;
    }

    if (action === "copy-single") {
        copyPortalSingleCoordinate();
        return;
    }

    if (action === "convert-batch") {
        convertPortalCoordinateBatch();
        return;
    }

    if (action === "copy-batch") {
        copyPortalCoordinateBatch();
        return;
    }

    if (action === "copy-history") {
        copyPortalCoordinateHistory();
        return;
    }

    if (action === "clear-history") {
        coordinateConversionHistory = [];
        renderPortalCoordinateHistory();
        setCoordinateStatus("Histórico limpo.");
    }
}

function convertPortalDecimalToDms() {
    const panel = getCoordinateConverterPanel();
    if (!panel) return;

    const lat = parsePortalDecimal(panel.querySelector("[data-coordinate-lat-decimal]")?.value);
    const lng = parsePortalDecimal(panel.querySelector("[data-coordinate-lng-decimal]")?.value);
    if (!isValidPortalLatLng(lat, lng)) {
        setCoordinateStatus("Informe coordenadas decimais válidas.");
        return;
    }

    const latDms = portalDecimalToDms(lat, "lat");
    const lngDms = portalDecimalToDms(lng, "lng");
    panel.querySelector("[data-coordinate-lat-dms]").value = latDms;
    panel.querySelector("[data-coordinate-lng-dms]").value = lngDms;
    addPortalCoordinateHistory({
        type: "Decimal para GMS",
        input: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latDecimal: lat.toFixed(6),
        lngDecimal: lng.toFixed(6),
        latDms,
        lngDms
    });
    setCoordinateStatus("Coordenada decimal convertida para GMS.");
}

function convertPortalDmsToDecimal() {
    const panel = getCoordinateConverterPanel();
    if (!panel) return;

    const latInput = panel.querySelector("[data-coordinate-lat-dms]")?.value || "";
    const lngInput = panel.querySelector("[data-coordinate-lng-dms]")?.value || "";
    const lat = parsePortalDms(latInput, "lat");
    const lng = parsePortalDms(lngInput, "lng");
    if (!isValidPortalLatLng(lat, lng)) {
        setCoordinateStatus("Informe coordenadas em GMS válidas.");
        return;
    }

    panel.querySelector("[data-coordinate-lat-decimal]").value = lat.toFixed(6);
    panel.querySelector("[data-coordinate-lng-decimal]").value = lng.toFixed(6);
    addPortalCoordinateHistory({
        type: "GMS para decimal",
        input: `${latInput} | ${lngInput}`,
        latDecimal: lat.toFixed(6),
        lngDecimal: lng.toFixed(6),
        latDms: portalDecimalToDms(lat, "lat"),
        lngDms: portalDecimalToDms(lng, "lng")
    });
    setCoordinateStatus("Coordenada GMS convertida para decimal.");
}

function addPortalCoordinateHistory(item) {
    coordinateConversionHistory.unshift({
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ...item
    });
    coordinateConversionHistory = coordinateConversionHistory.slice(0, 30);
    renderPortalCoordinateHistory();
}

function renderPortalCoordinateHistory() {
    const panel = getCoordinateConverterPanel();
    const history = panel?.querySelector("[data-coordinate-history]");
    const table = panel?.querySelector("[data-coordinate-history-table]");
    if (!history || !table) return;

    if (!coordinateConversionHistory.length) {
        history.hidden = true;
        table.innerHTML = "";
        return;
    }

    history.hidden = false;
    table.innerHTML = buildPortalCoordinateTableHTML(buildPortalCoordinateHistoryRows());
}

function buildPortalCoordinateHistoryRows() {
    return [
        ["latitude", "longitude", "lat_grau", "lat_min", "lat_seg", "ns", "long_grau", "long_min", "long_seg", "ew"],
        ...coordinateConversionHistory.map(item => {
            const lat = Number(item.latDecimal);
            const lng = Number(item.lngDecimal);
            const latParts = portalDecimalToDmsParts(lat, "lat");
            const lngParts = portalDecimalToDmsParts(lng, "lng");
            return [
                Number.isFinite(lat) ? lat.toFixed(6) : "",
                Number.isFinite(lng) ? lng.toFixed(6) : "",
                latParts.degrees,
                latParts.minutes,
                latParts.seconds,
                latParts.direction,
                lngParts.degrees,
                lngParts.minutes,
                lngParts.seconds,
                lngParts.direction
            ];
        })
    ];
}

function copyPortalSingleCoordinate() {
    const panel = getCoordinateConverterPanel();
    if (!panel) return;
    const values = [
        panel.querySelector("[data-coordinate-lat-decimal]")?.value || "",
        panel.querySelector("[data-coordinate-lng-decimal]")?.value || "",
        panel.querySelector("[data-coordinate-lat-dms]")?.value || "",
        panel.querySelector("[data-coordinate-lng-dms]")?.value || ""
    ];
    copyPortalText(values.join("\t"), "Coordenada copiada.");
}

function convertPortalCoordinateBatch() {
    const panel = getCoordinateConverterPanel();
    if (!panel) return;
    const input = panel.querySelector("[data-coordinate-batch-input]")?.value || "";
    const lines = input.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) {
        setCoordinateStatus("Cole uma ou mais coordenadas para converter em lote.");
        return;
    }

    const rows = [["Entrada", "latitude", "longitude", "lat_grau", "lat_min", "lat_seg", "ns", "long_grau", "long_min", "long_seg", "ew", "Latitude GMS", "Longitude GMS"]];
    lines.forEach(line => {
        const parsed = parsePortalCoordinatePair(line);
        if (parsed) {
            const latParts = portalDecimalToDmsParts(parsed.lat, "lat");
            const lngParts = portalDecimalToDmsParts(parsed.lng, "lng");
            rows.push([
                line,
                parsed.lat.toFixed(6),
                parsed.lng.toFixed(6),
                latParts.degrees,
                latParts.minutes,
                latParts.seconds,
                latParts.direction,
                lngParts.degrees,
                lngParts.minutes,
                lngParts.seconds,
                lngParts.direction,
                portalDecimalToDms(parsed.lat, "lat"),
                portalDecimalToDms(parsed.lng, "lng")
            ]);
        } else {
            rows.push([line, "Erro", "Erro", "", "", "", "", "", "", "", "", "Não reconhecida", "Não reconhecida"]);
        }
    });

    const results = panel.querySelector("[data-coordinate-batch-results]");
    results.innerHTML = buildPortalCoordinateTableHTML(rows);
    results.hidden = false;
    setCoordinateStatus(`${Math.max(0, rows.length - 1)} linha(s) processada(s).`);
}

function copyPortalCoordinateBatch() {
    const panel = getCoordinateConverterPanel();
    const table = panel?.querySelector("[data-coordinate-batch-results] table");
    if (!table) {
        setCoordinateStatus("Converta um lote antes de copiar.");
        return;
    }
    copyPortalText(tableToTsv(table), "Tabela em lote copiada.");
}

function copyPortalCoordinateHistory() {
    if (!coordinateConversionHistory.length) {
        setCoordinateStatus("Nenhuma conversão registrada nesta sessão.");
        return;
    }
    copyPortalText(buildPortalCoordinateHistoryRows().map(row => row.join("\t")).join("\n"), "Histórico copiado.");
}

function buildPortalCoordinateTableHTML(rows) {
    return `<table>${rows.map((row, rowIndex) => {
        const tag = rowIndex === 0 ? "th" : "td";
        return `<tr>${row.map(cell => `<${tag}>${escapeHTML(cell)}</${tag}>`).join("")}</tr>`;
    }).join("")}</table>`;
}

function tableToTsv(table) {
    return [...table.rows].map(row => [...row.cells].map(cell => cell.textContent).join("\t")).join("\n");
}

function parsePortalCoordinatePair(text) {
    const normalized = String(text || "").replace(/\s*;\s*/g, ", ");
    const decimal = normalized.match(/(-?\d+(?:[.,]\d+)?)\s*,\s*(-?\d+(?:[.,]\d+)?)/);
    if (decimal) {
        const lat = parsePortalDecimal(decimal[1]);
        const lng = parsePortalDecimal(decimal[2]);
        return isValidPortalLatLng(lat, lng) ? { lat, lng } : null;
    }

    const parts = normalized.split(/\s*,\s*/);
    if (parts.length >= 2) {
        const lat = parsePortalDms(parts[0], "lat");
        const lng = parsePortalDms(parts[1], "lng");
        return isValidPortalLatLng(lat, lng) ? { lat, lng } : null;
    }
    return null;
}

function portalDecimalToDms(value, type) {
    const parts = portalDecimalToDmsParts(value, type);
    if (!parts.direction) return "";
    return `${parts.degrees}° ${parts.minutes}' ${parts.seconds}" ${parts.direction}`;
}

function portalDecimalToDmsParts(value, type) {
    const number = Number(value);
    if (!Number.isFinite(number)) return { degrees: "", minutes: "", seconds: "", direction: "" };
    const direction = type === "lat" ? (number < 0 ? "S" : "N") : (number < 0 ? "W" : "E");
    const absolute = Math.abs(number);
    const degrees = Math.floor(absolute);
    const minutesFloat = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);
    return { degrees, minutes, seconds, direction };
}

function parsePortalDms(value, type) {
    const text = String(value || "").trim().replace(",", ".");
    if (!text) return null;
    const direction = (text.match(/[NSEWO]/i) || [""])[0].toUpperCase();
    const numbers = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
    if (!numbers.length) return null;
    const decimal = portalDmsPartsToDecimal(numbers[0], numbers[1] || 0, numbers[2] || 0, direction);
    if (type === "lat" && Math.abs(decimal) > 90) return null;
    if (type === "lng" && Math.abs(decimal) > 180) return null;
    return decimal;
}

function portalDmsPartsToDecimal(degrees, minutes, seconds, direction) {
    const deg = Number(String(degrees).replace(",", "."));
    const min = Number(String(minutes).replace(",", ".")) || 0;
    const sec = Number(String(seconds).replace(",", ".")) || 0;
    if (!Number.isFinite(deg)) return null;
    let decimal = Math.abs(deg) + (Math.abs(min) / 60) + (Math.abs(sec) / 3600);
    const dir = String(direction || "").trim().toUpperCase();
    if (deg < 0 || dir === "S" || dir === "W" || dir === "O") decimal *= -1;
    return decimal;
}

function parsePortalDecimal(value) {
    const text = String(value || "").trim().replace(",", ".");
    if (!text) return null;
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
}

function isValidPortalLatLng(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function getCoordinateConverterPanel() {
    return elements.infoPageContainer.querySelector("[data-coordinate-converter]");
}

function setCoordinateStatus(message) {
    const status = getCoordinateConverterPanel()?.querySelector("[data-coordinate-status]");
    if (status) status.textContent = message;
}

async function copyPortalText(text, successMessage = "Conteúdo copiado.") {
    if (!String(text || "").trim()) return;
    try {
        await navigator.clipboard.writeText(text);
        setCoordinateStatus(successMessage);
    } catch (error) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
        setCoordinateStatus(successMessage);
    }
}

function filterRepository(panel) {
    const search = normalizeText(panel.querySelector("[data-repository-search]")?.value || "");
    const year = panel.querySelector("[data-repository-year]")?.value || "";
    const type = panel.querySelector("[data-repository-type]")?.value || "";
    let visibleCount = 0;

    panel.querySelectorAll("[data-repository-item]").forEach(item => {
        const matchesSearch = !search || normalizeText(item.dataset.search || "").includes(search);
        const matchesYear = !year || item.dataset.year === year;
        const matchesType = !type || item.dataset.type === type;
        const isVisible = matchesSearch && matchesYear && matchesType;

        item.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
    });

    const empty = panel.querySelector("[data-repository-empty]");
    if (empty) {
        empty.hidden = visibleCount > 0;
    }
}

function normalizeText(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function startCarouselAutoplay() {
    const carousel = elements.infoPageContainer.querySelector(".photo-carousel");
    if (!carousel || carousel.querySelectorAll(".carousel-slide").length < 2) return;

    carouselAutoplayTimer = window.setInterval(() => {
        const activeCarousel = elements.infoPageContainer.querySelector(".photo-carousel");
        if (activeCarousel) {
            moveCarousel(activeCarousel, 1);
        }
    }, 5000);
}

function stopCarouselAutoplay() {
    if (!carouselAutoplayTimer) return;
    window.clearInterval(carouselAutoplayTimer);
    carouselAutoplayTimer = null;
}

function restartCarouselAutoplay() {
    stopCarouselAutoplay();
    startCarouselAutoplay();
}

function moveCarousel(carousel, direction) {
    const slides = carousel.querySelectorAll(".carousel-slide");
    if (slides.length === 0) return;

    const current = Number(carousel.dataset.activeIndex || 0);
    const next = (current + direction + slides.length) % slides.length;
    setCarouselIndex(carousel, next);
}

function setCarouselIndex(carousel, index) {
    carousel.dataset.activeIndex = String(index);
    carousel.querySelectorAll(".carousel-slide").forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
    });
    carousel.querySelectorAll(".carousel-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
    });
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCaptionHTML(value) {
    return escapeHTML(value)
        .replace(/&lt;(\/?)(em|strong)&gt;/gi, "<$1$2>");
}

function openActiveToolInNewTab() {
    if (!activeTool) return;
    window.open(withVersion(activeTool.path), "_blank", "noopener,noreferrer");
}

function withVersion(path) {
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}v=${APP_VERSION}&reload=${SESSION_VERSION}`;
}
