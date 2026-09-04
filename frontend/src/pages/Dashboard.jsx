import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Activity, Clock, FileJson, TrendingUp, Sparkles } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('agent');
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/agent/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-12 text-center text-brand-500 animate-pulse font-bold">Initializing Reasoning Engine...</div>;

  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {});

  const toggleExpand = (id) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const stats = {
    agent: { revenue: 48000, avgDiscount: "7.5%", unnecessary: 0 },
    static: { revenue: 35000, avgDiscount: "10.0%", unnecessary: 12 }
  };
  const currentStats = stats[mode];

  const doughnutData = {
    labels: Object.keys(actionCounts),
    datasets: [{
      data: Object.values(actionCounts),
      backgroundColor: ['#3f3f46', '#d946ef', '#10b981', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const lineData = {
    labels: ['10am', '11am', '12pm', '1pm', '2pm', '3pm', 'Now'],
    datasets: [
      {
        fill: true,
        label: 'Recovered Revenue (₹)',
        data: mode === 'agent' ? [12000, 19000, 15000, 25000, 22000, 30000, 48000] : [10000, 14000, 12000, 18000, 20000, 25000, 35000],
        borderColor: mode === 'agent' ? '#d946ef' : '#9ca3af',
        backgroundColor: mode === 'agent' ? 'rgba(217, 70, 239, 0.1)' : 'rgba(156, 163, 175, 0.1)',
        tension: 0.4,
        pointBackgroundColor: mode === 'agent' ? '#d946ef' : '#9ca3af',
        pointBorderColor: '#fff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false, color: '#3f3f46' }, ticks: { color: '#a1a1aa' } },
      y: { grid: { color: '#27272a' }, ticks: { color: '#a1a1aa' } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-brand-900/50 p-4 rounded-2xl border border-brand-500/30 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
            <Brain className="text-brand-400" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Agent Reasoning Engine</h1>
            <p className="text-gray-400 mt-1">Live autonomous decisions driving growth.</p>
          </div>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-2 bg-dark-900 border border-white/10 p-1 rounded-xl">
          <button 
            onClick={() => setMode('static')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'static' ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Static Rules Mode
          </button>
          <button 
            onClick={() => setMode('agent')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${mode === 'agent' ? 'bg-brand-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Sparkles size={14} /> Agent Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Actions Breakdown */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Intervention Types</h3>
          <div className="h-48 relative">
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }} />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-3xl font-extrabold text-white">{logs.length}</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Total Actions</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(actionCounts).map(([key, val], idx) => (
              <div key={key} className="flex justify-between items-center text-sm">
                <span className="text-gray-400 capitalize flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: doughnutData.datasets[0].backgroundColor[idx] }}></span>
                  {key}
                </span>
                <span className="text-white font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Revenue Impact Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-3 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Revenue Recovered</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-fuchsia-600">₹{currentStats.revenue.toLocaleString()}</span>
                {mode === 'agent' && <span className="text-green-400 text-sm font-bold flex items-center gap-1 mb-1"><TrendingUp size={14} /> +14.2%</span>}
              </div>
            </div>
            
            <div className="flex gap-6 bg-dark-900/50 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Avg Discount</p>
                <p className="text-xl font-bold text-white">{currentStats.avgDiscount}</p>
              </div>
              <div className="w-px bg-white/10"></div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Unnecessary Discounts</p>
                <p className={`text-xl font-bold ${currentStats.unnecessary === 0 ? 'text-green-400' : 'text-red-400'}`}>{currentStats.unnecessary}</p>
              </div>
            </div>
          </div>
          <div className="h-56 w-full">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
        <Clock size={20} className="text-brand-500" /> Neural Decision Log
      </h2>
      
      <div className="space-y-4">
        {logs.map((log, idx) => {
          const isExpanded = expandedLogs.has(log.id);
          return (
            <div key={log.id} className="bg-dark-800/40 rounded-xl border border-white/5 overflow-hidden hover:border-brand-500/30 transition-colors duration-300" style={{ animationDelay: `${(idx % 5) * 50}ms` }}>
              <div className="p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-dark-900 border border-white/10 text-brand-400 text-[10px] font-bold uppercase tracking-widest">
                      {log.trigger_event.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Activity size={12} /> {log.action_type}
                    </div>
                    <button 
                      onClick={() => toggleExpand(log.id)}
                      className="text-xs font-bold text-gray-400 hover:text-brand-400 transition-colors underline"
                    >
                      {isExpanded ? 'Hide Details' : 'Show me why'}
                    </button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 animate-fade-in-up">
                    {/* Reasoning Panel */}
                    <div className="bg-gradient-to-br from-brand-900/10 to-dark-900 rounded-lg p-4 border border-brand-500/10">
                      <div className="flex items-center gap-2 text-brand-400 mb-2 font-semibold text-xs uppercase tracking-widest">
                        <Brain size={14} /> Claude's Reasoning
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed italic">
                        "{log.reasoning}"
                      </p>
                      
                      {log.action_payload !== '{}' && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Generated Payload</p>
                          <pre className="text-xs text-brand-200 bg-dark-900/80 p-3 rounded-lg border border-white/5 font-mono overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.action_payload), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Context Panel */}
                    <div className="bg-dark-900/50 rounded-lg p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 mb-2 font-semibold text-xs uppercase tracking-widest">
                        <FileJson size={14} /> State Context
                      </div>
                      <pre className="text-xs text-gray-400 overflow-x-auto font-mono">
                        {JSON.stringify(JSON.parse(log.context), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {logs.length === 0 && (
          <div className="text-center py-12 glass-panel rounded-2xl">
            <Brain size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
            <p className="text-gray-400 font-medium">No neural decisions logged yet. The agent is standing by.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
