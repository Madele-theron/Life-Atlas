import { Target, Compass, Flag } from 'lucide-react';

export default function Goals() {
    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Goals & Values</h1>
                <p>The "why" behind your money and your life.</p>
            </header>

            <div className="dashboard-grid">
                {/* Core Values */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Compass className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Core Values</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Freedom over Stuff</h3>
                            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>Opting for maximum time freedom rather than material accumulation.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Health as Wealth</h3>
                            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>Investing in high-quality food, fitness, and peace of mind.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Intentional Generosity</h3>
                            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>Being able to help family and loved ones without financial stress.</p>
                        </div>
                    </div>
                </div>

                {/* 1 Year Goals */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Flag className="text-self" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Short-Term (1 Year)</h2>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li>Fully map out and optimize current South African tax footprint.</li>
                        <li>Take a 2-week uninterrupted international holiday.</li>
                        <li>Consolidate all old retirement funds into one provider.</li>
                    </ul>
                </div>

                {/* 5 Year Goals */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Target className="text-love" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Long-Term (5+ Years)</h2>
                    </div>
                    <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li>Hit 50% Coast FIRE milestone.</li>
                        <li>Transition to part-time or consultation work schedule (3 days a week).</li>
                        <li>Build a fully passive income stream covering basic needs.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
