import { Sun, Wind, Battery, Headphones } from 'lucide-react';

export default function Mind() {
    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Mental Wellbeing</h1>
                <p>Cultivating peace, resilience, and clarity of mind.</p>
            </header>

            <div className="dashboard-grid">
                {/* Daily Practices */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Sun className="text-self" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Daily Practices</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '8px' }}>
                                <Wind size={20} className="text-health" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Morning Sunlight</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>10 mins outside within 30 mins of waking to set circadian rhythm.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '8px' }}>
                                <Headphones size={20} className="text-self" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Mindfulness</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>15 mins of guided meditation or NSDR protocol.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderRadius: '8px' }}>
                                <Battery size={20} className="text-wealth" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', margin: '0 0 0.25rem 0' }}>Digital Shutdown</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>All screens off by 9:00 PM to prepare for deep rest.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stress & Mood Log */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Battery className="text-love" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Mental Energy Log</h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        A space to dump thoughts, worries, or wins. Getting it out of your head reduces cognitive load.
                    </p>

                    <textarea
                        placeholder="How are you feeling today? Any specific stressors? What went well?"
                        rows={6}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white', resize: 'vertical', marginBottom: '1rem' }}
                    ></textarea>
                    <button className="btn" style={{ background: 'var(--color-self)', width: '100%', justifyContent: 'center' }}>Save Entry</button>
                </div>
            </div>
        </div>
    );
}
