
import React, { useState, useEffect } from 'react';
import { PendingPayment, PaymentStatus } from '../types';
import { getPendingPayments, approvePayment, rejectPayment } from '../services/adminService';
import { 
    CheckCircle, XCircle, Loader2, ExternalLink, Calendar, 
    CreditCard, AlertTriangle, ShieldCheck, X, MessageSquare, Filter, Eye 
} from 'lucide-react';

const AdminPaymentPanel: React.FC = () => {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Succeeded' | 'Failed'>('Pending');
  
  // Modals
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; paymentId: string | null; userId: string | null }>({ isOpen: false, paymentId: null, userId: null });
  const [rejectReason, setRejectReason] = useState('');
  const [receiptModal, setReceiptModal] = useState<{ isOpen: boolean; url: string | null }>({ isOpen: false, url: null });

  const fetchPayments = async () => {
    setLoading(true);
    const data = await getPendingPayments();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
      if (filterStatus === 'All') {
          setFilteredPayments(payments);
      } else if (filterStatus === 'Pending') {
          setFilteredPayments(payments.filter(p => p.status === 'pending' || p.status === 'needs_review' || p.status === 'waiting'));
      } else if (filterStatus === 'Succeeded') {
          setFilteredPayments(payments.filter(p => p.status === 'succeeded'));
      } else {
          setFilteredPayments(payments.filter(p => p.status === 'failed'));
      }
  }, [payments, filterStatus]);

  const handleApprove = async (payment: PendingPayment) => {
    if (!confirm(`آیا از تایید پرداخت ${payment.userName} و فعال‌سازی طرح ${payment.plan} اطمینان دارید؟`)) return;
    
    setProcessingId(payment.id);
    const success = await approvePayment(payment.id, payment.userId, payment.plan, payment.durationMonths);
    
    if (success) {
        // Optimistic Update
        setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'succeeded' } : p));
    } else {
        alert("خطا در تایید پرداخت. لطفا لاگ‌ها را بررسی کنید.");
    }
    setProcessingId(null);
  };

  const openRejectModal = (payment: PendingPayment) => {
      setRejectModal({ isOpen: true, paymentId: payment.id, userId: payment.userId });
      setRejectReason('');
  };

  const handleRejectSubmit = async () => {
      if (!rejectModal.paymentId || !rejectModal.userId) return;
      if (!rejectReason.trim()) return alert("لطفا دلیل رد کردن را بنویسید.");

      setProcessingId(rejectModal.paymentId);
      const success = await rejectPayment(rejectModal.paymentId, rejectModal.userId, rejectReason);

      if (success) {
          setPayments(prev => prev.map(p => p.id === rejectModal.paymentId ? { ...p, status: 'failed' } : p));
          setRejectModal({ isOpen: false, paymentId: null, userId: null });
      } else {
          alert("خطا در رد پرداخت.");
      }
      setProcessingId(null);
  };

  const getStatusBadge = (status: PaymentStatus) => {
      switch(status) {
          case 'succeeded': return 'bg-green-500/20 text-green-400 border border-green-500/30';
          case 'failed': return 'bg-red-500/20 text-red-400 border border-red-500/30';
          case 'needs_review': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse';
          case 'waiting': return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
          default: return 'bg-gray-500/20 text-gray-400'; 
      }
  };

  const translateStatus = (status: PaymentStatus) => {
      switch(status) {
          case 'succeeded': return 'تایید شده';
          case 'failed': return 'رد شده';
          case 'needs_review': return 'در انتظار بررسی';
          case 'waiting': return 'منتظر پرداخت';
          case 'pending': return 'در صف';
          default: return status;
      }
  };

  return (
    <div className="p-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-blue-500"/> مدیریت مالی و اشتراک‌ها</h2>
            <p className="text-sm text-gray-400 mt-1">بررسی تراکنش‌های تتر و فعال‌سازی دستی اشتراک کاربران</p>
        </div>
        
        <div className="flex bg-[#1E293B] p-1 rounded-lg border border-gray-700">
             {['Pending', 'Succeeded', 'Failed', 'All'].map((s) => (
                 <button
                    key={s}
                    onClick={() => setFilterStatus(s as any)}
                    className={`px-4 py-2 rounded-md text-xs font-bold transition ${filterStatus === s ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                     {s === 'Pending' ? 'در انتظار' : s === 'Succeeded' ? 'موفق' : s === 'Failed' ? 'ناموفق' : 'همه'}
                 </button>
             ))}
        </div>
        
        <button onClick={fetchPayments} className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition">
            <Loader2 className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> بروزرسانی
        </button>
      </div>

      <div className="bg-[#1E293B] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        {loading ? (
            <div className="p-20 flex justify-center text-gray-400">
                <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
            </div>
        ) : filteredPayments.length === 0 ? (
            <div className="p-20 text-center text-gray-500 flex flex-col items-center">
                <CheckCircle className="w-16 h-16 mb-4 text-green-500 opacity-20"/>
                <p className="text-lg">موردی یافت نشد.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-black/40 text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            <th className="p-5 border-b border-gray-700">کاربر</th>
                            <th className="p-5 border-b border-gray-700">طرح انتخابی</th>
                            <th className="p-5 border-b border-gray-700">مبلغ (USDT)</th>
                            <th className="p-5 border-b border-gray-700">TXID / مدرک</th>
                            <th className="p-5 border-b border-gray-700 text-center">وضعیت</th>
                            <th className="p-5 border-b border-gray-700 text-center">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-gray-200">
                        {filteredPayments.map(p => (
                            <tr key={p.id} className="hover:bg-white/5 transition group">
                                <td className="p-5">
                                    <div className="font-bold text-white text-base">{p.userName}</div>
                                    <div className="text-[10px] text-gray-500 font-mono mt-1 opacity-70" dir="ltr">{p.userId}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex flex-col gap-1">
                                        <span className={`px-2 py-0.5 rounded w-fit text-[10px] font-bold border ${p.plan === 'elite_plus' ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30' : 'bg-yellow-900/30 text-yellow-300 border-yellow-500/30'}`}>
                                            {p.plan === 'elite_plus' ? 'Elite Plus' : 'Elite'}
                                        </span>
                                        <span className="text-xs text-gray-400">{p.durationMonths} ماهه</span>
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1"><Calendar size={10}/> {p.date}</div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="font-mono text-green-400 font-bold text-lg" dir="ltr">${p.amount}</div>
                                    <div className="text-[10px] text-gray-500 mt-1">{p.method === 'usdt_trc20' ? 'TRC20' : 'Manual'}</div>
                                </td>
                                <td className="p-5">
                                    {p.receipt_url ? (
                                        <button 
                                            onClick={() => setReceiptModal({isOpen: true, url: p.receipt_url!})}
                                            className="inline-flex items-center gap-1 text-xs bg-blue-900/30 text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-900/50 transition"
                                        >
                                            <Eye size={12}/> مشاهده رسید
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 max-w-[180px]">
                                            <span className="text-xs font-mono text-gray-300 truncate select-all" title={p.tx_id} dir="ltr">
                                                {p.tx_id || '---'}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-5 text-center">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${getStatusBadge(p.status)}`}>
                                        {translateStatus(p.status)}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex justify-center gap-2">
                                        {(p.status === 'pending' || p.status === 'needs_review' || p.status === 'waiting') ? (
                                            <>
                                                <button 
                                                    onClick={() => handleApprove(p)} 
                                                    disabled={!!processingId}
                                                    className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-500 rounded-lg text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                                    title="تایید و فعال‌سازی"
                                                >
                                                    {processingId === p.id ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={18}/>}
                                                </button>
                                                <button 
                                                    onClick={() => openRejectModal(p)} 
                                                    disabled={!!processingId}
                                                    className="w-9 h-9 flex items-center justify-center bg-red-600 hover:bg-red-500 rounded-lg text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                                    title="رد کردن"
                                                >
                                                    <XCircle size={18}/>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-600 font-mono text-xs">--</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-[#1E293B] border border-red-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <AlertTriangle className="text-red-500"/> رد درخواست
                      </h3>
                      <button onClick={() => setRejectModal({isOpen: false, paymentId: null, userId: null})} className="text-gray-400 hover:text-white"><X size={20}/></button>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4">لطفا دلیل رد شدن پرداخت را بنویسید. این پیام برای کاربر ارسال خواهد شد.</p>
                  
                  <textarea 
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="مثلا: کد رهگیری نامعتبر است یا مبلغ واریزی تطابق ندارد..."
                      className="w-full bg-black/30 border border-gray-600 rounded-xl p-3 text-white text-sm h-32 resize-none focus:border-red-500 outline-none mb-4"
                  />
                  
                  <div className="flex justify-end gap-3">
                      <button onClick={() => setRejectModal({isOpen: false, paymentId: null, userId: null})} className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600 text-white">انصراف</button>
                      <button onClick={handleRejectSubmit} className="px-6 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white font-bold flex items-center">
                          <MessageSquare size={16} className="mr-2"/> ارسال و رد
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Receipt Preview Modal */}
      {receiptModal.isOpen && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in" onClick={() => setReceiptModal({isOpen: false, url: null})}>
              <div className="relative max-w-2xl w-full max-h-[90vh] bg-[#1E293B] rounded-2xl overflow-hidden shadow-2xl border border-gray-700" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h3 className="text-white font-bold">تصویر رسید</h3>
                      <button onClick={() => setReceiptModal({isOpen: false, url: null})} className="text-gray-400 hover:text-white"><X size={24}/></button>
                  </div>
                  <div className="p-4 bg-black flex justify-center">
                      <img src={receiptModal.url!} alt="Receipt" className="max-h-[70vh] object-contain" />
                  </div>
                  <div className="p-4 bg-[#1E293B] text-center">
                      <a href={receiptModal.url!} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm flex items-center justify-center">
                          دانلود تصویر اصلی <ExternalLink size={14} className="ml-1"/>
                      </a>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPaymentPanel;
