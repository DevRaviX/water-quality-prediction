import { useState } from 'react';
import axios from 'axios';
import { BrainCircuit, CheckCircle, Award, Target, Loader2, RefreshCw, Activity, Rocket, Download, Terminal, X, Settings, History, ChevronRight } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Label, Legend } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TrainingStep = ({ sessionId }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDeployModal, setShowDeployModal] = useState(false);

    const [config, setConfig] = useState({ model_type: 'Random Forest', params: { n_estimators: 100 } });
    const [runHistory, setRunHistory] = useState([]);

    const handleTrain = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/api/datalab/train/${sessionId}`, config);
            setResults(res.data);
            if (res.data.history) {
                setRunHistory(res.data.history);
            }
        } catch (err) {
            console.error(err);
            setError('Model training failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!results && !loading) {
        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Model Studio</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Configure your training parameters and track experiments.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', alignItems: 'start' }}>
                    {/* Left: Configuration */}
                    <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <Settings className="text-blue-400" size={20} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Configuration</h3>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Model Algorithm</label>
                            <select
                                value={config.model_type}
                                onChange={(e) => setConfig({ ...config, model_type: e.target.value, params: {} })}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    background: '#0f172a',
                                    border: '1px solid var(--card-border)',
                                    color: 'white',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="Random Forest">Random Forest (Robust)</option>
                                <option value="Gradient Boosting">Gradient Boosting (High Performance)</option>
                                <option value="Logistic Regression">Logistic Regression (Interpretable)</option>
                            </select>
                        </div>

                        {/* Dynamic Params */}
                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '25px' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px', color: 'var(--text-muted)' }}>Hyperparameters</h4>

                            {config.model_type === 'Random Forest' && (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Trees (n_estimators)</label>
                                        <input
                                            type="number"
                                            value={config.params.n_estimators || 100}
                                            onChange={(e) => setConfig({ ...config, params: { ...config.params, n_estimators: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Max Depth</label>
                                        <select
                                            value={config.params.max_depth || "None"}
                                            onChange={(e) => setConfig({ ...config, params: { ...config.params, max_depth: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        >
                                            <option value="None">None (Unlimited)</option>
                                            <option value="10">10 (Prevent Overfitting)</option>
                                            <option value="20">20</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {config.model_type === 'Gradient Boosting' && (
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Estimators</label>
                                        <input
                                            type="number"
                                            value={config.params.n_estimators || 100}
                                            onChange={(e) => setConfig({ ...config, params: { ...config.params, n_estimators: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Learning Rate</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={config.params.learning_rate || 0.1}
                                            onChange={(e) => setConfig({ ...config, params: { ...config.params, learning_rate: e.target.value } })}
                                            style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {config.model_type === 'Logistic Regression' && (
                                <div>
                                    <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '5px' }}>Regularization (C)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={config.params.C || 1.0}
                                        onChange={(e) => setConfig({ ...config, params: { ...config.params, C: e.target.value } })}
                                        style={{ width: '100%', padding: '8px', borderRadius: '6px', background: '#1e293b', border: '1px solid #334155', color: 'white' }}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleTrain}
                            className="submit-btn"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px' }}
                        >
                            Start Training <BrainCircuit size={18} />
                        </button>
                    </div>

                    {/* Right: History */}
                    <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--card-border)', minHeight: '400px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <History className="text-purple-400" size={20} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Run History</h3>
                        </div>

                        {runHistory.length === 0 ? (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '40px' }}>
                                <p style={{ marginBottom: '10px' }}>No runs yet.</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Train a model to see your experiment history here.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {runHistory.map((run, idx) => (
                                    <div key={idx} style={{
                                        padding: '12px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        borderLeft: idx === runHistory.length - 1 ? '3px solid var(--primary)' : '3px solid transparent'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{run.model_type}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(run.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <span>Acc: <strong>{(run.metrics.accuracy * 100).toFixed(1)}%</strong></span>
                                            <span>AUC: <strong>{(run.metrics.auc * 100).toFixed(1)}%</strong></span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {error && <p style={{ color: 'var(--unsafe)', marginTop: '20px', textAlign: 'center' }}>{error}</p>}
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
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '15px',
                marginBottom: '40px'
            }}>
                <MetricCard icon={Award} label="Accuracy" value={results.accuracy} color="var(--primary)" />
                <MetricCard icon={Target} label="F1 Score" value={results.f1_score} color="var(--accent)" />
                <MetricCard icon={CheckCircle} label="Precision" value={results.precision} color="#8b5cf6" />
                <MetricCard icon={BrainCircuit} label="Recall" value={results.recall} color="#ec4899" />
                <MetricCard icon={Activity} label="AUC" value={results.auc_score} color="#eab308" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                {/* Confusion Matrix Heatmap */}
                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Confusion Matrix</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr 1fr',
                        gap: '10px',
                        alignItems: 'center',
                        justifyItems: 'center'
                    }}>
                        {/* Header Row */}
                        <div></div>
                        <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Pred Negative</div>
                        <div style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Pred Positive</div>

                        {/* Row 1: Actual Negative */}
                        <div style={{ fontWeight: '600', color: 'var(--text-muted)', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>Actual Neg</div>
                        <HeatmapCell
                            value={results.confusion_matrix[0][0]}
                            total={results.confusion_matrix.flat().reduce((a, b) => a + b, 0)}
                            type="good"
                            label="True Negative"
                        />
                        <HeatmapCell
                            value={results.confusion_matrix[0][1]}
                            total={results.confusion_matrix.flat().reduce((a, b) => a + b, 0)}
                            type="bad"
                            label="False Positive"
                        />

                        {/* Row 2: Actual Positive */}
                        <div style={{ fontWeight: '600', color: 'var(--text-muted)', transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>Actual Pos</div>
                        <HeatmapCell
                            value={results.confusion_matrix[1][0]}
                            total={results.confusion_matrix.flat().reduce((a, b) => a + b, 0)}
                            type="bad"
                            label="False Negative"
                        />
                        <HeatmapCell
                            value={results.confusion_matrix[1][1]}
                            total={results.confusion_matrix.flat().reduce((a, b) => a + b, 0)}
                            type="good"
                            label="True Positive"
                        />
                    </div>
                </div>

                {/* Threshold Tuning Curve */}
                <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Threshold Tuning</h3>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Precision vs Recall</div>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.threshold_curves}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="threshold"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    label={{ value: 'Decision Threshold', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 12 }}
                                />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Line type="monotone" dataKey="precision" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="recall" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="f1" stroke="#eab308" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ROC Curve */}
                {/* ROC Curve Polish */}
                <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>ROC Curve</h3>
                        <div style={{ background: 'var(--primary)15', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            AUC: {(results.auc_score * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div style={{ height: '300px', width: '100%', minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={results.roc_curve} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="fpr"
                                    type="number"
                                    domain={[0, 1]}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    height={50}
                                >
                                    <Label value="False Positive Rate" position="insideBottom" offset={0} fill="#94a3b8" fontSize={12} />
                                </XAxis>
                                <YAxis
                                    dataKey="tpr"
                                    type="number"
                                    domain={[0, 1]}
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    width={40}
                                >
                                    <Label value="True Positive Rate" angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fill: '#94a3b8', fontSize: 12 }} />
                                </YAxis>
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value, name) => [value.toFixed(3), name === 'tpr' ? 'True Positive Rate' : 'False Positive Rate']}
                                    labelFormatter={() => ''}
                                />
                                <Area type="monotone" dataKey="tpr" stroke="var(--primary)" fillOpacity={1} fill="url(#colorTpr)" strokeWidth={3} />
                                <Line type="monotone" dataKey="fpr" stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" dot={false} strokeWidth={1} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature Importance */}
                <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Top Logic Drivers</h3>
                    <div style={{ height: '250px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={results.feature_importance} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="feature" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} />
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



            {/* Actions Area */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px', marginBottom: '60px' }}>
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
                    <RefreshCw size={18} /> Retrain
                </button>

                <button
                    onClick={() => {
                        window.open(`${API_URL}/api/datalab/download_model/${sessionId}`, '_blank');
                    }}
                    style={{
                        background: 'var(--card-bg)',
                        color: 'var(--text)',
                        border: '1px solid var(--card-border)',
                        padding: '12px 24px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600'
                    }}
                >
                    <Download size={18} /> Download Model
                </button>

                <button
                    onClick={() => setShowDeployModal(true)}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 30px',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    <Rocket size={18} /> Deploy to API
                </button>
            </div>

            {/* Deploy Modal */}
            {
                showDeployModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}>
                        <div style={{
                            background: '#1e293b',
                            padding: '30px',
                            borderRadius: '16px',
                            width: '90%',
                            maxWidth: '600px',
                            border: '1px solid var(--card-border)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Rocket color="var(--primary)" /> Ready for Production
                                </h3>
                                <button
                                    onClick={() => setShowDeployModal(false)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                                Your model <strong>{sessionId.slice(0, 8)}...</strong> is staged and ready.
                                Use the following cURL command to make predictions via the REST API.
                            </p>

                            <div style={{
                                background: '#0f172a',
                                padding: '20px',
                                borderRadius: '8px',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                color: '#e2e8f0',
                                border: '1px solid #334155',
                                overflowX: 'auto'
                            }}>
                                <pre>{`curl -X POST ${API_URL}/api/predict \\
