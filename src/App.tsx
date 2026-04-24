/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Video, 
  Image as ImageIcon, 
  Settings, 
  History, 
  Play, 
  Download, 
  Trash2, 
  ChevronRight,
  Zap,
  Globe,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { Project, ProjectStatus } from './types';
import { APP_THEME, ANIMATION_STYLES, VIDEO_RESOLUTIONS, VIDEO_FORMATS } from './constants';
import * as Storage from './lib/storage';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Initialize with IndexedDB if none exists
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const saved = await Storage.getAllProjects();
        if (saved && saved.length > 0) {
          setProjects(saved.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          const initialProject: Project = {
            id: '1',
            name: 'Urban Dance Swap',
            status: 'completed',
            createdAt: Date.now() - 86400000,
            options: {
              removeBackground: true,
              animationSpeed: 1,
              animationStyle: 'Realistic',
              resolution: '1080p',
              format: 'mp4'
            },
            thumbnail: 'https://picsum.photos/seed/dance/300/200'
          };
          setProjects([initialProject]);
          await Storage.saveProject(initialProject);
        }
      } catch (e) {
        console.error("Failed to load projects from IndexedDB:", e);
      }
    };
    loadProjects();
  }, []);

  const saveProjectToStorage = async (project: Project) => {
    try {
      await Storage.saveProject(project);
    } catch (e) {
      console.error("Failed to save project to IndexedDB:", e);
    }
  };

  const createNewProject = async () => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Untitled Project ${projects.length + 1}`,
      status: 'draft',
      createdAt: Date.now(),
      options: {
        removeBackground: false,
        animationSpeed: 1,
        animationStyle: 'Realistic',
        resolution: '1080p',
        format: 'mp4'
      }
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    await saveProjectToStorage(newProject);
    setActiveProject(newProject);
    setCurrentView('editor');
  };

  const openProject = (project: Project) => {
    setActiveProject(project);
    setCurrentView('editor');
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    try {
      await Storage.deleteProject(id);
    } catch (e) {
      console.error("Failed to delete project from IndexedDB:", e);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0F] text-bento-text antialiased font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onNewProject={createNewProject}
      />
      
      <main className="flex-1 relative overflow-auto">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Dashboard 
                projects={projects} 
                onOpenProject={openProject}
                onDeleteProject={deleteProject}
                onNewProject={createNewProject}
              />
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <Editor 
                project={activeProject} 
                onClose={() => setCurrentView('dashboard')}
                onSave={async (p) => {
                  const updated = projects.map(proj => proj.id === p.id ? p : proj);
                  setProjects(updated);
                  await saveProjectToStorage(p);
                  setActiveProject(p);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

