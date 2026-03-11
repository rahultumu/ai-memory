import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import api from '../api';

export default function Reflections() {
  const [reflection, setReflection] = useState(null);

  useEffect(() => {
    api.get('/api/analytics/reflections').then(res => setReflection(res.data));
  }, []);

  if (!reflection) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white space-y-4">
      <div className="flex items-center space-x-2">
        <Sparkles className="w-5 h-5 text-blue-200" />
        <h2 className="text-lg font-bold">AI Weekly Reflection</h2>
      </div>
      <p className="text-sm leading-relaxed text-blue-50 font-medium">
        "{reflection.summary}"
      </p>
      <div className="flex items-center space-x-2 pt-2 text-xs font-bold uppercase tracking-wider text-blue-200">
        <TrendingUp className="w-4 h-4" />
        <span>Mood Trend: {reflection.mood_trend}</span>
      </div>
    </div>
  );
}
