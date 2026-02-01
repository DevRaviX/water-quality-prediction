import { useEffect, useState } from 'react';
import { getModelStats } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

const StatsDashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        getModelStats().then(setStats).catch(console.error);
    }, []);

    if (!stats) return <div className="loading">Loading Analytics...</div>;

    const phData = [
        { name: 'R2 Score', value: stats.r2_score * 100, color: '#4ade80' },
        { name: 'Target', value: 80, color: '#94a3b8' } // Baseline comparison
    ];

    const modelData = [
        { name: 'Recall', value: stats.recall_optimized * 100, color: '#3b82f6' },
        { name: 'Baseline', value: 65, color: '#94a3b8' } // Approximate baseline recall
    ];

    return (
        <div className="dashboard-container">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="stat-card feature-card"
            >
                <h3>pH Forecasting Model</h3>
                <div className="stat-value">{(stats.r2_score * 100).toFixed(1)}%</div>
                <div className="stat-label">Accuracy (R2 Score)</div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={phData} layout="vertical">
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#fff' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                {phData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
            >
                <h3>Classification Model</h3>
                <div className="stat-row">
                    <div>
                        <div className="stat-value">{(stats.recall_optimized * 100).toFixed(1)}%</div>
                        <div className="stat-label">Optimized Recall</div>
                    </div>
                </div>
                <div className="stat-row">
                    <div>
                        <div className="stat-value" style={{ fontSize: '1.8rem' }}>{stats.model_name}</div>
                        <div className="stat-label">Algorithm</div>
                    </div>
                </div>
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={modelData}>
                            <XAxis dataKey="name" tick={{ fill: '#fff' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                {modelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="stat-card"
                style={{ gridColumn: 'span 2' }}
            >
                <h3>Global Feature Importance (SHAP)</h3>
                <div className="chart-wrapper" style={{ height: '300px' }}>
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
                                tick={{ fill: '#e2e8f0' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f8fafc' }}
                            />
                            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={25}>
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
