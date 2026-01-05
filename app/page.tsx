
import { auth } from "@/auth"
import { SignOut } from "@/components/SignOut"
import { RefreshButton } from "@/components/RefreshButton"
import prisma from "@/lib/prisma"
import { Activity, Settings, Plus, LogIn } from "lucide-react"
import Link from "next/link"

import { EnvironmentFilter } from "@/components/EnvironmentFilter"
import { StatusFilter } from "@/components/StatusFilter"
import { DashboardClient } from "@/components/DashboardClient"

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth()
  const params = await searchParams
  const isAdmin = session?.user?.role === 'admin'

  // Filter keys from URL
  const envFilter = typeof params.env === 'string' ? params.env.split(',') : []
  const statusFilter = typeof params.status === 'string' ? params.status : null

  // Fetch environments with services and their latest logs (10 for history)
  let environments = await prisma.environment.findMany({
    include: {
      services: {
        include: {
          healthLogs: {
            take: 10,
            orderBy: { timestamp: 'desc' }
          }
        }
      }
    },
    orderBy: { order: 'asc' }
  })

  // Fetch 7-day chart data
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const historicalLogs = await prisma.healthLog.findMany({
    where: {
      timestamp: { gte: sevenDaysAgo }
    },
    select: {
      status: true,
      timestamp: true,
      service: {
        select: { environmentId: true }
      }
    },
    orderBy: { timestamp: 'asc' }
  })

  // Aggregate logs for charts
  const envChartData: any = {}

  // Initialize last 7 days for each environment
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  environments.forEach((env: any) => {
    envChartData[env.id] = dates.map(date => ({ date, up: 0, down: 0 }))
  })

  historicalLogs.forEach((log: any) => {
    const envId = log.service.environmentId
    if (!envChartData[envId]) return

    const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dayData = envChartData[envId].find((d: any) => d.date === dateStr)
    if (dayData) {
      if (log.status === 'UP') dayData.up++
      else dayData.down++
    }
  })

  // Apply env filter if present
  if (envFilter.length > 0) {
    environments = environments.filter((env: any) => envFilter.includes(env.name))
  }

  // Calculate global metrics
  let totalServices = 0
  let healthyServices = 0
  let downServices = 0

  environments.forEach((env: any) => {
    env.services.forEach((svc: any) => {
      totalServices++
      if (svc.healthLogs[0]?.status === 'UP') {
        healthyServices++
      } else {
        downServices++
      }
    })
  })

  // Apply Status filter for DISPLAY
  if (statusFilter) {
    environments = environments.map((env: any) => ({
      ...env,
      services: env.services.filter((svc: any) => {
        const status = svc.healthLogs[0]?.status || 'UNKNOWN'
        if (statusFilter === 'UP') return status === 'UP'
        if (statusFilter === 'DOWN') return status !== 'UP'
        return true
      })
    })).filter((env: any) => env.services.length > 0)
  }

  const systemStatus = totalServices > 0 && healthyServices === totalServices ? "Healthy" : (downServices > 0 ? "Degraded" : "Unknown")

  // Get all environment names for the filter
  const allEnvNames = await prisma.environment.findMany({
    select: { id: true, name: true },
    orderBy: { order: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-gray-950 font-sans antialiased text-gray-900 dark:text-gray-100">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              EPM Health <span className="text-indigo-600">Monitor</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <RefreshButton />
            <div className="h-5 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

            {isAdmin ? (
              <>
                <Link href="/settings" className="p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-all" title="Settings">
                  <Settings className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3 pl-2 sm:border-l border-gray-100 dark:border-gray-800">
                  <SignOut />
                </div>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                <LogIn className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <EnvironmentFilter environments={allEnvNames} />
          </div>

          <StatusFilter
            total={totalServices}
            healthy={healthyServices}
            down={downServices}
            systemStatus={systemStatus}
          />

          {environments.length > 0 ? (
            <DashboardClient
              environments={environments}
              envChartData={envChartData}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="inline-flex p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl mb-6">
                <Activity className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Welcome to EPM Monitor</h3>
              <p className="mt-2 text-gray-500 font-medium">Get started by setting up your first environment.</p>
              <div className="mt-10">
                {isAdmin ? (
                  <Link
                    href="/settings"
                    className="inline-flex items-center rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Configure Environments
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <LogIn className="-ml-1 mr-2 h-5 w-5" />
                    Admin Login to Configure
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
