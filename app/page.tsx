
import { auth } from "@/auth"
import { SignOut } from "@/components/SignOut"
import { RefreshButton } from "@/components/RefreshButton"
import prisma from "@/lib/prisma"
import { Activity, Settings, Server, Plus, LogIn } from "lucide-react"
import Link from "next/link"

import { EnvironmentFilter } from "@/components/EnvironmentFilter"
import { StatusFilter } from "@/components/StatusFilter"
import { HealthChart } from "@/components/HealthChart"

export const dynamic = 'force-dynamic'

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth()
  const params = await searchParams
  const isAdmin = session?.user?.role === 'admin'

  // Filter keys from URL
  const envFilter = typeof params.env === 'string' ? params.env.split(',') : []
  const statusFilter = typeof params.status === 'string' ? params.status : null

  // Fetch environments with services and their latest log
  let environments = await prisma.environment.findMany({
    include: {
      services: {
        include: {
          healthLogs: {
            take: 1,
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

  // Apply filter if present
  if (envFilter.length > 0) {
    environments = environments.filter((env: any) => envFilter.includes(env.name))
  }

  // Calculate metrics
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

          <div className="space-y-20">
            {environments.map((env: any) => (
              <section key={env.id} className="group/section">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6 transition-colors group-hover/section:border-indigo-100 dark:group-hover/section:border-indigo-900/40">
                  <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">{env.name}</h2>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl uppercase tracking-[0.2em]">{env.services.length} Managed Services</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
                  {/* Featured Analytics Card */}
                  <div className="col-span-2 md:col-span-2 bg-white dark:bg-gray-900 rounded-[1.5rem] p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group/chart hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">7-Day Trend</span>
                      <div className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      </div>
                    </div>
                    <div className="h-16">
                      <HealthChart data={envChartData[env.id]} isMinimal={true} />
                    </div>
                  </div>

                  {env.services.map((svc: any) => {
                    const latest = svc.healthLogs[0]
                    const isUp = latest?.status === 'UP'
                    return (
                      <div key={svc.id} className="group/card relative bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-3 border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:border-indigo-200 dark:hover:border-indigo-900/40">
                        <div className="flex justify-between items-start mb-2">
                          <div className={`p-1.5 rounded-lg ${isUp ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                            <Server className="h-3 w-3" />
                          </div>
                          {latest ? (
                            <div className={`w-2 h-2 rounded-full shadow-sm ${isUp ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse ring-2 ring-rose-100 dark:ring-rose-900/30'}`}></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                          )}
                        </div>

                        <h3 className="font-bold text-[11px] text-gray-900 dark:text-white truncate leading-tight mb-1" title={svc.name}>
                          {svc.name}
                        </h3>

                        <div className="mt-auto pt-2 border-t border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-[11px] font-black text-gray-900 dark:text-white tabular-nums">
                              {latest ? latest.latency : '-'}
                              {latest && <span className="text-[7px] font-bold text-gray-400 ml-0.5">ms</span>}
                            </span>
                          </div>
                          <div className="text-[7px] font-bold text-gray-300 dark:text-gray-600 uppercase">
                            {latest ? new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '-'}
                          </div>
                        </div>

                        {!isUp && latest?.error && (
                          <div className="absolute inset-x-0 bottom-full mb-1 flex justify-center opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity z-20">
                            <div className="bg-gray-900 text-white text-[8px] px-2 py-1 rounded shadow-xl whitespace-nowrap">
                              {latest.error}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {env.services.length === 0 && (
                    <div className="col-span-full py-8 text-center bg-gray-50/10 dark:bg-gray-900/10 rounded-[1.5rem] border border-dashed border-gray-100 dark:border-gray-800">
                      {isAdmin ? (
                        <Link href="/settings" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-500">+ Connect Service</Link>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No Services Configured</span>
                      )}
                    </div>
                  )}
                </div>
              </section>
            ))}

            {environments.length === 0 && (
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
        </div>
      </main>
    </div>
  )
}
