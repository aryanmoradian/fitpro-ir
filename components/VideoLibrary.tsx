
import React, { useState, useEffect } from 'react';
import { getVideos, logUserActivity } from '../services/adminService';
import { Video, UserProfile } from '../types';
import { Play } from 'lucide-react';

const VideoLibrary: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos().then(setVideos);
    logUserActivity(profile.id, 'page_view', { page: 'Video Library' });
  }, []);

  const handleWatch = (video: Video) => {
    logUserActivity(profile.id, 'video_watch', { videoId: video.id, title: video.title });
    window.open(video.videoUrl, '_blank');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Training Video Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => {
            return (
                <div key={v.id} onClick={() => handleWatch(v)} className="bg-[#1E293B] rounded-xl overflow-hidden border border-gray-700 relative group cursor-pointer transition transform hover:scale-105">
                    <div className="h-48 bg-black relative">
                        <img src={v.thumbnailUrl || 'https://via.placeholder.com/400x300?text=Video'} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"><Play className="text-white fill-current ml-1" /></div>
                        </div>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-white mb-1">{v.title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{v.description}</p>
                        <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                            <span>{v.category}</span>
                            <span>{v.views} views</span>
                        </div>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default VideoLibrary;
