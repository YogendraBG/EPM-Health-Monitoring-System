
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

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
    secret: process.env.AUTH_SECRET,
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
                return isLoggedIn // Only admins who are logged in can access settings
            }

            return true // Allow all other pages (Dashboard) to be viewed publicly
        },
    },
    pages: {
        signIn: '/login',
    }
})
