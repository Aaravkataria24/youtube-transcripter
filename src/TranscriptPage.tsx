import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type TranscriptData = {
    video_id: string
    transcript: string 
    transcript_list: { text: string; start: number; duration: number}[]
    reading_time: number
    duration: string
    word_count: number 
    thumbnail_url: string 
}

function TranscriptPage() {
    const [data, setData] = useState<TranscriptData | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const stored = localStorage.getItem('transcriptData')
        if (stored) {
            setData(JSON.parse(stored))
        } else {
            navigate('/')
        }
    }, [navigate])

    const handleCopy = () => {
        if (data) {
            navigator.clipboard.writeText(data.transcript)
        }
    }

    if (!data) return null
    
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex gap-12 max-w-7xl w-full px-8">
                {/* video info */}
                <div className="flex-1">
                    <div className="bg-gray-900 rounded-xl overflow-hidden mb-4">
                        <img 
                            src={data.thumbnail_url}
                            alt="Video thumbnail"
                            className="w-full object-cover"
                        />
                    </div>
                    <h2 className="text-white text-2xl font-bold mb-2 font-['Ubuntu']">
                        Video Transcript
                    </h2>
                    <div className="flex gap-4 mb-4">
                        <span className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center text-sm">             
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 2h12v10H4V5zm2 2v2h2V7H6zm0 4v2h2v-2H6zm4-4v2h2V7h-2zm0 4v2h2v-2h-2z"/>
                            </svg>
                            {data.reading_time} min read
                        </span>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="w-full bg-[#D50E0E] text-white font-bold py-3 rounded-lg mt-6 text-lg hover:bg-red-600 transition"
                    >
                        Copy Transcript
                    </button>
                </div>
                {/* transcript */}
                <div className="flex-1 bg-gray-900 rounded-xl p-6 overflow-y-auto max-h-[500px]">
                    <div className="text-white font-['Ubuntu'] text-lg whitespace-pre-line">
                        {data.transcript}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TranscriptPage 