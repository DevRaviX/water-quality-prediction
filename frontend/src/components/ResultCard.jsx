import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ResultCard = ({ result, reset }) => {
    const isSafe = result.is_potable;
    const explanation = result.explanation || [];
    const topFeatures = explanation.slice(0, 5);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className={`result-card ${isSafe ? 'safe' : 'unsafe'}`}
        >
            <div className="icon-wrapper">
                {isSafe ? <CheckCircle size={64} /> : <XCircle size={64} />}
            </div>
            <h2>{isSafe ? 'Water is Safe' : 'Not Potable'}</h2>
            <p className="confidence">Confidence Score: {(result.potability_score * 100).toFixed(1)}%</p>
            <p className="threshold-info">Threshold used: {result.threshold_used}</p>

            {explanation.length > 0 && (
                <div className="explanation-section" style={{ marginTop: '1.5rem', width: '100%' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', opacity: 0.9 }}>Top Contributing Factors</h3>
                    <div style={{ height: '200px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topFeatures} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="feature"
                                    type="category"
                                    width={100}
                                    tick={{ fill: '#e2e8f0', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                    <p style={{ margin: 0, fontWeight: '600', color: '#f8fafc' }}>{data.feature}</p>
                                                    <p style={{ margin: '0.25rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>Value: {data.value.toFixed(2)}</p>
                                                    <p style={{ margin: 0, fontWeight: '500', color: data.contribution > 0 ? '#4ade80' : '#f87171' }}>
                                                        Impact: {data.contribution > 0 ? '+' : ''}{data.contribution.toFixed(4)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="contribution" radius={[2, 2, 2, 2]}>
                                    {topFeatures.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? '#4ade80' : '#f87171'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <button onClick={reset} className="reset-btn">Test Another Sample</button>
        </motion.div>
    );
};

export default ResultCard;
