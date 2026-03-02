import { CheckCircle2, Circle, GraduationCap } from 'lucide-react';
import { useState, useEffect } from 'react';

const INITIAL_COURSE = [
    {
        week: 1,
        title: "Optimize Your Credit Cards",
        tasks: [
            { id: 'w1t1', text: "Check your credit score", completed: false },
            { id: 'w1t2', text: "Set up automatic credit card payments", completed: false },
            { id: 'w1t3', text: "Call credit card company to waive fees / lower APR", completed: false },
        ]
    },
    {
        week: 2,
        title: "Beat the Banks",
        tasks: [
            { id: 'w2t1', text: "Open a completely fee-free high-yield checking account", completed: false },
            { id: 'w2t2', text: "Open a high-yield savings account", completed: false },
            { id: 'w2t3', text: "Fund your new savings account with at least an initial deposit", completed: false },
        ]
    },
    {
        week: 3,
        title: "Get Ready to Invest",
        tasks: [
            { id: 'w3t1', text: "Open a retirement/investment account (e.g., TFSA or RA in SA)", completed: false },
            { id: 'w3t2', text: "Fund the investment account", completed: false },
            { id: 'w3t3', text: "Understand the difference between investing and speculating", completed: false },
        ]
    },
    {
        week: 4,
        title: "Conscious Spending",
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
        tasks: [
            { id: 'w5t1', text: "Link all your accounts together (paycheck -> checking -> savings/investing)", completed: false },
            { id: 'w5t2', text: "Set up an automatic money flow system for payday", completed: false },
        ]
    },
    {
        week: 6,
        title: "The Myth of Financial Expertise",
        tasks: [
            { id: 'w6t1', text: "Choose an automated, low-cost index fund or target-date fund", completed: false },
            { id: 'w6t2', text: "Commit to ignoring the daily market news", completed: false },
            { id: 'w6t3', text: "Set up automatic monthly contributions to your index fund", completed: false },
        ]
    },
];

export default function Course() {
    const [courseData, setCourseData] = useState(() => {
        return JSON.parse(localStorage.getItem('lcc_wealth_course')) || INITIAL_COURSE;
    });

    useEffect(() => {
        localStorage.setItem('lcc_wealth_course', JSON.stringify(courseData));
    }, [courseData]);

    const toggleTask = (weekIndex, taskId) => {
        const newData = [...courseData];
        const task = newData[weekIndex].tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            setCourseData(newData);
        }
    };

    // Calculate overall progress
    const totalTasks = courseData.reduce((acc, week) => acc + week.tasks.length, 0);
    const completedTasks = courseData.reduce((acc, week) => acc + week.tasks.filter(t => t.completed).length, 0);
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
        <div className="fade-in">
            <header className="mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Action Plan: How to Get Rich</h1>
                    <p>A step-by-step 6-week syllabus to automate your wealth and build your rich life.</p>
                </div>
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
                {courseData.map((week, wIndex) => {
                    const isWeekComplete = week.tasks.every(t => t.completed);

                    return (
                        <div key={week.week} className="card" style={{ opacity: isWeekComplete ? 0.7 : 1, transition: 'all 0.3s ease' }}>
                            <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-glass)' }}>
                                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--color-wealth)' }}>Week {week.week}</span>
                                <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.2rem', textDecoration: isWeekComplete ? 'line-through' : 'none' }}>{week.title}</h2>
                            </div>

                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
