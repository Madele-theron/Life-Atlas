import { PieChart, Landmark, ArrowUpRight, Anchor } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'lcc_netWorth';

export default function Assets() {
    const fireTarget = 5000000;
    const [currentAssets, setCurrentAssets] = useState(1100000); // default
    const [loading, setLoading] = useState(true);

    const fetchNetWorth = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_data')
            .select('value')
            .eq('key', STORAGE_KEY)
            .single();

        if (data && data.value) {
            setCurrentAssets(parseFloat(data.value));
        } else if (!error) {
            // Check local storage for legacy data (migration)
            const savedLocal = localStorage.getItem(STORAGE_KEY);
            if (savedLocal) {
                const parsed = parseFloat(savedLocal);
                setCurrentAssets(parsed);
                // Promptly push to DB
                await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: parsed });
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchNetWorth() }, [fetchNetWorth]);

    const handleNetWorthUpdate = async (value) => {
        const parsed = parseFloat(value) || 0;
        setCurrentAssets(parsed);
        // Persist to DB
        const { error } = await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: parsed });
        if (error) console.error('Error saving net worth:', error.message);
        // Also keep local as backup
        localStorage.setItem(STORAGE_KEY, parsed);
    };

    const progress = Math.min(100, Math.max(0, (currentAssets / fireTarget) * 100));

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Assets &amp; Investments</h1>
                <p>Your wealth-building engine and accounts.</p>
            </header>

            {/* FIRE Progress */}
            <div className="card mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Anchor className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Financial Independence (FIRE) Target</h2>
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{progress.toFixed(1)}%</span>
                </div>

                <div style={{ width: '100%', height: '16px', background: 'var(--bg-dark)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-wealth)', transition: 'width 1s ease-out' }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>Current Net Worth: R</span>
                        <input
                            type="number"
                            value={currentAssets}
                            onChange={(e) => handleNetWorthUpdate(e.target.value)}
                            style={{ width: '120px', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', color: 'var(--color-wealth)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontWeight: '600' }}
                        />
                    </div>
                    <span>Target: R {(fireTarget).toLocaleString()}</span>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Account Balances */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Landmark className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Account Balances</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>Emergency Fund</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard Bank MoneyMarket</div>
                            </div>
                            <strong style={{ alignSelf: 'center' }}>R 150,000</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>TFSA</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>EasyEquities S&P500</div>
                            </div>
                            <strong style={{ alignSelf: 'center' }}>R 250,000</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: '500' }}>Retirement Annuity</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sygnia</div>
                            </div>
                            <strong style={{ alignSelf: 'center' }}>R 700,000</strong>
                        </div>
                    </div>
                </div>

                {/* Income Streams */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <ArrowUpRight className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Income Streams</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '500' }}>Primary Salary</span>
                                <span style={{ color: 'var(--color-wealth)' }}>90%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px' }}>
                                <div style={{ width: '90%', height: '100%', background: 'var(--color-wealth)' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '500' }}>Dividend Yield (Passive)</span>
                                <span style={{ color: 'var(--color-self)' }}>7%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px' }}>
                                <div style={{ width: '7%', height: '100%', background: 'var(--color-self)' }}></div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '500' }}>Side Income</span>
                                <span style={{ color: 'var(--color-love)' }}>3%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px' }}>
                                <div style={{ width: '3%', height: '100%', background: 'var(--color-love)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
