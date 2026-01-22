import React, { useState } from 'react';
import type { SQIResult } from '../types';

interface ResultDashboardProps {
    result: SQIResult;
}

const ProgressBar = ({ value, color = 'var(--brand-gradient)' }: { value: number; color?: string }) => (
    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
    </div>
);

const ResultDashboard: React.FC<ResultDashboardProps> = ({ result }) => {
    const [showJson, setShowJson] = useState(false);

    const handleDownload = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `sqi_result_${result.student_id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        alert("JSON copied to clipboard!");
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                {/* Overall SQI Card */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Overall SQI</h3>
                    <div style={{
                        fontSize: '4rem',
                        fontWeight: 800,
                        background: 'var(--brand-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '1rem 0'
                    }}>
                        {result.overall_sqi}
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Student Quality Index</p>
                </div>

                {/* Topic Breakdown */}
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                    <h3 style={{ marginTop: 0 }}>Topic Scores</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {result.topic_scores.map((topic) => (
                            <div key={topic.topic}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <span>{topic.topic}</span>
                                    <span>{topic.sqi}</span>
                                </div>
                                <ProgressBar value={topic.sqi} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* Ranked Concepts */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                <h3 style={{ marginTop: 0 }}>Ranked Concepts for Summary Agent</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    These concepts have been prioritized based on wrong answers, importance, and detailed diagnostics.
                </p>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {result.ranked_concepts_for_summary.map((rc, idx) => (
                        <div key={`${rc.topic}-${rc.concept}`} style={{
                            background: 'rgba(255,255,255,0.03)',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '1rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-input)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                }}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{rc.concept}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{rc.topic}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '400px', justifyContent: 'flex-end' }}>
                                {rc.reasons.map((r, i) => (
                                    <span key={i} style={{
                                        fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px',
                                        background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc'
                                    }}>
                                        {r}
                                    </span>
                                ))}
                            </div>

                            <div style={{ textAlign: 'right', minWidth: '80px' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weight</div>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-accent)' }}>{rc.weight.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* JSON Payload */}
            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Values for Next Agent</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setShowJson(!showJson)} className="btn-secondary">
                            {showJson ? 'Hide JSON' : 'Show JSON'}
                        </button>
                        <button onClick={handleDownload} className="btn-primary">
                            Download JSON
                        </button>
                        <button onClick={handleCopy} className="btn-secondary">
                            Copy
                        </button>
                    </div>
                </div>

                {showJson && (
                    <pre style={{
                        background: 'var(--bg-input)',
                        padding: '1rem',
                        borderRadius: '8px',
                        overflowX: 'auto',
                        fontSize: '0.85rem',
                        color: '#d1d5db',
                        maxHeight: '400px'
                    }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                )}
            </div>

        </div>
    );
};

export default ResultDashboard;
