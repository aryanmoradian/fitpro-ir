
import React, { useState } from 'react';
import { sendMessage } from '../services/messagingService';
import { Send, Users, User } from 'lucide-react';

const AdminInbox: React.FC = () => {
  const [target, setTarget] = useState<'broadcast' | 'single'>('broadcast');
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (!subject || !message) return alert("لطفا تمام فیلدها را پر کنید");
    if (target === 'single' && !receiverId) return alert("شناسه کاربر الزامی است");

    await sendMessage('admin', target === 'single' ? receiverId : null, subject, message, target === 'broadcast');
    alert("پیام با موفقیت ارسال شد!");
    setMessage('');
    setSubject('');
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">سیستم پیام‌رسانی داخلی</h2>
      <div className="bg-[#1E293B] p-6 rounded-xl border border-gray-700 shadow-xl">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTarget('broadcast')} className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm ${target === 'broadcast' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/20 border-gray-600 text-gray-400'}`}>
            <Users size={18} /> ارسال همگانی (Broadcast)
          </button>
          <button onClick={() => setTarget('single')} className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 font-bold text-sm ${target === 'single' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/20 border-gray-600 text-gray-400'}`}>
            <User size={18} /> ارسال تکی (Direct)
          </button>
        </div>

        {target === 'single' && (
          <div className="mb-4 animate-in fade-in">
            <label className="block text-sm text-gray-400 mb-1">شناسه کاربر (User ID)</label>
            <input className="w-full input-styled p-3 font-mono text-sm" value={receiverId} onChange={e => setReceiverId(e.target.value)} placeholder="مثلا: 550e8400-e29b..." dir="ltr" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">موضوع پیام</label>
          <input className="w-full input-styled p-3" value={subject} onChange={e => setSubject(e.target.value)} placeholder="مثلا: بروزرسانی مهم سیستم..." />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">متن پیام</label>
          <textarea className="w-full input-styled p-3 h-32 resize-none" value={message} onChange={e => setMessage(e.target.value)} placeholder="متن پیام خود را اینجا بنویسید..." />
        </div>

        <button onClick={handleSend} className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-lg rounded-xl font-bold">
          <Send size={20} className="rotate-180" /> ارسال پیام
        </button>
      </div>
    </div>
  );
};

export default AdminInbox;
