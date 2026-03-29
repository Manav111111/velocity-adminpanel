import { Star, MessageSquare } from 'lucide-react';

export default function Reviews() {
  const reviews = [
    { title: 'Great Service!', rating: 5, date: 'Oct 24, 2023', author: 'Sarah J.', text: 'Super fast delivery and the products were perfectly packaged. Will order again.' },
    { title: 'Good but late', rating: 4, date: 'Oct 23, 2023', author: 'Mike T.', text: 'The organic milk is great but the delivery was 15 mins later than the estimate.' },
    { title: 'Missing item', rating: 2, date: 'Oct 22, 2023', author: 'Emma W.', text: 'Did not receive the blueberries I ordered. Support refunded me quickly though.' },
    { title: 'Best grocery app', rating: 5, date: 'Oct 21, 2023', author: 'David L.', text: 'VelocityPro is a lifesaver. The app is so easy to use.' },
  ];

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Reviews</h1>
          <p className="text-text-secondary mt-1">Monitor feedback and maintain quality standards.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">4.8</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Average</p>
          </div>
          <div className="flex text-accent-amber">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {reviews.map((r, i) => (
          <div key={i} className="glass-card p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1 text-accent-amber mb-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={j < r.rating ? "currentColor" : "transparent"} stroke={j < r.rating ? "none" : "currentColor"} />
                  ))}
                </div>
                <h3 className="text-base font-semibold text-white">{r.title}</h3>
              </div>
              <span className="text-xs text-text-muted">{r.date}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{r.text}</p>
            <div className="flex items-center justify-between pt-4 border-t border-dark-500/30">
              <span className="text-xs font-semibold text-white">{r.author}</span>
              <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
                <MessageSquare size={14} /> Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
