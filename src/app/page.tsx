'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Folder, Settings, Play, LogOut, User as UserIcon, LogIn, UserPlus } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

type Project = {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
};

export default function Dashboard() {
  const { data: session, status } = useSession() as any;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [session]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) {
        setProjects([]);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handeCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !session) return;
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-pulse text-blue-500 font-medium">Cargando proyectos...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Adventure Engine
          </h1>
          <p className="text-gray-500 mt-1">Crea y gestiona tus aventuras gráficas</p>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-xl border border-gray-700">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <UserIcon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white leading-none">{session.user?.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{session.role}</span>
                </div>
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                <PlusCircle size={20} />
                Nuevo Proyecto
              </button>

              <button
                onClick={() => signOut()}
                className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <button className="flex items-center gap-2 text-gray-300 hover:text-white px-4 py-2 font-medium transition-colors">
                  <LogIn size={18} />
                  Ingresar
                </button>
              </Link>
              <Link href="/register">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-bold border border-gray-700 transition-all">
                  <UserPlus size={18} />
                  Registrarse
                </button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {isCreating && session && (
        <div className="mb-10 p-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-gray-700/50 shadow-2xl animate-in fade-in zoom-in duration-300">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <PlusCircle className="text-blue-500" />
            Nuevo Proyecto
          </h2>
          <form onSubmit={handeCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 ml-1">Nombre del Proyecto</label>
              <input
                autoFocus
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-gray-600"
                placeholder="Ej: El Misterio del Castillo"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 ml-1">Descripción</label>
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all h-28 placeholder:text-gray-600 resize-none"
                placeholder="Una aventura épica en un mundo olvidado..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 md:flex-none md:min-w-[140px] bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                Crear Proyecto
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 md:flex-none md:min-w-[140px] bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-2xl font-bold transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <div key={project.id} className="group bg-gray-800/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 shadow-xl hover:shadow-blue-500/10 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

            <div className="flex items-start justify-between mb-6">
              <div className="bg-gray-900/50 p-4 rounded-2xl group-hover:bg-blue-900/30 transition-all duration-500 border border-gray-700/50 group-hover:border-blue-500/30">
                <Folder className="text-blue-400 group-hover:scale-110 transition-transform duration-500" size={28} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-700/50">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors duration-500">{project.name}</h3>
            <p className="text-gray-400 text-sm flex-grow mb-8 line-clamp-3 leading-relaxed">
              {project.description || "Sin descripción proporcionada."}
            </p>

            <div className="flex gap-3">
              <Link href={`/editor/${project.id}`} className="flex-1">
                <button className="w-full flex justify-center items-center gap-2 bg-gray-700/50 hover:bg-blue-600 py-3.5 rounded-2xl text-sm font-bold transition-all border border-gray-600/30 hover:border-blue-500 shadow-lg active:scale-95">
                  <Settings size={18} />
                  Abrir Editor
                </button>
              </Link>
              <button className="flex justify-center items-center gap-2 bg-purple-600/20 hover:bg-purple-600 p-3.5 rounded-2xl text-purple-400 hover:text-white transition-all border border-purple-500/30 active:scale-95" title="Previsualizar Juego">
                <Play size={18} fill="currentColor" />
              </button>
            </div>
          </div>
        ))}

        {projects.length === 0 && !isCreating && !loading && (
          <div className="col-span-full py-24 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800 border border-gray-700 mb-6">
              <Folder className="text-gray-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No hay proyectos aún</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              {session
                ? "Comienza creando tu primer proyecto para empezar a construir tu aventura."
                : "Inicia sesión para poder crear y gestionar tus propios proyectos."}
            </p>
            {session ? (
              <button
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Crear Mi Primer Proyecto
              </button>
            ) : (
              <Link href="/login">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20">
                  Iniciar Sesión para Empezar
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
