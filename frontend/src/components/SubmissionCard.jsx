import React, { useState } from 'react';

const SubmissionCard = ({ submission, onSave, isImage }) => {
    const [score, setScore] = useState(submission.score || '');

    return (
        <div className="card">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{submission.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                PROMPT: <strong>{submission.prompt.toUpperCase()}</strong>
            </p>

            {isImage ? (
                <div style={{ width: '100%', marginBottom: '1.5rem' }}>
                    <img
                        src={`http://${window.location.hostname}:8000/images/${submission.image_path.split('/').pop()}`}
                        alt="Generated"
                        style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}
                        onLoad={(e) => console.log("Image loaded successfully")}
                        onError={(e) => {
                            console.error("Image failed to load:", e.target.src);
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            ) : (
                <div style={{
                    background: '#f8fafc',
                    padding: '1.2rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    textAlign: 'left'
                }}>
                    {submission.response}
                </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                    type="number"
                    className="input"
                    placeholder="Score (1-25)"
                    min="1"
                    max="25"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    style={{ marginBottom: 0, flex: 1 }}
                />
                <button
                    className="button"
                    onClick={() => onSave(submission.id, parseInt(score))}
                    style={{ padding: '0.5rem 1rem' }}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default SubmissionCard;
