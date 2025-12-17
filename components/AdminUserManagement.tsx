import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus, deleteUser, createUser } from '../services/adminService';
import { sendMessage } from '../services/messagingService';
import { AdminUserView } from '../types';
import { Edit2, Shield, UserX, Check, Eye, Lock, Search, Mail, Trash2, Plus, X, UserCheck, AlertTriangle, Send } from 'lucide-react';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'All' | 'athlete' | 'coach' | 'admin'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'active' | 'banned'>('All');
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  
  // Add/Edit Form State
  const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      role: 'athlete',
      status: 'active',
      subscription: 'free',
      adminNotes: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
      filterData();
  }, [users, searchTerm, filterRole, filterStatus]);

  const loadUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  const filterData = () => {
      let temp = [...users];
      
      if (searchTerm) {
          const lowerTerm = searchTerm.toLowerCase();
          temp = temp.filter(u => 
              u.fullName.toLowerCase().includes(lowerTerm) || 
              u.email.toLowerCase().includes(lowerTerm) ||
              u.id.toLowerCase().includes(lowerTerm)
          );
      }

      if (filterRole !== 'All') {
          temp = temp.filter(u => u.role === filterRole);
      }

      if (filterStatus !== 'All') {
          temp = temp.filter(u => u.status === filterStatus);
      }

      setFilteredUsers(temp);
  };

  const handleEditClick = (user: AdminUserView) => {
      setSelectedUser(user);
      setFormData({
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          status: user.status,
          subscription: user.subscription,
          adminNotes: user.adminNotes || ''
      });
      setIsEditModalOpen(true);
  };

  const handleAddClick = () => {
      setSelectedUser(null);
      setFormData({
          fullName: '',
          email: '',
          role: 'athlete',
          status: 'active',
          subscription: 'free',
          adminNotes: ''
      });
      setIsAddModalOpen(true);
  };

  const handleMessageClick = (user: AdminUserView) => {
      setSelectedUser(user);
      setMessageSubject('');
      setMessageBody('');
      setIsMessageModalOpen(true);
  };

  const handleDeleteClick = async (user: AdminUserView) => {
      if (confirm(`آیا از حذف حساب کاربری "${user.fullName}" مطمئن هستید؟ این عملیات غیرقابل بازگشت است.`)) {
          const { success } = await deleteUser(user.id);
          if (success) {
              setUsers(prev => prev.filter(u => u.id !== user.id));
              alert("کاربر با موفقیت حذف شد.");
          } else {
              alert("خطا در حذف کاربر.");
          }
      }
  };

  const saveUser = async () => {
      if (selectedUser) {
          // Edit Mode
          const { success } = await updateUserStatus(selectedUser.id, formData as unknown as Partial<AdminUserView>);
          if (success) {
              setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...formData } as AdminUserView : u));
              setIsEditModalOpen(false);
              alert("اطلاعات کاربر بروزرسانی شد.");
          }
      } else {
          // Add Mode
          // In a real app, this creates a user in Auth + DB
          const { success } = await createUser(formData);
          if (success) {
              await loadUsers(); // Reload to get the new ID
              setIsAddModalOpen(false);
              alert("کاربر جدید ایجاد شد.");
          } else {
              alert("خطا در ایجاد کاربر.");
          }
      }
  };

  const sendMessageToUser = async () => {
      if (!selectedUser || !messageSubject || !messageBody) return alert("لطفا موضوع و متن پیام را وارد کنید.");
      
      await sendMessage('admin', selectedUser.id, messageSubject, messageBody, false);
      setIsMessageModalOpen(false);
      alert(`پیام با موفقیت برای ${selectedUser.fullName} ارسال شد.`);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserCheck className="text-blue-500"/> مدیریت کاربران
          </h2>
          
          <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <input 
                    type="text" 
                    placeholder="جستجو (نام، ایمیل، شناسه)..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1E293B] border border-gray-700 rounded-lg py-2 px-4 pl-10 text-white text-sm focus:border-blue-500 outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-500" size={16}/>
              </div>
              <button onClick={handleAddClick} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center whitespace-nowrap">
                  <Plus size={16} className="ml-1"/> افزودن کاربر
              </button>
          </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={filterRole} 
            onChange={e => setFilterRole(e.target.value as any)}
            className="bg-[#1E293B] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
              <option value="All">همه نقش‌ها</option>
              <option value="athlete">ورزشکار</option>
              <option value="coach">مربی</option>
              <option value="admin">مدیر</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-[#1E293B] border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
          >
              <option value="All">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="banned">مسدود</option>
          </select>
      </div>
      
      {/* --- ADD / EDIT USER MODAL --- */}
      {(isEditModalOpen || isAddModalOpen) && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1E293B] p-6 rounded-xl w-full max-w-lg border border-gray-600 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-white">
                        {isAddModalOpen ? 'افزودن کاربر جدید' : `ویرایش کاربر: ${selectedUser?.fullName}`}
                    </h3>
                    <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">نام کامل</label>
                            <input className="w-full input-styled p-2" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="نام و نام خانوادگی"/>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">ایمیل (نام کاربری)</label>
                            <input className="w-full input-styled p-2" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" disabled={isEditModalOpen} dir="ltr"/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">نقش</label>
                            <select className="w-full input-styled p-2" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                                <option value="athlete">ورزشکار</option>
                                <option value="coach">مربی</option>
                                <option value="admin">مدیر</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-gray-400 text-xs block mb-1">وضعیت</label>
                            <select className="w-full input-styled p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                                <option value="active">فعال</option>
                                <option value="banned">مسدود</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs block mb-1">سطح اشتراک</label>
                        <select className="w-full input-styled p-2" value={formData.subscription} onChange={e => setFormData({...formData, subscription: e.target.value})}>
                            <option value="free">رایگان (Free)</option>
                            <option value="elite">ویژه (Elite)</option>
                            <option value="elite_plus">ویژه پلاس (Elite Plus)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-gray-400 text-xs block mb-1">یادداشت مدیر (محرمانه)</label>
                        <textarea className="w-full input-styled p-2 resize-none" rows={3} value={formData.adminNotes} onChange={e => setFormData({...formData, adminNotes: e.target.value})} placeholder="توضیحات داخلی..." />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
                    <button onClick={() => { setIsEditModalOpen(false); setIsAddModalOpen(false); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm">انصراف</button>
                    <button onClick={saveUser} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-bold shadow-lg">
                        {isAddModalOpen ? 'ایجاد کاربر' : 'ذخیره تغییرات'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- SEND MESSAGE MODAL --- */}
      {isMessageModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1E293B] p-6 rounded-xl w-full max-w-lg border border-gray-600 shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Mail className="text-yellow-400"/> ارسال پیام به {selectedUser.fullName}
                    </h3>
                    <button onClick={() => setIsMessageModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs block mb-1">موضوع پیام</label>
                        <input className="w-full input-styled p-3" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} placeholder="مثلا: خوش آمدید"/>
                    </div>
                    <div>
                        <label className="text-gray-400 text-xs block mb-1">متن پیام</label>
                        <textarea className="w-full input-styled p-3 h-32 resize-none" value={messageBody} onChange={e => setMessageBody(e.target.value)} placeholder="متن پیام خود را اینجا بنویسید..." />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-700">
                    <button onClick={() => setIsMessageModalOpen(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm">انصراف</button>
                    <button onClick={sendMessageToUser} className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white text-sm font-bold flex items-center shadow-lg">
                        <Send size={16} className="ml-2 rotate-180"/> ارسال پیام
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- USER TABLE --- */}
      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-black/30 text-gray-400 text-xs uppercase font-bold border-b border-gray-700">
                    <tr>
                        <th className="p-4">کاربر / ایمیل</th>
                        <th className="p-4">نقش</th>
                        <th className="p-4">اشتراک</th>
                        <th className="p-4">تاریخ ثبت‌نام</th>
                        <th className="p-4">وضعیت</th>
                        <th className="p-4 text-center">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition group">
                            <td className="p-4">
                                <div className="font-bold text-white text-sm">{u.fullName}</div>
                                <div className="text-xs text-gray-500 font-mono" dir="ltr">{u.email}</div>
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                    u.role === 'admin' ? 'bg-red-900/30 text-red-400 border border-red-500/20' : 
                                    u.role === 'coach' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' : 
                                    'bg-gray-700 text-gray-300'
                                }`}>
                                    {u.role}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-300">
                                {u.subscription === 'elite' ? <span className="text-yellow-400 font-bold">Elite</span> : 
                                 u.subscription === 'elite_plus' ? <span className="text-cyan-400 font-bold">Elite+</span> : 
                                 <span className="text-gray-500">Free</span>}
                            </td>
                            <td className="p-4 text-xs text-gray-400 font-mono">
                                {u.joinDate}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center w-fit ${u.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                    {u.status === 'banned' ? <Lock size={10} className="mr-1"/> : <Check size={10} className="mr-1"/>}
                                    {u.status === 'banned' ? 'مسدود' : 'فعال'}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex justify-center gap-2 opacity-100 md:opacity-60 md:group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleMessageClick(u)} className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition" title="ارسال پیام">
                                        <Mail size={16}/>
                                    </button>
                                    <button onClick={() => handleEditClick(u)} className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600 hover:text-white transition" title="ویرایش">
                                        <Edit2 size={16}/>
                                    </button>
                                    <button onClick={() => handleDeleteClick(u)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition" title="حذف کاربر">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <UserCheck className="w-12 h-12 mb-4 opacity-20"/>
                <p>کاربری با این مشخصات یافت نشد.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;