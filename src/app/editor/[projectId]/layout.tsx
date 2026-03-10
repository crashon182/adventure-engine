'use client';
import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Map, Layers, Code, Play, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

export default function EditorLayout({ children, params }: { children: ReactNode, params: { projectId: string } }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Hide default sidebar if we are in a specific room editor or logic view
    const isRoomEditor = pathname.includes('/rooms/') && pathname.split('/').length > 5;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {/* Top Navbar */}
            <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Adventure Engine Editor
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/play/${params.projectId}`} target="_blank" className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                        <Play size={16} /> Play Test
                    </Link>
                    <a href={`/api/projects/${params.projectId}/export`} download className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
                        Export JSON
                    </a>
                </div>
            </header>

            {/* Main Body */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                {!isRoomEditor && (
                    <aside className={`bg-gray-800 border-r border-gray-700 flex flex-col shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
                        <div className={`p-4 border-b border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                            {!isCollapsed && <span>Project Navigator</span>}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-1 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
                            >
                                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-2">
                            <div className={`px-3 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                                <Link
                                    href={`/editor/${params.projectId}/rooms`}
                                    className={`flex items-center gap-3 py-2 rounded-md transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'} ${pathname.includes('/rooms') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    title={isCollapsed ? 'Rooms Outline' : ''}
                                >
                                    <Map size={18} />
                                    {!isCollapsed && <span>Rooms Outline</span>}
                                </Link>
                                <Link
                                    href={`/editor/${params.projectId}/assets`}
                                    className={`flex items-center gap-3 py-2 rounded-md transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'} ${pathname.includes('/assets') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    title={isCollapsed ? 'Asset Manager' : ''}
                                >
                                    <ImageIcon size={18} />
                                    {!isCollapsed && <span>Asset Manager</span>}
                                </Link>
                                <Link
                                    href={`/editor/${params.projectId}/items`}
                                    className={`flex items-center gap-3 py-2 rounded-md transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'} ${pathname.includes('/items') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    title={isCollapsed ? 'Global Inventory' : ''}
                                >
                                    <Layers size={18} />
                                    {!isCollapsed && <span>Global Inventory</span>}
                                </Link>
                                <Link
                                    href={`/editor/${params.projectId}/events`}
                                    className={`flex items-center gap-3 py-2 rounded-md transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'} ${pathname.includes('/events') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    title={isCollapsed ? 'Event Rules' : ''}
                                >
                                    <Code size={18} />
                                    {!isCollapsed && <span>Event Rules</span>}
                                </Link>
                                <Link
                                    href={`/editor/${params.projectId}/settings`}
                                    className={`flex items-center gap-3 py-2 rounded-md transition-colors ${isCollapsed ? 'px-2 justify-center' : 'px-3'} ${pathname.includes('/settings') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                                    title={isCollapsed ? 'Settings' : ''}
                                >
                                    <Settings size={18} />
                                    {!isCollapsed && <span>Settings</span>}
                                </Link>
                            </div>
                        </nav>
                    </aside>
                )}

                {/* Center Canvas Area */}
                <main className="flex-1 bg-gray-950 relative overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
