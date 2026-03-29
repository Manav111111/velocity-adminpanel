import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsData } from '../data/mockData';

export default function Analytics() {
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-text-secondary mt-1">Deep dive into store performance and conversion metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.weeklyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip cursor={{ fill: 'rgba(124,58,237,0.08)' }} contentStyle={{ backgroundColor: '#141933', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.categoryBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={v => `${v}%`} />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} width={80} />
              <Tooltip cursor={{ fill: 'rgba(124,58,237,0.08)' }} contentStyle={{ backgroundColor: '#141933', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', color: '#fff' }} />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
