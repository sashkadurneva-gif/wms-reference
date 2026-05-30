import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  createCustomArticle,
  deleteCustomArticle,
  fetchCustomArticles,
  polishArticleText,
  saveCustomArticles,
  updateCustomArticle
} from "./articleApi";

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
  },
  {
    id: "receiving-quality-control",
    section: "Приемка",
    title: "Контроль качества при приемке",
    content:
      "Проведите визуальный осмотр упаковки, проверьте сроки годности и отметьте дефекты в карточке поставки до размещения товара.",
    keywords: ["качество", "приемка", "дефекты", "сроки"]
  },
  {
    id: "receiving-discrepancy-act",
    section: "Приемка",
    title: "Оформление акта расхождений",
    content:
      "Зафиксируйте излишки или недостачу, сформируйте акт расхождений и отправьте уведомление ответственному менеджеру.",
    keywords: ["акт", "расхождения", "недостача", "излишки"]
  },
  {
    id: "storage-inventory-cycle",
    section: "Хранение",
    title: "Циклическая инвентаризация",
    content:
      "Планируйте пересчет по зонам, сравнивайте фактические остатки с учетными и создавайте корректировки по итогам проверки.",
    keywords: ["инвентаризация", "остатки", "корректировки", "зоны"]
  },
  {
    id: "storage-expiration-control",
    section: "Хранение",
    title: "Контроль сроков годности",
    content:
      "Отслеживайте партии с коротким сроком, формируйте задания на приоритетный отбор и предотвращайте списания.",
    keywords: ["сроки", "партии", "списания", "контроль"]
  },
  {
    id: "shipment-route-priorities",
    section: "Отгрузка",
    title: "Приоритеты маршрутов отгрузки",
    content:
      "Сортируйте отгрузки по SLA и типу клиента, чтобы сначала отправлять критичные и срочные заказы.",
    keywords: ["маршрут", "приоритет", "sla", "клиент"]
  },
  {
    id: "shipment-pack-control",
    section: "Отгрузка",
    title: "Финальная проверка упаковки",
    content:
      "Перед закрытием заказа выполните контроль веса, соответствия маркировки и целостности упаковки.",
    keywords: ["упаковка", "вес", "маркировка", "проверка"]
  }
];

const CUSTOM_ARTICLES_STORAGE_KEY = "koncrit.customArticles";
const FAVORITES_STORAGE_KEY = "koncrit.favoriteArticleIds";
const ARTICLE_TEMPLATE_VERSION = 3;

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

