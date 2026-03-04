import { CheckCircle2, Circle, GraduationCap, ArrowLeft, BookOpen } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'lcc_wealth_courses_v2';

const INITIAL_COURSES = [
    {
        id: 'how-to-get-rich',
        title: 'How to Get Rich',
        description: 'A step-by-step 6-week syllabus to automate your wealth and build your rich life.',
        weeks: [
            {
                week: 1,
                title: "Optimize Your Credit Cards",
                notes: "",
                tasks: [
                    { id: 'w1t1', text: "Check your credit score", completed: false },
                    { id: 'w1t2', text: "Set up automatic credit card payments", completed: false },
                    { id: 'w1t3', text: "Call credit card company to waive fees / lower APR", completed: false },
                ]
            },
            {
                week: 2,
                title: "Beat the Banks",
                notes: "",
                tasks: [
                    { id: 'w2t1', text: "Open a completely fee-free high-yield checking account", completed: false },
                    { id: 'w2t2', text: "Open a high-yield savings account", completed: false },
                    { id: 'w2t3', text: "Fund your new savings account with at least an initial deposit", completed: false },
                ]
            },
            {
                week: 3,
                title: "Get Ready to Invest",
                notes: "",
                tasks: [
                    { id: 'w3t1', text: "Open a retirement/investment account (e.g., TFSA or RA in SA)", completed: false },
                    { id: 'w3t2', text: "Fund the investment account", completed: false },
                    { id: 'w3t3', text: "Understand the difference between investing and speculating", completed: false },
                ]
            },
            {
                week: 4,
                title: "Conscious Spending",
                notes: "",
                tasks: [
                    { id: 'w4t1', text: "Track your spending for one month to find your baseline", completed: false },
                    { id: 'w4t2', text: "Categorize spending into Fixed Costs, Investments, Savings, and Guilt-Free Spending", completed: false },
                    { id: 'w4t3', text: "Ruthlessly cut costs on things you don't care about", completed: false },
                    { id: 'w4t4', text: "Spend extravagantly on the things you love", completed: false },
                ]
            },
            {
                week: 5,
                title: "Automate Your Infrastructure",
                notes: "",
                tasks: [
                    { id: 'w5t1', text: "Link all your accounts together (paycheck -> checking -> savings/investing)", completed: false },
                    { id: 'w5t2', text: "Set up an automatic money flow system for payday", completed: false },
                ]
            },
            {
                week: 6,
                title: "The Myth of Financial Expertise",
                notes: "",
                tasks: [
                    { id: 'w6t1', text: "Choose an automated, low-cost index fund or target-date fund", completed: false },
                    { id: 'w6t2', text: "Commit to ignoring the daily market news", completed: false },
                    { id: 'w6t3', text: "Set up automatic monthly contributions to your index fund", completed: false },
                ]
            },
        ]
    }
];

