export const features = [
  {
    id: 1,
    section: "Приёмка",
    title: "Автоматическое распределение товара по местам хранения",
    description: "Назначает места хранения на основе анализа состава партии.",
    date: "2024-06-12",
    author: "Иванова А.",
    status: "Реализовано"
  },
  {
    id: 2,
    section: "Отгрузка",
    title: "Контроль сборочных заданий",
    description: "Позволяет отслеживать ход выполнения заданий.",
    date: "2024-06-15",
    author: "Петров В.",
    status: "В разработке"
  }
];

import React, { useState } from "react";
import { features as initialFeatures } from "./mockFeatures";

function App() {
  const [features, setFeatures] = useState(initialFeatures);
  const [search, setSearch] = useState("");
  const [newFeature, setNewFeature] = useState({
    section: "",
    title: "",
    description: "",
    author: "",
    status: ""
  });
  const [showForm, setShowForm] = useState(false);

  const filtered = features.filter(
    (f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.section.toLowerCase().includes(search.toLowerCase())
  );

  const addFeature = (e) => {
    e.preventDefault();
    setFeatures([
      ...features,
      {
        ...newFeature,
        id: features.length + 1,
        date: new Date().toISOString().slice(0, 10)
      }
    ]);
    setNewFeature({
      section: "",
      title: "",
      description: "",
      author: "",
      status: ""
    });
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif", padding: 20 }}>
      <h2>Справочная система WMS (Прототип)</h2>
      <input
        placeholder="Поиск по названию, разделу, описанию"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "80%", padding: 8, marginBottom: 16 }}
      />
      <button onClick={() => setShowForm(!showForm)} style={{padding:8, marginLeft:10}}>
        {showForm ? "Отмена" : "Добавить функционал"}
      </button>
      {showForm && (
        <form onSubmit={addFeature} style={{ margin: "16px 0", background: "#f5f5f5", padding: 16, borderRadius:8 }}>
          <input placeholder="Раздел" value={newFeature.section} onChange={e => setNewFeature({...newFeature, section: e.target.value})} required style={{margin:4}}/>
          <input placeholder="Название" value={newFeature.title} onChange={e => setNewFeature({...newFeature, title: e.target.value})} required style={{margin:4}}/>
          <input placeholder="Описание" value={newFeature.description} onChange={e => setNewFeature({...newFeature, description: e.target.value})} required style={{margin:4, width:"80%"}}/>
          <input placeholder="Автор" value={newFeature.author} onChange={e => setNewFeature({...newFeature, author: e.target.value})} style={{margin:4}}/>
          <input placeholder="Статус (например, В работе)" value={newFeature.status} onChange={e => setNewFeature({...newFeature, status: e.target.value})} style={{margin:4}}/>
          <button type="submit" style={{margin:4, padding:6}}>Сохранить</button>
        </form>
      )}
      <ul>
        {filtered.length === 0 && <li>Нет данных</li>}
        {filtered.map(f => (
          <li key={f.id} style={{border: "1px solid #ccc", borderRadius:6, margin: "8px 0", padding: 12, background: "#fafafa"}}>
            <b>{f.section}</b>: <u>{f.title}</u>
            <div>{f.description}</div>
            <small>Автор: {f.author} | Статус: {f.status} | Дата: {f.date}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;