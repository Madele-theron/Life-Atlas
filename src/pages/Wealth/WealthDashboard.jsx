import { TrendingUp, Target, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function WealthDashboard() {
    const [netWorth, setNetWorth] = useState(
        () => localStorage.getItem('lcc_netWorth') || '0.00'
    );

    useEffect(() => {
        localStorage.setItem('lcc_netWorth', netWorth);
    }, [netWorth]);

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Financial Dashboard</h1>
                <p>A high-level view of your wealth-building journey.</p>
            </header>

            {/* Hero Section */}
            <div className="card mb-8" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(15, 23, 42, 0) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--color-wealth-bg)', borderRadius: '12px', color: 'var(--color-wealth)' }}>
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>Current Net Worth (ZAR)</h3>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>R</span>
                    <input
                        type="number"
                        value={netWorth}
                        onChange={(e) => setNetWorth(e.target.value)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-main)',
                            fontSize: '4.5rem',
                            fontWeight: '700',
                            outline: 'none',
                            fontFamily: 'var(--font-family)',
                            width: '100%',
                            letterSpacing: '-2px'
                        }}
                    />
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Priorities */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Target className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Top 3 Priorities</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-wealth)' }}>
                            <strong>1. Maximize TFSA</strong>
                            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Contribute R46,000 before the end of the tax year.</p>
                        </li>
                        <li style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-wealth)' }}>
                            <strong>2. Rebaseline Budget</strong>
                            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Cut subscription bloat in the upcoming month.</p>
                        </li>
                        <li style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--color-wealth)' }}>
                            <strong>3. RA Review</strong>
                            <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>Check performance of current Retirement Annuity funds.</p>
                        </li>
                    </ul>
                </div>

                {/* Quick Actions / At a Glance */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Zap className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Quick Stats</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Target Savings Rate</span>
                            <strong>40%</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Emergency Fund</span>
                            <strong style={{ color: 'var(--color-wealth)' }}>Fully Funded (6mo)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>FIRE Target Hit</span>
                            <strong>22%</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
