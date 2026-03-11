'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, ArrowLeft, Shield, LogOut, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession() as any;
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [status, session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!session || session.user?.role !== 'ADMIN') return null;

    const navItems = [
        { name: 'Usuarios', href: '/admin/users', icon: User },
        { name: 'Configuración', href: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800/50 border-r border-gray-700/50 flex flex-col backdrop-blur-xl">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Admin CP
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group cursor-pointer ${isActive
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}>
                                        <Icon size={18} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                        <span className="font-bold text-sm">{item.name}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-gray-700/50 space-y-4">
                    <Link href="/">
                        <div className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors cursor-pointer group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-bold">Volver al Sitio</span>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-h-screen overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
                {children}
            </main>
        </div>
    );
}
