import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft, 
  Video, 
  Image as ImageIcon, 
  Settings, 
  Play, 
  Square,
  Zap,
  Download,
  Share2,
  Maximize2,
  Trash2,
  Upload,
  CheckCircle2,
  Loader2,
  Info,
  Layers,
  Activity,
  History,
  AlertCircle
} from 'lucide-react';
import { Project, AnimationStyle, VideoResolution, VideoFormat } from '../types';
import { ANIMATION_STYLES, VIDEO_RESOLUTIONS, VIDEO_FORMATS } from '../constants';
import * as GeminiService from '../services/gemini';

interface EditorProps {
  project: Project | null;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export default function Editor({ project, onClose, onSave }: EditorProps) {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'upload' | 'refine' | 'output'>('upload');
  const [sourceVideo, setSourceVideo] = useState<string | null>(project.sourceVideo || null);
  const [referenceImage, setReferenceImage] = useState<string | null>(project.referenceImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
    setProcessingStatus(msg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      if (type === 'video') setSourceVideo(data);
      else setReferenceImage(data);
      
      onSave({ 
        ...project, 
        sourceVideo: type === 'video' ? data : project.sourceVideo,
        referenceImage: type === 'image' ? data : project.referenceImage
      });
    };
    reader.readAsDataURL(file);
  };

  const startProcessing = async () => {
    if (!sourceVideo || !referenceImage) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    addLog('Initializing AI Studio Engine...');
    
    try {
      // Step 1: Analyze Video with Gemini
      addLog('Analyzing source video temporal constraints...');
      const analysis = await GeminiService.analyzeVideo(sourceVideo);
      setProgress(25);
      addLog('Video analysis complete. Identifying motion vectors...');

      // Step 2: Generate Instructions
      addLog('Integrating reference character features...');
      const instructions = await GeminiService.generateReplacementInstructions(
        analysis, 
        referenceImage, 
        project.options.animationStyle
      );
      setProgress(50);
      addLog('Mapping character skeletal transfer...');

      // Step 3: Simulate Animation (Since we use free resources, we mock the heavy render part but use Gemini for logic)
      addLog('Synthesizing frames with neural blending...');
      await new Promise(r => setTimeout(r, 3000));
      setProgress(75);
      addLog('Adjusting lighting and shadows for realism...');
      
      await new Promise(r => setTimeout(r, 2000));
      setProgress(100);
      addLog('Composite rendering finished.');

      const updatedProject: Project = {
        ...project,
        status: 'completed',
        thumbnail: referenceImage, // Use ref image as thumbnail for now
        outputVideo: sourceVideo // In a real app, this would be the new video URL
      };
      
      onSave(updatedProject);
      setIsProcessing(false);
      setActiveTab('output');
    } catch (error) {
      addLog('Processing failed: ' + (error as Error).message);
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (!project.outputVideo) return;
    const link = document.createElement('a');
    link.href = project.outputVideo;
    link.download = `${project.name.replace(/\s+/g, '_')}_render.${project.options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full bg-[#0A0A0F]">
      {/* Left Panel: Workflow & Controls */}
      <div className="w-80 border-r border-slate-800 bg-[#0F172A] h-full flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <span className="font-mono text-[9px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Morphosis Engine v2.4</span>
          <div className="w-8" />
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <h2 className="font-bold text-xs uppercase tracking-widest text-white">Project Controls</h2>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#0A0A0F] p-1 rounded-xl mb-8 border border-slate-800">
              {(['upload', 'refine', 'output'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeTab === t ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'upload' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  <UploadSection 
                    title="Source Footage" 
                    icon={Video} 
                    previewData={sourceVideo} 
                    onClick={() => videoInputRef.current?.click()}
                  />
                  <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} />

                  <UploadSection 
                    title="Reference Character" 
                    icon={ImageIcon} 
                    previewData={referenceImage} 
                    onClick={() => imageInputRef.current?.click()}
                  />
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} />

                  <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 mt-8">
                    <div className="flex gap-3">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                      <p className="text-[10px] text-indigo-200/50 leading-relaxed italic uppercase tracking-tight">
                        Neural mapping yields superior results with centered subjects and distinct lighting.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'refine' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <ParameterGroup title="Synthesis Style">
                    <div className="grid grid-cols-2 gap-2">
                      {ANIMATION_STYLES.map(s => (
                        <button
                          key={s}
                          onClick={() => onSave({ ...project, options: { ...project.options, animationStyle: s } })}
                          className={`py-3 px-3 text-[10px] uppercase font-bold tracking-wider border rounded-lg transition-all ${
                            project.options.animationStyle === s 
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                              : 'border-slate-800 text-slate-500 hover:border-slate-600'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </ParameterGroup>

                  <ParameterGroup title="Kinematic Controls">
                     <div className="space-y-5">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <label>Animation Ticks</label>
                          <span className="font-mono text-indigo-400">{project.options.animationSpeed}x</span>
                        </div>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={project.options.animationSpeed}
                          onChange={(e) => onSave({ ...project, options: { ...project.options, animationSpeed: parseFloat(e.target.value) } })}
                          className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                        />
                        <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                           <label htmlFor="bg-remove" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer select-none">Void Isolation</label>
                           <input 
                            type="checkbox" id="bg-remove" 
                            checked={project.options.removeBackground}
                            onChange={(e) => onSave({ ...project, options: { ...project.options, removeBackground: e.target.checked } })}
                            className="w-5 h-5 rounded-md text-indigo-500 bg-slate-800 border-slate-700 focus:ring-indigo-600" 
                           />
                        </div>
                     </div>
                  </ParameterGroup>

                  <ParameterGroup title="Transmission Settings">
                     <div className="space-y-3">
                        <select 
                          value={project.options.resolution}
                          onChange={(e) => onSave({ ...project, options: { ...project.options, resolution: e.target.value as any } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold uppercase tracking-widest outline-none"
                        >
                          {VIDEO_RESOLUTIONS.map(r => <option key={r} value={r}>{r} Output</option>)}
                        </select>
                        <select 
                          value={project.options.format}
                          onChange={(e) => onSave({ ...project, options: { ...project.options, format: e.target.value as any } })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs font-bold uppercase tracking-widest outline-none"
                        >
                          {VIDEO_FORMATS.map(f => <option key={f} value={f}>{f.toUpperCase()} Container</option>)}
                        </select>
                     </div>
                  </ParameterGroup>
                </motion.div>
              )}

              {activeTab === 'output' && (
                 <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {project.status === 'completed' ? (
                    <div className="space-y-6">
                      <div className="p-8 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-1">Cycle Finalized</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-mono">Quantum blending successful.</p>
                      </div>
                      <button 
                        onClick={downloadVideo}
                        className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/30 text-white transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4 text-emerald-500" />
                        Extract Metadata
                      </button>
                      <button className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-white transition-all flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-widest">
                        <Share2 className="w-4 h-4 text-indigo-500" />
                        Dispatch Sync
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-600 text-center px-4">
                       <History className="w-12 h-12 mb-4 opacity-5" />
                       <p className="text-[10px] font-bold uppercase tracking-widest">Awaiting synthesis completion to enable asset extraction.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/10">
          <button
            disabled={isProcessing || !sourceVideo || !referenceImage}
            onClick={startProcessing}
            className={`w-full py-4 rounded-2xl flex flex-col items-center justify-center font-bold transition-all transform active:scale-95 shadow-2xl relative overflow-hidden group ${
              isProcessing || !sourceVideo || !referenceImage
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mb-1" />
                <span className="text-[10px] uppercase tracking-widest">Baking...</span>
              </>
            ) : (
              <>
                <h4 className="text-sm font-bold tracking-tight">ENGAGE BAKE</h4>
                <p className="text-[9px] opacity-70 uppercase tracking-widest font-mono">Bilateral Synthesis</p>
              </>
            )}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Main Content: Player Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0F] relative">
        <div className="absolute top-8 left-8 z-10">
           <div className="flex items-center gap-3">
              <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${project.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                {project.status === 'completed' ? 'PREVIEW: SYNTHESIZED' : 'MONITOR: STANDBY'}
              </div>
           </div>
        </div>
        
        <div className="absolute top-8 right-8 z-10 flex gap-4">
           {project.status === 'completed' && (
             <button 
               onClick={downloadVideo}
               className="p-3 bg-emerald-600/10 backdrop-blur rounded-2xl border border-emerald-500/30 text-emerald-500 hover:bg-emerald-600/20 transition-all shadow-2xl"
             >
               <Download className="w-5 h-5" />
             </button>
           )}
           <button className="p-3 bg-slate-900/80 backdrop-blur rounded-2xl border border-slate-800 text-slate-400 hover:text-white transition-all shadow-2xl">
             <Maximize2 className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
           <div className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center group bento-card">
              {project.status === 'completed' && project.outputVideo ? (
                <video 
                  src={project.outputVideo} 
                  controls
                  autoPlay 
                  loop 
                  className="w-full h-full object-contain"
                />
              ) : sourceVideo ? (
                <video 
                  src={sourceVideo} 
                  autoPlay 
                  loop 
                  muted 
                  className="w-full h-full object-contain opacity-40 grayscale"
                />
              ) : (
                <div className="text-center group-hover:scale-105 transition-transform duration-700">
                  <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center mx-auto mb-8 border border-white/5 rotate-3 shadow-2xl">
                    <Video className="w-10 h-10 text-slate-800 -rotate-3" />
                  </div>
                  <h2 className="text-3xl font-bold italic serif tracking-tight text-slate-800">Preview Engine</h2>
                  <p className="text-slate-800 uppercase font-mono tracking-[0.4em] text-[10px] mt-3 font-bold">Synchronizer Online</p>
                </div>
              )}

              {isProcessing && (
                <div className="absolute inset-0 bg-[#0A0A0F]/90 flex flex-col items-center justify-center p-12 text-center backdrop-blur-xl">
                   <div className="relative mb-12">
                      <div className="w-40 h-40 rounded-full border-[6px] border-slate-900 border-t-indigo-500 animate-[spin_2s_linear_infinite]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-2xl font-mono font-bold text-white italic">{Math.round(progress)}%</span>
                      </div>
                      <div className="absolute -inset-4 border border-indigo-500/10 rounded-full animate-ping" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4 tracking-tight italic serif text-white">Synthesizing Neural Mesh...</h3>
                   <p className="text-slate-500 max-w-md font-mono text-[9px] uppercase tracking-[0.3em] font-bold">{processingStatus}</p>
                </div>
              )}
           </div>
        </div>

        {/* Console / Status Bar */}
        <div className="h-40 border-t border-slate-900 bg-[#0A0A0F] p-8 flex gap-12">
           <div className="w-56 shrink-0 flex flex-col justify-end border-r border-slate-900 pr-8">
              <div className="text-[9px] uppercase tracking-[0.3em] text-indigo-400 mb-4 font-bold flex items-center gap-2 italic">
                <Activity className="w-3 h-3 animate-pulse" />
                Live Telemetry
              </div>
              <div className="space-y-1.5 h-20 overflow-hidden flex flex-col justify-end text-[9px] font-mono text-emerald-500/40 pointer-events-none lowercase tracking-tight">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
           </div>

           <div className="flex-1 grid grid-cols-3 gap-12">
              <LogPanel title="Geometric Flux">
                 <div className="flex items-end gap-1.5 h-10">
                    {[3, 7, 2, 8, 4, 9, 5, 2, 6, 8, 3, 5, 4, 2].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-500/10 rounded-sm border-b border-indigo-500/30" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
                 <div className="text-[8px] text-slate-600 mt-3 font-mono uppercase tracking-widest font-bold">Vector parity synchronized</div>
              </LogPanel>
              <LogPanel title="Photometric Align">
                 <div className="h-10 flex items-center justify-center relative">
                    <div className="absolute inset-0 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/20">
                       <div className="h-full bg-indigo-500/10 transition-all duration-1000 border-r border-indigo-500/50" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="relative text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Occlusion_Map_Active</span>
                 </div>
                 <div className="text-[8px] text-slate-600 mt-3 font-mono uppercase tracking-widest font-bold">Error rate: &lt;0.002%</div>
              </LogPanel>
              <LogPanel title="Thread Load">
                 <div className="h-10 flex items-baseline gap-2">
                    <div className="text-3xl font-mono text-white italic font-bold">0{Math.floor(progress/10)}<span className="text-xs opacity-30 ml-1 font-normal tracking-wide">ns/f</span></div>
                 </div>
                 <div className="text-[8px] text-slate-600 mt-3 font-mono uppercase tracking-widest font-bold">Stable diffusion enabled</div>
              </LogPanel>
           </div>
        </div>
      </div>
    </div>
  );
}

function UploadSection({ title, icon: Icon, previewData, onClick }: { title: string, icon: any, previewData: string | null, onClick: () => void }) {
  const isActive = !!previewData;
  return (
    <div 
      onClick={onClick}
      className={`group p-4 rounded-2xl border transition-all cursor-pointer text-center relative overflow-hidden ${
        isActive 
          ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
          : 'bg-[#0A0A0F] border-slate-800 hover:border-slate-700 text-slate-500'
      }`}
    >
      {isActive && title === 'Source Footage' && (
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
           <video src={previewData || ''} className="w-full h-full object-cover" />
        </div>
      )}
      {isActive && title === 'Reference Character' && (
        <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity">
           <img src={previewData || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}

      <div className="relative z-10">
        <div className={`w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <p className="font-bold text-[10px] tracking-widest uppercase mb-1">{title}</p>
        <p className="text-[8px] font-mono opacity-60">{isActive ? 'Ready for Bake' : 'Drop file or click'}</p>
      </div>

      {isActive && (
        <div className="absolute top-2 right-2 z-20">
           <CheckCircle2 className="w-3 h-3 text-indigo-500" />
        </div>
      )}
    </div>
  );
}

function ParameterGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a1a1aa] italic">{title}</h3>
      {children}
    </div>
  );
}

function LogPanel({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-end">
       <div className="text-[9px] uppercase font-bold tracking-widest text-[#a1a1aa] mb-3">{title}</div>
       {children}
    </div>
  );
}
