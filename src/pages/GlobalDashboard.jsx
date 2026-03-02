import { HeartPulse, Wallet, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GlobalDashboard() {
    return (
        <div className="dashboard-container">
            <header className="mb-8">
                <h1>Life Command Center</h1>
                <p>Your centralized hub for Health, Wealth, Love, and Self.</p>
            </header>

            <div className="dashboard-grid">
                {/* Wealth Card */}
                <div className="card" style={{ borderTop: '4px solid var(--color-wealth)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Wallet size={32} className="text-wealth" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Financial Center</span>
                    </div>
                    <h2>Wealth</h2>
                    <p className="mb-4">Net Worth, Assets, Cash Flow, and Financial Independence goals.</p>
                    <Link to="/wealth" className="btn" style={{ background: 'var(--color-wealth-bg)', color: 'var(--color-wealth)', width: '100%', justifyContent: 'center' }}>
                        Enter Wealth <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Health Card */}
                <div className="card" style={{ borderTop: '4px solid var(--color-health)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <HeartPulse size={32} className="text-health" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Physical & Mental</span>
                    </div>
                    <h2>Health</h2>
                    <p className="mb-4">Main goal: To be healthy at old age, with no weird or random sicknesses. Built through fitness tracking, longevity protocols, and mental wellbeing.</p>
                    <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                        Coming Soon
                    </button>
                </div>

                {/* Love Card */}
                <div className="card" style={{ borderTop: '4px solid var(--color-love)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Heart size={32} className="text-love" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Relationships</span>
                    </div>
                    <h2>Love</h2>
                    <p className="mb-4">Family, partner connections, and deep friendships.</p>
                    <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                        Coming Soon
                    </button>
                </div>

                {/* Self Card */}
                <div className="card" style={{ borderTop: '4px solid var(--color-self)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Sparkles size={32} className="text-self" />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Personal Growth</span>
                    </div>
                    <h2>Self</h2>
                    <p className="mb-4">Hobbies, learning horizons, skills, and life experiences.</p>
                    <button className="btn" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.5, cursor: 'not-allowed' }}>
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
}
