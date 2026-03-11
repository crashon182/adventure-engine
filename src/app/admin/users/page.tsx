'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Shield, ShieldAlert, ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

type DBUser = {
    id: string;
    email: string;
    name: string | null;
    role: 'ADMIN' | 'USER';
    createdAt: string;
};

export default function AdminUsersPage() {
    const { data: session, status } = useSession() as any;
    const router = useRouter();
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && session?.role !== 'ADMIN')) {
            router.push('/');
            return;
        }
        if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, session]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        setUpdatingId(userId);
        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, role: newRole }),
            });
            if (res.ok) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-8">
            <header className="mb-12">
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Volver al Dashboard
                </Link>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-500">Administra los roles y accesos de la plataforma</p>
                    </div>
                </div>
            </header>

            <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl pl-12 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                        {filteredUsers.length} Usuarios Encontrados
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-900/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Registrado</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-blue-500/10 group-hover:text-blue-400">
                                                <User size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold">{user.name || 'Sin nombre'}</span>
                                                <span className="text-gray-500 text-xs">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === 'ADMIN' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                                                <Shield size={12} />
                                                ADMIN
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                                <User size={12} />
                                                USUARIO
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => toggleRole(user.id, user.role)}
                                            disabled={updatingId === user.id}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${user.role === 'ADMIN'
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-blue-600 text-white hover:bg-blue-500'
                                                }`}
                                        >
                                            {updatingId === user.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : user.role === 'ADMIN' ? (
                                                <>
                                                    <ShieldAlert size={14} />
                                                    Quitar Admin
                                                </>
                                            ) : (
                                                <>
                                                    <Shield size={14} />
                                                    Hacer Admin
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
