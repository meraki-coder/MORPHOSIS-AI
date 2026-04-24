import React from 'react';
import { motion } from 'motion/react';
import { Plus, Play, Trash2, Clock, CheckCircle2, Loader2, Video } from 'lucide-react';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onNewProject: () => void;
}

export default function Dashboard({ projects, onOpenProject, onDeleteProject, onNewProject }: DashboardProps) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end border-b border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase italic text-white leading-tight">Project Hub</h1>
          <p className="text-slate-500 text-xs uppercase tracking-widest">Cinema-Grade Character Replacement</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-1 font-bold">Neural Engine Status</div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            SYNCHRONIZED
          </div>
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
            <Video className="w-4 h-4" />
            Active Repositories
          </h2>
          <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-900 px-3 py-1 rounded-full">{projects.length} UNITS</span>
        </div>

        {projects.length === 0 ? (
          <div className="bento-card p-24 flex flex-col items-center justify-center text-slate-400 border-dashed">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center mb-6">
              <Plus className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-xl font-bold text-white mb-2 italic serif">No Active Cycles</p>
            <p className="mb-8 text-sm opacity-60">Initialize your first AI character replacement sequence.</p>
            <button 
              onClick={onNewProject}
              className="py-3 px-8 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
            >
              Initialize Engine
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={onNewProject}
              className="group border border-dashed border-slate-700 hover:border-indigo-500/50 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/20 hover:bg-slate-900/50"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600/20 flex items-center justify-center mb-4 transition-all">
                <Plus className="w-6 h-6 text-indigo-500" />
              </div>
              <span className="font-bold text-xs uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Start New Sequence</span>
            </motion.div>

            {projects.map((project) => (
              <motion.div
                key={project.id}
                layoutId={project.id}
                onClick={() => onOpenProject(project)}
                className="group relative bento-card cursor-pointer hover:border-indigo-500/30 transition-all shadow-2xl"
              >
                <div className="aspect-video w-full bg-black relative overflow-hidden">
                  {project.thumbnail ? (
                    <img 
                      src={project.thumbnail} 
                      alt={project.name} 
                      className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-12 h-12 text-slate-800" />
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4">
                    <StatusBadge status={project.status} />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg uppercase tracking-tight truncate pr-4 text-white italic serif">{project.name}</h3>
                    <button 
                      onClick={(e) => onDeleteProject(project.id, e)}
                      className="p-2 text-slate-500 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-6 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                       {project.options.resolution}
                    </div>
                    <div className="flex items-center gap-2">
                       {project.options.format}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-[0.2em] border border-emerald-500/20 backdrop-blur-md">
          <CheckCircle2 className="w-3 h-3" />
          Synchronized
        </span>
      );
    case 'processing':
      return (
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] border border-indigo-500/20 backdrop-blur-md">
          <Loader2 className="w-3 h-3 animate-spin" />
          Baking Frames
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] border border-slate-700/50 backdrop-blur-md">
          <Clock className="w-3 h-3" />
          Analysis Draft
        </span>
      );
  }
}

function ChevronRight(props: any) {
  return <path d="m9 18 6-6-6-6" />;
}
