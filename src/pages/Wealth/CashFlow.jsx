import { ReceiptCent, AlertCircle, ExternalLink, Plus } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'lcc_leaks';

export default function CashFlow() {
    const [leaks, setLeaks] = useState([]);
    const [newLeak, setNewLeak] = useState({ item: '', amount: '' });
    const [loading, setLoading] = useState(true);

    const fetchLeaks = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_data')
            .select('value')
            .eq('key', STORAGE_KEY)
            .single();

        if (data && data.value) {
            setLeaks(data.value);
        } else {
            const savedLocal = localStorage.getItem(STORAGE_KEY);
            if (savedLocal) {
                const parsed = JSON.parse(savedLocal);
                setLeaks(parsed);
                await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: parsed });
            } else {
                setLeaks([{ id: 1, item: 'Takeout Coffee', amount: 120, date: '2026-02-25' }]);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchLeaks(); }, [fetchLeaks]);

    const persistLeaks = async (newData) => {
        setLeaks(newData);
        const { error } = await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: newData });
        if (error) console.error('Error saving leaks:', error.message);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    };

    const addLeak = (e) => {
        e.preventDefault();
        if (!newLeak.item || !newLeak.amount) return;
        const newArray = [...leaks, { id: Date.now(), item: newLeak.item, amount: Number(newLeak.amount), date: new Date().toISOString().split('T')[0] }];
        persistLeaks(newArray);
        setNewLeak({ item: '', amount: '' });
    };

    const deleteLeak = (id) => {
        const newArray = leaks.filter(l => l.id !== id);
        persistLeaks(newArray);
    };

    return (
        <div className="fade-in">
            <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Cash Flow & Spending</h1>
                    <p>Tracking the day-to-day reality of your money.</p>
                </div>
                <a href="#" className="btn" style={{ background: 'var(--color-wealth-bg)', color: 'var(--color-wealth)' }}>
                    <ExternalLink size={18} /> Open Excel Tracker
                </a>
            </header>

            <div className="dashboard-grid">
                {/* Minimalist Budget */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <ReceiptCent className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Monthly Budget Outline</h2>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '1rem 0', fontWeight: '500' }}>Category</th>
                                <th style={{ padding: '1rem 0', fontWeight: '500' }}>Planned</th>
                                <th style={{ padding: '1rem 0', fontWeight: '500' }}>Actual (So Far)</th>
                                <th style={{ padding: '1rem 0', fontWeight: '500' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '1rem 0' }}>Needs (Rent, Groceries, Utilities)</td>
                                <td style={{ padding: '1rem 0' }}>R 15,000</td>
                                <td style={{ padding: '1rem 0' }}>R 14,200</td>
                                <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--color-wealth)' }}>On Track</span></td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '1rem 0' }}>Wants (Dining, Hobbies)</td>
                                <td style={{ padding: '1rem 0' }}>R 4,000</td>
                                <td style={{ padding: '1rem 0' }}>R 4,500</td>
                                <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--color-love)' }}>Over</span></td>
                            </tr>
                            <tr>
                                <td style={{ padding: '1rem 0' }}>Savings & Investments</td>
                                <td style={{ padding: '1rem 0' }}>R 10,000</td>
                                <td style={{ padding: '1rem 0' }}>R 10,000</td>
                                <td style={{ padding: '1rem 0' }}><span style={{ color: 'var(--color-wealth)' }}>Met</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Leak Log */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertCircle className="text-love" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Leak Log</h2>
                    </div>
                    <p className="mb-4" style={{ fontSize: '0.9rem' }}>Mindful noting of where you overspent.</p>

                    <form onSubmit={addLeak} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <input type="text" placeholder="Item" value={newLeak.item} onChange={e => setNewLeak({ ...newLeak, item: e.target.value })} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }} />
                        <input type="number" placeholder="R Amount" value={newLeak.amount} onChange={e => setNewLeak({ ...newLeak, amount: e.target.value })} style={{ width: '80px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }} />
                        <button type="submit" className="btn" style={{ padding: '0.5rem', background: 'var(--color-wealth)' }}><Plus size={18} color="white" /></button>
                    </form>

                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {leaks.map(leak => (
                            <li key={leak.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: '2px solid var(--color-love)' }}>
                                <div>
                                    <div style={{ fontWeight: '500' }}>{leak.item}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{leak.date}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontWeight: '600' }}>-R{leak.amount}</span>
                                    <button onClick={() => deleteLeak(leak.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                                </div>
                            </li>
                        ))}
                        {leaks.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No leaks logged. Great job!</div>}
                    </ul>
                </div>
            </div>
        </div>
    );
}
