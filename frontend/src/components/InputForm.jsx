import { useState } from 'react';
import { motion } from 'framer-motion';
import { predictWaterQuality, getRandomSample } from '../api';
import { Info, RefreshCw, FlaskConical, Gauge, AlertTriangle, Droplet } from 'lucide-react'; // Added icons
import ResultCard from './ResultCard';

const initialFormState = {
    ph: '',
    Hardness: '',
    Solids: '',
    Chloramines: '',
    Sulfate: '',
    Conductivity: '',
    Organic_carbon: '',
    Trihalomethanes: '',
    Turbidity: ''
};

const tooltips = {
    ph: "Acidity or basicity (0-14). 7 is neutral.",
    Hardness: "Capacity of water to precipitate soap (mg/L).",
    Solids: "Total dissolved solids (ppm).",
    Chloramines: "Amount of Chloramines (ppm).",
    Sulfate: "Dissolved sulfates (mg/L).",
    Conductivity: "Electrical conductivity (μS/cm).",
    Organic_carbon: "Organic carbon content (ppm).",
    Trihalomethanes: "Chemicals found in water treated with chlorine (μg/L).",
    Turbidity: "Measure of light emitting property of water (NTU)."
};

const referenceRanges = {
    ph: { min: 6.5, max: 8.5, label: "6.5 - 8.5" },
    Hardness: { min: 60, max: 120, label: "60 - 120 mg/L" },
    Solids: { min: 50, max: 1000, label: "< 1000 ppm" },
    Chloramines: { min: 0, max: 4, label: "< 4 ppm" },
    Sulfate: { min: 0, max: 250, label: "< 250 mg/L" },
    Conductivity: { min: 0, max: 400, label: "< 400 μS/cm" },
    Organic_carbon: { min: 0, max: 4, label: "< 4 ppm" }, // Rough ref
    Trihalomethanes: { min: 0, max: 80, label: "< 80 μg/L" },
    Turbidity: { min: 0, max: 5, label: "< 5 NTU" }
};

const units = {
    ph: "",
    Hardness: "mg/L",
    Solids: "ppm",
    Chloramines: "ppm",
    Sulfate: "mg/L",
    Conductivity: "μS/cm",
    Organic_carbon: "ppm",
    Trihalomethanes: "μg/L",
    Turbidity: "NTU"
};

