import { HeartPulse, Activity, Moon, Apple, Target } from 'lucide-react';

export default function HealthDashboard() {
    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Health Dashboard</h1>
                <p>A high-level view of your physical and mental wellbeing.</p>
            </header>

            {/* Hero Goal Section */}
            <div className="card mb-8" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(15, 23, 42, 0) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.75rem', background: 'var(--color-health-bg)', borderRadius: '12px', color: 'var(--color-health)' }}>
                        <HeartPulse size={28} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>Core Mission</h3>
                    </div>
                </div>

                <p style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-muted)', lineHeight: '1.4', fontStyle: 'italic' }}>
                    "To be healthy and fit in my old age, avoiding random or preventable sicknesses. Building resilience today for tomorrow."
                </p>
            </div>

            {/* Monthly Focus Section */}
            <div className="card mb-8">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <Target className="text-love" size={24} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Current Focus</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px', borderLeft: '3px solid var(--color-love)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>March Focus</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Lowered calories and intensive gut healing protocols.</p>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px', borderLeft: '3px solid var(--color-self)' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>April Outlook</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Continued gut healing and menstrual cycle syncing for food and fitness.</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Quick Stats */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Activity className="text-health" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Activity Overview</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Strength Training</span>
                            <strong>3x / Week</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Cardio Zone 2</span>
                            <strong>45 Mins / Week</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Daily Steps Avg</span>
                            <strong style={{ color: 'var(--color-health)' }}>8,500</strong>
                        </div>
                    </div>
                </div>

                {/* Nutrition & Recovery */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Moon className="text-health" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recovery & Fuel</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Moon size={16} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)' }}>Average Sleep</span>
                            </div>
                            <strong>7.5 Hours</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Apple size={16} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)' }}>Diet Quality</span>
                            </div>
                            <strong>80% Whole Foods</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Hydration</span>
                            <strong>2.5L / Day</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
