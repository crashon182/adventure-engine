'use client';
import { Shield, User, Settings, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Inicio', href: '/', icon: Home },
        { name: 'Usuarios', href: '/admin/users', icon: User },
        { name: 'Configuración', href: '/admin/settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-gray-800/50 border-r border-gray-700/50 flex flex-col backdrop-blur-xl shrink-0 h-screen sticky top-0">
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
                        const href = item.href;
                        return (
                            <a
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group cursor-pointer ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
                                <span className="font-bold text-sm">{item.name}</span>
                            </a>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-8 border-t border-gray-700/50">
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mt-4">
                    v1.0.0
                </div>
            </div>
        </aside>
    );
}
