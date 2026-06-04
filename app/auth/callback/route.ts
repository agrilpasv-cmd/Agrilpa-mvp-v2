import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") // e.g. "signup", "recovery", "email"
  const next = searchParams.get("next") || "/dashboard"

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored in Server Components — middleware handles session refresh
          }
        },
      },
    }
  )

  // --- Flow 1: OAuth / PKCE code exchange (Google OAuth) ---
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // --- Flow 2: Email verification token_hash (signup confirmation email) ---
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "recovery" | "email" | "invite" | "magiclink" | "email_change",
    })
    if (!error) {
      // Show a success confirmation page before redirecting to dashboard
      return NextResponse.redirect(`${origin}/auth/verified`)
    }
  }

  // Fallback: redirect to an error state so the user sees a nice message
  return NextResponse.redirect(`${origin}/auth/verified?error=true`)
}
