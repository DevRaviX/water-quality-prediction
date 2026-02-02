import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label, PieChart, Pie, Cell } from 'recharts';
import { FileText, Ruler, AlertTriangle, Loader2, ArrowRight, Activity, Percent, Layers } from 'lucide-react';

import { API_BASE_URL } from '../../api';

const ExplorationStep = ({ sessionId, onNext }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/datalab/eda/${sessionId}`);
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
        <div className="eda-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <StatCard icon={FileText} label="Total Rows" value={data.total_rows} />
                <StatCard icon={Ruler} label="Features" value={data.total_columns - 1} />
                <StatCard
                    icon={AlertTriangle}
                    label="Missing Values"
                    value={Object.values(data.null_counts).reduce((a, b) => a + b, 0)}
                    color={Object.values(data.null_counts).reduce((a, b) => a + b, 0) > 0 ? 'var(--unsafe)' : 'var(--safe)'}
                />
                <StatCard
                    icon={Percent}
                    label="Potability Rate"
                    value={`${data.class_distribution.find(d => d.label === "1")?.percentage || 0}%`}
                    color="var(--accent)"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                {/* Correlation Heatmap */}
                <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Layers className="text-blue-400" size={20} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Feature Correlations</h3>
                    </div>
                    <CorrelationHeatmap data={data.correlation_matrix} columns={data.columns} />
                </div>

                {/* Class Distribution */}
                <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <Activity className="text-purple-400" size={20} />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Target Distribution</h3>
                    </div>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ClassDistribution data={data.class_distribution} />
                    </div>
                </div>
            </div>

            {/* Feature Spread / Outliers */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--primary)', paddingLeft: '10px' }}>Feature Spread & Outliers</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {Object.entries(data.boxplot_data).map(([col, stats]) => (
                        <BoxplotCard key={col} col={col} stats={stats} />
                    ))}
                </div>
            </div>

            {/* Histograms */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderLeft: '4px solid var(--accent)', paddingLeft: '10px' }}>Sub-Feature Distributions</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '30px'
                }}>
                    {Object.entries(data.histograms).map(([col, histData]) => {
                        if (histData.length === 0 || col === data.target_col) return null;
                        return (
                            <div key={col} style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                                <h4 style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: '1rem' }}>{col}</h4>
                                <div style={{ height: '200px', width: '100%', minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={histData} margin={{ bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} height={50}>
                                                <Label value="Value Range" position="insideBottom" offset={0} fill="#94a3b8" fontSize={12} />
                                            </XAxis>
                                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} width={50}>
                                                <Label value="Count" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#94a3b8" fontSize={12} />
                                            </YAxis>
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

const ClassDistribution = ({ data }) => {
    const COLORS = ['#ef4444', '#22c55e'];
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="count"
                    label={({ label, percentage }) => `${label === "1" ? "Potable" : "Unsafe"} (${percentage}%)`}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                    formatter={(value, name, props) => [value, props.payload.label === "1" ? "Potable" : "Unsafe"]}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

const CorrelationHeatmap = ({ data, columns }) => {
    const displayCols = columns.slice(0, 9);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: `45px repeat(${displayCols.length}, 1fr)`,
                gap: '3px',
                padding: '10px'
            }}>
                <div />
                {displayCols.map(col => (
                    <div key={`h-${col}`} style={{
                        fontSize: '0.55rem',
                        color: 'var(--text-muted)',
                        transform: 'rotate(-45deg)',
                        transformOrigin: 'bottom left',
                        whiteSpace: 'nowrap',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        paddingLeft: '5px'
                    }}>
                        {col.slice(0, 6)}
                    </div>
                ))}

                {displayCols.map((colY, j) => (
                    <div key={`row-${colY}`} style={{ display: 'contents' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            {colY.slice(0, 6)}
                        </div>
                        {displayCols.map((colX, i) => {
                            const pair = data.find(p => p.x === colX && p.y === colY);
                            const val = pair ? pair.value : 0;
                            const isDiag = i === j;
                            const absV = Math.abs(val);
                            // Boosted contrast for low values
                            const opac = isDiag ? 1 : Math.max(0.15, absV);

                            return (
                                <div
                                    key={`${i}-${j}`}
                                    title={`${colX} x ${colY}: ${val.toFixed(3)}`}
                                    style={{
                                        aspectRatio: '1/1',
                                        background: isDiag
                                            ? 'var(--primary)'
                                            : val > 0
                                                ? `rgba(59, 130, 246, ${opac})`
                                                : `rgba(239, 68, 68, ${opac})`,
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.65rem',
                                        fontWeight: 'bold',
                                        color: opac > 0.6 ? 'white' : 'rgba(255,255,255,0.4)',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    {absV > 0.4 ? val.toFixed(1) : ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Positive Corel.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }} />
                    <span style={{ color: 'var(--text-muted)' }}>Negative Corel.</span>
                </div>
            </div>
        </div>
    );
};

const BoxplotCard = ({ col, stats }) => (
    <div style={{ background: 'var(--card-bg)', padding: '15px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-muted)' }}>{col}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '0.75rem' }}>
            <div>Median: <strong>{stats.median.toFixed(2)}</strong></div>
            <div>IQR Range: <strong>{stats.q1.toFixed(1)}-{stats.q3.toFixed(1)}</strong></div>
        </div>
        <div style={{
            marginTop: '10px',
            height: '6px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                left: '20%',
                right: '30%',
                top: 0,
                bottom: 0,
                background: 'var(--primary)',
                opacity: 0.3,
                borderRadius: '3px'
            }} />
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: stats.outlier_count > 0 ? 'var(--unsafe)' : 'var(--text-muted)' }}>
                Outliers: {stats.outlier_count} ({stats.outlier_percentage}%)
            </span>
        </div>
    </div>
);

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
