import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Participant from './routes/Participant';
import Judge from './routes/Judge';
import './styles/theme.css';

function App() {
    return (
        <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <header style={{
                    padding: '1.5rem 2rem',
                    borderBottom: '1px solid var(--border-color)',
                    textAlign: 'center',
                    background: 'rgba(11, 15, 25, 0.8)',
                    backdropFilter: 'blur(8px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: '-0.025em' }}>
                        <span style={{ color: '#3b82f6' }}>PROMPT</span> BATTLE
                    </h2>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Powered by NSS-NIST
                    </div>
                </header>

                <main style={{ flex: 1, padding: '2rem 1rem' }}>
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
