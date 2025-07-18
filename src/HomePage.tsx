import React, { useState } from "react"
import homeImage from './assets/home-image.png'
import { useNavigate} from 'react-router-dom'

function HomePage() {
    const navigate = useNavigate() 
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleExtract = async () => {
        if (!url.trim()) {
            setError('Please enter a YouTube URL.')
            return 
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('http://localhost:8000/api/transcript', {
                method: 'POST', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.trim() })
            })
            
            const data = await response.json()
            if (response.ok) {
                // store -> navigate to transcript page
                localStorage.setItem('transcriptData', JSON.stringify(data.data))
                navigate('/transcript')
            } else {
                setError(data.detail || "Failed to get transcript.")
            } 
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            handleExtract()
        }
    }
    
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex items-center gap-16 max-w-7xl">
                {/* left column, content */}
                <div className="flex-1">
                    <h1 className="font-['Ubuntu'] text-[45px] font-bold text-white leading-[1] mb-2">
                        Instant <span className="text-[#D50E0E]">YouTube</span> Video to<br />Transcript
                    </h1>
                    <p className="font-['Ubuntu'] text-[#8F8F8F] text-[20px] leading-[1.1] mb-8">
                        Paste the link to any YouTube video below and instantly<br />view/download it's transcript. 
                    </p>

                    {error && (
                        <p className="text-red-500 mb-4 font-['Ubuntu']">{error}</p>
                    )}

                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Paste the video link here..."
                            className="w-96 px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg font-['Ubuntu'] text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D50E0E]" />
                        <button 
                            onClick={handleExtract}
                            disabled={loading}
                            className="px-8 py-3 bg-[#D50E0E] text-white rounded-lg font-['Ubuntu'] font-bold text-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-[#D50E0E] disabled:opacity-50 disabled:cursor-not-allowed"
                        >    
                            {loading ? 'Extracting...' : 'Extract'}
                        </button>
                    </div>
                </div>

                {/*right column, image */}
                <div className="flex-1 flex justify-center">
                    <img
                        src={homeImage}
                        alt="YouTube Transcripter Image"
                        className="max-w-md h-auto"
                    />
                </div>
            </div>
        </div>
    )
}

export default HomePage