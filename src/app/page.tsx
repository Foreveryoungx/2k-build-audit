'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle, CheckCircle, Zap, DollarSign, Share2,
  Target, Dribbble, Shield, MoveUp, Info, ChevronRight,
  Menu, X, TrendingUp, AlertCircle
} from 'lucide-react';

// --- DATA & TYPES ---
interface Requirements { [key: string]: number; }

interface MetaAnimation {
  id: string;
  name: string;
  category: 'Finishing' | 'Shooting' | 'Playmaking' | 'Defense';
  req: Requirements;
  msg: string;
  cost: number;
}

interface InputState {
  [key: string]: number; // Allow dynamic access
  driving_dunk: number;
  driving_layup: number;
  standing_dunk: number;
  post_control: number;
  mid_range_shot: number;
  three_point_shot: number;
  free_throw: number;
  pass_accuracy: number;
  ball_handle: number;
  speed_with_ball: number;
  interior_defense: number;
  perimeter_defense: number;
  steal: number;
  block: number;
  offensive_rebound: number;
  defensive_rebound: number;
  speed: number;
  acceleration: number;
  strength: number;
  vertical: number;
  stamina: number;
}

interface AuditResult {
  score: number;
  warnings: { id: string, name: string, msg: string, missing: string[], severity: 'critical' | 'warning', req?: Requirements }[];
  successes: { id: string, name: string, category: string, req?: Requirements }[];
  opportunities: { id: string, name: string, category: string, req?: Requirements }[];
}

// Expanded Data Set for "Full Builder" feel
const META_ANIMATIONS: MetaAnimation[] = [
  // FINISHING
  { id: "cont_elite_1", name: "Elite Contact Dunks (Off One)", category: 'Finishing', req: { driving_dunk: 99, vertical: 90 }, msg: "Missing Elite Contacts (Off One).", cost: 50 },
  { id: "cont_elite_2", name: "Elite Contact Dunks (Off Two)", category: 'Finishing', req: { driving_dunk: 96, vertical: 86 }, msg: "Missing Elite Contacts (Off Two).", cost: 45 },
  { id: "cont_pro_1", name: "Pro Contact Dunks (Off One)", category: 'Finishing', req: { driving_dunk: 89, vertical: 78 }, msg: "Missing Pro Contacts (Off One).", cost: 40 },
  { id: "cont_pro_2", name: "Pro Contact Dunks (Off Two)", category: 'Finishing', req: { driving_dunk: 87, vertical: 75 }, msg: "Missing Pro Contacts (Off Two). This is the standard minimum.", cost: 35 },

  // SHOOTING
  { id: "limitless_gold", name: "Gold Limitless Range", category: 'Shooting', req: { three_point_shot: 96 }, msg: "Paying Elite prices for Silver results if < 96.", cost: 60 },
  { id: "set_shot_gold", name: "Gold Set Shot Specialist", category: 'Shooting', req: { three_point_shot: 89 }, msg: "89 is the 'Golden Number' for catch & shoot.", cost: 40 },
  { id: "base_tmac", name: "T-Mac Jump Shot Base", category: 'Shooting', req: { mid_range_shot: 87 }, msg: "You need 87 Mid or 3PT for T-Mac base (Meta).", cost: 30 },

  // PLAYMAKING
  { id: "drib_kyrie", name: "Kyrie Dribble Style", category: 'Playmaking', req: { speed_with_ball: 90 }, msg: "Fastest dribble style in the game.", cost: 35 },
  { id: "hali_pass", name: "Haliburton Pass Style", category: 'Playmaking', req: { pass_accuracy: 89 }, msg: "Fastest pass style. Avoid 87-88 dead zone.", cost: 20 },
  { id: "murray_btb", name: "Jamal Murray Behind Back", category: 'Playmaking', req: { ball_handle: 83 }, msg: "The #1 escape move. Don't sit at 80-82.", cost: 25 },

  // DEFENSE
  { id: "glove_gold", name: "Gold Glove", category: 'Defense', req: { steal: 91 }, msg: "91 Steal is the pluck breakpoint.", cost: 45 },
  { id: "intercept_gold", name: "Gold Interceptor", category: 'Defense', req: { steal: 85 }, msg: "Lane steal meta starts here.", cost: 35 },
  { id: "anchor_gold", name: "Gold Anchor", category: 'Defense', req: { block: 92, interior_defense: 77 }, msg: "Need 92 Block + 77 Interior for Gold Anchor.", cost: 40 },
  { id: "rebound_gold", name: "Gold Rebound Chaser", category: 'Defense', req: { defensive_rebound: 92 }, msg: "92/93 is the standard for bigs.", cost: 35 },
];

