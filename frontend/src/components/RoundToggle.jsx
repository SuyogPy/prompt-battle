import React from 'react';

const RoundToggle = ({ round, setRound, disabled }) => {
    return (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', width: '100%', maxWidth: '600px' }}>
            <button
                className="button"
                style={{
                    background: round === 'image' ? 'var(--accent-gradient)' : '#f1f5f9',
                    color: round === 'image' ? 'white' : 'var(--text-secondary)',
                    flex: 1,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    fontWeight: 700
                }}
                onClick={() => setRound('image')}
                disabled={disabled}
            >
                ROUND 1: IMAGE
            </button>
            <button
                className="button"
                style={{
                    background: round === 'text' ? 'var(--accent-gradient)' : '#f1f5f9',
                    color: round === 'text' ? 'white' : 'var(--text-secondary)',
                    flex: 1,
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    fontWeight: 700
                }}
                onClick={() => setRound('text')}
                disabled={disabled}
            >
                ROUND 2: TEXT
            </button>
        </div>
    );
};

export default RoundToggle;
