import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Participant from './routes/Participant';
import Judge from './routes/Judge';
import './styles/theme.css';

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', width: '100vw' }}>
                <header style={{
                    padding: '2rem',
                    textAlign: 'center',
                    background: '#ffffff',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <h1 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.05em', fontSize: '2.5rem' }}>
                        <span style={{ color: 'var(--accent-color)' }}>PROMPT</span> BATTLE
                    </h1>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 500 }}>
                        POWERED BY NSS-NIST
                    </div>
                </header>

                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0 1rem' }}>
                    <Routes>
                        <Route path="/" element={<Participant />} />
                        <Route path="/judge_filename" element={<Judge />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
