class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const readBody = (request) => {
  if (!request.body) return {};
  if (typeof request.body === "string") {
    return JSON.parse(request.body);
  }
  return request.body;
};

const extractOutputText = (responseBody) => {
  if (typeof responseBody.output_text === "string") {
    return responseBody.output_text.trim();
  }

  return (responseBody.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text" && typeof item.text === "string")
    .map((item) => item.text)
    .join("\n")
    .trim();
};

module.exports = async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      throw new HttpError(405, "Method not allowed");
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new HttpError(500, "OpenAI is not configured. Missing env: OPENAI_API_KEY");
    }

    const body = readBody(request);
    const text = normalizeString(body.text);
    const section = normalizeString(body.section);

    if (!text) {
      throw new HttpError(400, "Text is required");
    }

    if (text.length > 4000) {
      throw new HttpError(400, "Text is too long");
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        instructions: [
          "Ты редактор пользовательской документации WMS.",
          "Тебе дают описание кейса для разработчиков или аналитиков.",
          "Преобразуй его в понятное описание уже реализованной функции для обычного пользователя склада.",
          "Пиши в настоящем времени: система показывает, позволяет, проверяет, сохраняет, формирует.",
          "Не используй формулировки постановки задачи: должно, нужно, необходимо, требуется, реализовать, добавить, будет сделано.",
          "Не выдумывай факты, поля, роли, интеграции, номера документов или ограничения, которых нет в исходном тексте.",
          "Верни 2-4 коротких предложения без Markdown, списков, заголовков, кавычек и канцелярита.",
          "Текст должен быть готов для статьи базы знаний о существующей системе."
        ].join(" "),
        input: [
          `Раздел: ${section || "не указан"}`,
          "Исходное описание:",
          text
        ].join("\n")
      })
    });

    const responseBody = await openaiResponse.json().catch(() => ({}));

    if (!openaiResponse.ok) {
      throw new HttpError(
        openaiResponse.status,
        responseBody.error?.message || "OpenAI request failed"
      );
    }

    const polishedText = extractOutputText(responseBody);

    if (!polishedText) {
      throw new HttpError(502, "OpenAI returned an empty response");
    }

    response.status(200).json({ text: polishedText });
  } catch (error) {
    const statusCode = error instanceof HttpError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    response.status(statusCode).json({ error: message });
  }
};
