import { Target, Lock, Unlock, CheckCircle2, ListPlus, CalendarDays, Rocket } from 'lucide-react';
import { useState, useEffect } from 'react';

// Default State for a new user
const DEFAULT_ASCENT_DATA = {
    focusWindow: {
        title: "March Sprint",
        endDate: "2026-03-31",
    },
    levels: [
        {
            id: 1,
            title: "Sort out skin routine",
            description: "Establish morning/night protocol & book derm appt.",
            status: "active" // 'completed', 'active', 'locked'
        },
        {
            id: 2,
            title: "Workout Consistency",
            description: "Hit 4 workouts a week for the entire month.",
            status: "locked"
        },
        {
            id: 3,
            title: "Digital Declutter",
            description: "Zero inbox and organize local file storage.",
            status: "locked"
        }
    ],
    queue: [] // Future goals not yet assigned a level
};

export default function AscentDashboard() {
    const [data, setData] = useState(() => {
        return JSON.parse(localStorage.getItem('lcc_ascent')) || DEFAULT_ASCENT_DATA;
    });

    // Goal Form State
    const [showAdmin, setShowAdmin] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '' });

    useEffect(() => {
        localStorage.setItem('lcc_ascent', JSON.stringify(data));
    }, [data]);

    // Logic to calculate days remaining
    const calculateDaysLeft = () => {
        if (!data.focusWindow.endDate) return null;
        const end = new Date(data.focusWindow.endDate);
        const now = new Date();
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysLeft = calculateDaysLeft();

    // Core Mechanism: Complete a Level
    const completeLevel = (levelId) => {
        const newLevels = data.levels.map((level, index) => {
            // Mark current as complete
            if (level.id === levelId) {
                return { ...level, status: 'completed' };
            }

            // Unlock the immediate next level if it was locked
            // Wait, we need to check if the PREVIOUS level was just completed. 
            // A safer way is to process the array sequentially:
            return level;
        });

        // Re-evaluate active state linearly ensuring strict gating
        let foundActive = false;
        for (let i = 0; i < newLevels.length; i++) {
            if (newLevels[i].status === 'completed') continue;

            if (!foundActive) {
                newLevels[i].status = 'active'; // This is the new frontier
                foundActive = true;
            } else {
                newLevels[i].status = 'locked'; // Everything else behind the frontier is locked
            }
        }

        setData({ ...data, levels: newLevels });
    };

    // Admin: Add to Queue
    const addToQueue = (e) => {
        e.preventDefault();
        if (!newGoal.title) return;

        setData({
            ...data,
            queue: [...data.queue, { id: Date.now(), ...newGoal }]
        });
        setNewGoal({ title: '', description: '' });
    };

    // Admin: Move Queue item to Next Level
    const promoteToLevel = (queueId) => {
        const itemToMove = data.queue.find(q => q.id === queueId);
        const newQueue = data.queue.filter(q => q.id !== queueId);

        const newLevelItem = {
            ...itemToMove,
            // If there are no active/locked levels, this becomes active. Else locked.
            status: data.levels.every(l => l.status === 'completed') ? 'active' : 'locked'
        };

        setData({
            ...data,
            queue: newQueue,
            levels: [...data.levels, newLevelItem]
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return { border: '1px solid var(--color-wealth)', background: 'var(--bg-dark)', opacity: 0.6 };
            case 'active': return { border: '2px solid var(--color-self)', background: 'var(--bg-card-hover)', transform: ' scale(1.02)' };
            case 'locked': return { border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)', opacity: 0.4 };
            default: return {};
        }
    }

    return (
        <div className="fade-in">
            <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>The Ascent</h1>
                    <p>Strictly gated, sequential focus. Finish the current level to unlock the next.</p>
                </div>
                <button onClick={() => setShowAdmin(!showAdmin)} className="btn" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                    {showAdmin ? 'Close Queue' : 'Manage Queue / Admin'}
                </button>
            </header>

            {/* Focus Window Hero */}
            <div className="card mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0) 100%)', border: '1px solid var(--color-self)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--color-self-bg)', borderRadius: '16px', color: 'var(--color-self)' }}>
                        <Rocket size={32} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>Current Focus: {data.focusWindow.title}</h2>
                        <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Complete all levels below before the window closes.</p>
                    </div>
                </div>
                {daysLeft !== null && (
                    <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-self)', lineHeight: '1' }}>{daysLeft}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.25rem' }}>Days Left</div>
                    </div>
                )}
            </div>

            <div className="dashboard-grid">
                {/* The Level Pathway */}
                <div style={{ gridColumn: showAdmin ? 'span 1' : 'span 2' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} className="text-self" /> Active Path
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                        {/* Visual connecting line behind the cards */}
                        <div style={{ position: 'absolute', left: '2rem', top: '2rem', bottom: '2rem', width: '2px', background: 'var(--border-glass)', zIndex: 0 }}></div>

                        {data.levels.map((level, index) => (
                            <div key={level.id} className="card" style={{ ...getStatusStyle(level.status), position: 'relative', zIndex: 1, display: 'flex', gap: '1.5rem', alignItems: 'flex-start', transition: 'all 0.3s ease' }}>

                                {/* Status Icon Indicator */}
                                <div style={{
                                    background: 'var(--bg-dark)',
                                    borderRadius: '50%',
                                    padding: '0.5rem',
                                    border: `2px solid ${level.status === 'completed' ? 'var(--color-wealth)' : level.status === 'active' ? 'var(--color-self)' : 'var(--border-glass)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '48px',
                                    height: '48px',
                                    flexShrink: 0
                                }}>
                                    {level.status === 'completed' && <CheckCircle2 size={24} className="text-wealth" />}
                                    {level.status === 'active' && <Unlock size={24} className="text-self" />}
                                    {level.status === 'locked' && <Lock size={20} color="var(--text-muted)" />}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                        Level {index + 1}
                                    </div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: level.status === 'locked' ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: level.status === 'completed' ? 'line-through' : 'none' }}>
                                        {level.title}
                                    </h3>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{level.description}</p>

                                    {level.status === 'active' && (
                                        <button
                                            onClick={() => completeLevel(level.id)}
                                            className="btn"
                                            style={{ marginTop: '1rem', background: 'var(--color-self)', color: 'white' }}
                                        >
                                            Complete Level
                                        </button>
                                    )}
                                    {level.status === 'completed' && (
                                        <span style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-wealth)', fontWeight: '500' }}>
                                            ✓ Achievement Unlocked
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {data.levels.length === 0 && (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--border-glass)' }}>
                                <p>No active levels. Open Admin to promote goals from your queue.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin / Queue Section */}
                {showAdmin && (
                    <div>
                        <div className="card mb-4" style={{ borderTop: '4px solid var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <ListPlus className="text-muted" size={20} />
                                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Add to Waiting Room</h2>
                            </div>
                            <form onSubmit={addToQueue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Goal Title (e.g., Read 3 books)"
                                    value={newGoal.title}
                                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}
                                />
                                <textarea
                                    placeholder="Description / Requirements..."
                                    rows={2}
                                    value={newGoal.description}
                                    onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                                    style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white', resize: 'vertical' }}
                                ></textarea>
                                <button type="submit" className="btn" style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-glass)' }}>Add to Queue</button>
                            </form>
                        </div>

                        <div className="card" style={{ borderTop: '4px solid var(--text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                <CalendarDays className="text-muted" size={20} />
                                <h2 style={{ margin: 0, fontSize: '1.25rem' }}>The Queue</h2>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Goals waiting to be assigned a level in the active path.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {data.queue.map(item => (
                                    <div key={item.id} style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{item.title}</div>
                                        </div>
                                        <button onClick={() => promoteToLevel(item.id)} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'var(--color-self)', color: 'white' }}>
                                            Promote →
                                        </button>
                                    </div>
                                ))}
                                {data.queue.length === 0 && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Queue is empty.</div>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
