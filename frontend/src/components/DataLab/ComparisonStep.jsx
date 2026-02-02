import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Label } from 'recharts';

import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

import { API_BASE_URL } from '../../api';

const ComparisonStep = ({ sessionId, onNext, onBack }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/datalab/compare/${sessionId}`);
                setData(res.data.comparisons);
            } catch (err) {
                console.error(err);
                setError('Failed to load comparison data.');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) fetchData();
    }, [sessionId]);

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /> Loading...</div>;

    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="comparison-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Review Changes</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Compare the data distribution before and after cleaning.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '30px',
                marginBottom: '40px'
            }}>
                {Object.entries(data).map(([col, chartData]) => {
                    // Calculate Impact (Distribution Shift)
                    const totalSamples = chartData.reduce((acc, bin) => acc + bin.Raw, 0);
                    const movedSamples = chartData.reduce((acc, bin) => acc + Math.abs(bin.Raw - bin.Cleaned), 0) / 2;
                    const shift = totalSamples > 0 ? (movedSamples / totalSamples) * 100 : 0;

                    let impactLabel = 'Low';
                    let impactColor = 'var(--safe)';
                    if (shift > 5) { impactLabel = 'Medium'; impactColor = 'var(--primary)'; }
                    if (shift > 15) { impactLabel = 'High'; impactColor = 'var(--unsafe)'; }

                    return (
                        <div key={col} className="glass-panel" style={{
                            padding: '20px',
                            borderRadius: '16px',
                            position: 'relative'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h4 style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>
                                    {col} distribution
                                </h4>
                                <div style={{
                                    background: `${impactColor}20`,
                                    color: impactColor,
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    border: `1px solid ${impactColor}40`
                                }}>
                                    {impactLabel} Impact ({shift.toFixed(1)}%)
                                </div>
                            </div>
                            <div style={{ height: '220px', width: '100%', minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} height={50}>
                                            <Label value="Value Range" position="insideBottom" offset={0} fill="#94a3b8" fontSize={12} />
                                        </XAxis>
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={50}>
                                            <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#94a3b8" fontSize={12} />
                                        </YAxis>
                                        <Tooltip
                                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="Raw" fill="var(--text-muted)" name="Before (Raw)" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Cleaned" fill="var(--safe)" name="After (Cleaned)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--card-border)',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <ArrowLeft size={18} /> Back to Cleaning
                </button>
                <button
                    onClick={onNext}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}
                >
                    Confirm & Train Model <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default ComparisonStep;
