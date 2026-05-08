import React from "react";

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
    <div
      style={{
        margin: "0 auto",
        maxWidth: 900,
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937"
      }}
    >
      <h1 style={{ marginBottom: 8 }}>WMS Reference</h1>
      <p style={{ marginTop: 0, fontSize: 18, color: "#4b5563" }}>
        Демонстрационная страница справочной системы для складских процессов.
      </p>

      <div
        style={{
          display: "grid",
          gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          marginTop: 24
        }}
      >
        {sections.map((item) => (
          <section
            key={item.title}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
              background: "#f9fafb"
            }}
          >
            <h3 style={{ marginTop: 0 }}>{item.title}</h3>
            <p style={{ marginBottom: 0, color: "#374151" }}>{item.description}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default App;