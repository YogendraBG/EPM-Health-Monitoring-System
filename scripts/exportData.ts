
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
    const exportPath = path.join(process.cwd(), 'data-export.sql')
    const stream = fs.createWriteStream(exportPath, { encoding: 'utf8' })

    console.log('Fetching data from local database...')

    const environments = await prisma.environment.findMany()
    const services = await prisma.service.findMany()
    const healthLogs = await prisma.healthLog.findMany({
        take: 1000,
        orderBy: { timestamp: 'desc' }
    })

    stream.write('-- Data Export Script Generated at ' + new Date().toISOString() + '\n')

    stream.write('\n-- Environments\n')
    for (const env of environments) {
        const token = env.token ? `'${env.token.replace(/'/g, "''")}'` : 'NULL'
        stream.write(`INSERT INTO "Environment" ("id", "name", "token", "order", "createdAt", "updatedAt") VALUES ('${env.id}', '${env.name.replace(/'/g, "''")}', ${token}, ${env.order}, '${env.createdAt.toISOString()}', '${env.updatedAt.toISOString()}');\n`)
    }

    stream.write('\n-- Services\n')
    for (const svc of services) {
        const token = svc.token ? `'${svc.token.replace(/'/g, "''")}'` : 'NULL'
        stream.write(`INSERT INTO "Service" ("id", "environmentId", "name", "url", "token", "createdAt", "updatedAt") VALUES ('${svc.id}', '${svc.environmentId}', '${svc.name.replace(/'/g, "''")}', '${svc.url.replace(/'/g, "''")}', ${token}, '${svc.createdAt.toISOString()}', '${svc.updatedAt.toISOString()}');\n`)
    }

    stream.write('\n-- Health Logs\n')
    for (const log of healthLogs) {
        const error = log.error ? `'${log.error.replace(/'/g, "''")}'` : 'NULL'
        const latency = log.latency !== null ? log.latency : 'NULL'
        stream.write(`INSERT INTO "HealthLog" ("id", "serviceId", "status", "error", "latency", "timestamp") VALUES ('${log.id}', '${log.serviceId}', '${log.status}', ${error}, ${latency}, '${log.timestamp.toISOString()}');\n`)
    }

    stream.end()
    console.log(`Data successfully exported to ${exportPath}`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
