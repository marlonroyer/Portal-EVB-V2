const ALLOWED_ORIGINS = new Set([
  'https://marlonroyer.github.io',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = getCorsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405, corsHeaders);
    }

    if (!env.IUCN_TOKEN) {
      return json({ error: 'IUCN_TOKEN secret is not configured' }, 500, corsHeaders);
    }

    const url = new URL(request.url);
    const species = (url.searchParams.get('species') || '').trim();
    const parts = species.split(/\s+/);
    const genusName = url.searchParams.get('genus_name') || parts[0] || '';
    const speciesName = url.searchParams.get('species_name') || parts[1] || '';

    if (!genusName || !speciesName) {
      return json({ error: 'Missing genus_name/species_name' }, 400, corsHeaders);
    }

    const apiUrl = new URL('https://api.iucnredlist.org/api/v4/taxa/scientific_name');
    apiUrl.searchParams.set('genus_name', genusName);
    apiUrl.searchParams.set('species_name', speciesName);

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${env.IUCN_TOKEN}`,
        Accept: 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 404) {
        return json({
          species: `${genusName} ${speciesName}`,
          category: '',
          source: 'IUCN Red List',
          notFound: true
        }, 200, corsHeaders);
      }

      return json({ error: 'IUCN request failed', status: response.status, data }, response.status, corsHeaders);
    }

    const assessment = extractIucnAssessment(data);
    if (!assessment?.category) {
      return json({ species: `${genusName} ${speciesName}`, category: '', source: 'IUCN Red List' }, 200, corsHeaders);
    }

    return json({
      species: `${genusName} ${speciesName}`,
      category: normalizeCategory(assessment.category),
      criteria: assessment.criteria || '',
      endemism: '',
      source: 'IUCN Red List',
      year: assessment.year || '',
      scope: assessment.scope || ''
    }, 200, corsHeaders);
  }
};

function getCorsHeaders(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : 'https://marlonroyer.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

function extractIucnAssessment(data) {
  const objects = collectObjects(data);
  const candidates = objects
    .map((object) => ({
      category: object.red_list_category_code || object.red_list_category?.code || object.red_list_category?.name || object.red_list_category || object.category || object.redlist_category || object.redListCategory,
      criteria: object.criteria || object.red_list_criteria || object.redlist_criteria || '',
      year: object.year_published || object.assessment_date || object.published_year || object.year || '',
      scope: object.scope?.description || object.scope || '',
      latest: object.latest === true || object.is_latest === true,
      global: /global/i.test(String(
        object.scope?.description ||
        object.scope ||
        object.scopes?.[0]?.description?.en ||
        object.scopes?.[0]?.description ||
        ''
      ))
    }))
    .filter((item) => item.category);

  return candidates.find((item) => item.latest && item.global) ||
    candidates.find((item) => item.latest) ||
    candidates.find((item) => item.global) ||
    candidates[0] ||
    null;
}

function collectObjects(value, output = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, output));
  } else if (value && typeof value === 'object') {
    output.push(value);
    Object.values(value).forEach((item) => collectObjects(item, output));
  }
  return output;
}

function normalizeCategory(value) {
  const category = String(value || '').trim().toUpperCase();
  const match = category.match(/\b(CR(?:\(PEX\))?|EW|EX|EN|VU|NT|LC|DD|NE)\b/);
  return match ? match[1] : category;
}
