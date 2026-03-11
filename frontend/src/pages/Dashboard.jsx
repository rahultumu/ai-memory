import React, { useState, useEffect } from 'react';
import { Mic, Send, BrainCircuit, Activity, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api';
import Goals from '../components/Goals';
import Reflections from '../components/Reflections';

const COLORS = {
  Happy: '#10B981', // green
  Sad: '#6366F1', // indigo
  Neutral: '#9CA3AF', // gray
  Stressed: '#EF4444' // red
};

export default function Dashboard() {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState([]);
  const [recentMemories, setRecentMemories] = useState([]);

  const fetchData = async () => {
    try {
      const [analyticsRes, timelineRes] = await Promise.all([
        api.get('/api/analytics/mood'),
        api.get('/api/analytics/timeline')
      ]);
      
      const chartData = Object.keys(analyticsRes.data)
        .filter(key => analyticsRes.data[key] > 0)
        .map(key => ({
          name: key,
          value: analyticsRes.data[key]
        }));
        
      setAnalytics(chartData);
      setRecentMemories(timelineRes.data.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    try {
      await api.post('/api/memories/', { content });
      setContent('');
      fetchData(); // refresh data
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleRecording = () => {
    // Mock recording experience for Hackathon Demo
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setContent(prev => prev + " (Transcribed from Voice: I am feeling so overwhelmed preparing for this hackathon!)");
      }, 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Input Form & Reflections */}
        <div className="md:col-span-2 space-y-6">
          <Reflections />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-blue-500" />
              <span>Log a Memory</span>
            </h2>
            <form onSubmit={handleSubmit}>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="How are you feeling right now? What happened today?"
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
              />
              <div className="flex justify-between items-center mt-3">
                <button 
                  type="button" 
                  onClick={toggleRecording}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecording ? 'Recording...' : 'Voice Note'}</span>
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !content}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Saving...' : 'Save Memory'}</span>
                  <Send className="w-4 h-4 ml-1" />
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Recent Memories</h2>
            {recentMemories.length === 0 ? (
              <p className="text-gray-500 text-sm">No memories yet. Start journaling to see them here.</p>
            ) : (
              <div className="space-y-4">
                {recentMemories.map(mem => (
                  <div key={mem.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-500">{new Date(mem.created_at).toLocaleString()}</span>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full text-white" style={{ backgroundColor: COLORS[mem.emotion] || COLORS.Neutral }}>
                        {mem.emotion || 'Neutral'}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{mem.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Analytics Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span>Mood Analytics</span>
            </h2>
            {analytics.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    data={analytics}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.Neutral} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {analytics.map(a => (
                <div key={a.name} className="flex items-center space-x-1 text-xs text-gray-600">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[a.name] }}></div>
                  <span>{a.name} ({a.value})</span>
                </div>
              ))}
            </div>
          </div>

          <Goals />
        </div>

      </div>
    </div>
  );
}
