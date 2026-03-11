import React, { useState, useEffect } from 'react';
import { Mic, Send, BrainCircuit, Activity, Clock, Image as ImageIcon, Video, X } from 'lucide-react';
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
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

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
    if (!content.trim() && !file) return;
    
    setLoading(true);
    try {
      let mediaData = { media_url: null, media_type: null };
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/api/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaData = { media_url: uploadRes.data.url, media_type: uploadRes.data.type };
      }

      await api.post('/api/memories/', { 
        content, 
        ...mediaData 
      });
      
      setContent('');
      setFile(null);
      setPreview(null);
      fetchData(); // refresh data
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview({
        url,
        type: selectedFile.type.startsWith('image/') ? 'image' : 'video'
      });
    }
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
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-t-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none transition"
              />
              
              {preview && (
                <div className="relative p-2 bg-gray-50 border-x border-gray-200">
                  <button 
                    onClick={() => { setFile(null); setPreview(null); }}
                    className="absolute top-4 right-4 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {preview.type === 'image' ? (
                    <img src={preview.url} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                  ) : (
                    <video src={preview.url} className="max-h-48 rounded-lg" controls />
                  )}
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-b-xl">
                <div className="flex space-x-2">
                  <button 
                    type="button" 
                    onClick={toggleRecording}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>{isRecording ? 'Recording...' : 'Voice'}</span>
                  </button>
                  
                  <label className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 cursor-pointer transition">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Media</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || (!content && !file)}
                  className="bg-blue-600 text-white px-5 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
                >
                  <span>{loading ? 'Saving...' : 'Save'}</span>
                  <Send className="w-3.5 h-3.5 ml-1" />
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
                    {mem.media_url && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-black">
                        {mem.media_type === 'image' ? (
                          <img src={`http://localhost:8000${mem.media_url}`} alt="Memory" className="w-full object-cover max-h-40" />
                        ) : (
                          <video src={`http://localhost:8000${mem.media_url}`} className="w-full max-h-40" controls />
                        )}
                      </div>
                    )}
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
