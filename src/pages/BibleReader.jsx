// src/pages/BibleReader.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function BibleReader() {
  const { book } = useParams();
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [chapter, setChapter] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (book) {
      fetch(`https://bible-api.com/${book}+${chapter}?translation=kjv`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.verses) {
            setVerses(data.verses);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [book, chapter]);

  const handlePrev = () => {
    if (chapter > 1) setChapter(chapter - 1);
  };

  const handleNext = () => {
    setChapter(chapter + 1);
  };

  const openVerse = (verseNum) => {
    navigate(`/verse/${book}/${chapter}/${verseNum}`);
  };

  return (
    <div className="reader-container">
      <div className="reader-header">
        <div className="nav-button">
          <button onClick={handlePrev} disabled={chapter === 1}>
            &lt; Previous Chapter
          </button>
        </div>

        <div className="chapter-title">
          <h2>{book}</h2>
          <h3>Chapter {chapter}</h3>
        </div>

        <div className="nav-button">
          <button onClick={handleNext}>Next Chapter &gt;</button>
        </div>
      </div>

      <div className="chapter-content">
        {loading ? (
          <p className="loading">Loading verses...</p>
        ) : (
          verses.map((verse, index) => (
            <div
              key={index}
              className="verse-line clickable"
              onClick={() => openVerse(verse.verse)}
            >
              <span className="verse-num">{verse.verse}</span>
              <span className="verse-text">{verse.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
