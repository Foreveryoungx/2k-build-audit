'use client';

import React, { useState, ChangeEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Zap,
  DollarSign,
  Share2,
  Target,
  Dribbble,
  Shield,
  MoveUp,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

// --- TYPES ---
interface Requirements {
  [key: string]: number;
}

interface MetaAnimation {
  id: string;
  name: string;
  category: 'Finishing' | 'Shooting' | 'Playmaking' | 'Defense';
  req: Requirements;
  msg: string;
  cost: number;
}

interface InputState {
  [key: string]: number;
  driving_dunk: number;
  vertical: number;
  ball_handle: number;
  speed_with_ball: number;
  pass_accuracy: number;
  three_point_shot: number;
  steal: number;
}

interface Warning extends MetaAnimation {
  missing: string[];
}

interface AuditResult {
  warnings: Warning[];
  successes: MetaAnimation[];
  opportunities: MetaAnimation[];
  score: number;
}

// --- DATA ---
const META_ANIMATIONS: MetaAnimation[] = [
  { id: "contact_elite", name: "Elite Contact Dunks (Off One)", category: 'Finishing', req: { driving_dunk: 99, vertical: 90 }, msg: "You are missing the most unblockable dunk in the game.", cost: 50 },
  { id: "contact_pro", name: "Pro Contact Dunks (Off Two)", category: 'Finishing', req: { driving_dunk: 87, vertical: 75 }, msg: "Without this, you get forced into layup animations.", cost: 35 },
  { id: "dribble_jamal", name: "Jamal Murray Behind Back", category: 'Playmaking', req: { ball_handle: 83 }, msg: "The #1 escape move for guards. Essential.", cost: 25 },
  { id: "badge_lightning", name: "Gold Lightning Launch", category: 'Playmaking', req: { speed_with_ball: 86 }, msg: "The new 'Quick First Step'. Silver is too slow.", cost: 30 },
  { id: "pass_hali", name: "Tyrese Haliburton Pass Style", category: 'Playmaking', req: { pass_accuracy: 89 }, msg: "Fastest pass style. 87-88 is a dead zone.", cost: 20 },
  { id: "shoot_limitless", name: "Gold Limitless Range", category: 'Shooting', req: { three_point_shot: 96 }, msg: "Paying Elite prices for Silver results at 94.", cost: 60 },
  { id: "def_glove", name: "Gold Glove (Steal)", category: 'Defense', req: { steal: 91 }, msg: "91 is the breakpoint for consistent plucks.", cost: 45 },
  { id: "def_intercept", name: "Gold Interceptor", category: 'Defense', req: { steal: 85 }, msg: "Passing lane meta revolves around this threshold.", cost: 35 }
];

export default function Home() {
  const [inputs, setInputs] = useState<InputState>({
    driving_dunk: 80,
    vertical: 70,
    three_point_shot: 75,
    ball_handle: 80,
    speed_with_ball: 75,
    pass_accuracy: 70,
    steal: 60
  });

  const [useCapBreaker, setUseCapBreaker] = useState<boolean>(false);
  const [auditResults, setAuditResults] = useState<AuditResult | null>(null);

  // --- HANDLERS ---
  const updateVal = (key: string, val: number) => {
    let newValue = val;
    if (newValue > 99) newValue = 99;
    if (newValue < 25) newValue = 25;
    setInputs(prev => ({ ...prev, [key]: newValue }));
  };

  const calculateCost = (score: number): number => 50 + (score * 0.5);

  const runAudit = () => {
    let score = 0;
    let warnings: Warning[] = [];
    let successes: MetaAnimation[] = [];
    let opportunities: MetaAnimation[] = [];

    META_ANIMATIONS.forEach((anim) => {
      let passed = true;
      let closeCall = false;
      let missingStats: string[] = [];

      Object.keys(anim.req).forEach((statKey) => {
        const userValue = inputs[statKey] || 0;
        const reqValue = anim.req[statKey];
        const potentialValue = userValue + 5;

        if (userValue < reqValue) {
          passed = false;
          if (userValue >= reqValue - 4) closeCall = true;
          missingStats.push(`${statKey.replace(/_/g, ' ')} needs ${reqValue}`);
        }

        if (!passed && useCapBreaker && potentialValue >= reqValue) {
          if (!opportunities.includes(anim)) opportunities.push(anim);
        }
      });

      if (passed) {
        successes.push(anim);
        score += 10;
      } else if (closeCall) {
        warnings.push({ ...anim, missing: missingStats });
      }
    });

    setAuditResults({ warnings, successes, opportunities, score });
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setInputs({
      driving_dunk: 80, vertical: 70, three_point_shot: 75,
      ball_handle: 80, speed_with_ball: 75, pass_accuracy: 70, steal: 60
    });
    setAuditResults(null);
  };

  // Helper for Category Cards
  const InputGroup = ({ title, color, icon: Icon, fields }: any) => (
    <div className={`bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden`}>
      <div className={`px-4 py-3 border-b border-slate-800 flex items-center gap-2 ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        <h3 className="font-bold text-slate-200">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        {fields.map((key: string) => (
          <div key={key}>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {key.replace(/_/g, ' ')}
              </label>
              <span className={`text-lg font-bold font-mono ${color.replace('bg-', 'text-')}`}>
                {inputs[key]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => updateVal(key, inputs[key] - 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <Minus size={14} />
              </button>

              <input
                type="range"
                min="25"
                max="99"
                value={inputs[key]}
                onChange={(e) => updateVal(key, parseInt(e.target.value))}
                className={`flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:${color}`}
              />

              <button
                onClick={() => updateVal(key, inputs[key] + 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:py-10 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* HERO */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/20">
            Updated for NBA 2K25
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 tracking-tight">
            BUILD AUDIT
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Stop guessing. Detect dead zones and missing animations before you spend 450k VC.
          </p>
        </div>

        {/* CONTROLS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup
            title="Finishing"
            color="bg-blue-500"
            icon={MoveUp}
            fields={['driving_dunk', 'vertical']}
          />
          <InputGroup
            title="Shooting"
            color="bg-emerald-500"
            icon={Target}
            fields={['three_point_shot']}
          />
          <InputGroup
            title="Playmaking"
            color="bg-amber-500"
            icon={Dribbble}
            fields={['ball_handle', 'speed_with_ball', 'pass_accuracy']}
          />
          <InputGroup
            title="Defense"
            color="bg-rose-500"
            icon={Shield}
            fields={['steal']}
          />
        </div>

        {/* ACTIONS CARD */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

            {/* Cap Breaker Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${useCapBreaker ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${useCapBreaker ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={useCapBreaker} onChange={() => setUseCapBreaker(!useCapBreaker)} />
              <div className="select-none">
                <p className="font-bold text-slate-200 group-hover:text-white transition-colors">Simulate Cap Breakers</p>
                <p className="text-xs text-slate-500">Add +5 potential to stats</p>
              </div>
            </label>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleReset}
                className="px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset all"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={runAudit}
                className="flex-1 md:flex-none md:min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all active:scale-95"
              >
                Run Audit
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS SECTION */}
        {auditResults && (
          <div id="results-section" className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Results</span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* SCORECARD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Build Cost</p>
                  <p className="text-3xl font-black text-slate-200">~${calculateCost(auditResults.score).toFixed(0)}</p>
                </div>
                <DollarSign className="text-slate-700 w-10 h-10" />
              </div>
              <div className={`p-6 rounded-xl border flex items-center justify-between ${auditResults.warnings.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${auditResults.warnings.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Safety Status</p>
                  <p className={`text-3xl font-black ${auditResults.warnings.length > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                    {auditResults.warnings.length === 0 ? 'OPTIMIZED' : 'RISKY'}
                  </p>
                </div>
                {auditResults.warnings.length > 0 ? <AlertTriangle className="text-red-500 w-10 h-10" /> : <CheckCircle className="text-emerald-500 w-10 h-10" />}
              </div>
            </div>

            {/* CRITICAL WARNINGS */}
            {auditResults.warnings.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-red-400 font-bold flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Dead Zones ({auditResults.warnings.length})
                </h3>
                <div className="grid gap-3">
                  {auditResults.warnings.map((warn, idx) => (
                    <div key={idx} className="bg-slate-900 border-l-4 border-l-red-500 rounded-r-xl p-5 border-y border-r border-slate-800 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-200 text-lg">{warn.name}</span>
                        <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase">{warn.category}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{warn.msg}</p>
                      <div className="inline-flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded text-xs text-red-400 font-mono border border-red-500/20">
                        ⚠️ MISSING: {warn.missing.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CAP BREAKER OPPORTUNITIES */}
            {useCapBreaker && auditResults.opportunities.length > 0 && (
              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="text-indigo-400 font-bold flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5" />
                  Future Unlocks (Cap Breakers)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {auditResults.opportunities.map((opp, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900 rounded border border-indigo-500/20">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-indigo-200 text-sm font-medium">{opp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUCCESSES */}
            {auditResults.successes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-emerald-500 font-bold text-lg">Unlocked Meta Animations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {auditResults.successes.map((succ, idx) => (
                    <div key={idx} className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-slate-200 text-sm font-bold">{succ.name}</p>
                        <p className="text-slate-500 text-xs mt-1">{succ.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-8 text-center">
              <button className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto text-sm transition-colors">
                <Share2 size={16} /> Share Results
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}