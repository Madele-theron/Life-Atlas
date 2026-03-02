import { Dumbbell, Activity, Calendar, Trophy, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Fitness() {
    const [workouts, setWorkouts] = useState(() => {
        return JSON.parse(localStorage.getItem('lcc_workouts')) || [
            { id: 1, type: 'Strength', duration: 45, date: '2026-02-27', notes: 'Leg day. Increased squat weight to 80kg.' },
            { id: 2, type: 'Cardio', duration: 30, date: '2026-02-26', notes: 'Zone 2 running. Kept HR under 140.' }
        ];
    });
    const [newWorkout, setNewWorkout] = useState({ type: 'Strength', duration: '', notes: '' });

    useEffect(() => {
        localStorage.setItem('lcc_workouts', JSON.stringify(workouts));
    }, [workouts]);

    const addWorkout = (e) => {
        e.preventDefault();
        if (!newWorkout.duration) return;
        setWorkouts([{ id: Date.now(), ...newWorkout, date: new Date().toISOString().split('T')[0] }, ...workouts]);
        setNewWorkout({ type: 'Strength', duration: '', notes: '' });
    };

    const getIcon = (type) => {
        if (type === 'Strength') return <Dumbbell size={20} className="text-wealth" />;
        if (type === 'Cardio') return <Activity size={20} className="text-health" />;
        if (type === 'Mobility') return <Calendar size={20} className="text-self" />;
        return <Trophy size={20} />;
    }

    return (
        <div className="fade-in">
            <header className="mb-8">
                <h1>Fitness Tracking</h1>
                <p>Building physical resilience and strength for the decades ahead.</p>
            </header>

            <div className="dashboard-grid">
                {/* Log Workout */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Plus className="text-health" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Log Session</h2>
                    </div>

                    <form onSubmit={addWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select
                            value={newWorkout.type}
                            onChange={e => setNewWorkout({ ...newWorkout, type: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}
                        >
                            <option value="Strength">Strength Training</option>
                            <option value="Cardio">Cardio (Zone 2+)</option>
                            <option value="Mobility">Mobility / Yoga</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Duration (minutes)"
                            value={newWorkout.duration}
                            onChange={e => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white' }}
                        />
                        <textarea
                            placeholder="Notes (e.g., Hit a new PR, felt tired...)"
                            rows={3}
                            value={newWorkout.notes}
                            onChange={e => setNewWorkout({ ...newWorkout, notes: e.target.value })}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', background: 'var(--bg-dark)', color: 'white', resize: 'vertical' }}
                        ></textarea>
                        <button type="submit" className="btn" style={{ background: 'var(--color-health)' }}>Log Workout</button>
                    </form>
                </div>

                {/* Workout History */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Calendar className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Recent History</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {workouts.map(workout => (
                            <div key={workout.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '12px' }}>
                                    {getIcon(workout.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{workout.type}</h3>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{workout.date}</span>
                                    </div>
                                    <div style={{ color: 'var(--color-health)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>{workout.duration} Mins</div>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{workout.notes}</p>
                                </div>
                            </div>
                        ))}
                        {workouts.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No workouts logged yet. Time to get moving!</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
