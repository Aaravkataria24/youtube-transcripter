from fastapi import FastAPI, HTTPException 
from fastapi.middleware.cors import CORSMiddleware 
from pydantic import BaseModel 
import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter 
import json

app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VideoRequest(BaseModel):
    url: str

def extract_video_id(url: str) -> str:
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
        r'youtube\.com\/watch\?.*v=([^&\n?#]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    raise ValueError("Invalid YouTube URL")

def get_video_info(video_id: str): 
    try: 
        print(f"Attempting to get transcript for video ID: {video_id}")
        
        # Use the simpler direct method instead of list_transcripts
        transcript_data = YouTubeTranscriptApi.get_transcript(video_id)
        print(f"Successfully fetched transcript with {len(transcript_data)} entries")

        # Format the transcript manually instead of using TextFormatter
        transcript_text = ""
        for entry in transcript_data:
            transcript_text += entry['text'] + " "
        
        # Clean up the text
        transcript_text = transcript_text.strip()
        print(f"Formatted transcript length: {len(transcript_text)} characters")

        word_count = len(transcript_text.split())
        reading_time = max(1, word_count // 200)

        if transcript_data:
            duration_seconds = transcript_data[-1]['start'] + transcript_data[-1]['duration']
            duration_minutes = int(duration_seconds // 60)
            duration_seconds_remainder = int(duration_seconds % 60)
            duration_formatted = f"{duration_minutes}:{duration_seconds_remainder:02d}"
        else: 
            duration_formatted = "Unknown"
        
        return {
            "video_id": video_id,
            "transcript": transcript_text,
            "transcript_list": transcript_data,
            "reading_time": reading_time, 
            "duration": duration_formatted,
            "word_count": word_count,
            "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        }

    except Exception as e:
        error_msg = str(e)
        print(f"Error in get_video_info: {error_msg}")
        
        if "no element found" in error_msg:
            raise HTTPException(status_code=400, detail="This video has no available transcripts or captions.")
        elif "Video unavailable" in error_msg:
            raise HTTPException(status_code=400, detail="This video is unavailable or private.")
        elif "TranscriptsDisabled" in error_msg:
            raise HTTPException(status_code=400, detail="Transcripts are disabled for this video.")
        else:
            raise HTTPException(status_code=400, detail=f"Error fetching transcript: {error_msg}")

@app.post("/api/transcript")
async def get_transcript(request: VideoRequest):
    try: 
        print(f"Received request for URL: {request.url}")
        video_id = extract_video_id(request.url)
        print(f"Extracted video ID: {video_id}")
        
        video_info = get_video_info(video_id)
        return {
            "success": True,
            "data": video_info
        }
    
    except ValueError as e:
        print(f"ValueError: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/test/{video_id}")
async def test_video(video_id: str):
    """Test endpoint to check if a video has transcripts"""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        available_transcripts = [t.language_code for t in transcript_list]
        return {
            "available": True,
            "transcripts": available_transcripts,
            "video_id": video_id
        }
    except Exception as e:
        return {
            "available": False,
            "error": str(e),
            "video_id": video_id
        }

@app.get("/api/test-connectivity")
async def test_connectivity():
    """Test basic connectivity to YouTube"""
    try:
        import requests
        response = requests.get("https://www.youtube.com", timeout=10)
        return {
            "youtube_accessible": response.status_code == 200,
            "status_code": response.status_code
        }
    except Exception as e:
        return {
            "youtube_accessible": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)