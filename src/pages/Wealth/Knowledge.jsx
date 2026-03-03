import { BookOpen, Lightbulb, Search, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Knowledge() {
    const defaultNotes = [
        { id: 1, type: 'tip', title: 'Tax Benefits of RA in SA', content: 'Contributions to a Retirement Annuity are tax-deductible up to 27.5% of remuneration or taxable income (capped at R350,000 p.a.).' },
        { id: 2, type: 'research', title: 'Index Funds', content: 'Compare Satrix MSCI World vs Sygnia Itrix S&P 500 TERs.' },
        { id: 3, type: 'win', title: 'Hit Emergency Fund Target', content: 'Finally reached 6 months of expenses in a high-yield savings account! 🥳' }
    ];

    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem('lcc_notes');
            return saved ? JSON.parse(saved) : defaultNotes;
        } catch {
            console.warn('lcc_notes was corrupted — resetting to defaults.');
            return defaultNotes;
        }
    });

    const [newNote, setNewNote] = useState({ title: '', content: '', type: 'tip' });

    useEffect(() => {
        localStorage.setItem('lcc_notes', JSON.stringify(notes));
    }, [notes]);

    const addNote = (e) => {
        e.preventDefault();
        if (!newNote.title || !newNote.content) return;
        setNotes([{ id: Date.now(), ...newNote }, ...notes]);
        setNewNote({ title: '', content: '', type: 'tip' });
    };

    const getIcon = (type) => {
        if (type === 'tip') return <Lightbulb size={20} className="text-wealth" />;
        if (type === 'research') return <Search size={20} className="text-self" />;
        if (type === 'win') return <Trophy size={20} className="text-health" />;
        return <BookOpen size={20} />;
    }

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>AI Tips, Notes & Learnings</h1>
                <p>Your personal financial diary and knowledge base.</p>
            </header>

            <div className="card mb-8">
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Add a New Note</h2>
                <form onSubmit={addNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Title (e.g., Tax Strategy 2026)"
                            value={newNote.title}
                            onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}
                        />
                        <select
                            value={newNote.type}
                            onChange={e => setNewNote({ ...newNote, type: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}
                        >
                            <option value="tip">Strategy / Tip</option>
                            <option value="research">To Research</option>
                            <option value="win">Milestone / Win</option>
                        </select>
                    </div>
                    <textarea
                        placeholder="Paste your AI prompt insights, tax notes, or ideas here..."
                        rows={4}
                        value={newNote.content}
                        onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white', resize: 'vertical' }}
                    ></textarea>
                    <button type="submit" className="btn" style={{ alignSelf: 'flex-start', background: 'var(--color-wealth)' }}>Save Note</button>
                </form>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {notes.map(note => (
                    <div key={note.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                            {getIcon(note.type)}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{note.title}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{note.content}</p>
                        </div>
                    </div>
                ))}
                {notes.length === 0 && <p>No notes yet. Add your first learning above!</p>}
            </div>
        </div>
    );
}
