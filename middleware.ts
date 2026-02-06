import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    )
                },
            },
        },
    )

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes - require authentication
    const protectedRoutes = ["/dashboard"]
    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // If trying to access a protected route without being logged in, redirect to auth
    if (isProtectedRoute && !user) {
        const redirectUrl = new URL("/auth", request.url)
        // Save the original URL to redirect back after login
        redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and trying to access auth page, redirect to dashboard
    if (user && request.nextUrl.pathname === "/auth") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Analytics Tracking (Fire and forget)
    // We only track main pages to avoid noise
    if (request.method === "GET" && !request.nextUrl.pathname.startsWith("/api")) {
        // Detect country from header (Vercel/Cloudflare) or fallback to XX
        // @ts-ignore
        const country = request.geo?.country ||
            request.headers.get("x-vercel-ip-country") ||
            request.headers.get("cf-ipcountry") ||
            "XX"

        const path = request.nextUrl.pathname
        const referrer = request.headers.get("referer") || ""

        // Use the anon key client already created to insert
        // We don't await this to not block the response time significantly
        supabase.from("page_analytics").insert({
            path,
            country,
            referrer,
            user_agent: request.headers.get("user-agent") || "unknown"
        }).then(({ error }) => {
            if (error) console.error("Analytics error:", error.message)
        })
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
