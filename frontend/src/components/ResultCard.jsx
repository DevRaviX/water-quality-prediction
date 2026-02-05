import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ResultCard = ({ result, reset }) => {
    const isSafe = result.is_potable;
    const explanation = result.explanation || [];
    const topFeatures = explanation.slice(0, 5);

    // Score Recalibration Logic (Psychological UX)
    // Threshold (e.g., 0.35) should always effectively be "50%" to the user.
    // If Score < Threshold: Normalized = (Score / Threshold) * 50
    // If Score >= Threshold: Normalized = 50 + ((Score - Threshold) / (1 - Threshold) * 50)
    const rawScore = result.potability_score;
    const threshold = result.threshold_used || 0.35; // Default if missing

    let displayScore;
    if (rawScore < threshold) {
        displayScore = (rawScore / threshold) * 50;
    } else {
        displayScore = 50 + ((rawScore - threshold) / (1 - threshold)) * 50;
    }

    // Determine dominant factors for caption
    const positiveFactors = topFeatures.filter(f => f.contribution > 0).map(f => f.feature);
    const negativeFactors = topFeatures.filter(f => f.contribution < 0).map(f => f.feature);

    let caption = "The water quality analysis is inconclusive.";
    if (isSafe) {
        if (negativeFactors.length > 0) {
            caption = `Although ${negativeFactors.slice(0, 2).join(' and ')} negatively impacted the score, the overall quality remains within safe limits.`;
        } else {
            caption = "All major quality indicators suggest this water is safe for consumption.";
        }
    } else {
        if (positiveFactors.length > 0) {
            caption = `Despite good levels of ${positiveFactors.slice(0, 2).join(' and ')}, the ${negativeFactors[0]} levels make this unsafe.`;
        } else {
            caption = "Multiple critical quality parameters exceed safe limits.";
        }
    }

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

            {/* Display Recalibrated Score */}
            <p className="confidence font-mono" title={`Raw Model Probability: ${(rawScore * 100).toFixed(1)}%`}>
                Confidence Score: {displayScore.toFixed(1)}%
            </p>
            <p className="threshold-info">Based on optimized threshold: {threshold}</p>

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
                                    width={140}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div style={{ backgroundColor: 'var(--card-bg)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--card-border)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--text)' }}>{data.feature}</p>
                                                    <p style={{ margin: '0.25rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Value: {data.value.toFixed(2)}</p>
                                                    <p style={{ margin: 0, fontWeight: '500', color: data.contribution > 0 ? 'var(--safe)' : 'var(--unsafe)' }}>
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
                                        <Cell key={`cell-${index}`} fill={entry.contribution > 0 ? 'var(--safe)' : 'var(--unsafe)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Dynamic Caption */}
                    <p style={{
                        marginTop: '15px',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        lineHeight: '1.5',
                        borderTop: '1px solid var(--card-border)',
                        paddingTop: '10px'
                    }}>
                        {caption}
                    </p>
                </div>
            )}

            <button onClick={reset} className="reset-btn">Test Another Sample</button>
        </motion.div>
    );
};

export default ResultCard;
