import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Pre-check for local development to avoid "Invalid URL"
if (process.env.NODE_ENV === "development" && !process.env.AUTH_URL) {
    process.env.AUTH_URL = "http://localhost:3500";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (credentials?.username === "admin" && credentials?.password === "J@nF1rst") {
                    return { id: "1", name: "Administrator", role: "admin" }
                }
                return null
            }
        }),
    ],
    secret: process.env.AUTH_SECRET || "fallback-secret-for-build-time-only-12345",
    trustHost: true,
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role
            }
            return session
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isSettingsPage = nextUrl.pathname.startsWith("/settings")

            if (isSettingsPage) {
                return isLoggedIn
            }

            return true
        },
    },
    pages: {
        signIn: '/login',
    }
})
