import { BookOpen, Lightbulb, Search, Trophy, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function Knowledge() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState({ title: '', content: '', type: 'tip' });

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('knowledge_notes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error loading notes:', error.message);
        } else {
            setNotes(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchNotes(); }, [fetchNotes]);

    const addNote = async (e) => {
        e.preventDefault();
        if (!newNote.title || !newNote.content) return;

        const { data, error } = await supabase
            .from('knowledge_notes')
            .insert({ title: newNote.title, content: newNote.content, type: newNote.type })
            .select()
            .single();

        if (error) {
            console.error('Error saving note:', error.message);
            alert('Could not save note. Please try again.');
            return;
        }
        setNotes(prev => [data, ...prev]);
        setNewNote({ title: '', content: '', type: 'tip' });
    };

    const deleteNote = async (id) => {
        if (!confirm('Delete this note?')) return;
        const { error } = await supabase.from('knowledge_notes').delete().eq('id', id);
        if (error) {
            console.error('Error deleting note:', error.message);
            alert('Could not delete note. Please try again.');
            return;
        }
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        if (type === 'tip') return <Lightbulb size={20} className="text-wealth" />;
        if (type === 'research') return <Search size={20} className="text-self" />;
        if (type === 'win') return <Trophy size={20} className="text-health" />;
        return <BookOpen size={20} />;
    };

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>AI Tips, Notes &amp; Learnings</h1>
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
                {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading notes…</p>}
                {!loading && notes.length === 0 && <p>No notes yet. Add your first learning above!</p>}
                {notes.map(note => (
                    <div key={note.id} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)', flexShrink: 0 }}>
                            {getIcon(note.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{note.title}</h3>
                            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{note.content}</p>
                        </div>
                        <button
                            onClick={() => deleteNote(note.id)}
                            style={{ background: 'var(--color-love-bg)', border: 'none', color: 'var(--color-love)', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer', flexShrink: 0 }}
                            title="Delete note"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}


