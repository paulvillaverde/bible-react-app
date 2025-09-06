// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);

  // 📜 Verse of the Day API
  useEffect(() => {
    fetch("https://labs.bible.org/api/?passage=votd&type=json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const v = data[0];
          setVerse(`${v.text} (${v.bookname} ${v.chapter}:${v.verse})`);
        }
      })
      .catch(() => setVerse("Unable to load Verse of the Day."));
  }, []);

  // 📚 Book Lists
  const oldTestament = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
    "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
    "1 Kings","2 Kings","1 Chronicles","2 Chronicles",
    "Ezra","Nehemiah","Esther","Job","Psalms","Proverbs",
    "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations",
    "Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah",
    "Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"
  ];

  const newTestament = [
    "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
    "2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
    "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus",
    "Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John",
    "3 John","Jude","Revelation"
  ];

  return (
    <div>
      {/* 📖 Verse of the Day */}
      <div className="container">
        <div className="vod-card">
          <div className="vod-header">
            <h2>Bible Verse of the Day</h2>
          </div>
          <div className="vod-body">
            <p className="verse">{verse || "Loading verse..."}</p>
          </div>
        </div>
      </div>

      {/* 📚 Books Section */}
      <div className="container">
        <div className="books-section">
          {/* Old Testament */}
          <div className="books-column">
            <h3>📖 Old Testament</h3>
            <div className="books-grid">
              {oldTestament.map((book, i) => (
                <div
                  key={i}
                  className="book-box"
                  onClick={() => navigate(`/read/${book}`)}
                >
                  {book}
                </div>
              ))}
            </div>
          </div>

          {/* New Testament */}
          <div className="books-column">
            <h3>📖 New Testament</h3>
            <div className="books-grid">
              {newTestament.map((book, i) => (
                <div
                  key={i}
                  className="book-box"
                  onClick={() => navigate(`/read/${book}`)}
                >
                  {book}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
