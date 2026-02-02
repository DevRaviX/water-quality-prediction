import { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, CheckCircle, Award, Target, Loader2, RefreshCw, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TrainingStep = ({ sessionId }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrain = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/api/datalab/train/${sessionId}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
            setError('Model training failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!results && !loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                }}>
                    <BrainCircuit size={48} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Ready to Train?</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                    We will train a Random Forest classifier on your cleaned dataset.
                </p>
                <button
                    onClick={handleTrain}
                    className="submit-btn"
                    style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                    Start Training
                </button>
                {error && <p style={{ color: 'var(--unsafe)', marginTop: '20px' }}>{error}</p>}
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '1.5rem' }}>Training Model...</h2>
                <p style={{ color: 'var(--text-muted)' }}>This usually takes a few seconds.</p>
            </div>
        );
    }

    // Display Results
    return (
        <div className="training-results" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <CheckCircle className="text-green-500" /> Training Complete!
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Target Variable: <span className="text-blue-400 font-mono">{results.target}</span></p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <MetricCard icon={Award} label="Accuracy" value={results.accuracy} color="var(--primary)" />
                <MetricCard icon={Target} label="F1 Score" value={results.f1_score} color="var(--accent)" />
                <MetricCard icon={CheckCircle} label="Precision" value={results.precision} color="#8b5cf6" />
                <MetricCard icon={BrainCircuit} label="Recall" value={results.recall} color="#ec4899" />
                <MetricCard icon={Activity} label="AUC Score" value={results.auc_score} color="#eab308" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                {/* ROC Curve */}
                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>ROC Curve (TPR vs FPR)</h3>
                    <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.roc_curve}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="fpr" type="number" domain={[0, 1]} tick={{ fill: '#94a3b8' }} label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} />
                                <YAxis dataKey="tpr" type="number" domain={[0, 1]} tick={{ fill: '#94a3b8' }} label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                                <Line type="monotone" dataKey="tpr" stroke="var(--primary)" strokeWidth={3} dot={false} />
                                {/* Diagonal random guess line */}
                                <Line type="monotone" dataKey="fpr" stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" dot={false} strokeWidth={1} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Confusion Matrix */}
                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Confusion Matrix</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '2px',
                        background: 'var(--card-border)',
                        padding: '2px',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}>
                        {results.confusion_matrix.map((row, i) => (
                            row.map((cell, j) => (
                                <div key={`${i}-${j}`} style={{
                                    background: 'rgba(30, 41, 59, 1)',
                                    padding: '20px',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{cell}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {i === 0 ? 'Actual Neg' : 'Actual Pos'} / {j === 0 ? 'Pred Neg' : 'Pred Pos'}
                                    </span>
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                {/* Feature Importance */}
                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Top Logic Drivers</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results.feature_importance} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="feature" type="category" width={100} tick={{ fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                                <Bar dataKey="importance" fill="var(--primary)" radius={[0, 4, 4, 0]}>
                                    {results.feature_importance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${1 - index * 0.15})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                    onClick={() => setResults(null)}
                    style={{
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--card-border)',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <RefreshCw size={18} /> Retrain Model
                </button>
            </div>
        </div>
    );
};

const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        background: 'var(--card-bg)',
        padding: '25px',
        borderRadius: '16px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    }}>
        <div style={{ background: `${color}20`, padding: '15px', borderRadius: '12px', color }}>
            <Icon size={32} />
        </div>
        <div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(value * 100).toFixed(1)}%</div>
        </div>
    </div>
);

export default TrainingStep;
