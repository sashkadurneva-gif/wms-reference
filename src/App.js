import React, { useState } from "react";
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

function App() {
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);

  return (
    <div className="page">
      <div className="content">
        <header className="hero">
          <p className="tag">Справочная система</p>
          <h1>KONCRIT</h1>
          <p className="subtitle">
            Быстрый доступ к основным процессам склада: от приемки до отгрузки.
          </p>
          <button
            className="primary-button"
            type="button"
            onClick={() => setIsKnowledgeBaseOpen(true)}
          >
            Открыть базу знаний
          </button>
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
        <div className="knowledge-overlay" role="dialog" aria-modal="true">
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

          <div className="knowledge-grid">
            {sections.map((item) => (
              <section key={`knowledge-${item.title}`} className="knowledge-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ul>
                  <li>Инструкции</li>
                  <li>Частые вопросы</li>
                  <li>Контрольные чек-листы</li>
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;