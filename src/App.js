import React, { useCallback, useRef } from "react";
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
  const cardsRef = useRef(null);

  const openKnowledgeBase = useCallback(() => {
    cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="page">
      <header className="hero">
        <p className="tag">Справочная система</p>
        <h1>
          KON<span>CRIT</span>
        </h1>
        <p className="subtitle">
          Быстрый доступ к основным процессам склада: от приемки до отгрузки.
        </p>
        <button className="primary-button" type="button" onClick={openKnowledgeBase}>
          Открыть базу знаний
        </button>
      </header>

      <div className="cards" ref={cardsRef}>
        {sections.map((item) => (
          <section key={item.title} className="card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default App;