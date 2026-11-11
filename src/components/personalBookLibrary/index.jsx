import { useMemo, useState } from "react";
import { FiBookOpen, FiCheck, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import ConfirmDialog from "../confirmDialog/index.jsx";
import styles from "./styles.module.css";

const starterBooks = [
    { id: 1, title: "Piranesi", author: "Susanna Clarke", pages: 245, read: 181, status: "Reading", art: "piranesi" },
    { id: 2, title: "Small Things Like These", author: "Claire Keegan", pages: 128, read: 0, status: "To read", art: "smallThings" },
    { id: 3, title: "The Creative Act", author: "Rick Rubin", pages: 432, read: 96, status: "Reading", art: "creativeAct" },
    { id: 4, title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", pages: 416, read: 416, status: "Finished", art: "tomorrow" },
    { id: 5, title: "Braiding Sweetgrass", author: "Robin Wall Kimmerer", pages: 384, read: 0, status: "To read", art: "braiding" },
    { id: 6, title: "The Left Hand of Darkness", author: "Ursula K. Le Guin", pages: 304, read: 138, status: "Reading", art: "leftHand" },
];
const shelves = ["All books", "Reading", "To read", "Finished"];
const storageKey = "shelf-notes-books";
const validStatuses = new Set(["Reading", "To read", "Finished"]);

const isBook = (book) => book && typeof book === "object" &&
    (typeof book.id === "string" || typeof book.id === "number") &&
    typeof book.title === "string" && typeof book.author === "string" &&
    Number.isFinite(book.pages) && book.pages > 0 &&
    Number.isFinite(book.read) && book.read >= 0 && book.read <= book.pages &&
    validStatuses.has(book.status);

const loadLibrary = () => {
    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === null) return { books: starterBooks, warning: "" };
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(isBook)) {
            return { books: starterBooks, warning: "Saved library data could not be read. Sample books are shown; later changes may replace the unreadable data." };
        }
        return { books: parsed, warning: "" };
    } catch {
        return { books: starterBooks, warning: "Browser storage is unavailable. Changes may not persist after you leave or refresh." };
    }
};

