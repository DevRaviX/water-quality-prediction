import { useState } from 'react';
import { Upload, Search, Wand2, BrainCircuit } from 'lucide-react';
import UploadStep from './DataLab/UploadStep';
import ExplorationStep from './DataLab/ExplorationStep';
import CleaningStep from './DataLab/CleaningStep';
import ComparisonStep from './DataLab/ComparisonStep';
import TrainingStep from './DataLab/TrainingStep';

const DataLab = () => {
    const [activeStep, setActiveStep] = useState('upload'); // upload, eda, clean, train
    const [sessionId, setSessionId] = useState(null);
    const [filename, setFilename] = useState(null);

    const handleSessionCreated = (id, name) => {
        setSessionId(id);
        setFilename(name);
        setActiveStep('eda');
    };

    const steps = [
        { id: 'upload', label: 'Upload', icon: Upload },
        { id: 'eda', label: 'Analyze', icon: Search },
        { id: 'clean', label: 'Clean', icon: Wand2 },
        { id: 'compare', label: 'Verify', icon: Search },
        { id: 'train', label: 'Train', icon: BrainCircuit },
    ];

    return (
        <div className="datalab-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>

            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '10px' }}>AutoML Data Lab</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    End-to-end Machine Learning pipeline: Upload, Analyze, Clean, and Train.
                </p>
            </div>

            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '10px' }}>
                {steps.map((step, index) => {
                    const isActive = step.id === activeStep;
                    const isCompleted = steps.findIndex(s => s.id === activeStep) > index;
                    const Icon = step.icon;

                    return (
                        <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                background: isActive ? 'var(--primary)' : (isCompleted ? 'rgba(34, 197, 94, 0.2)' : 'var(--card-bg)'),
                                color: isActive ? 'white' : (isCompleted ? 'var(--safe)' : 'var(--text-muted)'),
                                border: `1px solid ${isActive ? 'transparent' : 'var(--card-border)'}`,
                                fontWeight: '600',
                                transition: 'all 0.3s'
                            }}>
                                <Icon size={18} />
                                <span>{step.label}</span>
                            </div>

                            {index < steps.length - 1 && (
                                <div style={{ width: '40px', height: '2px', background: 'var(--card-border)', margin: '0 10px' }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Content Area */}
            <div className="step-content" style={{
                background: 'rgba(30, 41, 59, 0.4)',
                borderRadius: '24px',
                padding: '20px',
                border: '1px solid var(--card-border)',
                minHeight: '400px'
            }}>
                {activeStep === 'upload' && <UploadStep onSessionCreated={handleSessionCreated} />}
                {activeStep === 'eda' && <ExplorationStep sessionId={sessionId} />}
                {activeStep === 'clean' && <CleaningStep sessionId={sessionId} onNext={() => setActiveStep('compare')} />}
                {activeStep === 'compare' && <ComparisonStep sessionId={sessionId} onNext={() => setActiveStep('train')} onBack={() => setActiveStep('clean')} />}
                {activeStep === 'train' && <TrainingStep sessionId={sessionId} />}
            </div>

            {/* Debug Info (Can remove later) */}
            {sessionId && (
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Active Session: {sessionId} ({filename})
                </div>
            )}
        </div>
    );
};

export default DataLab;
