import { useState } from 'react';
import { motion } from 'framer-motion';
import { predictWaterQuality, getRandomSample } from '../api';
import { Info, RefreshCw } from 'lucide-react';
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
            setFormData({
                ph: '7.0',
                Hardness: '200',
                Solids: '20000',
                Chloramines: '7.0',
                Sulfate: '300',
                Conductivity: '400',
                Organic_carbon: '10.0',
                Trihalomethanes: '60.0',
                Turbidity: '4.0'
            });
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
                <h2 style={{ margin: 0 }}>Water Parameters</h2>
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
                    {Object.keys(initialFormState).map((key) => (
                        <div key={key} className="input-group">
                            <div className="label-row">
                                <label htmlFor={key}>{key.replace('_', ' ')}</label>
                                <div title={tooltips[key]} className="info-icon">
                                    <Info size={14} />
                                </div>
                            </div>
                            <input
                                type="number"
                                name={key}
                                id={key}
                                step="any"
                                value={formData[key]}
                                onChange={handleChange}
                                required
                                placeholder="0.0"
                            />
                        </div>
                    ))}
                </div>

                {error && <p className="error-msg" style={{ color: 'var(--unsafe)', textAlign: 'center' }}>{error}</p>}

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Analyzing...' : 'Analyze Quality'}
                </motion.button>
            </form>

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
};

export default InputForm;
