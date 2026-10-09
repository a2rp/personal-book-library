import { useEffect, useMemo, useState } from "react";
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

const PersonalBookLibrary = () => {
    const [books, setBooks] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey)) ?? starterBooks; } catch { return starterBooks; } });
    const [shelf, setShelf] = useState("All books");
    const [search, setSearch] = useState("");
    const [newTitle, setNewTitle] = useState("");
    const [newAuthor, setNewAuthor] = useState("");
    const [removing, setRemoving] = useState(null);
    useEffect(() => localStorage.setItem(storageKey, JSON.stringify(books)), [books]);
    const visibleBooks = useMemo(() => books.filter((book) => (shelf === "All books" || book.status === shelf) && (book.title + " " + book.author).toLowerCase().includes(search.toLowerCase())), [books, shelf, search]);
    const updateStatus = (id, status) => setBooks((current) => current.map((book) => book.id === id ? { ...book, status, read: status === "Finished" ? book.pages : status === "To read" ? 0 : book.read } : book));
    const addPages = (book) => setBooks((current) => current.map((item) => item.id === book.id ? { ...item, read: Math.min(item.pages, item.read + 10), status: item.read + 10 >= item.pages ? "Finished" : "Reading" } : item));
    const addBook = (event) => { event.preventDefault(); const title = newTitle.trim(); const author = newAuthor.trim(); if (!title || !author) return; setBooks((current) => [{ id: Date.now(), title, author, pages: 240, read: 0, status: "To read", art: "newRead" }, ...current]); setNewTitle(""); setNewAuthor(""); };
    const removeBook = () => { setBooks((current) => current.filter((book) => book.id !== removing.id)); setRemoving(null); };
    const count = (status) => books.filter((book) => book.status === status).length;
    const currentBook = books.find((book) => book.status === "Reading");

    return <div className={styles.library}>
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
        <form className={styles.addBook} onSubmit={addBook}><div><h2>Add to the shelf</h2><p>New books start in “To read”.</p></div><label><span>Book title</span><input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="A book to remember" /></label><label><span>Author</span><input value={newAuthor} onChange={(event) => setNewAuthor(event.target.value)} placeholder="Author name" /></label><button type="submit"><FiPlus aria-hidden="true" /> Add book</button></form>
        {removing && <ConfirmDialog title="Remove this book?" description={removing.title + " will be removed from your library."} confirmLabel="Remove book" onCancel={() => setRemoving(null)} onConfirm={removeBook} />}
    </div>;
};

export default PersonalBookLibrary;
