import React, { useState, useEffect } from 'react';
import SubmissionCard from '../components/SubmissionCard';

const API_BASE = `http://${window.location.hostname}:8000`;

const Judge = () => {
    const [accessCode, setAccessCode] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');
    const [round, setRound] = useState('image');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        if (accessCode === '0000') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Access Code');
        }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        const endpoint = round === 'image' ? '/image-submissions' : '/text-submissions';
        try {
            const response = await fetch(`${API_BASE}${endpoint}`);
            const data = await response.json();
            setSubmissions(data);
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubmissions();
        }
    }, [isAuthenticated, round]);

    const handleSaveScore = async (id, score) => {
        const endpoint = round === 'image' ? `/score-image/${id}` : `/score-text/${id}`;
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score }),
            });
            if (response.ok) {
                alert('Score saved!');
                fetchSubmissions(); // Refresh to show updated scores
            }
        } catch (err) {
            console.error('Failed to save score:', err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
                    <h2 style={{ marginTop: 0 }}>JUDGE ACCESS</h2>
                    <input
                        type="password"
                        className="input"
                        placeholder="Enter Access Code"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                    />
                    {error && <p style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}
                    <button className="button" style={{ width: '100%' }} onClick={handleLogin}>
                        AUTHORIZE
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Judge Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button
                        className="button"
                        onClick={() => setRound('image')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: round === 'image' ? 'var(--accent-gradient)' : '#f1f5f9',
                            color: round === 'image' ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}
                    >
                        IMAGE ROUND
                    </button>
                    <button
                        className="button"
                        onClick={() => setRound('text')}
                        style={{
                            padding: '0.5rem 1.5rem',
                            background: round === 'text' ? 'var(--accent-gradient)' : '#f1f5f9',
                            color: round === 'text' ? 'white' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}
                    >
                        TEXT ROUND
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px' }}></div>
                </div>
            ) : (
                <div className="grid">
                    {submissions.map((sub) => (
                        <SubmissionCard
                            key={sub.id}
                            submission={sub}
                            isImage={round === 'image'}
                            onSave={handleSaveScore}
                        />
                    ))}
                    {submissions.length === 0 && (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No submissions yet for this round.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Judge;
