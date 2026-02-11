import React, { useState, useEffect } from 'react';
import RoundToggle from '../components/RoundToggle';

const API_BASE = `http://${window.location.hostname}:8000`;

const Participant = () => {
    const [name, setName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [round, setRound] = useState('image');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [locked, setLocked] = useState(false);

    const [nameEntered, setNameEntered] = useState(false);

    useEffect(() => {
        const savedName = localStorage.getItem('promptbattle_user_name');
        if (savedName) {
            setName(savedName);
            setNameEntered(true);
        }

        const isLocked = localStorage.getItem('promptbattle_locked_global');
        const savedResult = localStorage.getItem(`promptbattle_result_${round}`);

        if (isLocked === 'true') {
            setLocked(true);
            if (savedResult) {
                setResult(JSON.parse(savedResult));
            } else {
                setResult(null);
            }
        } else {
            setLocked(false);
            setResult(null);
        }
    }, [round]);

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            localStorage.setItem('promptbattle_user_name', name);
            setNameEntered(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = round === 'image' ? '/submit-image' : '/submit-text';

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, prompt }),
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data);
                setLocked(true);
                localStorage.setItem('promptbattle_locked_global', 'true');
                localStorage.setItem(`promptbattle_result_${round}`, JSON.stringify(data));
            } else {
                throw new Error(data.detail || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission failed:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForNewRound = (newRound) => {
        setRound(newRound);
        setResult(null);
        // Note: Locked state is handled by useEffect
    };

    return (
        <div className="container" style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!nameEntered && !locked ? (
                <div className="card" style={{ textAlign: 'center' }}>
                    <h1 style={{ marginTop: 0 }}>Welcome to Prompt Battle</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Please enter your name to start.</p>
                    <form onSubmit={handleNameSubmit}>
                        <input
                            className="input"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your Full Name"
                            autoFocus
                        />
                        <button className="button" type="submit" style={{ width: '100%' }}>
                            Continue
                        </button>
                    </form>
                </div>
            ) : (
                <>
                    <RoundToggle round={round} setRound={resetForNewRound} disabled={loading || locked} />

                    <div className="card">
                        <h1 style={{ marginTop: 0, fontSize: '1.8rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 800 }}>
                            {round === 'image' ? 'IMAGE ROUND' : 'TEXT ROUND'}
                        </h1>

                        {!locked ? (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                                        PARTICIPATING AS: <strong style={{ color: 'var(--accent-color)' }}>{name.toUpperCase()}</strong>
                                    </span>
                                </div>
                                <textarea
                                    className="textarea"
                                    required
                                    rows="5"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={round === 'image' ? "DESCRIBE YOUR IMAGE..." : "ENTER YOUR CREATIVE PROMPT..."}
                                    autoFocus
                                />

                                <button className="button" type="submit" disabled={loading} style={{ width: '100%', fontSize: '1.1rem' }}>
                                    {loading ? <div className="spinner"></div> : 'GENERATE'}
                                </button>
                            </form>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ marginBottom: '1rem', color: '#10b981', fontWeight: 800, fontSize: '1.4rem' }}>
                                    ✓ SUBMITTED
                                </div>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Response saved for <strong>{name}</strong>.</p>

                                {result && round === 'image' && result.image_path && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>GENERATED IMAGE</label>
                                        <img
                                            src={`${API_BASE}/images/${result.image_path.split('/').pop()}`}
                                            alt="Your Generated Image"
                                            style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                        />
                                    </div>
                                )}

                                {result && round === 'text' && result.response && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI RESPONSE</label>
                                        <div style={{
                                            background: '#f8fafc',
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            textAlign: 'left',
                                            whiteSpace: 'pre-wrap',
                                            border: '1px solid var(--border-color)',
                                            color: 'var(--text-primary)',
                                            fontSize: '0.95rem'
                                        }}>
                                            {result.response}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Prompt Battle by NSS-NIST
            </p>
        </div>
    );
};

export default Participant;
