import { useEffect, useState } from 'react';
import { getModelStats } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

const StatsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [threshold, setThreshold] = useState(0.5);

    useEffect(() => {
        getModelStats().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="loading">Loading Analytics...</div>;

    // Simulate Precision-Recall Curve for interactivity
    const generateCurve = (t) => {
        const data = [];
        for (let i = 0; i <= 10; i++) {
            const r = i / 10;
            // Simulated simplified curve P = 1 - R^2
            const p = 1 - Math.pow(r, 2);
            data.push({
                recall: r,
                precision: p,
                threshold: i / 10,
                isCurrent: Math.abs((i / 10) - t) < 0.05
            });
        }
        return data;
    };

    const curveData = generateCurve(threshold);
    const currentPrecision = (1 - Math.pow(threshold, 2)).toFixed(2);
    const currentRecall = threshold.toFixed(2); // Simplified coupling

    return (
        <div className="dashboard-container">
            {/* Stat Cards - Top Row */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="stat-card"
            >
                <h3>
                    <TrendingUp size={20} style={{ color: 'var(--safe)' }} />
                    Classification Performance
                </h3>
                <div className="stat-value font-mono">0.60</div>
                <div className="stat-label flex items-center gap-2">
                    <span style={{ color: 'var(--safe)', background: 'var(--safe-bg)' }} className="px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <ArrowUpRight size={12} /> +28.6%
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>vs Logistic Regression</span>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
            >
                <h3>
                    <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                    Forecasting Accuracy
                </h3>
                <div className="stat-value font-mono">0.83</div>
                <div className="stat-label flex items-center gap-2">
                    <span style={{ color: 'var(--primary)', background: 'rgba(59, 130, 246, 0.1)' }} className="px-2 py-1 rounded text-xs font-bold">
                        R² Score
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>High Temporal Correlation</span>
                </div>
            </motion.div>

            {/* Interactive Threshold Plot */}
            <motion.div
                className="stat-card"
                style={{ gridColumn: 'span 2' }} // Span full width on desktop
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Decision Threshold Optimization</h3>
                    <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                        <div>Precision: <strong style={{ color: '#3b82f6' }}>{currentPrecision}</strong></div>
                        <div>Recall: <strong style={{ color: '#a855f7' }}>{currentRecall}</strong></div>
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        style={{ width: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                        <span>High Recall (Catch Unsafe)</span>
                        <span>Threshold: {threshold}</span>
                        <span>High Precision (Minimize False Alarms)</span>
                    </div>
                </div>

                <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={curveData}>
                            <defs>
                                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                            <XAxis dataKey="recall" label={{ value: 'Recall', position: 'insideBottom', offset: -5, fill: 'var(--text-muted)' }} tick={{ fill: 'var(--text-muted)' }} />
                            <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)' }} tick={{ fill: 'var(--text-muted)' }} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)' }} />
                            <ReferenceLine x={threshold} stroke="red" strokeDasharray="3 3" label={{ value: 'Current', fill: 'red', fontSize: 12 }} />
                            <Area type="monotone" dataKey="precision" stroke="var(--primary)" fill="url(#colorMetric)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Feature Importance (Bottom) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="stat-card"
                style={{ gridColumn: 'span 2' }}
            >
                <h3>Global Feature Importance (SHAP)</h3>
                <div className="chart-wrapper" style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={stats.feature_importance ? stats.feature_importance.slice(0, 7) : []}
                            layout="vertical"
                            margin={{ left: 20, right: 30, top: 20, bottom: 20 }}
                        >
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="feature"
                                type="category"
                                width={120}
                                tick={{ fill: 'var(--text-muted)' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--card-border)' }}
                                contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--text)' }}
                            />
                            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                                {stats.feature_importance && stats.feature_importance.slice(0, 7).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={'#f472b6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default StatsDashboard;
