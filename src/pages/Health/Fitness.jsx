import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, Flame, CheckCircle2, Circle, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ─── helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lcc_fitness_calendar_v2';

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function monthLabel(year, month) {
    return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year, month) {
    // 0 = Sunday, shift so week starts on Monday
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Mon=0 … Sun=6
}

function buildCalendarGrid(year, month) {
    const offset = firstDayOfMonth(year, month);
    const total = daysInMonth(year, month);
    const cells = [];

    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);

    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

function dateKey(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

function calcStreak(data) {
    let streak = 0;
    const today = new Date();
    const cursor = new Date(today);

    while (true) {
        const key = cursor.toISOString().split('T')[0];
        const entry = data[key];
        if (entry && entry.done) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            // allow today to be missed (still building the streak)
            if (cursor.toISOString().split('T')[0] === todayStr() && streak === 0) {
                cursor.setDate(cursor.getDate() - 1);
                continue;
            }
            break;
        }
    }
    return streak;
}

function calcMonthWorkouts(data, year, month) {
    return Object.entries(data).filter(([key, val]) => {
        const [y, m] = key.split('-').map(Number);
        return y === year && m - 1 === month && val.done;
    }).length;
}

// ─── sub-components ─────────────────────────────────────────────────────────

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WORKOUT_TYPES = [
    { value: 'strength', label: 'Strength', color: '#f59e0b', emoji: '🏋️' },
    { value: 'cardio', label: 'Cardio', color: '#10b981', emoji: '🏃' },
    { value: 'mobility', label: 'Mobility', color: '#3b82f6', emoji: '🧘' },
    { value: 'hiit', label: 'HIIT', color: '#f43f5e', emoji: '🔥' },
    { value: 'sport', label: 'Sport', color: '#8b5cf6', emoji: '⚽' },
    { value: 'walk', label: 'Walk/Hike', color: '#06b6d4', emoji: '🥾' },
    { value: 'split_stretch', label: 'Split Stretches', color: '#ec4899', emoji: '🤸' },
    { value: 'handstands', label: 'Handstands', color: '#a78bfa', emoji: '🙃' },
    { value: 'pull_ups', label: 'Pull Ups', color: '#fb923c', emoji: '💪' },
    { value: 'legs_glutes', label: 'Legs (Glutes)', color: '#e879f9', emoji: '🍑' },
    { value: 'legs_quads', label: 'Legs (Quads)', color: '#f472b6', emoji: '🦵' },
    { value: 'abs', label: 'Abs', color: '#34d399', emoji: '🎯' },
    { value: 'apt', label: 'APT', color: '#60a5fa', emoji: '📐' },
    { value: 'kickboxing', label: 'Kickboxing', color: '#f87171', emoji: '🥊' },
    { value: 'body20', label: 'Body20', color: '#fbbf24', emoji: '⚡' },
];

function typeInfo(value) {
    return WORKOUT_TYPES.find(t => t.value === value) || WORKOUT_TYPES[0];
}

function DayCell({ day, dateStr, entry, isToday, isFuture, onClick }) {
    if (!day) return <div className="fc-cell fc-cell--empty" />;

    const done = entry?.done;
    const types = entry?.types || [];
    const colors = types.slice(0, 2).map(t => typeInfo(t).color);
    const mainColor = colors[0] || '#f59e0b';

    return (
        <button
            className={[
                'fc-cell',
                done ? 'fc-cell--done' : '',
                isToday ? 'fc-cell--today' : '',
                isFuture ? 'fc-cell--future' : '',
            ].join(' ')}
            onClick={() => !isFuture && onClick(dateStr)}
            style={done ? { '--cell-color': mainColor } : {}}
            title={done ? types.map(t => typeInfo(t).label).join(' + ') : 'Click to mark workout'}
        >
            <span className="fc-day-num">{day}</span>

            {done && (
                <span className="fc-dot-row">
                    {colors.map((c, i) => (
                        <span key={i} className="fc-dot" style={{ background: c }} />
                    ))}
                </span>
            )}

            {isToday && !done && (
                <span className="fc-today-ring" />
            )}
        </button>
    );
}

