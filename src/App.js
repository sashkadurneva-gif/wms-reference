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

const articles = [
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
  const [query, setQuery] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState(articles[0].id);
  const [searchMessage, setSearchMessage] = useState("");

  const selectedArticle = useMemo(
    () => articles.find((article) => article.id === selectedArticleId) ?? articles[0],
    [selectedArticleId]
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
        </header>

        <div className="cards">
          {sections.map((item) => (
            <section key={item.title} className="card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </section>
          ))}
        </div>
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
              <h3>{selectedArticle.title}</h3>
              <p>{selectedArticle.content}</p>
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