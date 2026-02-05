import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictWaterQuality, getRandomSample } from '../api';
import { Info, RefreshCw, FlaskConical, Gauge, AlertTriangle, Droplet } from 'lucide-react';
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
    Organic_carbon: { min: 0, max: 4, label: "< 4 ppm" },
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

const SmartInput = ({ name, value, onChange, range, tooltip, disabled }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    const numVal = parseFloat(value);
    const isOutOfRange = (value !== '') && range && (numVal < range.min || numVal > range.max);

    // Determine status color class for Professional MVP
    let statusClass = "";
    if (value !== "" && range) {
        if (numVal >= range.min && numVal <= range.max) statusClass = "input-safe";
        else statusClass = "input-unsafe";
    }

    // Slider logic
    const handleSliderChange = (e) => {
        onChange({ target: { name, value: e.target.value } });
    };

    // If focused or empty, show raw. If blurred and valid number, show fixed(2).
    const displayValue = isFocused || value === '' ? value : parseFloat(value).toFixed(2);

    return (
        <div className="input-group">
            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor={name} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    {name.replace('_', ' ')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Integrated Reference Label */}
                    {range && (
                        <span style={{ fontSize: '0.7rem', color: isOutOfRange ? 'var(--unsafe)' : 'var(--text-muted)', opacity: isOutOfRange ? 1 : 0.6 }}>
                            {range.label}
                        </span>
                    )}
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
                    disabled={disabled}
                    className={`font-mono ${statusClass}`}
                    placeholder="0.00"
                    style={{
                        width: '100%',
                        padding: '12px',
                        paddingRight: units[name] ? '60px' : '15px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'white',
                        borderRadius: '12px',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        outline: 'none',
                        transition: 'all 0.2s',
                        borderColor: 'var(--card-border)'
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

            {/* Slider Widget: Only show if enabled and range exists */}
            {!disabled && range && (
                <div style={{ padding: '0 4px', marginTop: '5px' }}>
                    <input
                        type="range"
                        min={name === 'ph' ? 0 : 0}
                        max={name === 'ph' ? 14 : range.max * 1.5}
                        step={name === 'ph' ? 0.1 : 1}
                        value={value === '' ? (range.min + range.max) / 2 : value}
                        onChange={handleSliderChange}
                    />
                </div>
            )}
        </div>
    );
};

const InputGroup = ({ title, icon: Icon, color, fields, formData, handleChange, disabled }) => (
    <div className="input-group-card">
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
                    disabled={disabled}
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

    // IoT / Live Mode State
    const [liveMode, setLiveMode] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Simulate IoT Data Stream
    useEffect(() => {
        let interval;
        if (liveMode) {
            // Poll Backend for latest Sensor Data
            const pollSensorData = async () => {
                try {
                    // Update axios configuration in api.js to include this or direct fetch
                    const response = await fetch('http://127.0.0.1:8000/api/sensors/latest');
                    if (response.ok) {
                        const data = await response.json();
                        setIsConnected(true);
                        setFormData(data);
                    } else {
                        // If 404 (no data yet) or error, mark offline
                        setIsConnected(false);
                    }
                } catch (err) {
                    console.error("Sensor Poll Error:", err);
                    setIsConnected(false);
                }
            };

            // Immediate first check
            pollSensorData();

            // Poll every 1s (quicker for live feel)
            interval = setInterval(pollSensorData, 1000);

        } else {
            setIsConnected(false);
        }
        return () => clearInterval(interval);
    }, [liveMode]);

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
            console.error(err);
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

                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Live Mode Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Live Sensor</div>
                            <div className="live-badge">
                                <div className={`pulse-dot ${isConnected ? '' : 'offline'}`}></div>
                                {isConnected ? 'ONLINE' : 'OFFLINE'}
                            </div>
                        </div>
                        <div
                            className={`toggle-switch ${liveMode ? 'active' : ''}`}
                            onClick={() => setLiveMode(!liveMode)}
                        >
                            <div className="toggle-handle"></div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loadRandomSample}
                        className="sample-btn"
                        disabled={loadingSample || liveMode}
                        style={{ opacity: liveMode ? 0.5 : 1 }}
                    >
                        <RefreshCw size={14} className={loadingSample ? 'spin' : ''} style={{ animation: loadingSample ? 'spin 1s linear infinite' : 'none' }} />
                        {loadingSample ? 'Auto-Fill' : 'Auto-Fill Sample'}
                    </button>
                </div>
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
                        disabled={liveMode}
                    />
                    <InputGroup
                        title="Chemical Composition"
                        icon={FlaskConical}
                        color="#a855f7"
                        fields={['Sulfate', 'Chloramines', 'Hardness']}
                        formData={formData}
                        handleChange={handleChange}
                        disabled={liveMode}
                    />
                    <InputGroup
                        title="Contaminants"
                        icon={Droplet}
                        color="#ef4444"
                        fields={['Organic_carbon', 'Trihalomethanes']}
                        formData={formData}
                        handleChange={handleChange}
                        disabled={liveMode}
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
                        {loading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                <span>Analyzing Specimen...</span>
                            </div>
                        ) : 'Run Analysis'}
                    </motion.button>
                </div>
            </form>

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes pulse { 
            0% { transform: scale(1); opacity: 1; } 
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        
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
                padding: 16px !important;
                font-size: 16px !important;
            }
            .label-row {
                margin-bottom: 6px !important;
            }
            .submit-btn {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                width: 90% !important;
                max-width: none !important;
                z-index: 50;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                margin: 0 !important;
            }
            form {
                padding-bottom: 100px;
            }
        }
      `}</style>
        </div>
    );
};

export default InputForm;
