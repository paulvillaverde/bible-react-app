// src/pages/VerseView.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function VerseView() {
  const { book, chapter, verse } = useParams();
  const navigate = useNavigate();
  const [verseData, setVerseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch single verse from API
  useEffect(() => {
    if (book && chapter && verse) {
      fetch(`https://bible-api.com/${book}+${chapter}:${verse}?translation=kjv`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.text) {
            setVerseData(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [book, chapter, verse]);

  const prevVerse = parseInt(verse) > 1 ? parseInt(verse) - 1 : null;
  const nextVerse = parseInt(verse) + 1;

  if (loading) {
    return <p className="loading">Loading verse...</p>;
  }

  if (!verseData) {
    return <p className="error">Verse not found.</p>;
  }

  return (
    <div className="container">
      <div className="results-card" style={{ textAlign: "center" }}>
        <h2 style={{ color: "#9c2a1a", textTransform: "uppercase", marginBottom: "15px" }}>
          {book} {chapter}:{verse}
        </h2>
        <p className="verse-text" style={{ fontSize: "1.5rem", fontStyle: "italic" }}>
          “{verseData.text.trim()}”
        </p>
        <p style={{ marginTop: "10px", fontStyle: "italic" }}>King James Version (KJV)</p>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
          {/* Previous Verse Button */}
          {prevVerse ? (
            <button
              className="nav-btn"
              onClick={() => navigate(`/verse/${book}/${chapter}/${prevVerse}`)}
            >
              &lt; Previous Verse
            </button>
          ) : (
            <span></span>
          )}

          {/* View Full Chapter Button */}
          <Link to={`/read/${book}`} className="nav-btn">
            View Chapter
          </Link>

          {/* Next Verse Button */}
          <button
            className="nav-btn"
            onClick={() => navigate(`/verse/${book}/${chapter}/${nextVerse}`)}
          >
            Next Verse &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
