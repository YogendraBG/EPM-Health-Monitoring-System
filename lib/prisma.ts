
import { PrismaClient } from '@prisma/client'

// Robust URL detection with build-time fallback
const getDbUrl = () => {
    let url = process.env.DATABASE_URL

    // During Vercel build, DATABASE_URL might be missing or placeholder
    // We provide a dummy one to prevent Prisma v6 from crashing during 'generate'
    if (!url || url === "") {
        if (process.env.NODE_ENV === 'production') {
            // Return undefined to let Prisma try default env or fail gracefully later
            return undefined
        }
        return "postgresql://postgres:postgres@localhost:5432/postgres" // local fallback
    }

    return url
}

const prismaClientSingleton = () => {
    const url = getDbUrl()

    return new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
