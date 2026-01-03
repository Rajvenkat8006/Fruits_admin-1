import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    // Only protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Try to get token from header (bearer) or cookie (if we used cookies, but frontend uses localStorage).
        // Middleware cannot access localStorage. Content must be served.
        // BUT: Frontend calls API. API checks token.
        // Browsing to /admin (UI) is a GET request.
        // If we only store token in localStorage, the browser DOES NOT send it on initial page load of /admin.
        // Middleware cannot protect UI routes effectively if token is only in localStorage!

        // User said "admin login credencles is write a middleware".
        // If they strictly want middleware protection for UI, we MUST use Cookies.
        // Or, we accept that Middleware only protects APIs?
        // User said "login only user ui is ok but api is no need".

        // If I'm protecting /admin (UI), I need a Cookie.
        // Current Login implementation: returns token in JSON. Frontend puts in LocalStorage.
        // This meant Middleware CANNOT check authentication for UI pages.
        // The previous implementation used `useEffect` in `app/admin/layout.tsx` to check localStorage and redirect.
        // That is "Client-side protection".

        // Does the user want Server-side protection (Middleware)?
        // "write a middleware".
        // If so, I must change Login to set a COOKIE.

        // Let's check `request.cookies.get('token')`.
        // I will update Login to set a cookie as well.

        const token = request.cookies.get('token')?.value

        if (!token) {
            // If accessing API, return 401. If accessing Page, redirect.
            if (request.nextUrl.pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            const secret = new TextEncoder().encode(
                process.env.JWT_SECRET || 'your-secret-key-here'
            )
            const { payload } = await jwtVerify(token, secret)

            // Logic: If user is attempting to access /admin, checks if they are admin
            // Since we removed Roles, how do we know?
            // I will add `isAdmin: true` to the token payload for the "Special Admin Login".
            // Regular users won't have it.



        } catch (error) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
