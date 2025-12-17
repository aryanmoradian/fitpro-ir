import React, { useState, useEffect } from 'react';
import { getTransactionLogs } from '../services/adminService';
import { TransactionLog } from '../types';
import { DollarSign, Download, TrendingUp, AlertCircle } from 'lucide-react';

const AdminFinancePanel: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);

  useEffect(() => {
    getTransactionLogs().then((data) => setTransactions(data as TransactionLog[]));
  }, []);

  const totalRevenue = transactions.reduce((acc, curr) => acc + (curr.status === 'confirmed' ? curr.amount : 0), 0);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "ID,TxID,Amount,Currency,Status,Date\n" + transactions.map(e => `${e.id},${e.txid},${e.amount},${e.currency},${e.status},${e.createdAt}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-900/30 border border-green-500/30 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-1">مجموع درآمد کل</h3>
            <div className="text-3xl font-black text-green-400" dir="ltr">${totalRevenue.toLocaleString()}</div>
        </div>
        <div className="bg-blue-900/30 border border-blue-500/30 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-1">تعداد تراکنش‌ها</h3>
            <div className="text-3xl font-black text-blue-400">{transactions.length}</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-500/30 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-1">در انتظار تایید</h3>
            <div className="text-3xl font-black text-yellow-400">{transactions.filter(t => t.status === 'pending').length}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">گزارش ریزتراکنش‌ها</h2>
        <button onClick={exportCSV} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center text-sm"><Download size={16} className="ml-2"/> خروجی اکسل</button>
      </div>

      <div className="bg-[#1E293B] rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-right text-sm text-gray-300">
            <thead className="bg-black/30 uppercase text-xs font-bold text-gray-500">
                <tr>
                    <th className="p-4">شناسه تراکنش (TxID)</th>
                    <th className="p-4">مبلغ</th>
                    <th className="p-4">تاریخ</th>
                    <th className="p-4">وضعیت</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/5">
                        <td className="p-4 font-mono text-xs text-blue-300" dir="ltr">{t.txid}</td>
                        <td className="p-4 font-bold text-white" dir="ltr">${t.amount}</td>
                        <td className="p-4">{t.createdAt}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : t.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {t.status === 'confirmed' ? 'تایید شده' : t.status === 'rejected' ? 'رد شده' : 'در انتظار'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500">تراکنشی ثبت نشده است.</div>
        )}
      </div>
    </div>
  );
};

export default AdminFinancePanel;