import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import api from '../api';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/api/goals/');
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/goals/', newGoal);
      setNewGoal({ title: '', description: '' });
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleGoal = async (id) => {
    try {
      await api.patch(`/api/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <Target className="w-5 h-5 text-blue-500" />
        <span>Life Goals & Tasks</span>
      </h2>

      <form onSubmit={handleAddGoal} className="space-y-3 mb-6">
        <input 
          type="text" 
          placeholder="New Goal Title"
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          value={newGoal.title}
          onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
        />
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Description (Optional)"
            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={newGoal.description}
            onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
          />
          <button 
            type="submit" 
            disabled={loading || !newGoal.title}
            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {goals.map(goal => (
          <div 
            key={goal.id} 
            className={`flex items-center justify-between p-3 rounded-xl border transition ${goal.completed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'}`}
          >
            <div className="flex items-center space-x-3">
              <button onClick={() => toggleGoal(goal.id)} className="text-blue-500">
                {goal.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
              </button>
              <div>
                <p className={`text-sm font-medium ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{goal.title}</p>
                {goal.description && <p className="text-xs text-gray-500">{goal.description}</p>}
              </div>
            </div>
          </div>
        ))}
        {goals.length === 0 && <p className="text-gray-400 text-center text-sm py-4">No goals set. What's your next milestone?</p>}
      </div>
    </div>
  );
}