// ─── Day Detail Modal ────────────────────────────────────────────────────────

function DayModal({ dateStr, entry, onClose, onSave }) {
    const [selectedTypes, setSelectedTypes] = useState(entry?.types || []);
    const [done, setDone] = useState(entry?.done || false);

    const toggleType = (val) => {
        setSelectedTypes(prev =>
            prev.includes(val) ? prev.filter(t => t !== val) : [...prev, val]
        );
        if (!done) setDone(true);
    };

    const handleSave = () => {
        onSave(dateStr, {
            done: done || selectedTypes.length > 0,
            types: selectedTypes,
        });
        onClose();
    };

    const handleToggleDone = () => {
        const next = !done;
        setDone(next);
        if (!next) setSelectedTypes([]);
    };

    const [d, m, y] = [
        parseInt(dateStr.split('-')[2]),
        parseInt(dateStr.split('-')[1]),
        parseInt(dateStr.split('-')[0]),
    ];
    const label = new Date(y, m - 1, d).toLocaleString('default', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal" onClick={e => e.stopPropagation()}>
                <div className="fc-modal-header">
                    <Calendar size={18} style={{ color: '#f59e0b' }} />
                    <h3 className="fc-modal-title">{label}</h3>
                </div>

                {/* Big toggle */}
                <button
                    className={`fc-big-toggle ${done ? 'fc-big-toggle--on' : ''}`}
                    onClick={handleToggleDone}
                >
                    {done
                        ? <><CheckCircle2 size={22} /> Workout Done!</>
                        : <><Circle size={22} /> Mark as Rest Day</>}
                </button>

                {/* Workout type pills */}
                {done && (
                    <div className="fc-type-section">
                        <p className="fc-type-label">Workout type(s)</p>
                        <div className="fc-type-grid">
                            {WORKOUT_TYPES.map(t => {
                                const active = selectedTypes.includes(t.value);
                                return (
                                    <button
                                        key={t.value}
                                        className={`fc-type-pill ${active ? 'fc-type-pill--active' : ''}`}
                                        style={active ? { borderColor: t.color, background: t.color + '22', color: t.color } : {}}
                                        onClick={() => toggleType(t.value)}
                                    >
                                        <span>{t.emoji}</span> {t.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="fc-modal-actions">
                    <button className="fc-btn fc-btn--ghost" onClick={onClose}>Cancel</button>
                    <button className="fc-btn fc-btn--save" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Fitness() {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);

    const fetchFitnessData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: dbData, error } = await supabase
                .from('user_data')
                .select('value')
                .eq('key', STORAGE_KEY)
                .maybeSingle(); // maybeSingle doesn't throw error if not found

            if (dbData && dbData.value) {
                setData(dbData.value);
            } else {
                // Check local storage for legacy data (migration)
                const savedLocal = localStorage.getItem(STORAGE_KEY);
                if (savedLocal) {
                    try {
                        const parsed = JSON.parse(savedLocal);
                        setData(parsed);
                        // Silently try to sync to DB
                        await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: parsed });
                    } catch (e) { console.error('Migration failure:', e); }
                }
            }
        } catch (err) {
            console.error('Error fetching fitness data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchFitnessData(); }, [fetchFitnessData]);

    const persistFitnessData = async (newData) => {
        // 1. Update React state immediately
        setData(newData);

        // 2. Update Local Storage immediately (Sync)
        // This ensures the data stays even if the page is refreshed BEFORE the DB call finishes
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

        // 3. Update Supabase (Async)
        const { error } = await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: newData });
        if (error) console.error('Error saving to Supabase:', error.message);
    };

    const navigate = (dir) => {
        setMonth(prev => {
            let m = prev + dir;
            if (m < 0) { setYear(y => y - 1); return 11; }
            if (m > 11) { setYear(y => y + 1); return 0; }
            return m;
        });
    };

    const handleCellClick = useCallback((dateStr) => {
        setModal(dateStr);
    }, []);

    const handleSave = useCallback((dateStr, payload) => {
        // Use functional update to avoid closure staleness issues
        setData(prevData => {
            const newData = { ...prevData, [dateStr]: payload };
            persistFitnessData(newData);
            return newData;
        });
    }, []);

    const cells = buildCalendarGrid(year, month);
    const today = todayStr();
    const streak = calcStreak(data);
    const monthWO = calcMonthWorkouts(data, year, month);
    const totalWO = Object.values(data).filter(v => v.done).length;

    return (
        <div className="fc-root">
            {/* ── Header ── */}
            <header className="fc-page-header">
                <div>
                    <h1 className="fc-page-title">
                        <Dumbbell size={28} style={{ color: '#f59e0b' }} />
                        Fitness Calendar
                    </h1>
                    <p className="fc-page-sub">Track the days you show up. That's all that matters.</p>
                </div>

                {/* Stats strip */}
                <div className="fc-stats">
                    <div className="fc-stat">
                        <Flame size={18} style={{ color: '#f43f5e' }} />
                        <span className="fc-stat-num">{streak}</span>
                        <span className="fc-stat-lbl">day streak</span>
                    </div>
                    <div className="fc-stat-divider" />
                    <div className="fc-stat">
                        <Calendar size={18} style={{ color: '#f59e0b' }} />
                        <span className="fc-stat-num">{monthWO}</span>
                        <span className="fc-stat-lbl">this month</span>
                    </div>
                    <div className="fc-stat-divider" />
                    <div className="fc-stat">
                        <CheckCircle2 size={18} style={{ color: '#10b981' }} />
                        <span className="fc-stat-num">{totalWO}</span>
                        <span className="fc-stat-lbl">all time</span>
                    </div>
                </div>
            </header>

            {/* ── Calendar card ── */}
            <div className="fc-calendar-card">
                {/* Month nav */}
                <div className="fc-month-nav">
                    <button className="fc-nav-btn" onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <span className="fc-month-label">{monthLabel(year, month)}</span>
                    <button
                        className="fc-nav-btn"
                        onClick={() => navigate(1)}
                        disabled={year === now.getFullYear() && month === now.getMonth()}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Day-of-week headers */}
                <div className="fc-grid fc-grid--header">
                    {WEEK_DAYS.map(d => (
                        <div key={d} className="fc-week-label">{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="fc-grid fc-grid--cells">
                    {cells.map((day, idx) => {
                        const ds = day ? dateKey(year, month, day) : null;
                        const isToday = ds === today;
                        const isFuture = ds ? ds > today : false;
                        return (
                            <DayCell
                                key={idx}
                                day={day}
                                dateStr={ds}
                                entry={ds ? data[ds] : null}
                                isToday={isToday}
                                isFuture={isFuture}
                                onClick={handleCellClick}
                            />
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="fc-legend">
                    {WORKOUT_TYPES.map(t => (
                        <div key={t.value} className="fc-legend-item">
                            <span className="fc-legend-dot" style={{ background: t.color }} />
                            <span>{t.emoji} {t.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly progress bar */}
            <div className="fc-progress-card">
                <div className="fc-progress-header">
                    <span>Monthly Progress</span>
                    <span className="fc-progress-fraction">
                        {monthWO} / {daysInMonth(year, month)} days
                    </span>
                </div>
                <div className="fc-progress-track">
                    <div
                        className="fc-progress-fill"
                        style={{ width: `${(monthWO / daysInMonth(year, month)) * 100}%` }}
                    />
                </div>
                <p className="fc-progress-hint">
                    {monthWO === 0
                        ? 'No workouts logged yet — click a day to start!'
                        : monthWO < 8
                            ? 'Keep going! Every rep counts.'
                            : monthWO < 16
                                ? 'Solid effort this month 💪'
                                : monthWO < 24
                                    ? 'Crushing it — you\'re building a real habit!'
                                    : 'Absolute beast mode! 🔥'}
                </p>
            </div>

            {/* Modal */}
            {modal && (
                <DayModal
                    dateStr={modal}
                    entry={data[modal]}
                    onClose={() => setModal(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
