import React from "react";
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
  return (
    <div className="page">
      <header className="hero">
        <p className="tag">Складская справочная система</p>
        <h1>KONCRIT</h1>
        <p className="subtitle">
          Быстрый доступ к основным процессам склада: от приемки до отгрузки.
        </p>
        <button className="primary-button" type="button">
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

      <footer className="footer">
        <span>Поддержка: support@koncrit.ru</span>
        <span>Телефон: +7 (999) 123-45-67</span>
      </footer>
    </div>
  );
}

export default App;