// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./components/Home.jsx";
import BibleReader from "./pages/BibleReader.jsx";
import VerseView from "./pages/VerseView.jsx";
import HeaderBar from "./components/HeaderBar.jsx";
import "./styles/HeaderBar.css";


export default function App() {
  // 📜 Book Lists
  const oldTestament = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings",
    "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
    "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes",
    "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah",
    "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
    "Haggai", "Zechariah", "Malachi"
  ];

  const newTestament = [
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
  ];

  return (
    <div>
      {/* 📌 HEADER - always visible */}
      <header className="hero">
        <div className="hero-inner">
          <Link to="/" className="logo-row">
            <span className="logo-icon">📖</span>
            <h1>King James Bible</h1>
          </Link>
        </div>

        {/* HeaderBar Component */}
        <HeaderBar oldTestament={oldTestament} newTestament={newTestament} />
      </header>

      {/* 📌 MAIN CONTENT */}
      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read/:book" element={<BibleReader />} />
          <Route path="/verse/:book/:chapter/:verse" element={<VerseView />} />
        </Routes>
      </main>
    </div>
  );
}
