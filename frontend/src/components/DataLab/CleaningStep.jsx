import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wand2, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CleaningStep = ({ sessionId, onNext }) => {
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [strategies, setStrategies] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Fetch initial null counts
    useEffect(() => {
        const fetchNulls = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/datalab/eda/${sessionId}`);
                const nulls = res.data.null_counts;
                const colsWithNulls = Object.entries(nulls)
                    .filter(([_, count]) => count > 0)
                    .map(([col, count]) => ({ name: col, count }));

                setColumns(colsWithNulls);

                // Initialize default strategies (Median for numbers is usually safe)
                const defaults = {};
                colsWithNulls.forEach(c => defaults[c.name] = 'median');
                setStrategies(defaults);
            } catch (err) {
                setError('Failed to load data.');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId) fetchNulls();
    }, [sessionId]);

    const handleApply = async () => {
        setProcessing(true);
        setError(null);
        try {
            await axios.post(`${API_URL}/api/datalab/impute/${sessionId}`, strategies);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to apply cleaning strategies.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /> Loading...</div>;

    if (success) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <CheckCircle2 size={48} color="var(--safe)" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Data Cleaned Successfully!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    Your dataset is now ready for training.
                </p>
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    Proceed to Training <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    if (columns.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <CheckCircle2 size={48} color="var(--safe)" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No Missing Values!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    Your dataset is already clean. You can skip this step.
                </p>
                <button onClick={onNext} className="submit-btn" style={{ width: 'auto' }}>
                    Skip to Training
                </button>
            </div>
        );
    }

    return (
        <div className="cleaning-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '12px', borderRadius: '12px' }}>
                    <Wand2 size={28} color="var(--accent)" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Clean Your Data</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Found {columns.length} columns with missing values.</p>
                </div>
            </div>

            <div style={{ background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                            <th style={{ padding: '15px 20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Column</th>
                            <th style={{ padding: '15px 20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Missing Count</th>
                            <th style={{ padding: '15px 20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Imputation Strategy</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columns.map((col) => (
                            <tr key={col.name} style={{ borderTop: '1px solid var(--card-border)' }}>
                                <td style={{ padding: '15px 20px', fontWeight: '500' }}>{col.name}</td>
                                <td style={{ padding: '15px 20px', color: 'var(--unsafe)' }}>{col.count}</td>
                                <td style={{ padding: '15px 20px' }}>
                                    <select
                                        value={strategies[col.name]}
                                        onChange={(e) => setStrategies({ ...strategies, [col.name]: e.target.value })}
                                        style={{
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid var(--card-border)',
                                            color: 'white',
                                            padding: '8px 12px',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="median">Fill with Median</option>
                                        <option value="mean">Fill with Mean</option>
                                        <option value="mode">Fill with Mode</option>
                                        <option value="drop_row">Drop Rows</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {error && (
                <div style={{ marginTop: '20px', color: 'var(--unsafe)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} /> {error}
                </div>
            )}

            <button
                onClick={handleApply}
                disabled={processing}
                className="submit-btn"
                style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            >
                {processing ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                {processing ? 'Applying Changes...' : 'Apply Strategies'}
            </button>
        </div>
    );
};

export default CleaningStep;
