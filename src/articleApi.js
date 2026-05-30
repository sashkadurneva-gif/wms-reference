const API_BASE_URL = (process.env.REACT_APP_API_URL || "").replace(/\/$/, "");

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let message = response.statusText || "Request failed";

    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // Keep the response status text when the server did not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const fetchCustomArticles = () => requestJson("/api/articles");

export const createCustomArticle = (article) =>
  requestJson("/api/articles", {
    method: "POST",
    body: JSON.stringify(article)
  });

export const updateCustomArticle = (articleId, article) =>
  requestJson(`/api/articles?id=${encodeURIComponent(articleId)}`, {
    method: "PUT",
    body: JSON.stringify(article)
  });

export const deleteCustomArticle = (articleId) =>
  requestJson(`/api/articles?id=${encodeURIComponent(articleId)}`, {
    method: "DELETE"
  });

export const saveCustomArticles = (articles) =>
  requestJson("/api/articles", {
    method: "PUT",
    body: JSON.stringify(articles)
  });

export const polishArticleText = ({ text, section }) =>
  requestJson("/api/polish-article", {
    method: "POST",
    body: JSON.stringify({ text, section })
  });
