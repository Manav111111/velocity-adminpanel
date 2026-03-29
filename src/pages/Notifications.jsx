import { Bell, Info, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    { title: 'New Order Received', desc: 'Order #ORD-90219 has been placed.', time: '2 mins ago', icon: Bell, type: 'info' },
    { title: 'Stock Alert', desc: 'Organic Almond Milk is running low (12 units left).', time: '1 hour ago', icon: AlertTriangle, type: 'warning' },
    { title: 'System Maintenance', desc: 'Server upgrade scheduled for tomorrow 02:00 UTC.', time: '3 hours ago', icon: Info, type: 'info' },
    { title: 'Payout Successful', desc: 'Weekly payout of $12,450 sent to connected bank account.', time: '1 day ago', icon: CheckCircle, type: 'success' },
  ];

  return (
    <div className="space-y-6 fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <button className="text-sm text-purple-400 hover:text-purple-300 font-semibold">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="glass-card p-5 flex gap-4 hover:border-purple-500/30 transition-colors">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0
              ${n.type === 'warning' ? 'bg-accent-red/15 text-accent-red' :
                n.type === 'success' ? 'bg-accent-green/15 text-accent-green' :
                'bg-purple-500/15 text-purple-400'}`}>
              <n.icon size={18} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                <span className="text-xs text-text-muted">{n.time}</span>
              </div>
              <p className="text-sm text-text-secondary">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