const loadFavoriteArticleIds = () => {
  try {
    const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string");
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

const cleanupDeveloperWording = (text) =>
  text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^(нужно|надо|необходимо|требуется)\s+/i, "")
    .replace(/^(добавить|реализовать|сделать|разработать|создать)\s+/i, "")
    .replace(/\bдолжн(а|о|ы)?\s+быть\s+/gi, "")
    .replace(/\bдолжн(а|о|ы)?\s+/gi, "")
    .replace(/\bбудет\s+/gi, "")
    .replace(/\bследует\s+/gi, "")
    .trim();

const ensureSentenceEnd = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const trimTitle = (text) => {
  const normalized = cleanupDeveloperWording(text)
    .replace(/^функци(я|и):\s*/i, "")
    .replace(/[.?!:;]+$/g, "")
    .trim();

  if (normalized.length <= 88) {
    return toProcessSentence(normalized);
  }

  const compactTitle = normalized
    .slice(0, 88)
    .replace(/\s+\S*$/u, "")
    .trim();

  return toProcessSentence(compactTitle || normalized.slice(0, 88).trim());
};

const buildKnowledgeArticleFromInput = (rawInput, section, existingId) => {
  const normalizedInput = rawInput.trim().replace(/\s+/g, " ");
  const clauses = normalizedInput
    .split(/[.!?;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const firstClause = clauses[0] || normalizedInput;
  const title = trimTitle(firstClause);
  const userFacingSentences = clauses
    .map(cleanupDeveloperWording)
    .filter(Boolean)
    .map(toProcessSentence);
  const description = ensureSentenceEnd(userFacingSentences[0] || title);
  const details = userFacingSentences.slice(1, 4);

  const keywords = normalizedInput
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word))
    .slice(0, 8);

  const contentParts = [
    "Описание:",
    description
  ];

  if (details.length > 0) {
    contentParts.push("", "Как работает в системе:");
    contentParts.push(...details.map(ensureSentenceEnd));
  }

  const content = contentParts.join("\n");

  return {
    id: existingId ?? `custom-${Date.now()}`,
    section,
    title,
    content,
    keywords,
    sourceRaw: normalizedInput,
    templateVersion: ARTICLE_TEMPLATE_VERSION
  };
};

const isCustomArticle = (article) => article?.id?.startsWith("custom-");

const normalizeCustomArticles = (articleList) =>
  articleList
    .filter(isCustomArticle)
    .map((article) => {
      if (article.templateVersion === ARTICLE_TEMPLATE_VERSION && article.sourceRaw) {
        return article;
      }
      const fallbackSource = article.sourceRaw || article.title || article.content;
      const validSection = sections.some((item) => item.title === article.section)
        ? article.section
        : sections[0].title;
      return buildKnowledgeArticleFromInput(fallbackSource, validSection, article.id);
    });

const needsArticleTemplateMigration = (articleList) =>
  articleList.some(
    (article) =>
      isCustomArticle(article) &&
      (article.templateVersion !== ARTICLE_TEMPLATE_VERSION ||
        article.title?.startsWith("Функция:") ||
        article.content?.includes("Обеспечить выполнение функции") ||
        article.content?.includes("Когда использовать:") ||
        article.content?.includes("Пошагово:"))
  );

const getArticleHaystack = (article) =>
  [
    article.title,
    article.section,
    article.content,
    ...article.keywords
  ]
    .join(" ")
    .toLowerCase();

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
  const [newFeatureSection, setNewFeatureSection] = useState(sections[0].title);
  const [addMessage, setAddMessage] = useState("");
  const [databaseMessage, setDatabaseMessage] = useState("");
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);
  const [isAddPending, setIsAddPending] = useState(false);
  const [isAiPending, setIsAiPending] = useState(false);
  const [isEditPending, setIsEditPending] = useState(false);
  const [isDiagramView, setIsDiagramView] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editArticleId, setEditArticleId] = useState("");
  const [editFeatureText, setEditFeatureText] = useState("");
  const [editFeatureSection, setEditFeatureSection] = useState(sections[0].title);
  const [activeSectionFilter, setActiveSectionFilter] = useState("Все");
  const [draggedArticleId, setDraggedArticleId] = useState("");
  const [dropTargetArticleId, setDropTargetArticleId] = useState("");
  const [pendingArticleId, setPendingArticleId] = useState("");
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [favoriteArticleIds, setFavoriteArticleIds] = useState(() => loadFavoriteArticleIds());

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? articles[0],
    [articles, selectedArticleId]
  );
  const customArticlesCount = useMemo(
    () => articles.filter((article) => isCustomArticle(article)).length,
    [articles]
  );
  const favoritesCount = useMemo(
    () => articles.filter((article) => favoriteArticleIds.includes(article.id)).length,
    [articles, favoriteArticleIds]
  );
  const sectionStats = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        count: articles.filter((article) => article.section === section.title).length
      })),
    [articles]
  );

  useEffect(() => {
    if (!isKnowledgeBaseOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        if (articleToDelete && !pendingArticleId) {
          setArticleToDelete(null);
          return;
        }
        if (isEditModalOpen && !isEditPending) {
          setIsEditModalOpen(false);
          return;
        }
        setIsKnowledgeBaseOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [articleToDelete, isEditModalOpen, isEditPending, isKnowledgeBaseOpen, pendingArticleId]);

  useEffect(() => {
    const hasSelectedArticle = articles.some((article) => article.id === selectedArticleId);
    if (!hasSelectedArticle && articles.length > 0) {
      setSelectedArticleId(articles[0].id);
    }
  }, [articles, selectedArticleId]);

  useEffect(() => {
    let isMounted = true;

    const loadArticlesFromDatabase = async () => {
      setIsArticlesLoading(true);
      const localArticles = normalizeCustomArticles(loadCustomArticles());

      try {
        const rawDatabaseArticles = await fetchCustomArticles();
        const databaseArticles = normalizeCustomArticles(rawDatabaseArticles);

        if (!isMounted) return;

        if (databaseArticles.length === 0 && localArticles.length > 0) {
          const migratedArticles = normalizeCustomArticles(await saveCustomArticles(localArticles));
          setArticles([...migratedArticles, ...initialArticles]);
          setSelectedArticleId(migratedArticles[0]?.id ?? initialArticles[0].id);
          setDatabaseMessage("Локальные статьи перенесены в базу.");
          return;
        }

        if (needsArticleTemplateMigration(rawDatabaseArticles) && databaseArticles.length > 0) {
          await saveCustomArticles(databaseArticles);
        }

        setArticles([...databaseArticles, ...initialArticles]);
        setSelectedArticleId(databaseArticles[0]?.id ?? initialArticles[0].id);
        setDatabaseMessage("");
      } catch (error) {
        if (!isMounted) return;

        setArticles([...localArticles, ...initialArticles]);
        setSelectedArticleId(localArticles[0]?.id ?? initialArticles[0].id);
        setDatabaseMessage(
          "База статей недоступна. Проверьте настройки Supabase в Vercel."
        );
      } finally {
        if (isMounted) {
          setIsArticlesLoading(false);
        }
      }
    };

    loadArticlesFromDatabase();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteArticleIds));
  }, [favoriteArticleIds]);

  useEffect(() => {
    const shouldLockScroll = isKnowledgeBaseOpen || isEditModalOpen || Boolean(articleToDelete);
    if (!shouldLockScroll) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [articleToDelete, isEditModalOpen, isKnowledgeBaseOpen]);

  const openKnowledgeBase = () => {
    setSearchMessage("");
    setIsKnowledgeBaseOpen(true);
  };

  const handleRefreshArticles = async () => {
    setIsArticlesLoading(true);
    setDatabaseMessage("");

    try {
      const rawDatabaseArticles = await fetchCustomArticles();
      const databaseArticles = normalizeCustomArticles(rawDatabaseArticles);
      if (needsArticleTemplateMigration(rawDatabaseArticles) && databaseArticles.length > 0) {
        await saveCustomArticles(databaseArticles);
      }
      setArticles([...databaseArticles, ...initialArticles]);
      setSelectedArticleId(databaseArticles[0]?.id ?? initialArticles[0].id);
      setDatabaseMessage("Статьи обновлены из базы.");
    } catch (error) {
      setDatabaseMessage(`Не удалось обновить базу: ${error.message}`);
    } finally {
      setIsArticlesLoading(false);
    }
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
    return sections.map((sectionItem) => {
      const nodes = articles
        .filter((article) => article.section === sectionItem.title)
        .map((article) => article.title);
      return {
        group: sectionItem.title,
        status: "Реализовано",
        children: nodes
      };
    });
  }, [articles]);

  const visibleArticles = useMemo(() => {
    let filteredArticles = articles;

    if (activeSectionFilter === "Избранное") {
      filteredArticles = filteredArticles.filter((article) => favoriteArticleIds.includes(article.id));
    } else if (activeSectionFilter !== "Все") {
      filteredArticles = filteredArticles.filter((article) => article.section === activeSectionFilter);
    }

    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      filteredArticles = filteredArticles.filter((article) =>
        getArticleHaystack(article).includes(normalizedQuery)
      );
    }

    return filteredArticles;
  }, [activeSectionFilter, articles, favoriteArticleIds, query]);

  const handleSearch = (event) => {
    event.preventDefault();
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      setSearchMessage("Введите название статьи или ключевое слово.");
      setIsKnowledgeBaseOpen(true);
      return;
    }

    const match = articles.find((article) => getArticleHaystack(article).includes(normalizedQuery));

    setIsKnowledgeBaseOpen(true);
    if (!match) {
      setSearchMessage("Статья не найдена. Попробуйте изменить запрос.");
      return;
    }

    setSelectedArticleId(match.id);
    setSearchMessage(`Открыта статья: ${match.title}`);
  };

  const handlePolishFeatureText = async () => {
    const rawDescription = newFeatureText.trim();

    if (!rawDescription) {
      setAddMessage("Добавьте черновик описания, чтобы улучшить его с ИИ.");
      return;
    }

    setIsAiPending(true);
    setAddMessage("ИИ редактирует описание...");

    try {
      const result = await polishArticleText({
        text: rawDescription,
        section: newFeatureSection
      });
      setNewFeatureText(result.text);
      setAddMessage("Описание улучшено. Проверьте текст и добавьте статью в базу.");
    } catch (error) {
      setAddMessage(`ИИ-редактор недоступен: ${error.message}`);
    } finally {
      setIsAiPending(false);
    }
  };

  const handleAddFeature = async (event) => {
    event.preventDefault();
    const rawDescription = newFeatureText.trim();

    if (!rawDescription) {
      setAddMessage("Добавьте описание новой функциональности.");
      return;
    }

    const newArticle = buildKnowledgeArticleFromInput(rawDescription, newFeatureSection);
    setAddMessage("Сохраняем статью в базу...");
    setIsAddPending(true);

    try {
      const savedArticle = await createCustomArticle(newArticle);
      setArticles((prev) => [
        savedArticle,
        ...prev.filter((article) => article.id !== savedArticle.id)
      ]);
      setSelectedArticleId(savedArticle.id);
      setIsKnowledgeBaseOpen(true);
      setSearchMessage(`Добавлена статья: ${savedArticle.title}`);
      setAddMessage("Описание преобразовано и сохранено в базе знаний.");
      setDatabaseMessage("");
      setNewFeatureText("");
      setNewFeatureSection(sections[0].title);
    } catch (error) {
      setAddMessage(`Не удалось сохранить статью в базу: ${error.message}`);
    } finally {
      setIsAddPending(false);
    }
  };

  const handleDeleteFeature = (articleId) => {
    const articleToDelete = articles.find((article) => article.id === articleId);
    if (!articleToDelete || !isCustomArticle(articleToDelete)) {
      return;
    }

    setArticleToDelete(articleToDelete);
  };

  const handleConfirmDeleteFeature = async () => {
    if (!articleToDelete) {
      return;
    }

    const articleId = articleToDelete.id;
    setPendingArticleId(articleId);

    try {
      await deleteCustomArticle(articleId);
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      setFavoriteArticleIds((prev) => prev.filter((id) => id !== articleId));
      setSearchMessage(`Статья удалена: ${articleToDelete.title}`);
      setDatabaseMessage("");
      setArticleToDelete(null);
    } catch (error) {
      setSearchMessage(`Не удалось удалить статью из базы: ${error.message}`);
    } finally {
      setPendingArticleId("");
    }
  };

  const handleEditFeature = (articleId) => {
    const articleToEdit = articles.find((article) => article.id === articleId);
    if (!articleToEdit || !isCustomArticle(articleToEdit)) {
      return;
    }
    setEditArticleId(articleToEdit.id);
    setEditFeatureText(articleToEdit.sourceRaw || articleToEdit.title);
    setEditFeatureSection(articleToEdit.section);
    setIsEditModalOpen(true);
  };

  const handleSaveEditFeature = async (event) => {
    event.preventDefault();
    const normalized = editFeatureText.trim();
    if (!normalized) {
      setSearchMessage("Заполните описание для сохранения изменений.");
      return;
    }

    const updatedArticle = buildKnowledgeArticleFromInput(
      normalized,
      editFeatureSection,
      editArticleId
    );
    setIsEditPending(true);

    try {
      const savedArticle = await updateCustomArticle(editArticleId, updatedArticle);
      setArticles((prev) =>
        prev.map((article) =>
          article.id === editArticleId ? savedArticle : article
        )
      );
      setSelectedArticleId(savedArticle.id);
      setIsEditModalOpen(false);
      setSearchMessage("Функциональность обновлена и сохранена в базе.");
      setDatabaseMessage("");
    } catch (error) {
      setSearchMessage(`Не удалось сохранить изменения в базе: ${error.message}`);
    } finally {
      setIsEditPending(false);
    }
  };

  const handleCustomDragStart = (articleId) => {
    setDraggedArticleId(articleId);
  };

  const handleCustomDrop = async (targetArticleId) => {
    if (!draggedArticleId || draggedArticleId === targetArticleId) return;

    const draggedArticle = articles.find((item) => item.id === draggedArticleId);
    const targetArticle = articles.find((item) => item.id === targetArticleId);

    if (
      !draggedArticle ||
      !targetArticle ||
      !isCustomArticle(draggedArticle) ||
      !isCustomArticle(targetArticle) ||
      draggedArticle.section !== targetArticle.section
    ) {
      setDraggedArticleId("");
      setDropTargetArticleId("");
      return;
    }

    const dragIndex = articles.findIndex((item) => item.id === draggedArticleId);
    const targetIndex = articles.findIndex((item) => item.id === targetArticleId);
    if (dragIndex < 0 || targetIndex < 0) return;

    const updated = [...articles];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setArticles(updated);
    setPendingArticleId(draggedArticleId);

    try {
      await saveCustomArticles(normalizeCustomArticles(updated));
      setDatabaseMessage("");
    } catch (error) {
      setArticles(articles);
      setSearchMessage(`Не удалось сохранить порядок статей: ${error.message}`);
    } finally {
      setPendingArticleId("");
    }

    setDraggedArticleId("");
    setDropTargetArticleId("");
  };

  const toggleFavorite = (articleId) => {
    setFavoriteArticleIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
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
              {query && (
                <button
                  className="search-clear-button"
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSearchMessage("");
                  }}
                >
                  Сброс
                </button>
              )}
            </form>
          </div>
          <form className="add-feature-form" onSubmit={handleAddFeature}>
            <div className="feature-form-top">
              <label htmlFor="new-feature-section" className="feature-form-label">
                Раздел, куда добавить функциональность
              </label>
              <select
                id="new-feature-section"
                className="feature-section-select"
                value={newFeatureSection}
                onChange={(event) => setNewFeatureSection(event.target.value)}
                disabled={isAddPending || isAiPending}
              >
                {sections.map((item) => (
                  <option key={`add-${item.title}`} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="feature-input"
              value={newFeatureText}
              onChange={(event) => setNewFeatureText(event.target.value)}
              placeholder="Добавить функциональность: опишите новую возможность системы простыми словами"
              disabled={isAddPending || isAiPending}
            />
            <div className="feature-form-actions">
              <button
                className="ai-button"
                type="button"
                onClick={handlePolishFeatureText}
                disabled={isAddPending || isAiPending}
              >
                {isAiPending ? "ИИ редактирует..." : "Улучшить с ИИ"}
              </button>
              <button
                className="add-feature-button"
                type="submit"
                disabled={isAddPending || isAiPending}
              >
                {isAddPending ? "Сохраняем..." : "Добавить функциональность"}
              </button>
            </div>
          </form>
          {addMessage && <p className="add-message">{addMessage}</p>}
          {isArticlesLoading && <p className="add-message">Загружаем статьи из базы...</p>}
          {databaseMessage && <p className="add-message">{databaseMessage}</p>}
        </header>

        <div className="cards">
          {sectionStats.map((item) => (
            <section key={item.title} className="card">
              <div className="card-title-row">
                <h3>{item.title}</h3>
                <span>{item.count}</span>
              </div>
              <p>{item.description}</p>
            </section>
          ))}
        </div>

        <section className="process-tree">
          <div className="process-tree-header">
            <h2>Дерево процессов</h2>
            <div className="view-toggle" aria-label="Формат дерева процессов">
              <button
                type="button"
                className={!isDiagramView ? "view-toggle-btn view-toggle-btn--active" : "view-toggle-btn"}
                onClick={() => setIsDiagramView(false)}
              >
                Список
              </button>
              <button
                type="button"
                className={isDiagramView ? "view-toggle-btn view-toggle-btn--active" : "view-toggle-btn"}
                onClick={() => setIsDiagramView(true)}
              >
                Диаграмма
              </button>
            </div>
          </div>
          {!isDiagramView ? (
            <ul className="process-list">
              {processTree.map((node) => (
                <li key={node.group} className="process-node">
                  <div className="process-title-row">
                    <strong>{node.group}</strong>
                    <span className="process-status process-status--done">{node.status}</span>
                  </div>
                  <ul>
                    {node.children.length > 0 ? (
                      node.children.map((child) => <li key={`${node.group}-${child}`}>{child}</li>)
                    ) : (
                      <li>Подразделы пока не добавлены</li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <div className="process-diagram-map">
              <div className="diagram-root">KONCRIT WMS</div>
              <div className="diagram-lanes">
                {processTree.map((node) => (
                  <section key={`diagram-${node.group}`} className="diagram-lane">
                    <div className="diagram-lane-heading">
                      <h3>{node.group}</h3>
                      <span>{node.children.length}</span>
                    </div>
                    <ul>
                      {node.children.length > 0 ? (
                        node.children.map((child) => (
                          <li key={`diagram-child-${node.group}-${child}`}>{child}</li>
                        ))
                      ) : (
                        <li>Подразделы пока не добавлены</li>
                      )}
                    </ul>
                  </section>
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
              <div className="knowledge-meta">
                <span>Всего статей: {articles.length}</span>
                <span>Пользовательских: {customArticlesCount}</span>
                <span>Избранных: {favoritesCount}</span>
              </div>
              <div className="knowledge-tools">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={handleRefreshArticles}
                  disabled={isArticlesLoading}
                >
                  {isArticlesLoading ? "Обновляем..." : "Обновить"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setIsKnowledgeBaseOpen(false)}
                >
                  Закрыть
                </button>
              </div>
            </div>
            {(isArticlesLoading || databaseMessage) && (
              <p
                className={`sync-message ${
                  databaseMessage.startsWith("Не удалось") ||
                  databaseMessage.includes("недоступна")
                    ? "sync-message--error"
                    : ""
                }`}
              >
                {isArticlesLoading ? "Загружаем статьи из Supabase..." : databaseMessage}
              </p>
            )}

            <div className="section-filters">
              <button
                type="button"
                className={`section-filter-btn ${
                  activeSectionFilter === "Все" ? "section-filter-btn--active" : ""
                }`}
                onClick={() => setActiveSectionFilter("Все")}
              >
                Все
              </button>
              <button
                type="button"
                className={`section-filter-btn ${
                  activeSectionFilter === "Избранное" ? "section-filter-btn--active" : ""
                }`}
                onClick={() => setActiveSectionFilter("Избранное")}
              >
                Избранное
              </button>
              {sections.map((sectionItem) => (
                <button
                  key={`filter-${sectionItem.title}`}
                  type="button"
                  className={`section-filter-btn ${
                    activeSectionFilter === sectionItem.title ? "section-filter-btn--active" : ""
                  }`}
                  onClick={() => setActiveSectionFilter(sectionItem.title)}
                >
                  {sectionItem.title}
                </button>
              ))}
            </div>

            <article className="article-view">
              <p className="article-section">{selectedArticle.section}</p>
              <h3>{renderWithHighlight(selectedArticle.title, query)}</h3>
              <div>{renderStructuredContent(selectedArticle.content, query)}</div>
              {searchMessage && <p className="search-message">{searchMessage}</p>}
            </article>

            <div className="knowledge-grid">
              {visibleArticles.length === 0 && (
                <div className="empty-state">
                  <h3>Статьи не найдены</h3>
                  <p>Измените запрос или выберите другой раздел.</p>
                </div>
              )}
              {visibleArticles.map((article) => (
                <button
                  key={article.id}
                  className={`knowledge-card ${
                    selectedArticle.id === article.id ? "knowledge-card--active" : ""
                  } ${dropTargetArticleId === article.id ? "knowledge-card--drop-target" : ""}`}
                  type="button"
                  disabled={pendingArticleId === article.id}
                  draggable={isCustomArticle(article) && pendingArticleId !== article.id}
                  onDragStart={() => handleCustomDragStart(article.id)}
                  onDragOver={(event) => {
                    if (isCustomArticle(article)) {
                      event.preventDefault();
                      setDropTargetArticleId(article.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dropTargetArticleId === article.id) setDropTargetArticleId("");
                  }}
                  onDrop={() => handleCustomDrop(article.id)}
                  onDragEnd={() => {
                    setDraggedArticleId("");
                    setDropTargetArticleId("");
                  }}
                  onClick={() => {
                    setSelectedArticleId(article.id);
                    setSearchMessage("");
                  }}
                >
                  <h3>{article.title}</h3>
                  <p>{getArticleSummary(article.content)}</p>
                  <div className="card-meta-row">
                    <span className="article-chip">{article.section}</span>
                    <span
                      className={`favorite-star ${
                        favoriteArticleIds.includes(article.id) ? "favorite-star--active" : ""
                      }`}
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFavorite(article.id);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(article.id);
                        }
                      }}
                    >
                      ★
                    </span>
                  </div>
                  {isCustomArticle(article) && (
                    <div className="feature-actions">
                      <span
                        className="feature-action-link"
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (pendingArticleId !== article.id) {
                            handleEditFeature(article.id);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            if (pendingArticleId !== article.id) {
                              handleEditFeature(article.id);
                            }
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
                          if (pendingArticleId !== article.id) {
                            handleDeleteFeature(article.id);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            if (pendingArticleId !== article.id) {
                              handleDeleteFeature(article.id);
                            }
                          }
                        }}
                      >
                        {pendingArticleId === article.id ? "Удаляем..." : "Удалить"}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div
          className="edit-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsEditModalOpen(false);
            }
          }}
        >
          <div className="edit-content">
            <h2>Редактирование функциональности</h2>
            <form className="edit-form" onSubmit={handleSaveEditFeature}>
              <select
                className="feature-section-select"
                value={editFeatureSection}
                onChange={(event) => setEditFeatureSection(event.target.value)}
                disabled={isEditPending}
              >
                {sections.map((item) => (
                  <option key={`edit-${item.title}`} value={item.title}>
                    {item.title}
                  </option>
                ))}
              </select>
              <textarea
                className="edit-textarea"
                value={editFeatureText}
                onChange={(event) => setEditFeatureText(event.target.value)}
                disabled={isEditPending}
              />
              <div className="edit-actions">
                <button className="add-feature-button" type="submit" disabled={isEditPending}>
                  {isEditPending ? "Сохраняем..." : "Сохранить"}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={isEditPending}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {articleToDelete && (
        <div
          className="confirm-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget && !pendingArticleId) {
              setArticleToDelete(null);
            }
          }}
        >
          <div className="confirm-content">
            <p className="article-section">Удаление статьи</p>
            <h2>{articleToDelete.title}</h2>
            <p>
              Статья будет удалена из общей базы Supabase и пропадет у всех пользователей.
            </p>
            <div className="confirm-actions">
              <button
                className="danger-button"
                type="button"
                onClick={handleConfirmDeleteFeature}
                disabled={pendingArticleId === articleToDelete.id}
              >
                {pendingArticleId === articleToDelete.id ? "Удаляем..." : "Удалить статью"}
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => setArticleToDelete(null)}
                disabled={pendingArticleId === articleToDelete.id}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
