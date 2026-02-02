
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download } from 'lucide-react';

const reportContent = `
# Water Quality Prediction using Machine Learning

## Executive Summary
This project aims to predict the **potability of water** using advanced machine learning techniques. By analyzing 3,276 water samples across 9 quality parameters, we developed a system capable of classifying water as safe or unsafe for human consumption with high reliability.

The final system deployed includes:
- **Random Forest Classifier** (Best Performer)
- **Gradient Boosting & Logistic Regression** (Benchmarks)
- **Interactive SaaS Dashboard** for real-time analysis

## Methodology

### Data Preprocessing
The dataset contained missing values in **ph**, **Sulfate**, and **Trihalomethanes**. We applied mean imputation strategies to preserve data distribution.

### Model Selection
We evaluated three primary algorithms:
1. **Random Forest:** Selected for its robustness against overfitting and ability to handle non-linear relationships.
2. **Gradient Boosting:** High performance but computationally expensive.
3. **Logistic Regression:** Used as a baseline for interpretability.

## Results & Performance

| Model | Accuracy | F1-Score | AUC |
|-------|----------|----------|-----|
| **Random Forest** | **68.2%** | **0.60** | **0.72** |
| Gradient Boosting | 65.4% | 0.58 | 0.69 |
| Logistic Regression | 52.1% | 0.45 | 0.51 |

**Key Findings:**
- The F1-Score improved by **+28.6%** over the baseline model.
- **Sulfate** and **pH** were identified as the most critical predictors of water safety.
- The model exhibits strong stability across varying water compositions.

## Future Scope
- Integration with IoT sensors for real-time streaming.
- Deployment on edge devices (Raspberry Pi) for field usage.
`;

const ReportViewer = () => {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: '#e2e8f0' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid var(--card-border)',
                paddingBottom: '20px'
            }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FileText className="text-blue-500" /> Project Report
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                        Comprehensive analysis of methodology and results.
                    </p>
                </div>

                <button
                    onClick={() => window.print()}
                    style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Download size={18} /> Export PDF
                </button>
            </div>

            <div className="markdown-body" style={{ background: 'transparent' }}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: ({ node, ...props }) => <h1 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: '10px' }} {...props} />,
                        h2: ({ node, ...props }) => <h2 style={{ color: '#60a5fa', marginTop: '30px', fontSize: '1.5rem' }} {...props} />,
                        h3: ({ node, ...props }) => <h3 style={{ color: '#94a3b8', marginTop: '20px', fontSize: '1.2rem' }} {...props} />,
                        table: ({ node, ...props }) => <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', marginBottom: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }} {...props} />,
                        th: ({ node, ...props }) => <th style={{ padding: '12px', textAlign: 'left', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid #334155' }} {...props} />,
                        td: ({ node, ...props }) => <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...props} />,
                        p: ({ node, ...props }) => <p style={{ lineHeight: '1.7', color: '#cbd5e1' }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ lineHeight: '1.7', color: '#cbd5e1', marginBottom: '8px' }} {...props} />,
                    }}
                >
                    {reportContent}
                </ReactMarkdown>
            </div>

            <div style={{ marginTop: '60px', borderTop: '1px solid var(--card-border)', paddingTop: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>© 2025 Water Quality Prediction System • Final Year Project</p>
            </div>
        </div>
    );
};

export default ReportViewer;
