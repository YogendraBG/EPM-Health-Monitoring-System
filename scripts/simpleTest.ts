
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Prisma connection to Supabase...')
    try {
        const envCount = await prisma.environment.count()
        console.log(`Connection successful! Total environments in cloud: ${envCount}`)
    } catch (e: any) {
        console.error('Connection failed!')
        console.error(e.message)
        process.exit(1)
    }
}

main().finally(() => prisma.$disconnect())
