import React from 'react';

const RoundToggle = ({ round, setRound, disabled }) => {
    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
                className="button"
                style={{
                    background: round === 'image' ? 'var(--accent-gradient)' : '#1f2937',
                    flex: 1
                }}
                onClick={() => setRound('image')}
                disabled={disabled}
            >
                Round 1: Image
            </button>
            <button
                className="button"
                style={{
                    background: round === 'text' ? 'var(--accent-gradient)' : '#1f2937',
                    flex: 1
                }}
                onClick={() => setRound('text')}
                disabled={disabled}
            >
                Round 2: Text
            </button>
        </div>
    );
};

export default RoundToggle;
