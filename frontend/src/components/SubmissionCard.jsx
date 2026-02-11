import React, { useState } from 'react';

const SubmissionCard = ({ submission, onSave, isImage }) => {
    const [score, setScore] = useState(submission.score || '');

    return (
        <div className="card">
            <h3 style={{ margin: '0 0 0.5rem 0' }}>{submission.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <strong>Prompt:</strong> {submission.prompt}
            </p>

            {isImage ? (
                <img
                    src={`http://${window.location.hostname}:8000/images/${submission.image_path.split('/').pop()}`}
                    alt="Generated"
                    style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }}
                />
            ) : (
                <div style={{
                    background: '#0f172a',
                    padding: '1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap'
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
