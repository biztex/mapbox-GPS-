'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

export default function VideoPresentation() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch video URL from API
    const fetchVideo = async () => {
      try {
        const response = await fetch('/api/fleet/video');
        if (response.ok) {
          const data = await response.json();
          if (data.videoUrl) {
            setVideoUrl(data.videoUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching video:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading video...</p>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center">
        <Play className="w-16 h-16 text-amber-500/50 mb-4" />
        <p className="text-gray-400 text-sm font-medium">No video uploaded yet</p>
        <p className="text-gray-500 text-xs mt-1">Upload a video from the admin panel</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          onError={(e) => {
            console.error('Video playback error:', e);
          }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}