const PersonalBookLibrary = () => {
    const [initialLibrary] = useState(loadLibrary);
    const [books, setBooks] = useState(initialLibrary.books);
    const [storageWarning, setStorageWarning] = useState(initialLibrary.warning);
    const [shelf, setShelf] = useState("All books");
    const [search, setSearch] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newAuthor, setNewAuthor] = useState("");
    const [formError, setFormError] = useState("");
    const [removing, setRemoving] = useState(null);
    const visibleBooks = useMemo(() => books.filter((book) => (shelf === "All books" || book.status === shelf) && (book.title + " " + book.author).toLowerCase().includes(search.toLowerCase())), [books, shelf, search]);
    const saveBooks = (nextBooks) => {
        setBooks(nextBooks);
        try {
            localStorage.setItem(storageKey, JSON.stringify(nextBooks));
            setStorageWarning("");
        } catch {
            setStorageWarning("Browser storage is unavailable. Changes will not persist after you leave or refresh.");
        }
    };
    const updateStatus = (id, status) => saveBooks(books.map((book) => book.id === id ? { ...book, status, read: status === "Finished" ? book.pages : status === "To read" ? 0 : book.status === "Finished" ? 0 : book.read } : book));
    const addPages = (book) => saveBooks(books.map((item) => item.id === book.id ? { ...item, read: Math.min(item.pages, item.read + 10), status: item.read + 10 >= item.pages ? "Finished" : "Reading" } : item));
    const addBook = (event) => {
        event.preventDefault();
        const title = newTitle.trim();
        const author = newAuthor.trim();
        if (!title || !author) { setFormError("Enter both a book title and an author."); return; }
        saveBooks([{ id: Date.now(), title, author, pages: 240, read: 0, status: "To read", art: "newRead" }, ...books]);
        setNewTitle("");
        setNewAuthor("");
        setFormError("");
    };
    const removeBook = () => { saveBooks(books.filter((book) => book.id !== removing.id)); setRemoving(null); };
    const count = (status) => books.filter((book) => book.status === status).length;
    const currentBook = books.find((book) => book.status === "Reading");

    return <div className={styles.library}>
        {storageWarning && <p className={styles.storageNotice} role="status">{storageWarning}</p>}
        <section className={styles.hero} id="shelves"><div><p className={styles.label}>Your reading life</p><h1>A little more<br />every day.</h1><p>Keep a record of the books you’re reading, saving, and coming back to.</p></div><div className={styles.readingCard} id="reading-now"><div className={styles.miniCover + " " + styles[currentBook?.art ?? "piranesi"]} aria-hidden="true" /><div><span>READING NOW</span><strong>{currentBook?.title ?? "Choose your next book"}</strong><small>{currentBook ? Math.round(currentBook.read / currentBook.pages * 100) + "% through" : "Your next chapter is waiting"}</small></div><FiBookOpen aria-hidden="true" /></div></section>
        <section className={styles.shelfStats} aria-label="Library totals"><div><strong>{books.length}</strong><span>Books in your library</span></div><div><strong>{count("Reading")}</strong><span>Reading now</span></div><div><strong>{count("Finished")}</strong><span>Finished books</span></div><div className={styles.monthNote}>A shelf can hold more than one story at a time.</div></section>
        <section className={styles.collection}>
            <div className={styles.collectionTitle}><div><h2>Your shelves</h2><p>Update your progress one page at a time.</p></div><label className={styles.search}><FiSearch aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title or author" aria-label="Search books" /></label></div>
            <div className={styles.shelfTabs} role="group" aria-label="Book shelf filter">{shelves.map((item) => <button type="button" key={item} onClick={() => setShelf(item)} aria-pressed={shelf === item} className={shelf === item ? styles.activeTab : ""}>{item}<span>{item === "All books" ? books.length : count(item)}</span></button>)}</div>
            <div className={styles.bookGrid}>{visibleBooks.map((book) => {
                const percent = Math.round(book.read / book.pages * 100);
                return <article key={book.id} className={styles.bookCard}>
                    <div className={styles.bookTop}><div className={styles.cover + " " + styles[book.art]} aria-hidden="true"><span>{book.title}</span><small>{book.author}</small><i /></div><div className={styles.bookDetails}><span className={styles.state}>{book.status}</span><h3>{book.title}</h3><p>{book.author}</p><span className={styles.pageCount}>{book.read} / {book.pages} pages</span></div></div>
                    <div className={styles.progress}><span style={{ width: percent + "%" }} /></div>
                    <div className={styles.cardActions}><select value={book.status} onChange={(event) => updateStatus(book.id, event.target.value)} aria-label={"Reading status for " + book.title}><option>To read</option><option>Reading</option><option>Finished</option></select>{book.status === "Reading" ? <button type="button" onClick={() => addPages(book)} aria-label={"Add 10 pages to " + book.title}>+10 pages</button> : book.status === "Finished" ? <span className={styles.finished}><FiCheck aria-hidden="true" /> Complete</span> : <span className={styles.prompt}>Ready when you are</span>}<button className={styles.remove} type="button" onClick={() => setRemoving(book)} aria-label={"Remove " + book.title}><FiTrash2 /></button></div>
                </article>;
            })}</div>
            {!visibleBooks.length && <p className={styles.empty}>No books on this shelf match your search.</p>}
        </section>
        <form className={styles.addBook} onSubmit={addBook}><div><h2>Add to the shelf</h2><p>New books start in “To read”.</p></div><label><span>Book title</span><input value={newTitle} onChange={(event) => { setNewTitle(event.target.value); setFormError(""); }} placeholder="A book to remember" required /></label><label><span>Author</span><input value={newAuthor} onChange={(event) => { setNewAuthor(event.target.value); setFormError(""); }} placeholder="Author name" required /></label>{formError && <p className={styles.formError} role="alert">{formError}</p>}<button type="submit"><FiPlus aria-hidden="true" /> Add book</button></form>
        {removing && <ConfirmDialog title="Remove this book?" description={removing.title + " will be removed from your library."} confirmLabel="Remove book" onCancel={() => setRemoving(null)} onConfirm={removeBook} />}
    </div>;
};

export default PersonalBookLibrary;
