import React, { useEffect, useState, useRef } from "react";

/*
  App features:
  - Search bar (keyword or passage) with submit button.
  - Book dropdown (66 books), chapter dropdown (uses CHAPTER_COUNTS),
    verse dropdown (counts fetched from bible-api per chapter).
  - Verse of the Day (deterministic).
  - Lists of Old and New Testament books as buttons; clicking opens the book.
  - Previous / Next chapter buttons.
  - Uses https://bible-api.com/{passage}?translation=kjv
*/

// Mapping of book -> number of chapters (66 books)
const CHAPTER_COUNTS = {
  "Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
  "Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10,
  "Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31,
  "Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5,
  "Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9, "Obadiah": 1,
  "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3, "Zephaniah": 3, "Haggai": 2,
  "Zechariah": 14, "Malachi": 4,
  "Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
  "Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
  "Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6,
  "2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5,
  "1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1,
  "Jude": 1, "Revelation": 22
};

// Lists for Old and New Testaments (display as buttons)
const OLD_TESTAMENT = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
  "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"
];

const NEW_TESTAMENT = [
  "Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians",
  "Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy",
  "Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"
];

function formatQuery(book, chapter, verse) {
  if (!book) return "";
  if (!chapter) return book;
  if (!verse) return `${book} ${chapter}`;
  return `${book} ${chapter}:${verse}`;
}

