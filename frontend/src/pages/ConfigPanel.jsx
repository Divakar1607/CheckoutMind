import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, ShieldAlert, Cpu } from 'lucide-react';

const ConfigPanel = () => {
  const [config, setConfig] = useState({
    max_discount_percentage: '',
    agent_tone: '',
    enabled_for_abandonment: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/config');
        setConfig(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      await axios.put('http://localhost:5000/api/config', { key, value });
      setTimeout(() => setSaving(false), 500);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-brand-500 font-bold animate-pulse">Loading Guardrails...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in-up">
      <div className="flex items-center space-x-4 mb-10">
        <div className="bg-brand-900/50 p-4 rounded-2xl border border-brand-500/30 shadow-[0_0_20px_rgba(217,70,239,0.3)]">
          <Settings className="text-brand-400" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Agent Guardrails</h1>
          <p className="text-gray-400 mt-1">Configure limits and personality for the autonomous engine.</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-fuchsia-500 to-purple-500"></div>
        
        <div className="bg-brand-900/20 border-b border-white/5 p-5 flex items-start gap-4">
          <div className="bg-brand-500/20 p-2 rounded-full mt-1">
            <Cpu className="text-brand-400" size={20} />
          </div>
          <div>
            <h3 className="text-brand-300 font-bold tracking-wide">Live Constraints Active</h3>
            <p className="text-gray-400 text-sm mt-1">
              CheckoutMind reads these configurations in real-time before executing any action. Changes are applied instantly to the neural prompt.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-10">
          
          {/* Max Discount */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-widest">
              Maximum Negotiation Limit
            </label>
            <p className="text-sm text-gray-400 mb-4">The absolute highest discount percentage the AI is permitted to offer.</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative">
                <input 
                  type="number" 
                  value={config.max_discount_percentage}
                  onChange={(e) => handleChange('max_discount_percentage', e.target.value)}
                  className="block w-full sm:w-32 rounded-xl bg-dark-900 border border-white/10 text-white font-bold px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                  min="0" max="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
              </div>
              <button 
                onClick={() => handleSave('max_discount_percentage', config.max_discount_percentage)}
                className="flex items-center justify-center gap-2 bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white border border-brand-500/30 hover:border-brand-400 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)]"
                disabled={saving}
              >
                <Save size={18} /> {saving ? 'Applying...' : 'Apply Limit'}
              </button>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Agent Tone */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-widest">
              Agent Persona & Tone
            </label>
            <p className="text-sm text-gray-400 mb-4">Dictates the style of language used in popups and emails.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={config.agent_tone}
                onChange={(e) => handleChange('agent_tone', e.target.value)}
                className="block w-full max-w-md rounded-xl bg-dark-900 border border-white/10 text-white font-bold px-4 py-3 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors appearance-none"
              >
                <option value="urgent but friendly">Urgent but friendly</option>
                <option value="highly professional and calm">Highly professional and calm</option>
                <option value="playful and exciting">Playful and exciting</option>
                <option value="luxurious and exclusive">Luxurious and exclusive</option>
              </select>
              <button 
                onClick={() => handleSave('agent_tone', config.agent_tone)}
                className="flex items-center justify-center gap-2 bg-brand-500/20 hover:bg-brand-500 text-brand-300 hover:text-white border border-brand-500/30 hover:border-brand-400 px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] hover:shadow-[0_0_20px_rgba(217,70,239,0.4)] sm:w-auto w-full"
                disabled={saving}
              >
                <Save size={18} /> Update Persona
              </button>
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Abandonment Emails */}
          <div className="group">
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-2 uppercase tracking-widest">
              Abandonment Recovery
            </label>
            <p className="text-sm text-gray-400 mb-4">Allow the AI to independently draft follow-up sequences for abandoned carts.</p>
            <div className="flex items-center gap-4 bg-dark-900/50 p-4 rounded-xl border border-white/5 inline-flex">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.enabled_for_abandonment === 'true'}
                  onChange={(e) => {
                    const val = e.target.checked ? 'true' : 'false';
                    handleChange('enabled_for_abandonment', val);
                    handleSave('enabled_for_abandonment', val);
                  }}
                  className="sr-only peer" 
                />
                <div className="w-14 h-7 bg-dark-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-500 border border-white/10 shadow-inner"></div>
              </label>
              <span className={`text-sm font-bold uppercase tracking-wider ${config.enabled_for_abandonment === 'true' ? 'text-brand-400' : 'text-gray-500'}`}>
                {config.enabled_for_abandonment === 'true' ? 'Engaged' : 'Standby'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
