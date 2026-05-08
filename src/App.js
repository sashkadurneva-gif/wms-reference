import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const sections = [
  {
    title: "Приемка",
    description: "Проверка поставки, контроль документов и размещение товара по ячейкам."
  },
  {
    title: "Хранение",
    description: "Управление остатками, адресное хранение и инвентаризация без остановки склада."
  },
  {
    title: "Отгрузка",
    description: "Сборка заказов, проверка и отгрузка с контролем сроков и приоритетов."
  }
];

const initialArticles = [
  {
    id: "receiving-rules",
    section: "Приемка",
    title: "Проверка поставки по накладной",
    content:
      "Сверьте артикулы и количество, зафиксируйте расхождения, затем подтвердите приемку в системе и отправьте товар в зону размещения.",
    keywords: ["поставка", "накладная", "расхождения", "приемка"]
  },
  {
    id: "storage-addressing",
    section: "Хранение",
    title: "Адресное размещение товара",
    content:
      "Используйте правила адресации: тяжелые позиции на нижних уровнях, быстрый ассортимент в ближних ячейках, контроль по срокам годности.",
    keywords: ["адрес", "ячейка", "размещение", "хранение"]
  },
  {
    id: "shipment-checklist",
    section: "Отгрузка",
    title: "Чек-лист перед отгрузкой",
    content:
      "Проверьте комплектацию заказа, качество упаковки, маркировку и подтверждение транспортной службы перед передачей груза.",
    keywords: ["чек-лист", "отгрузка", "упаковка", "маркировка"]
  }
];

const CUSTOM_ARTICLES_STORAGE_KEY = "koncrit.customArticles";
const ARTICLE_TEMPLATE_VERSION = 2;

const TEMPLATE_RESULT_TEXT =
  "Пользователь получает понятный и повторяемый сценарий работы в системе.";

const loadCustomArticles = () => {
  try {
    const raw = window.localStorage.getItem(CUSTOM_ARTICLES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.section === "string" &&
          typeof item.title === "string" &&
          typeof item.content === "string" &&
          Array.isArray(item.keywords)
      )
      .map((item) => ({
        ...item,
        sourceRaw: typeof item.sourceRaw === "string" ? item.sourceRaw : "",
        templateVersion:
          typeof item.templateVersion === "number" ? item.templateVersion : ARTICLE_TEMPLATE_VERSION
      }));
  } catch {
    return [];
  }
};

const STOP_WORDS = new Set([
  "и",
  "в",
  "на",
  "по",
  "для",
  "с",
  "что",
  "это",
  "как",
  "или",
  "из",
  "под",
  "к",
  "у",
  "о",
  "об"
]);