export default function BuilderPage() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'All' | 'Finishing' | 'Shooting' | 'Playmaking' | 'Defense' | 'Physicals'>('All');
  const [useCapBreaker, setUseCapBreaker] = useState(false);
  const [showMobileAudit, setShowMobileAudit] = useState(false);

  // Initial Attribute State
  const [inputs, setInputs] = useState<InputState>({
    driving_dunk: 85, driving_layup: 70, standing_dunk: 40, post_control: 25,
    mid_range_shot: 70, three_point_shot: 78, free_throw: 60,
    pass_accuracy: 70, ball_handle: 80, speed_with_ball: 75,
    interior_defense: 50, perimeter_defense: 75, steal: 60, block: 40, offensive_rebound: 40, defensive_rebound: 60,
    speed: 80, acceleration: 75, strength: 60, vertical: 75, stamina: 90
  });

  const [audit, setAudit] = useState<AuditResult>({ score: 0, warnings: [], successes: [], opportunities: [] });

  // --- LOGIC ---

  // Real-time auditor effect
  useEffect(() => {
    let score = 50; // Base score
    let warnings: any[] = [];
    let successes: any[] = [];
    let opportunities: any[] = [];

    META_ANIMATIONS.forEach((anim) => {
      let passed = true;
      let closeCall = false; // Within 3 points
      let missing: string[] = [];

      Object.keys(anim.req).forEach((key) => {
        const val = inputs[key];
        const req = anim.req[key];
        const potential = val + 5;

        if (val < req) {
          passed = false;
          if (val >= req - 3) closeCall = true;
          missing.push(`${key.replace(/_/g, ' ')} ${val}/${req}`);
        }

        // Cap Breaker Check
        if (!passed && useCapBreaker && potential >= req) {
          if (!opportunities.find(o => o.id === anim.id)) {
            opportunities.push({ ...anim });
          }
        }
      });

      if (passed) {
        successes.push({ ...anim });
        score += 5;
      } else if (closeCall) {
        warnings.push({ ...anim, missing, severity: 'warning' });
        score -= 5;
      }
    });

    // Score clamp
    if (score > 99) score = 99;
    if (score < 50) score = 50;

    setAudit({ score, warnings, successes, opportunities });
  }, [inputs, useCapBreaker]);

  const updateVal = (key: string, val: number) => {
    const clamped = Math.min(99, Math.max(25, val));
    setInputs(prev => ({ ...prev, [key]: clamped }));
  };

  // --- SUB-COMPONENTS ---

  const AttributeRow = ({ label, statKey, color }: { label: string, statKey: string, color: string }) => {
    const val = inputs[statKey];

    // Check if this specific row is triggering a warning
    const activeWarning = audit.warnings.find(w => w.missing.some(m => m.includes(statKey.replace(/_/g, ' '))));
    const activeSuccess = audit.successes.find(s => Object.keys(s.req || {}).includes(statKey));

    return (
      <div className="mb-4 group">
        <div className="flex justify-between items-end mb-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
            {label}
            {activeWarning && <AlertTriangle size={12} className="text-amber-500 animate-pulse" />}
            {activeSuccess && <CheckCircle size={12} className="text-emerald-500" />}
          </label>
          <span className={`font-mono font-bold text-lg ${activeWarning ? 'text-amber-400' : 'text-slate-200'}`}>
            {val}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Custom Slider Track */}
          <div className="relative flex-1 h-8 bg-slate-900 rounded-md border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors">
            {/* Fill Bar */}
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-150 ${color} opacity-80`}
              style={{ width: `${(val - 25) / (99 - 25) * 100}%` }}
            />

            {/* Invisible Input Overlay */}
            <input
              type="range"
              min="25"
              max="99"
              value={val}
              onChange={(e) => updateVal(statKey, parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
            />

            {/* Threshold Markers (Visual Cues) */}
            <div className="absolute top-0 right-[15%] h-full w-px bg-slate-950/20 z-0 pointer-events-none" title="85 Threshold"></div>
            <div className="absolute top-0 right-[8%] h-full w-px bg-slate-950/20 z-0 pointer-events-none" title="92 Threshold"></div>
          </div>

          {/* Precision Buttons */}
          <div className="flex gap-1">
            <button onClick={() => updateVal(statKey, val - 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded text-slate-400 hover:text-white hover:bg-slate-700">-</button>
            <button onClick={() => updateVal(statKey, val + 1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded text-slate-400 hover:text-white hover:bg-slate-700">+</button>
          </div>
        </div>

        {/* Inline Warning Text */}
        {activeWarning && (
          <div className="mt-1 text-[10px] text-amber-500 font-medium flex items-center gap-1">
            <MoveUp size={10} /> Push to {activeWarning.req?.[statKey] || 'higher'} for {activeWarning.name}
          </div>
        )}
      </div>
    );
  };

  const CategorySection = ({ title, color, icon: Icon, stats }: any) => (
    <div className="mb-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/50">
        <Icon className={color.replace('bg-', 'text-')} size={18} />
        <h3 className="font-bold text-slate-200 uppercase tracking-widest text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-8">
        {stats.map((s: any) => (
          <AttributeRow key={s.key} label={s.label} statKey={s.key} color={color} />
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md fixed top-0 w-full z-50 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-black text-white text-xs">2K</div>
          <h1 className="font-bold text-lg tracking-tight text-slate-100 hidden md:block">BuildAudit <span className="text-slate-500 font-normal">Pro</span></h1>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-900 rounded-full px-1 border border-slate-800">
            <button
              onClick={() => setUseCapBreaker(false)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${!useCapBreaker ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Current
            </button>
            <button
              onClick={() => setUseCapBreaker(true)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${useCapBreaker ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Zap size={10} /> +5 Cap Breakers
            </button>
          </div>
          <button
            className="md:hidden p-2 text-slate-300"
            onClick={() => setShowMobileAudit(!showMobileAudit)}
          >
            {showMobileAudit ? <X /> : <AlertCircle className={audit.warnings.length > 0 ? "text-amber-500" : ""} />}
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <div className="pt-20 px-4 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">

        {/* LEFT COLUMN: BUILDER INPUTS (Scrollable) */}
        <div className="lg:col-span-8 overflow-y-auto pr-2 pb-20 custom-scrollbar">

          {/* Physicals Header Card */}
          <div className="bg-slate-900 rounded-xl p-5 mb-6 border border-slate-800 flex flex-wrap gap-6 items-center">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Height</label>
              <select className="bg-slate-950 border border-slate-700 text-slate-200 text-sm font-bold rounded px-3 py-2 w-24">
                <option>6'3"</option><option>6'6"</option><option>6'8"</option><option>7'0"</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Weight</label>
              <div className="flex items-center text-sm font-bold bg-slate-950 border border-slate-700 rounded px-3 py-2 w-24">
                205 <span className="text-slate-600 ml-1 text-xs">lbs</span>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Wingspan</label>
              <div className="flex items-center text-sm font-bold bg-slate-950 border border-slate-700 rounded px-3 py-2 w-24">
                6'11"
              </div>
            </div>
            <div className="ml-auto px-4 py-2 bg-slate-800 rounded border border-slate-700 text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Build Cost</div>
              <div className="text-green-400 font-black text-lg">~${(50 + (audit.score * 0.5)).toFixed(0)}</div>
            </div>
          </div>

          {/* Category Tabs (Mobile Sticky) */}
          <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-20 pb-4 pt-2 flex gap-2 overflow-x-auto hide-scrollbar mb-4 border-b border-slate-900">
            {['All', 'Finishing', 'Shooting', 'Playmaking', 'Defense'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ATTRIBUTE SECTIONS */}
          <div className="space-y-2">
            {(activeTab === 'All' || activeTab === 'Finishing') && (
              <CategorySection
                title="Finishing" color="bg-blue-500" icon={MoveUp}
                stats={[
                  { label: "Driving Dunk", key: "driving_dunk" },
                  { label: "Driving Layup", key: "driving_layup" },
                  { label: "Standing Dunk", key: "standing_dunk" },
                  { label: "Post Control", key: "post_control" }
                ]}
              />
            )}

            {(activeTab === 'All' || activeTab === 'Shooting') && (
              <CategorySection
                title="Shooting" color="bg-emerald-500" icon={Target}
                stats={[
                  { label: "Mid-Range Shot", key: "mid_range_shot" },
                  { label: "Three-Point Shot", key: "three_point_shot" },
                  { label: "Free Throw", key: "free_throw" }
                ]}
              />
            )}

            {(activeTab === 'All' || activeTab === 'Playmaking') && (
              <CategorySection
                title="Playmaking" color="bg-amber-500" icon={Dribbble}
                stats={[
                  { label: "Pass Accuracy", key: "pass_accuracy" },
                  { label: "Ball Handle", key: "ball_handle" },
                  { label: "Speed With Ball", key: "speed_with_ball" }
                ]}
              />
            )}

            {(activeTab === 'All' || activeTab === 'Defense') && (
              <CategorySection
                title="Defense / Rebounding" color="bg-rose-500" icon={Shield}
                stats={[
                  { label: "Interior Defense", key: "interior_defense" },
                  { label: "Perimeter Defense", key: "perimeter_defense" },
                  { label: "Steal", key: "steal" },
                  { label: "Block", key: "block" },
                  { label: "Offensive Rebound", key: "offensive_rebound" },
                  { label: "Defensive Rebound", key: "defensive_rebound" }
                ]}
              />
            )}

            {(activeTab === 'All' || activeTab === 'Physicals') && (
              <CategorySection
                title="Physicals" color="bg-slate-400" icon={Info}
                stats={[
                  { label: "Speed", key: "speed" },
                  { label: "Acceleration", key: "acceleration" },
                  { label: "Strength", key: "strength" },
                  { label: "Vertical", key: "vertical" },
                  { label: "Stamina", key: "stamina" }
                ]}
              />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: AUDIT DASHBOARD (Sticky) */}
        <div className={`
          lg:col-span-4 lg:block
          fixed inset-0 lg:static bg-slate-950 lg:bg-transparent z-40 lg:z-auto p-4 lg:p-0
          transition-transform duration-300
          ${showMobileAudit ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
          <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">

            {/* Dashboard Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp className="text-indigo-400" size={18} /> Live Analysis
                </h2>
                <button onClick={() => setShowMobileAudit(false)} className="lg:hidden text-slate-400"><X /></button>
              </div>
              <p className="text-xs text-slate-500">Real-time check against Meta requirements.</p>
            </div>

            {/* Scrollable Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

              {/* 1. WARNINGS */}
              {audit.warnings.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Alerts</h3>
                  {audit.warnings.map((warn) => (
                    <div key={warn.id} className="bg-amber-500/10 border-l-2 border-amber-500 p-3 rounded-r-md">
                      <div className="flex justify-between items-start">
                        <span className="text-amber-200 font-bold text-sm">{warn.name}</span>
                      </div>
                      <p className="text-amber-200/60 text-xs mt-1 leading-snug">{warn.msg}</p>
                      <div className="mt-2 text-[10px] font-mono text-amber-500 bg-amber-500/10 inline-block px-1.5 py-0.5 rounded">
                        MISSING: {warn.missing.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg text-center">
                  <CheckCircle className="mx-auto text-emerald-500 mb-2" />
                  <p className="text-emerald-200 text-sm font-bold">No Dead Zones Detected</p>
                  <p className="text-emerald-200/60 text-xs">Your attribute distribution is efficient.</p>
                </div>
              )}

              {/* 2. CAP BREAKER OPPORTUNITIES */}
              {useCapBreaker && audit.opportunities.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={12} /> Cap Breaker Unlocks
                  </h3>
                  {audit.opportunities.map((opp) => (
                    <div key={opp.id} className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0"></div>
                      <span className="text-purple-200 text-sm font-medium">{opp.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. SUCCESSES */}
              {audit.successes.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Unlocked Animations</h3>
                  <div className="grid grid-cols-1 gap-1">
                    {audit.successes.map((succ) => (
                      <div key={succ.id} className="text-xs text-slate-400 flex items-center gap-2 py-1 px-2 hover:bg-slate-800 rounded transition-colors">
                        <CheckCircle size={10} className="text-slate-600" />
                        {succ.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900">
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                <Share2 size={16} /> Share Build Report
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}