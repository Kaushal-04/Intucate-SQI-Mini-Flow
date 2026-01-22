import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.endsWith('@intucate.com')) {
            setError('Email must be an @intucate.com address');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        const success = await login(email);
        if (success) {
            navigate('/admin');
        } else {
            setError('Login failed. Please try again.');
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%)'
        }}>
            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderRadius: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="text-gradient" style={{ margin: 0, fontSize: '2rem' }}>Intucate SQI</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Admin Access</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email</label>
                        <input
                            type="email"
                            className="glass-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@intucate.com"
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Password</label>
                        <input
                            type="password"
                            className="glass-input"
                            style={{ width: '100%', boxSizing: 'border-box' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
