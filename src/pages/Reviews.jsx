import { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { subscribeToCollectionOrdered } from '../services/firestoreService';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToCollectionOrdered('reviews', 'createdAt', 'desc', (data) => {
      setReviews(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Reviews</h1>
          <p className="text-text-secondary mt-1">Monitor feedback and maintain quality standards.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{loading ? '-' : averageRating}</p>
            <p className="text-xs text-text-muted uppercase tracking-wider">Average</p>
          </div>
          <div className="flex text-accent-amber">
            {[...Array(5)].map((_, i) => <Star key={i} size={20} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "transparent"} stroke={i < Math.round(Number(averageRating)) ? "none" : "currentColor"} />)}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
           <div className="glass-card p-12 text-center flex flex-col items-center">
              <Loader2 size={32} className="animate-spin text-purple-400 mb-4" />
              <p className="text-text-secondary">Loading real-time reviews...</p>
           </div>
        ) : reviews.length === 0 ? (
           <div className="glass-card p-12 text-center text-text-muted">No reviews found.</div>
        ) : reviews.map((r) => {
          const d = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt || 0);
          return (
          <div key={r.id} className="glass-card p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-1 text-accent-amber mb-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={j < (r.rating || 0) ? "currentColor" : "transparent"} stroke={j < (r.rating || 0) ? "none" : "currentColor"} />
                  ))}
                </div>
                <h3 className="text-base font-semibold text-white">{r.title || 'Review'}</h3>
              </div>
              <span className="text-xs text-text-muted">{d.toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">{r.text || r.comment}</p>
            <div className="flex items-center justify-between pt-4 border-t border-dark-500/30">
              <span className="text-xs font-semibold text-white">{r.author || r.userName || 'Anonymous'}</span>
              <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold">
                <MessageSquare size={14} /> Reply
              </button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
