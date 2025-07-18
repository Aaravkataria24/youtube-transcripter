import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './HomePage' 
import TranscriptPage from './TranscriptPage'

function App() {
    return (
        <Router>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/transcript' element={<TranscriptPage />} />
            </Routes>
        </Router>
    )
}

export default App