
import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { getVideos, createVideo, deleteVideo } from '../services/adminService';
import { Plus, Trash2, Video as VideoIcon, Save, X } from 'lucide-react';

const AdminVideoPanel: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newVideo, setNewVideo] = useState<Partial<Video>>({ visibility: 'free' });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const data = await getVideos(true);
    setVideos(data);
  };

  const handleSave = async () => {
    if (!newVideo.title || !newVideo.videoUrl) return alert("عنوان و لینک ویدیو الزامی است");
    await createVideo(newVideo);
    setIsEditing(false);
    setNewVideo({ visibility: 'free' });
    loadVideos();
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این ویدیو اطمینان دارید؟")) {
      await deleteVideo(id);
      loadVideos();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><VideoIcon /> مدیریت محتوای ویدیویی</h2>
        <button onClick={() => setIsEditing(true)} className="btn-primary py-2 px-4 flex items-center rounded-lg text-sm"><Plus size={16} className="ml-2"/> آپلود ویدیو جدید</button>
      </div>

      {isEditing && (
        <div className="bg-gray-800 p-6 rounded-xl mb-6 border border-gray-700 animate-in fade-in">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-white">افزودن ویدیو</h3>
             <button onClick={() => setIsEditing(false)}><X className="text-gray-400 hover:text-white"/></button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="text-xs text-gray-400 block mb-1">عنوان ویدیو</label>
                <input placeholder="مثلا: آموزش صحیح اسکات" className="input-styled p-2 w-full" value={newVideo.title || ''} onChange={e => setNewVideo({...newVideo, title: e.target.value})} />
            </div>
            <div>
                <label className="text-xs text-gray-400 block mb-1">دسته‌بندی</label>
                <input placeholder="مثلا: آموزش حرکات، تغذیه" className="input-styled p-2 w-full" value={newVideo.category || ''} onChange={e => setNewVideo({...newVideo, category: e.target.value})} />
            </div>
            <div>
                <label className="text-xs text-gray-400 block mb-1">لینک ویدیو (MP4/Youtube)</label>
                <input placeholder="https://..." className="input-styled p-2 w-full" value={newVideo.videoUrl || ''} onChange={e => setNewVideo({...newVideo, videoUrl: e.target.value})} dir="ltr" />
            </div>
            <div>
                <label className="text-xs text-gray-400 block mb-1">لینک تصویر بندانگشتی</label>
                <input placeholder="https://..." className="input-styled p-2 w-full" value={newVideo.thumbnailUrl || ''} onChange={e => setNewVideo({...newVideo, thumbnailUrl: e.target.value})} dir="ltr" />
            </div>
            <div>
                <label className="text-xs text-gray-400 block mb-1">سطح دسترسی</label>
                <select className="input-styled p-2 w-full" value={newVideo.visibility} onChange={e => setNewVideo({...newVideo, visibility: e.target.value as any})}>
                    <option value="free">رایگان (Free)</option>
                    <option value="members">ویژه اعضا (Members Only)</option>
                    <option value="vip">مخصوص VIP</option>
                </select>
            </div>
          </div>
          <div>
             <label className="text-xs text-gray-400 block mb-1">توضیحات ویدیو</label>
             <textarea placeholder="توضیحات کوتاه درباره محتوا..." className="input-styled w-full p-2 mb-4" rows={3} value={newVideo.description || ''} onChange={e => setNewVideo({...newVideo, description: e.target.value})} />
          </div>
          
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-white text-sm font-bold">انصراف</button>
            <button onClick={handleSave} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center"><Save size={16} className="ml-2"/> ذخیره و انتشار</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map(v => (
          <div key={v.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 relative group">
            <div className="h-40 bg-black/50 flex items-center justify-center relative">
              {v.thumbnailUrl ? <img src={v.thumbnailUrl} className="w-full h-full object-cover"/> : <VideoIcon size={40} className="text-gray-500"/>}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button onClick={() => handleDelete(v.id)} className="bg-red-600 p-2 rounded-full text-white hover:bg-red-500"><Trash2 size={20}/></button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-sm">{v.title}</h4>
                <span className={`text-[10px] px-2 py-1 rounded font-bold ${v.visibility === 'vip' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {v.visibility === 'free' ? 'رایگان' : v.visibility === 'members' ? 'اعضا' : 'VIP'}
                </span>
              </div>
              <p className="text-gray-400 text-xs mt-2 line-clamp-2">{v.description}</p>
              <div className="mt-4 flex justify-between items-center text-[10px] text-gray-500">
                <span>{v.category}</span>
                <span>{v.views} بازدید</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminVideoPanel;
