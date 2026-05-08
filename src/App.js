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

function App() {
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [articles, setArticles] = useState(initialArticles);
  const [query, setQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState(initialArticles[0].id);
  const [searchMessage, setSearchMessage] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");
  const [addMessage, setAddMessage] = useState("");

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

  const processTree = useMemo(() => {
    const customArticles = articles.filter((article) => article.section === "Новый функционал");
    return [
      { group: "Приемка", status: "Реализовано", children: ["Проверка поставки по накладной"] },
      { group: "Хранение", status: "Реализовано", children: ["Адресное размещение товара"] },
      { group: "Отгрузка", status: "Реализовано", children: ["Чек-лист перед отгрузкой"] },
      {
        group: "Новый функционал",
        status: customArticles.length ? "В разработке" : "Пусто",
        children: customArticles.map((article) => article.title)
      }
    ];
  }, [articles]);

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

    const newArticle = {
      id: `custom-${Date.now()}`,
      section: "Новый функционал",
      title: `Новая функция: ${rawDescription.slice(0, 42)}${rawDescription.length > 42 ? "..." : ""}`,
      content: `Пользовательское описание: ${rawDescription}. Система добавила этот функционал в структуру базы знаний понятным языком.`,
      keywords: rawDescription
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 3)
    };

    setArticles((prev) => [newArticle, ...prev]);
    setSelectedArticleId(newArticle.id);
    setIsKnowledgeBaseOpen(true);
    setSearchMessage(`Добавлена статья: ${newArticle.title}`);
    setAddMessage("Функциональность добавлена в структуру справочной системы.");
    setNewFeatureText("");
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
          <h2>Дерево процессов</h2>
          <ul className="process-list">
            {processTree.map((node) => (
              <li key={node.group} className="process-node">
                <div className="process-title-row">
                  <strong>{node.group}</strong>
                  <span
                    className={`process-status ${
                      node.status === "Реализовано"
                        ? "process-status--done"
                        : node.status === "В разработке"
                          ? "process-status--progress"
                          : "process-status--empty"
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
                <ul>
                  {node.children.length ? (
                    node.children.map((child) => <li key={`${node.group}-${child}`}>{child}</li>)
                  ) : (
                    <li>Пока нет добавленных процессов</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
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
              <p>{renderWithHighlight(selectedArticle.content, query)}</p>
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
                  <p>{article.content}</p>
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