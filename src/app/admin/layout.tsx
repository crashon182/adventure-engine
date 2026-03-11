'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession() as any;
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'ADMIN')) {
            router.push('/');
        }
    }, [status, session]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    if (!session || session.user?.role !== 'ADMIN') return null;

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 max-h-screen overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
                {children}
            </main>
        </div>
    );
}
