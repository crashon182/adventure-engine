'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Folder, Settings, Play } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handeCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
      });
      if (res.ok) {
        setIsCreating(false);
        setNewProjectName('');
        setNewProjectDesc('');
        fetchProjects();
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading projects...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Adventure Engine
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <PlusCircle size={20} />
          New Project
        </button>
      </header>

      {isCreating && (
        <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-xl">
          <h2 className="text-xl font-bold mb-4">Create New Project</h2>
          <form onSubmit={handeCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
              <input
                autoFocus
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Shadowgate Clone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors h-24"
                placeholder="A mysterious castle..."
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="group bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-gray-900 p-3 rounded-lg group-hover:bg-blue-900/30 transition-colors">
                <Folder className="text-blue-400" size={24} />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{project.name}</h3>
            <p className="text-gray-400 text-sm flex-grow mb-6 line-clamp-3">
              {project.description || "No description provided."}
            </p>

            <div className="flex gap-2 mt-auto">
              <Link href={`/editor/${project.id}`} className="flex-1">
                <button className="w-full flex justify-center items-center gap-2 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Settings size={16} />
                  Editor
                </button>
              </Link>
              <button className="flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 p-2 rounded-lg text-sm font-medium transition-colors" title="Play Game">
                <Play size={16} />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && !isCreating && !loading && (
          <div className="col-span-full py-20 text-center text-gray-500">
            <p className="mb-4">No projects found.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-blue-400 hover:underline"
            >
              Create your first project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
