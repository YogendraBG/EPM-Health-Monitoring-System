
import { PrismaClient } from '@prisma/client'

// Robust URL detection with build-time fallback
const getDbUrl = () => {
    const url = process.env.DATABASE_URL

    // During Vercel build, DATABASE_URL might be missing or placeholder.
    // Prisma 6 strictly validates that 'url' is a string in the constructor.
    // We provide a dummy fallback to satisfy the constructor during the build phase.
    if (!url || url === "") {
        return "postgresql://postgres:postgres@localhost:5432/postgres" // build-time placeholder
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