async function fetchPassage(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://bible-api.com/${encoded}?translation=kjv`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// deterministic verse of the day index
function getDailyIndex(list) {
  const d = new Date();
  const seed = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
  return seed % list.length;
}

export default function App() {
  // Search text (keyword or passage)
  const [searchText, setSearchText] = useState("");

  // Book/Chapter/Verse selectors
  const [book, setBook] = useState("Genesis");
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState("");

  // verse dropdown max (determined per chapter)
  const [verseCount, setVerseCount] = useState(0);

  // result and states
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verse of the day
  const [verseOfDay, setVerseOfDay] = useState(null);
  const [vodLoading, setVodLoading] = useState(false);

  // currently displayed book view (for Old/New buttons)
  const [displayBook, setDisplayBook] = useState(null);
  const [displayChapter, setDisplayChapter] = useState(null);
  const [displayVerses, setDisplayVerses] = useState(null);
  const [displayLoading, setDisplayLoading] = useState(false);

  const resultRef = useRef();

  // On load: set verse count for initial book/chapter, and load verse of the day
  useEffect(() => {
    updateVerseCount(book, chapter);
    loadVerseOfDay();
  }, []); // eslint-disable-line

  // when book or chapter changes in selectors, update verse dropdown count
  useEffect(() => {
    updateVerseCount(book, chapter);
  }, [book, chapter]);

  async function updateVerseCount(b, ch) {
    setVerseCount(0);
    // quick guard
    if (!b || !ch) return;
    try {
      // query the chapter and count verses
      const data = await fetchPassage(`${b} ${ch}`);
      if (data && data.verses) {
        setVerseCount(data.verses.length);
        // if current selected verse > new count, adjust
        if (verse && Number(verse) > data.verses.length) {
          setVerse("");
        }
      } else if (data && data.text) {
        // fallback: split by newline then approximate
        const approx = data.text.split("\n").length || 1;
        setVerseCount(approx);
      }
    } catch (err) {
      // API may fail for invalid combo; keep chapter counts from CHAPTER_COUNTS
      const maxCh = CHAPTER_COUNTS[b] || 1;
      if (ch > maxCh) {
        setChapter(1);
      }
      setVerseCount(0);
    }
  }

  async function handleSearchSubmit(e) {
    e?.preventDefault();
    const q = searchText.trim();
    let effective = q;
    if (!effective) {
      // if no search text, use selector values
      effective = formatQuery(book, chapter, verse);
    }
    if (!effective) {
      setError("Enter search text or pick a passage.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchPassage(effective);
      setResult(data);
      // scroll to result
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    } catch (err) {
      console.error(err);
      setError("Could not find passage or API error.");
    } finally {
      setLoading(false);
    }
  }

  // load Verse of the Day (deterministic selection from a list, then fetch)
  const POPULAR = [
    "John 3:16","Psalm 23:1","Matthew 5:9","Romans 8:28","Philippians 4:13",
    "Proverbs 3:5","Psalm 46:1","Matthew 24:5","Jeremiah 29:11","Isaiah 40:31"
  ];

  async function loadVerseOfDay() {
    setVodLoading(true);
    setVerseOfDay(null);
    try {
      const today = new Date().toISOString().slice(0,10);
      const cached = localStorage.getItem("vod_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.date === today) {
          setVerseOfDay(parsed.data);
          setVodLoading(false);
          return;
        }
      }
      const idx = getDailyIndex(POPULAR);
      const passage = POPULAR[idx];
      const data = await fetchPassage(passage);
      setVerseOfDay(data);
      localStorage.setItem("vod_cache", JSON.stringify({ date: today, data }));
    } catch (err) {
      console.error(err);
    } finally {
      setVodLoading(false);
    }
  }

  // clicking an Old/New Testament book button opens book display (chapter 1 by default)
  async function openBook(b) {
    setDisplayBook(b);
    setDisplayChapter(1);
    setDisplayVerses(null);
    await loadBookChapter(b, 1);
    // sync selectors too
    setBook(b);
    setChapter(1);
    setVerse("");
  }

  async function loadBookChapter(b, ch) {
    setDisplayLoading(true);
    setDisplayVerses(null);
    try {
      const data = await fetchPassage(`${b} ${ch}`);
      setDisplayVerses(data);
    } catch (err) {
      setDisplayVerses(null);
      console.error(err);
    } finally {
      setDisplayLoading(false);
    }
  }

  async function goToDisplayChapter(newChapter) {
    if (!displayBook) return;
    const max = CHAPTER_COUNTS[displayBook] || 1;
    if (newChapter < 1 || newChapter > max) return;
    setDisplayChapter(newChapter);
    await loadBookChapter(displayBook, newChapter);
  }

  // previous/next chapter when viewing a book
  const prevChapter = async () => {
    if (!displayBook) return;
    const prev = displayChapter - 1;
    if (prev < 1) return;
    await goToDisplayChapter(prev);
    // sync main selectors
    setBook(displayBook);
    setChapter(prev);
    setVerse("");
  };

  const nextChapter = async () => {
    if (!displayBook) return;
    const max = CHAPTER_COUNTS[displayBook] || 1;
    const nxt = displayChapter + 1;
    if (nxt > max) return;
    await goToDisplayChapter(nxt);
    setBook(displayBook);
    setChapter(nxt);
    setVerse("");
  };

  // when user selects "Go" for the selectors specifically (not search field), call search
  async function handleSelectorsGo(e) {
    e?.preventDefault();
    const q = formatQuery(book, chapter, verse || undefined);
    if (!q) {
      setError("Please select a book and chapter.");
      return;
    }
    setSearchText(""); // clear search box to avoid confusion
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await fetchPassage(q);
      setResult(data);
      // scroll
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    } catch (err) {
      console.error(err);
      setError("Could not fetch the passage.");
    } finally {
      setLoading(false);
    }
  }

  // when selector chapter changes, fetch verse count via updateVerseCount which is in useEffect
  function onBookChange(e) {
    const b = e.target.value;
    setBook(b);
    // reset chapter to 1 if current chapter > book's chapters
    const maxCh = CHAPTER_COUNTS[b] || 1;
    if (chapter > maxCh) setChapter(1);
    setVerse("");
  }

  // utility: create array from 1..n
  const range = (n) => Array.from({length:n}, (_,i)=>i+1);

  // helper to render verse lines (when API returns .verses)
  function renderVersesBlock(data) {
    if (!data) return null;
    if (data.verses && data.verses.length > 0) {
      return data.verses.map(v => (
        <p key={v.verse} className="verse-line">
          <span className="verse-num">{v.verse}</span>
          <span className="verse-text">{v.text}</span>
        </p>
      ));
    }
    if (data.text) {
      return <pre className="verse-text-pre">{data.text}</pre>;
    }
    return <p className="muted">No verses found.</p>;
  }

  return (
    <div className="app-root">
      <header className="hero">
        <div className="hero-inner">
          <div className="logo-row">
            <div className="logo-icon">📖</div>
            <h1>King James Bible (KJV)</h1>
          </div>
          <p className="subtitle">Search words or verses — or browse books and chapters.</p>

          {/* Top controls: search bar with submit on right, then book/chapter/verse dropdowns and Go */}
          <form className="controls" onSubmit={handleSearchSubmit}>
            <div className="search-and-selects">
              <div className="search-wrapper">
                <input
                  aria-label="Search the Bible"
                  placeholder="Search words (e.g. 'faith') or passage (e.g. 'John 3:16')"
                  value={searchText}
                  onChange={(e)=>setSearchText(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-submit">Search</button>
              </div>

              <div className="selectors-row">
                <select value={book} onChange={onBookChange} aria-label="Book">
                  {Object.keys(CHAPTER_COUNTS).map(bk => <option key={bk} value={bk}>{bk}</option>)}
                </select>

                <select value={chapter} onChange={(e)=>setChapter(Number(e.target.value))} aria-label="Chapter">
                  {range(CHAPTER_COUNTS[book]).map(ch => <option key={ch} value={ch}>{ch}</option>)}
                </select>

                <select value={verse} onChange={(e)=>setVerse(e.target.value)} aria-label="Verse">
                  <option value="">—</option>
                  {verseCount > 0 ? range(verseCount).map(vn => <option key={vn} value={vn}>{vn}</option>)
                    : <option disabled>Loading...</option>}
                </select>

                <button className="go-btn" type="button" onClick={handleSelectorsGo}>Go</button>
              </div>
            </div>
          </form>
        </div>
      </header>

      <main className="container">
        {/* Verse of the Day */}
        <section className="vod-card">
          <div className="vod-header">
            <h3>Verse of the Day</h3>
            <div className="vod-actions">
              <button onClick={loadVerseOfDay} title="Refresh VOD">↻</button>
            </div>
          </div>
          <div className="vod-body">
            {vodLoading ? <p className="muted">Loading verse...</p> : verseOfDay ? (
              <>
                <blockquote className="verse">“{verseOfDay.text}”</blockquote>
                <div className="ref-row">
                  <span className="reference">{verseOfDay.reference} (KJV)</span>
                  <div className="action-row">
                    <button onClick={() => navigator.clipboard?.writeText(verseOfDay.text)}>Copy</button>
                    <button onClick={() => { navigator.share ? navigator.share({ title: verseOfDay.reference, text: verseOfDay.text }).catch(()=>{}) : navigator.clipboard?.writeText(verseOfDay.text); }}>Share</button>
                  </div>
                </div>
              </>
            ) : <p className="muted">Could not load Verse of the Day.</p>}
          </div>
        </section>

        {/* Search Results */}
        <section className="results-card" ref={resultRef}>
          <h3>Results</h3>
          {error && <div className="error">{error}</div>}
          {loading && <p className="muted">Searching...</p>}
          {!loading && !result && <p className="muted">Enter a search term or choose a book/chapter and press Go.</p>}
          {result && (
            <>
              <div className="result-meta">
                <strong>{result.reference}</strong>
                <div className="meta-actions">
                  <button onClick={() => navigator.clipboard?.writeText(result.text)}>Copy</button>
                </div>
              </div>
              <div className="verse-block">
                {renderVersesBlock(result)}
              </div>
            </>
          )}
        </section>

        {/* Old and New Testament Lists */}
        <section className="books-section">
          <div className="books-column">
            <h4>Old Testament</h4>
            <div className="books-list">
              {OLD_TESTAMENT.map(bk => (
                <button key={bk} className="book-btn" onClick={() => openBook(bk)}>{bk}</button>
              ))}
            </div>
          </div>
          <div className="books-column">
            <h4>New Testament</h4>
            <div className="books-list">
              {NEW_TESTAMENT.map(bk => (
                <button key={bk} className="book-btn" onClick={() => openBook(bk)}>{bk}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Display selected book and chapter with prev/next controls */}
        <section className="display-section">
          {displayBook ? (
            <div className="display-card">
              <div className="display-header">
                <h3>{displayBook} — Chapter {displayChapter}</h3>
                <div className="display-actions">
                  <button onClick={prevChapter} disabled={displayChapter <= 1}>Previous Chapter</button>
                  <button onClick={nextChapter} disabled={displayChapter >= (CHAPTER_COUNTS[displayBook]||1)}>Next Chapter</button>
                </div>
              </div>

              <div className="display-body">
                {displayLoading ? <p className="muted">Loading...</p> : displayVerses ? (
                  <>
                    <div className="result-meta">
                      <strong>{displayVerses.reference}</strong>
                      <div className="meta-actions">
                        <button onClick={() => navigator.clipboard?.writeText(displayVerses.text)}>Copy</button>
                      </div>
                    </div>
                    <div className="verse-block">
                      {renderVersesBlock(displayVerses)}
                    </div>
                  </>
                ) : <p className="muted">No data for this chapter.</p>}
              </div>
            </div>
          ) : (
            <p className="muted">Click a book from the lists above to open it.</p>
          )}
        </section>

        <footer className="footer">
          <small>Powered by bible-api.com • KJV translation</small>
        </footer>
      </main>
    </div>
  );
}
