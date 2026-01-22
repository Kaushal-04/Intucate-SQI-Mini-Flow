import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calculateSQI } from '../utils/sqi-engine';
import type { SQIResult } from '../types';
import ResultDashboard from '../components/ResultDashboard';

const AdminConsole = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [promptText, setPromptText] = useState('');
    const [inputData, setInputData] = useState('');
    const [result, setResult] = useState<SQIResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCompute = () => {
        setError(null);
        try {
            if (!inputData.trim()) {
                setError("Please enter student attempt data JSON.");
                return;
            }

            const parsed = JSON.parse(inputData);

            // Basic validation
            if (!parsed.student_id || !Array.isArray(parsed.attempts)) {
                throw new Error("Invalid schema: Must have 'student_id' and 'attempts' array.");
            }

            const sqiResult = calculateSQI(parsed.student_id, parsed.attempts);
            setResult(sqiResult);
        } catch (err: any) {
            setError(`Error computing SQI: ${err.message}`);
        }
    };

    const handleSavePrompt = () => {
        // Mock save
        alert("Prompt saved successfully (Mock).");
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <header className="glass-panel" style={{
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                borderRadius: 0,
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>Intucate Console</h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user}</span>
                    <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                        Logout
                    </button>
                </div>
            </header>

            <main style={{ padding: '2rem', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>SQI Calculator</h2>

                {/* Input Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginTop: 0 }}>Diagnostic Agent Prompt</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Edit the system prompt for the diagnostic agent.</p>
                        <textarea
                            className="glass-input"
                            style={{ width: '100%', flex: 1, minHeight: '300px', fontFamily: 'monospace', resize: 'vertical' }}
                            placeholder="Paste the diagnostic agent prompt here..."
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                        />
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={handleSavePrompt}>Save Prompt</button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginTop: 0 }}>Input Data</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Paste student attempt JSON here.</p>
                        <textarea
                            className="glass-input"
                            style={{ width: '100%', flex: 1, minHeight: '300px', fontFamily: 'monospace', resize: 'vertical' }}
                            placeholder={'{\n  "student_id": "S123",\n  "attempts": [\n    ...\n  ]\n}'}
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                        />
                        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                            {error && <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</span>}
                            <button className="btn-primary" onClick={handleCompute}>Compute SQI</button>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                {result && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                        <ResultDashboard result={result} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminConsole;
