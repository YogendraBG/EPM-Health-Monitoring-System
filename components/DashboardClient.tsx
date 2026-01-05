
'use client'

import { useState } from "react"
import { Server } from "lucide-react"
import { HealthChart } from "./HealthChart"
import { ServiceDetailModal } from "./ServiceDetailModal"

interface DashboardClientProps {
    environments: any[]
    envChartData: any
    isAdmin: boolean
}

export function DashboardClient({ environments, envChartData, isAdmin }: DashboardClientProps) {
    const [selectedService, setSelectedService] = useState<any | null>(null)

    return (
        <>
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
                                    <div
                                        key={svc.id}
                                        onClick={() => setSelectedService(svc)}
                                        className="group/card relative bg-white dark:bg-gray-900 rounded-[1.2rem] shadow-sm hover:shadow-xl transition-all duration-300 p-3 border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:border-indigo-200 dark:hover:border-indigo-900/40 cursor-pointer active:scale-95"
                                    >
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
                        </div>
                    </section>
                ))}
            </div>

            <ServiceDetailModal
                service={selectedService}
                onClose={() => setSelectedService(null)}
            />
        </>
    )
}
