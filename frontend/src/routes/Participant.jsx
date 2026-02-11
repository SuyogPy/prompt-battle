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

    useEffect(() => {
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
        <div className="container" style={{ maxWidth: '600px' }}>
            <RoundToggle round={round} setRound={resetForNewRound} disabled={loading || locked} />

            <div className="card">
                <h1 style={{ marginTop: 0, fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                    {round === 'image' ? 'Image Prompt Battle' : 'Text Prompt Battle'}
                </h1>

                {!locked ? (
                    <form onSubmit={handleSubmit}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
                        <input
                            className="input"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />

                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Prompt</label>
                        <textarea
                            className="textarea"
                            required
                            rows="4"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={round === 'image' ? "Describe the image you want to generate..." : "Enter your creative prompt..."}
                        />

                        <button className="button" type="submit" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {loading ? <div className="spinner"></div> : 'Submit Prompt'}
                        </button>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#10b981' }}>Submission Locked</h2>
                        <p>Your prompt has been submitted. Good luck!</p>

                        {result && round === 'image' && result.image_path && (
                            <img
                                src={`${API_BASE}/images/${result.image_path.split('/').pop()}`}
                                alt="Your Generated Image"
                                style={{ width: '100%', borderRadius: '8px', marginTop: '1rem' }}
                            />
                        )}

                        {result && round === 'text' && result.response && (
                            <div style={{
                                background: '#0f172a',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                marginTop: '1rem',
                                textAlign: 'left',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {result.response}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Prompt Battle by NSS-NIST
            </p>
        </div>
    );
};

export default Participant;