const SmartInput = ({ name, value, onChange, range, tooltip }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const numVal = parseFloat(value);
    const isOutOfRange = (value !== '') && range && (numVal < range.min || numVal > range.max);

    // If focused or empty, show raw. If blurred and valid number, show fixed(2).
    const displayValue = isFocused || value === '' ? value : parseFloat(value).toFixed(2);

    return (
        <div className="input-group">
            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor={name} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    {name.replace('_', ' ')}
                </label>
                <div
                    title="Click for details" // Fallback
                    className="info-icon"
                    onClick={() => setShowInfo(!showInfo)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <Info size={14} className={showInfo ? "text-blue-400" : ""} style={{ opacity: showInfo ? 1 : 0.5 }} />
                    {showInfo && (
                        <div style={{
                            position: 'absolute',
                            right: '-10px',
                            top: '24px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--card-border)',
                            padding: '12px',
                            borderRadius: '12px',
                            width: '220px',
                            zIndex: 50,
                            fontSize: '0.8rem',
                            color: '#e2e8f0',
                            textAlign: 'left',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                            lineHeight: '1.4'
                        }}>
                            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>{name}</strong>
                            {tooltip}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <input
                    type="number"
                    id={name}
                    name={name}
                    step="any"
                    value={displayValue}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="font-mono"
                    placeholder="0.00"
                    style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: units[name] ? '60px' : '15px',
                        borderColor: isOutOfRange ? 'var(--unsafe)' : 'var(--card-border)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        color: 'white',
                        borderRadius: '12px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                />

                {units[name] && (
                    <span style={{
                        position: 'absolute',
                        right: '16px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '0.8rem',
                        pointerEvents: 'none',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: '500'
                    }}>
                        {units[name]}
                    </span>
                )}
            </div>

            <div style={{
                marginTop: '6px',
                minHeight: '20px',
                display: 'flex',
                fontSize: '0.75rem',
                justifyContent: 'flex-end',
                textAlign: 'right'
            }}>
                {isOutOfRange ? (
                    <span style={{ color: 'var(--unsafe)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> High ({'>'} {range?.max} {units[name]})
                    </span>
                ) : (
                    range && <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
                        Ref: {range.label}
                    </span>
                )}
            </div>
        </div>
    );
};

const InputGroup = ({ title, icon: Icon, color, fields, formData, handleChange }) => (
    <div className="input-group-card" style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div style={{ background: `${color}20`, padding: '8px', borderRadius: '8px', color: color }}>
                <Icon size={20} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{title}</h3>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
            {fields.map(key => (
                <SmartInput
                    key={key}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    range={referenceRanges[key]}
                    tooltip={tooltips[key]}
                />
            ))}
        </div>
    </div>
);

const InputForm = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingSample, setLoadingSample] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const loadRandomSample = async () => {
        setLoadingSample(true);
        try {
            const sample = await getRandomSample();
            setFormData(sample);
        } catch (err) {
            console.error(err);
            // Fallback
            // Fallback: Generate random values within reference ranges
            const randomData = {};
            Object.keys(initialFormState).forEach(key => {
                const range = referenceRanges[key];
                if (range) {
                    const randomVal = Math.random() * (range.max - range.min) + range.min;
                    randomData[key] = randomVal.toFixed(2);
                } else {
                    randomData[key] = '0';
                }
            });
            setFormData(randomData);
        } finally {
            setLoadingSample(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const payload = Object.fromEntries(
                Object.entries(formData).map(([k, v]) => [k, parseFloat(v) || 0])
            );
            const data = await predictWaterQuality(payload);
            setResult(data);
        } catch (err) {
            setError('Failed to get prediction. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return <ResultCard result={result} reset={() => setResult(null)} />;
    }

    return (
        <div className="form-container">
            <div className="form-header">
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Water Lab</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Enter parameters to analyze potable status.</p>
                </div>
                <button
                    type="button"
                    onClick={loadRandomSample}
                    className="sample-btn"
                    disabled={loadingSample}
                >
                    <RefreshCw size={14} className={loadingSample ? 'spin' : ''} style={{ animation: loadingSample ? 'spin 1s linear infinite' : 'none' }} />
                    {loadingSample ? 'Loading...' : 'Auto-Fill Sample'}
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-grid">
                    <InputGroup
                        title="Physical Properties"
                        icon={Gauge}
                        color="#3b82f6"
                        fields={['ph', 'Turbidity', 'Solids', 'Conductivity']}
                        formData={formData}
                        handleChange={handleChange}
                    />
                    <InputGroup
                        title="Chemical Composition"
                        icon={FlaskConical}
                        color="#a855f7"
                        fields={['Sulfate', 'Chloramines', 'Hardness']}
                        formData={formData}
                        handleChange={handleChange}
                    />
                    <InputGroup
                        title="Contaminants"
                        icon={Droplet}
                        color="#ef4444"
                        fields={['Organic_carbon', 'Trihalomethanes']}
                        formData={formData}
                        handleChange={handleChange}
                    />
                </div>

                {error && <p className="error-msg" style={{ color: 'var(--unsafe)', textAlign: 'center', marginTop: '20px' }}>{error}</p>}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                        style={{ maxWidth: '400px' }}
                    >
                        {loading ? 'Analyzing...' : 'Run Analysis'}
                    </motion.button>
                </div>
            </form>

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
            .form-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
            
            .sample-btn {
                width: 100%;
                justify-content: center;
                padding: 12px;
                font-size: 0.95rem;
            }

            .input-group-card {
                padding: 16px !important;
            }
            
            .input-group input {
                padding: 16px !important; /* Larger touch target */
                font-size: 16px !important; /* Prevent iOS zoom */
            }
            
            .label-row {
                margin-bottom: 6px !important;
            }

            .submit-btn {
                position: fixed;
                bottom: 80px; /* Above nav if exists, or just bottom */
                left: 50%;
                transform: translateX(-50%);
                width: 90% !important;
                max-width: none !important;
                z-index: 50;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                margin: 0 !important;
            }
            
            /* Add padding to form to account for fixed button */
            form {
                padding-bottom: 100px;
            }
        }
      `}</style>
        </div>
    );
};

export default InputForm;
