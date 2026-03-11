import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = (await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    })) as any;

    // Rutas que siempre deben estar disponibles (Auth, Next, Assets)
    if (
        pathname.startsWith('/api/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/uploads') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname === '/mantenimiento' ||
        pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/)
    ) {
        return NextResponse.next();
    }

    // Proteger el Panel de Administración (Solo ADMIN)
    if (pathname.startsWith('/admin')) {
        if (!token || token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Proteger el Editor (Requiere estar logueado)
    if (pathname.startsWith('/editor')) {
        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Chequeo de Mantenimiento
    try {
        const baseUrl = request.nextUrl.origin;
        const res = await fetch(`${baseUrl}/api/settings/status`, {
            cache: 'no-store'
        });
        const data = await res.json();

        // Redirigir a mantenimiento si:
        // 1. El modo está activo
        // 2. El usuario NO es ADMIN (los admins pueden ver el sitio siempre)
        if (data.maintenanceMode && token?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/mantenimiento', request.url));
        }
    } catch (e) {
        console.error('Middleware maintenance check failed', e);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
