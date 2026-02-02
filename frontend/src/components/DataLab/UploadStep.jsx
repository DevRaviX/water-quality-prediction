import { useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

// Use same base URL logic as api.js (assuming simple axios call for now or importing instance)
import { API_BASE_URL } from '../../api';

const UploadStep = ({ onSessionCreated }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    const [previewData, setPreviewData] = useState(null);
    const [tempSessionId, setTempSessionId] = useState(null);

    const fetchPreview = async (sessionId) => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/datalab/preview/${sessionId}`);
            setPreviewData(res.data);
            setTempSessionId(sessionId);
        } catch (err) {
            console.error("Preview fetch failed", err);
            // Show error but allow manual continue
            setError("Could not load preview. You can still proceed.");
            setTempSessionId(sessionId); // Allow continue even if preview fails
        }
    };

    const handleUpload = async (file) => {
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            setError('Please upload a CSV file.');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/datalab/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.session_id) {
                await fetchPreview(res.data.session_id);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleUseSample = async () => {
        setIsUploading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/datalab/use_sample`);
            if (res.data.session_id) {
                await fetchPreview(res.data.session_id);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Failed to load sample data.');
        } finally {
            setIsUploading(false);
        }
    };

    if (previewData && tempSessionId) {
        return (
            <div className="upload-container" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '1rem', fontWeight: '600' }}>Data Preview</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Here are the first 5 rows. Does this look right?
                </p>

                <div style={{
                    overflowX: 'auto',
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: '1px solid var(--card-border)',
                    marginBottom: '30px'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--card-border)' }}>
                                {previewData.columns.map(col => (
                                    <th key={col} style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {previewData.rows.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    {row.map((cell, j) => (
                                        <td key={j} style={{ padding: '12px' }}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <button
                        onClick={() => { setPreviewData(null); setTempSessionId(null); }}
                        style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--card-border)',
                            padding: '12px 24px',
                            borderRadius: '30px',
                            cursor: 'pointer'
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={() => onSessionCreated(tempSessionId, "Current Dataset")}
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
                            gap: '8px'
                        }}
                    >
                        Confirm & Analyze <FileText size={18} />
                    </button>
                </div>
            </div>
        );
    }

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleUpload(file);
    };

    return (
        <div className="upload-container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: '600' }}>Upload your Dataset</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Upload a CSV file to analyze, clean, and train a custom model.
            </p>

            <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                style={{
                    border: '2px dashed var(--card-border)',
                    borderRadius: '16px',
                    padding: '30px 20px',
                    background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--card-bg)',
                    borderColor: isDragging ? 'var(--primary)' : 'var(--card-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
                onClick={() => document.getElementById('file-upload').click()}
            >
                <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    style={{ display: 'none' }}
                    onChange={(e) => handleUpload(e.target.files[0])}
                />

                {isUploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
                        <p>Uploading and processing...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            padding: '20px',
                            borderRadius: '50%',
                            color: 'var(--primary)'
                        }}>
                            <UploadCloud size={40} />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '5px' }}>
                                Click to upload or drag and drop
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                CSV files only (max 50MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div style={{
                    marginTop: '20px',
                    padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    color: 'var(--unsafe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                }}>
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ height: '1px', flex: 1, background: 'var(--card-border)' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>OR</span>
                <div style={{ height: '1px', flex: 1, background: 'var(--card-border)' }}></div>
            </div>

            <button
                onClick={handleUseSample}
                disabled={isUploading}
                style={{
                    marginTop: '20px',
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                }}
            >
                <FileText size={18} />
                Use Sample Dataset (Water Potability)
            </button>
        </div>
    );
};

export default UploadStep;
