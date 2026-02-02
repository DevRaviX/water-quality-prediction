
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

    // Parse value for logic, handle empty string
    const numVal = parseFloat(value);
    const isOutOfRange = (value !== '') && range && (numVal < range.min || numVal > range.max);

    // Display Logic: Round on blur (View Mode), Raw on focus (Edit Mode)
    const displayValue = isFocused || value === '' ? value : parseFloat(value).toFixed(2);

    return (
        <div className="input-group">
            <div className="label-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor={name} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                    {name.replace('_', ' ')}
                </label>
                <div
                    title={tooltip}
                    className="info-icon"
                    onClick={() => setShowInfo(!showInfo)}
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    <Info size={14} className={showInfo ? "text-blue-400" : ""} />
                    {showInfo && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '20px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            padding: '12px',
                            borderRadius: '8px',
                            width: '200px',
                            zIndex: 10,
                            fontSize: '0.8rem',
                            color: '#e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
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
                        paddingRight: units[name] ? '60px' : '15px', // Make room for unit
                        borderColor: isOutOfRange ? 'var(--unsafe)' : 'var(--card-border)',
                        background: 'rgba(0, 0, 0, 0.2)',
                        color: 'white'
                    }}
                />

                {/* Unit Adornment */}
                {units[name] && (
                    <span style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'rgba(255, 255, 255, 0.3)',
                        fontSize: '0.85rem',
                        pointerEvents: 'none',
                        fontFamily: 'JetBrains Mono',
                        fontWeight: '500'
                    }}>
                        {units[name]}
                    </span>
                )}
            </div>

            {/* Validation / Ref Text Morphing */}
            <div style={{
                marginTop: '6px',
                minHeight: '20px',
                display: 'flex',
                fontSize: '0.75rem',
                justifyContent: 'flex-end'
            }}>
                {isOutOfRange ? (
                    <span style={{ color: 'var(--unsafe)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> High ({'>'} {range?.max} {units[name]})
                    </span>
                ) : (
                    range && <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                        Ref: {range.label}
                    </span>
                )}
            </div>
        </div>
    );
};
