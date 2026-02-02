import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FileText, Ruler, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ExplorationStep = ({ sessionId, onNext }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/datalab/eda/${sessionId}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load analysis. Session might be expired.');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) {
            fetchData();
        }
    }, [sessionId]);

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Crunching the numbers...</p>
        </div>
    );

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--unsafe)' }}>
            <AlertTriangle size={48} style={{ marginBottom: '20px' }} />
            <p>{error}</p>
        </div>
    );

    if (!data) return null;

    return (
        <div className="eda-container">
            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <StatCard icon={FileText} label="Total Rows" value={data.total_rows} />
                <StatCard icon={Ruler} label="Features" value={data.total_columns} />
                <StatCard
                    icon={AlertTriangle}
                    label="Missing Values"
                    value={Object.values(data.null_counts).reduce((a, b) => a + b, 0)}
                    color={Object.values(data.null_counts).reduce((a, b) => a + b, 0) > 0 ? 'var(--unsafe)' : 'var(--safe)'}
                />
            </div>

            {/* Null Counts Section */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--primary)', paddingLeft: '10px' }}>Missing Values</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '10px'
                }}>
                    {Object.entries(data.null_counts).map(([col, count]) => (
                        <div key={col} style={{
                            background: 'var(--card-bg)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1px solid ${count > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--card-border)'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{col}</span>
                            <span style={{ fontWeight: 'bold', color: count > 0 ? 'var(--unsafe)' : 'var(--safe)' }}>{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Histograms */}
            <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--accent)', paddingLeft: '10px' }}>Distributions</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '30px'
                }}>
                    {Object.entries(data.histograms).map(([col, histData]) => {
                        if (histData.length === 0) return null;
                        return (
                            <div key={col} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '1rem' }}>{col}</h4>
                                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={histData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                            <Tooltip
                                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <button
                    onClick={onNext}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                    }}
                >
                    Proceed to Cleaning <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color = 'var(--text)' }) => (
    <div style={{
        background: 'var(--card-bg)',
        padding: '20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        border: '1px solid var(--card-border)'
    }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
            <Icon size={24} color="var(--primary)" />
        </div>
        <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color }}>{value}</div>
        </div>
    </div>
);

export default ExplorationStep;
