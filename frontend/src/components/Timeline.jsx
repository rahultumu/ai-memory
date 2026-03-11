import React from 'react';
import { Clock, Calendar, Bookmark } from 'lucide-react';

const COLORS = {
  Happy: '#10B981', Sad: '#6366F1', Neutral: '#9CA3AF', Stressed: '#EF4444'
};

export default function Timeline({ memories }) {
  if (!memories.length) return <div className="text-center py-10 text-gray-400">No memories to show in timeline.</div>;

  return (
    <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100">
      {memories.map((mem, index) => (
        <div key={mem.id} className="relative">
          <div 
            className="absolute -left-10 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center"
            style={{ backgroundColor: COLORS[mem.emotion] || COLORS.Neutral }}
          >
            <Bookmark className="w-2 h-2 text-white" />
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                <span>{new Date(mem.created_at).toLocaleDateString()} at {new Date(mem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span 
                className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-white"
                style={{ backgroundColor: COLORS[mem.emotion] || COLORS.Neutral }}
              >
                {mem.emotion}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{mem.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