-H "Content-Type: application/json" \\
-d '{
    "ph": 7.2,
    "Hardness": 204.8,
    "Solids": 20791.3,
    "Chloramines": 7.3,
    "Sulfate": 368.5,
    "Conductivity": 564.3,
    "Organic_carbon": 10.3,
    "Trihalomethanes": 86.9,
    "Turbidity": 2.9
}'`}</pre>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`curl -X POST ${API_URL}/api/predict -H "Content-Type: application/json" -d '{"ph": 7.2}'`);
                                        alert('Copied to clipboard!');
                                    }}
                                    style={{
                                        background: 'var(--card-border)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Copy Snippet
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div style={{
        background: 'var(--card-bg)',
        padding: '15px 12px',
        borderRadius: '16px',
        border: '1px solid var(--card-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }}>
        <div style={{ background: `${color}15`, padding: '10px', borderRadius: '12px', color }}>
            <Icon size={24} />
        </div>
        <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{(value * 100).toFixed(1)}%</div>
        </div>
    </div>
);

const HeatmapCell = ({ value, total, type, label }) => {
    // Calculate intensity 0-1
    const intensity = Math.min(Math.max(value / total * 2, 0.1), 1); // Boost simple logic for demo

    // Green (Good) vs Red (Bad)
    const bg = type === 'good'
        ? `rgba(34, 197, 94, ${intensity})`
        : `rgba(239, 68, 68, ${intensity})`;

    return (
        <div style={{
            background: bg,
            width: '100%',
            height: '100px',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{value}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{label}</span>
        </div>
    );
};

export default TrainingStep;
