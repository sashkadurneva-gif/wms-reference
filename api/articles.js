const requiredEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

const articleColumns = [
  "id",
  "section",
  "title",
  "content",
  "keywords",
  "source_raw",
  "template_version",
  "sort_order"
].join(",");

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const getConfig = () => {
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new HttpError(
      500,
      `Supabase is not configured. Missing env: ${missing.join(", ")}`
    );
  }

  return {
    url: process.env.SUPABASE_URL.replace(/\/$/, ""),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  };
};

const sendJson = (response, statusCode, payload) => {
  response.status(statusCode).json(payload);
};

const readBody = (request) => {
  if (!request.body) return null;
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }
  return request.body;
};

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const createArticleId = () =>
  `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeArticle = (input, forcedId) => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new HttpError(400, "Article must be an object");
  }

  const rawId = normalizeString(forcedId || input.id);
  const id = rawId.startsWith("custom-") ? rawId : createArticleId();
  const section = normalizeString(input.section);
  const title = normalizeString(input.title);
  const content = normalizeString(input.content);
  const keywords = Array.isArray(input.keywords)
    ? input.keywords.map(normalizeString).filter(Boolean)
    : [];

  if (!section || !title || !content) {
    throw new HttpError(400, "Article must include section, title and content");
  }

  return {
    id,
    section,
    title,
    content,
    keywords,
    source_raw: normalizeString(input.sourceRaw || input.source_raw),
    template_version: Number.isFinite(input.templateVersion)
      ? input.templateVersion
      : Number.isFinite(input.template_version)
        ? input.template_version
        : 2
  };
};

const fromDatabaseArticle = (article) => ({
  id: article.id,
  section: article.section,
  title: article.title,
  content: article.content,
  keywords: Array.isArray(article.keywords) ? article.keywords : [],
  sourceRaw: article.source_raw || "",
  templateVersion: article.template_version || 2
});

const supabaseRequest = async (path, options = {}) => {
  const config = getConfig();
  const response = await fetch(`${config.url}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new HttpError(response.status, body || response.statusText);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const fetchArticles = async () => {
  const rows = await supabaseRequest(
    `/articles?select=${articleColumns}&order=sort_order.desc,created_at.asc`
  );
  return rows.map(fromDatabaseArticle);
};

const createArticle = async (article) => {
  const databaseArticle = {
    ...normalizeArticle(article),
    sort_order: Date.now()
  };

  const rows = await supabaseRequest("/articles", {
    method: "POST",
    headers: {
      Prefer: "return=representation"
    },
    body: JSON.stringify(databaseArticle)
  });

  return fromDatabaseArticle(rows[0]);
};

const updateArticle = async (articleId, article) => {
  const databaseArticle = normalizeArticle(article, articleId);
  const rows = await supabaseRequest(
    `/articles?id=eq.${encodeURIComponent(articleId)}`,
    {
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      },
      body: JSON.stringify(databaseArticle)
    }
  );

  if (!rows[0]) {
    throw new HttpError(404, "Article not found");
  }

  return fromDatabaseArticle(rows[0]);
};

const upsertArticles = async (articles) => {
  if (!Array.isArray(articles)) {
    throw new HttpError(400, "Articles payload must be an array");
  }

  const databaseArticles = articles.map((article, index) => ({
    ...normalizeArticle(article),
    sort_order: articles.length - index
  }));

  if (databaseArticles.length === 0) {
    return [];
  }

  await supabaseRequest("/articles?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(databaseArticles)
  });

  return fetchArticles();
};

const deleteArticle = async (articleId) => {
  await supabaseRequest(`/articles?id=eq.${encodeURIComponent(articleId)}`, {
    method: "DELETE"
  });
};

module.exports = async function handler(request, response) {
  try {
    const id = typeof request.query.id === "string" ? request.query.id : "";

    if (request.method === "GET" && !id) {
      sendJson(response, 200, await fetchArticles());
      return;
    }

    if (request.method === "POST" && !id) {
      sendJson(response, 201, await createArticle(readBody(request)));
      return;
    }

    if (request.method === "PUT" && !id) {
      sendJson(response, 200, await upsertArticles(readBody(request)));
      return;
    }

    if (request.method === "PUT" && id) {
      sendJson(response, 200, await updateArticle(id, readBody(request)));
      return;
    }

    if (request.method === "DELETE" && id) {
      await deleteArticle(id);
      response.status(204).end();
      return;
    }

    throw new HttpError(405, "Method not allowed");
  } catch (error) {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    sendJson(response, statusCode, { error: message });
  }
};
