import { CreditCard, ArrowUpRight, ArrowDownRight, Download, Filter } from 'lucide-react';

export default function Payments() {
  const transactions = [
    { id: 'TXN-90214', date: 'Oct 24, 14:22', type: 'Credit', amount: 244.50, status: 'Completed', method: 'Stripe •••• 4242' },
    { id: 'TXN-90215', date: 'Oct 24, 15:05', type: 'Credit', amount: 1029.00, status: 'Completed', method: 'PayPal' },
    { id: 'TXN-90216', date: 'Oct 24, 16:30', type: 'Refund', amount: 45.00, status: 'Processed', method: 'Stripe •••• 1111' },
    { id: 'TXN-90217', date: 'Oct 24, 18:10', type: 'Credit', amount: 89.10, status: 'Pending', method: 'Apple Pay' },
  ];

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Payments</h1>
          <p className="text-text-secondary mt-1">Manage transactions, refunds, and financial reporting.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline text-sm"><Filter size={14} /> Filter</button>
          <button className="btn-outline text-sm"><Download size={14} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Total Volume (30d)</p>
          <p className="text-3xl font-bold text-white mb-2">$142,890</p>
          <p className="text-xs text-accent-green flex items-center gap-1"><ArrowUpRight size={12} /> +12.5% vs last month</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Refunds (30d)</p>
          <p className="text-3xl font-bold text-white mb-2">$2,450</p>
          <p className="text-xs text-accent-red flex items-center gap-1"><ArrowDownRight size={12} /> +2.1% vs last month</p>
        </div>
        <div className="glass-card p-6">
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Pending Escrow</p>
          <p className="text-3xl font-bold text-white mb-2">$8,420</p>
          <p className="text-xs text-text-secondary">Clearing in 24-48 hrs</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-500/30">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] text-text-muted uppercase tracking-widest border-b border-dark-500/30">
              <th className="text-left p-4 font-semibold">Transaction ID</th>
              <th className="text-left p-4 font-semibold">Date</th>
              <th className="text-left p-4 font-semibold">Method</th>
              <th className="text-left p-4 font-semibold">Status</th>
              <th className="text-right p-4 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i} className="border-t border-dark-500/20 hover:bg-dark-500/10">
                <td className="p-4 text-sm font-semibold text-white">{t.id}</td>
                <td className="p-4 text-sm text-text-secondary">{t.date}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-text-muted" />
                    <span className="text-sm text-white">{t.method}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`status-badge ${t.status === 'Completed' || t.status === 'Processed' ? 'badge-delivered' : 'badge-pending'}`}>{t.status}</span>
                </td>
                <td className={`p-4 text-sm font-bold text-right ${t.type === 'Refund' ? 'text-accent-red' : 'text-white'}`}>
                  {t.type === 'Refund' ? '-' : '+'}${t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