export default function Course() {
    const [courses, setCourses] = useState(INITIAL_COURSES);
    const [loading, setLoading] = useState(true);
    const [selectedCourseId, setSelectedCourseId] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_data')
            .select('value')
            .eq('key', STORAGE_KEY)
            .single();

        if (data && data.value) {
            setCourses(data.value);
        } else {
            // Check local storage for legacy data (migration)
            const savedLocal = localStorage.getItem(STORAGE_KEY);
            if (savedLocal) {
                const parsed = JSON.parse(savedLocal);
                setCourses(parsed);
                // Promptly push to DB
                await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: parsed });
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    // This handles all updates by persisting to Supabase
    const persistUpdates = async (newCourses) => {
        setCourses(newCourses);
        const { error } = await supabase.from('user_data').upsert({ key: STORAGE_KEY, value: newCourses });
        if (error) console.error('Error saving course progress:', error.message);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCourses));
    };

    const toggleTask = (weekIndex, taskId) => {
        if (!selectedCourseId) return;
        const newCourses = [...courses];
        const courseIndex = newCourses.findIndex(c => c.id === selectedCourseId);
        const task = newCourses[courseIndex].weeks[weekIndex].tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            persistUpdates(newCourses);
        }
    };

    const updateNotes = (weekIndex, text) => {
        if (!selectedCourseId) return;
        const newCourses = [...courses];
        const courseIndex = newCourses.findIndex(c => c.id === selectedCourseId);
        newCourses[courseIndex].weeks[weekIndex].notes = text;
        persistUpdates(newCourses);
    };

    // Course List View
    if (!selectedCourseId) {
        return (
            <div className="fade-in">
                <header className="mb-8">
                    <h1>Courses</h1>
                    <p>Interactive action plans and syllabuses to level up your wealth.</p>
                </header>
                <div className="dashboard-grid">
                    {courses.map(course => {
                        const totalTasks = course.weeks.reduce((acc, week) => acc + week.tasks.length, 0);
                        const completedTasks = course.weeks.reduce((acc, week) => acc + week.tasks.filter(t => t.completed).length, 0);
                        const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

                        return (
                            <div key={course.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid var(--border-glass)' }} onClick={() => setSelectedCourseId(course.id)} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-wealth)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-glass)'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'var(--color-wealth-bg)', borderRadius: '8px', color: 'var(--color-wealth)' }}>
                                        <GraduationCap size={24} />
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{course.title}</h2>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', minHeight: '40px' }}>{course.description}</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    <span>Progress</span>
                                    <span style={{ color: 'var(--color-wealth)', fontWeight: '600' }}>{progressPercent}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-wealth)' }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Individual Course View
    const totalTasks = activeCourse.weeks.reduce((acc, week) => acc + week.tasks.length, 0);
    const completedTasks = activeCourse.weeks.reduce((acc, week) => acc + week.tasks.filter(t => t.completed).length, 0);
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="fade-in">
            <header className="mb-8">
                <button
                    onClick={() => setSelectedCourseId(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: 0, marginBottom: '1rem' }}
                >
                    <ArrowLeft size={16} /> Back to Courses
                </button>
                <h1>{activeCourse.title}</h1>
                <p>{activeCourse.description}</p>
            </header>

            <div className="card mb-8">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <GraduationCap className="text-wealth" size={24} />
                        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Course Progress</h2>
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '1.2rem', color: 'var(--color-wealth)' }}>{progressPercent}% Complete</span>
                </div>

                <div style={{ width: '100%', height: '12px', background: 'var(--bg-dark)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--color-wealth)', transition: 'width 0.5s ease-out' }}></div>
                </div>
            </div>

            <div className="dashboard-grid">
                {activeCourse.weeks.map((week, wIndex) => {
                    const isWeekComplete = week.tasks.every(t => t.completed);

                    return (
                        <div key={week.week} className="card" style={{ opacity: isWeekComplete ? 0.7 : 1, transition: 'all 0.3s ease' }}>
                            <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)' }}>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-wealth)' }}>Week {week.week}</span>
                                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem', textDecoration: isWeekComplete ? 'line-through' : 'none' }}>{week.title}</h2>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {week.tasks.map(task => (
                                    <li
                                        key={task.id}
                                        onClick={() => toggleTask(wIndex, task.id)}
                                        style={{
                                            display: 'flex',
                                            gap: '0.75rem',
                                            alignItems: 'flex-start',
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            background: task.completed ? 'var(--bg-card-hover)' : 'transparent',
                                        }}
                                    >
                                        <div style={{ marginTop: '2px' }}>
                                            {task.completed ?
                                                <CheckCircle2 size={18} className="text-wealth" /> :
                                                <Circle size={18} color="var(--text-muted)" />
                                            }
                                        </div>
                                        <span style={{
                                            fontSize: '0.95rem',
                                            color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            transition: 'all 0.2s ease'
                                        }}>
                                            {task.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* Notes Section for the Week */}
                            <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                                    <BookOpen size={16} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Week {week.week} Notes & Progress</span>
                                </div>
                                <textarea
                                    placeholder="Write down your thoughts, wins, and roadblocks for this week..."
                                    rows={3}
                                    value={week.notes || ""}
                                    onChange={(e) => updateNotes(wIndex, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-glass)',
                                        background: 'var(--bg-dark)',
                                        color: 'white',
                                        resize: 'vertical',
                                        fontSize: '0.9rem'
                                    }}
                                ></textarea>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
