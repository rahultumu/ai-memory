import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, List, Grid, History } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../api';
import TimelineComponent from '../components/Timeline';

const COLORS = {
  Happy: '#10B981', Sad: '#6366F1', Neutral: '#9CA3AF', Stressed: '#EF4444'
};

export default function Explorer() {
  const [view, setView] = useState('search'); // 'search', 'calendar', or 'timeline'
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    // Pre-fetch timeline for calendar view
    api.get('/api/analytics/timeline').then(res => setTimeline(res.data));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/memories/search?query=${encodeURIComponent(query)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Get memories for a specific date
  const getMemoriesForDate = (selectedDate) => {
    return timeline.filter(m => {
      const d = new Date(m.created_at);
      return d.getDate() === selectedDate.getDate() &&
             d.getMonth() === selectedDate.getMonth() &&
             d.getFullYear() === selectedDate.getFullYear();
    });
  };

  const selectedDateMemories = getMemoriesForDate(date);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          {view === 'search' ? <Search className="w-6 h-6 text-blue-500" /> : <CalendarIcon className="w-6 h-6 text-blue-500" />}
          <span>{view === 'search' ? 'Search Memories' : 'Calendar View'}</span>
        </h1>
        <div className="bg-white rounded-lg border border-gray-200 p-1 flex">
          <button 
            onClick={() => setView('search')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1 ${view === 'search' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <List className="w-4 h-4" /> <span>Search</span>
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1 ${view === 'calendar' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Grid className="w-4 h-4" /> <span>Calendar</span>
          </button>
          <button 
            onClick={() => setView('timeline')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition flex items-center space-x-1 ${view === 'timeline' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <History className="w-4 h-4" /> <span>Timeline</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[60vh]">
        {view === 'search' ? (
          <div className="space-y-6">
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search natural language: e.g. 'when was I stressed last week?'"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <button type="submit" className="hidden" />
            </form>

            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-4 pt-4">
                  {[1,2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl w-full"></div>)}
                </div>
              ) : results.length > 0 ? (
                results.map(mem => (
                  <div key={mem.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition">
                    <div className="flex justify-between mb-2 text-sm text-gray-500">
                      <span>{new Date(mem.created_at).toLocaleString()}</span>
                      <span className="text-white px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: COLORS[mem.emotion] || COLORS.Neutral }}>
                        {mem.emotion}
                      </span>
                    </div>
                    <p className="text-gray-800">{mem.content}</p>
                  </div>
                ))
              ) : query && !loading ? (
                <div className="text-center text-gray-400 py-10">No memories match your search.</div>
              ) : (
                <div className="text-center text-gray-400 py-10 text-sm">Use natural language to find past experiences and emotions.</div>
              )}
            </div>
          </div>
        ) : view === 'calendar' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="calendar-wrapper flex justify-center">
              <Calendar 
                onChange={setDate} 
                value={date} 
                className="border-none shadow-none font-sans"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">{date.toDateString()}</h3>
              <div className="space-y-4">
                {selectedDateMemories.length > 0 ? (
                  selectedDateMemories.map(mem => (
                    <div key={mem.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex justify-between mb-2">
                        <span className="text-white px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: COLORS[mem.emotion] || COLORS.Neutral }}>
                          {mem.emotion}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm">{mem.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No memories recorded on this day.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <TimelineComponent memories={timeline} />
        )}
      </div>
    </div>
  );
}