const toProcessSentence = (text) => {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const buildKnowledgeArticleFromInput = (rawInput, existingId) => {
  const normalizedInput = rawInput.trim().replace(/\s+/g, " ");
  const clauses = normalizedInput
    .split(/[.!?;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const firstClause = clauses[0] || normalizedInput;
  const titleBase = toProcessSentence(firstClause);
  const title = `Функция: ${titleBase.slice(0, 52)}${titleBase.length > 52 ? "..." : ""}`;

  const steps = clauses.slice(0, 3).map((clause) => toProcessSentence(clause));
  const fallbackStep = "Определите сценарий использования и ожидаемый результат.";
  while (steps.length < 3) {
    steps.push(fallbackStep);
  }

  const keywords = normalizedInput
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .slice(0, 8);

  const content = [
    "Цель:",
    `Обеспечить выполнение функции: ${titleBase}.`,
    "",
    "Когда использовать:",
    `Когда требуется сценарий: ${titleBase.toLowerCase()}.`,
    "",
    "Пошагово:",
    `1. ${steps[0]}.`,
    `2. ${steps[1]}.`,
    `3. ${steps[2]}.`,
    "",
    "Результат:",
    TEMPLATE_RESULT_TEXT
  ].join("\n");

  return {
    id: existingId ?? `custom-${Date.now()}`,
    section: "Новый функционал",
    title,
    content,
    keywords,
    sourceRaw: normalizedInput,
    templateVersion: ARTICLE_TEMPLATE_VERSION
  };
};

function App() {
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [articles, setArticles] = useState(() => [...loadCustomArticles(), ...initialArticles]);
  const [query, setQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState(() => {
    const customArticles = loadCustomArticles();
    return customArticles[0]?.id ?? initialArticles[0].id;
  });
  const [searchMessage, setSearchMessage] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");
  const [addMessage, setAddMessage] = useState("");
  const [isDiagramView, setIsDiagramView] = useState(false);

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? articles[0],
    [articles, selectedArticleId]
  );

  useEffect(() => {
    if (!isKnowledgeBaseOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsKnowledgeBaseOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isKnowledgeBaseOpen]);

  useEffect(() => {
    const hasSelectedArticle = articles.some((article) => article.id === selectedArticleId);
    if (!hasSelectedArticle && articles.length > 0) {
      setSelectedArticleId(articles[0].id);
    }
  }, [articles, selectedArticleId]);

  useEffect(() => {
    const customArticles = articles.filter((article) => article.section === "Новый функционал");
    const normalizedCustomArticles = customArticles.map((article) => {
      if (article.templateVersion === ARTICLE_TEMPLATE_VERSION && article.sourceRaw) {
        return article;
      }
      const fallbackSource = article.sourceRaw || article.title || article.content;
      return buildKnowledgeArticleFromInput(fallbackSource, article.id);
    });
    window.localStorage.setItem(
      CUSTOM_ARTICLES_STORAGE_KEY,
      JSON.stringify(normalizedCustomArticles)
    );
  }, [articles]);

  const openKnowledgeBase = () => {
    setSearchMessage("");
    setIsKnowledgeBaseOpen(true);
  };

  const splitWithHighlight = (text, phrase) => {
    const normalizedPhrase = phrase.trim();
    if (!normalizedPhrase) return [text];

    const escaped = normalizedPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.split(regex);
  };

  const renderWithHighlight = (text, phrase) =>
    splitWithHighlight(text, phrase).map((part, index) =>
      part.toLowerCase() === phrase.trim().toLowerCase() ? (
        <mark key={`${part}-${index}`} className="search-highlight">
          {part}
        </mark>
      ) : (
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
      )
    );

  const renderStructuredContent = (content, phrase) => {
    const lines = content.split("\n").map((line) => line.trim());
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      if (!line) return;
      if (line.endsWith(":")) {
        currentSection = { heading: line.replace(":", ""), body: [] };
        sections.push(currentSection);
        return;
      }
      if (!currentSection) {
        currentSection = { heading: "Описание", body: [] };
        sections.push(currentSection);
      }
      currentSection.body.push(line);
    });

    return sections.map((section) => (
      <div key={section.heading} className="article-block">
        <h4>{section.heading}</h4>
        {section.body.map((line) => (
          <p key={`${section.heading}-${line}`}>{renderWithHighlight(line, phrase)}</p>
        ))}
      </div>
    ));
  };

  const getArticleSummary = (content) =>
    content
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line && !line.endsWith(":")) || "Описание отсутствует.";

  const processTree = useMemo(() => {
    return [
      { group: "Приемка", status: "Реализовано", children: ["Проверка поставки по накладной"] },
      { group: "Хранение", status: "Реализовано", children: ["Адресное размещение товара"] },
      { group: "Отгрузка", status: "Реализовано", children: ["Чек-лист перед отгрузкой"] }
    ];
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setSearchMessage("Введите название статьи или ключевое слово.");
      setIsKnowledgeBaseOpen(true);
      return;
    }

    const match = articles.find((article) => {
      const haystack = [
        article.title,
        article.section,
        article.content,
        ...article.keywords
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    setIsKnowledgeBaseOpen(true);
    if (!match) {
      setSearchMessage("Статья не найдена. Попробуйте изменить запрос.");
      return;
    }

    setSelectedArticleId(match.id);
    setSearchMessage(`Открыта статья: ${match.title}`);
  };

  const handleAddFeature = (event) => {
    event.preventDefault();
    const rawDescription = newFeatureText.trim();

    if (!rawDescription) {
      setAddMessage("Добавьте описание новой функциональности.");
      return;
    }

    const newArticle = buildKnowledgeArticleFromInput(rawDescription);

    setArticles((prev) => [newArticle, ...prev]);
    setSelectedArticleId(newArticle.id);
    setIsKnowledgeBaseOpen(true);
    setSearchMessage(`Добавлена статья: ${newArticle.title}`);
    setAddMessage("Описание преобразовано в формат справочника и добавлено в базу знаний.");
    setNewFeatureText("");
  };

  const handleDeleteFeature = (articleId) => {
    const articleToDelete = articles.find((article) => article.id === articleId);
    if (!articleToDelete || articleToDelete.section !== "Новый функционал") {
      return;
    }

    setArticles((prev) => prev.filter((article) => article.id !== articleId));
    setSearchMessage(`Функциональность удалена: ${articleToDelete.title}`);
  };

  const handleEditFeature = (articleId) => {
    const articleToEdit = articles.find((article) => article.id === articleId);
    if (!articleToEdit || articleToEdit.section !== "Новый функционал") {
      return;
    }

    const updatedDescription = window.prompt(
      "Обновите описание функциональности:",
      articleToEdit.sourceRaw || articleToEdit.title.replace("Функция: ", "")
    );

    if (!updatedDescription || !updatedDescription.trim()) {
      return;
    }

    const normalized = updatedDescription.trim();
    const updatedArticle = buildKnowledgeArticleFromInput(normalized, articleId);
    setArticles((prev) =>
      prev.map((article) =>
        article.id === articleId ? updatedArticle : article
      )
    );
    setSearchMessage("Функциональность обновлена и переформулирована в формат справочника.");
  };

  return (
    <div className="page">
      <div className="content">
        <header className="hero">
          <p className="tag">Справочная система</p>
          <h1>KONCRIT</h1>
          <p className="subtitle">
            Быстрый доступ к основным процессам склада: от приемки до отгрузки.
          </p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={openKnowledgeBase}>
              Открыть базу знаний
            </button>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                className="search-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск статьи в базе знаний"
              />
              <button className="search-button" type="submit">
                Поиск
              </button>
            </form>
          </div>
          <form className="add-feature-form" onSubmit={handleAddFeature}>
            <textarea
              className="feature-input"
              value={newFeatureText}
              onChange={(event) => setNewFeatureText(event.target.value)}
              placeholder="Добавить функциональность: опишите новую возможность системы простыми словами"
            />
            <button className="add-feature-button" type="submit">
              Добавить функциональность
            </button>
          </form>
          {addMessage && <p className="add-message">{addMessage}</p>}
        </header>

        <div className="cards">
          {sections.map((item) => (
            <section key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </section>
          ))}
        </div>

        <section className="process-tree">
          <h2
            className="process-tree-title"
            onClick={() => setIsDiagramView((prev) => !prev)}
            title="Нажмите, чтобы переключить формат"
          >
            Дерево процессов {isDiagramView ? "(диаграмма)" : "(список)"}
          </h2>
          {!isDiagramView ? (
            <ul className="process-list">
              {processTree.map((node) => (
                <li key={node.group} className="process-node">
                  <div className="process-title-row">
                    <strong>{node.group}</strong>
                    <span className="process-status process-status--done">{node.status}</span>
                  </div>
                  <ul>
                    {node.children.map((child) => (
                      <li key={`${node.group}-${child}`}>{child}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="process-diagram">
              <div className="diagram-root">KONCRIT WMS</div>
              <div className="diagram-branches">
                {processTree.map((node) => (
                  <div key={`diagram-${node.group}`} className="diagram-branch">
                    <div className="diagram-node">{node.group}</div>
                    <div className="diagram-arrow">↓</div>
                    <div className="diagram-leaf">{node.children[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {isKnowledgeBaseOpen && (
        <div
          className="knowledge-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsKnowledgeBaseOpen(false);
            }
          }}
        >
          <div className="knowledge-content">
            <div className="knowledge-header">
              <h2>База знаний KONCRIT</h2>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setIsKnowledgeBaseOpen(false)}
              >
                Закрыть
              </button>
            </div>

            <article className="article-view">
              <p className="article-section">{selectedArticle.section}</p>
              <h3>{renderWithHighlight(selectedArticle.title, query)}</h3>
              <div>{renderStructuredContent(selectedArticle.content, query)}</div>
              {searchMessage && <p className="search-message">{searchMessage}</p>}
            </article>

            <div className="knowledge-grid">
              {articles.map((article) => (
                <button
                  key={article.id}
                  className={`knowledge-card ${
                    selectedArticle.id === article.id ? "knowledge-card--active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    setSelectedArticleId(article.id);
                    setSearchMessage("");
                  }}
                >
                  <h3>{article.title}</h3>
                  <p>{getArticleSummary(article.content)}</p>
                  {article.section === "Новый функционал" && (
                    <div className="feature-actions">
                      <span
                        className="feature-action-link"
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEditFeature(article.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            handleEditFeature(article.id);
                          }
                        }}
                      >
                        Редактировать
                      </span>
                      <span
                        className="feature-action-link feature-action-link--danger"
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteFeature(article.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            handleDeleteFeature(article.id);
                          }
                        }}
                      >
                        Удалить
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;