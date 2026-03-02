import { Apple, Moon, Timer, Droplet, ShieldCheck, Activity } from 'lucide-react';

export default function Longevity() {
    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Longevity & Nutrition</h1>
                <p>Protocols for avoiding sickness and feeling vibrant.</p>
            </header>

            <div className="dashboard-grid">
                {/* Core Pillars */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <ShieldCheck className="text-health" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>The Four Pillars</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Moon className="text-self" size={28} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Optimize Sleep</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Target 7.5-8 hours. Keep room cold and dark. No screens 1hr before bed.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Apple className="text-health" size={28} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Whole Foods</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prioritize protein. Minimize ultra-processed foods and refined sugars.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Timer className="text-wealth" size={28} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Fasting Window</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>14-16 hours of daily time-restricted eating to promote cellular repair.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Droplet className="text-love" size={28} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Hydration</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Minimum 2.5L water daily. Electrolytes in the morning.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checkups */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Activity className="text-health" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Prevention Checklist</h2>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                        <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                            <span>Annual Blood Work</span>
                            <span style={{ color: 'var(--color-wealth)' }}>Done (Jan 2026)</span>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                            <span>Dentist Cleaning</span>
                            <span style={{ color: 'var(--color-love)' }}>Due Soon</span>
                        </li>
                        <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                            <span>Dermatologist Check</span>
                            <span style={{ color: 'var(--text-muted)' }}>Scheduled (Mar 2026)</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
