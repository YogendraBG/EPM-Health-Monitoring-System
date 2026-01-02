"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, AlertTriangle } from "lucide-react"

interface StatusFilterProps {
    total: number
    healthy: number
    down: number
    systemStatus: string
}

export function StatusFilter({ total, healthy, down, systemStatus }: StatusFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentStatus = searchParams.get("status")

    const setStatus = (status: string | null) => {
        const params = new URLSearchParams(searchParams)
        if (status) {
            params.set("status", status)
        } else {
            params.delete("status")
        }
        router.push(`/?${params.toString()}`)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Card */}
            <div className={`relative overflow-hidden p-4 rounded-[1.5rem] border transition-all duration-500 shadow-sm
                ${systemStatus === 'Healthy'
                    ? 'bg-white dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/50'
                    : 'bg-white dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/50 shadow-rose-100/50 animate-pulse'}`}>
                <div className="relative z-10 flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current Status</span>
                    <div className="flex items-center justify-between">
                        <span className={`text-xl font-black italic tracking-tighter ${systemStatus === 'Healthy' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {systemStatus}
                        </span>
                        {systemStatus === 'Healthy' ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 text-rose-500" />
                        )}
                    </div>
                </div>
            </div>

            {/* Total Filter */}
            <button
                onClick={() => setStatus(null)}
                className={`group relative p-4 rounded-[1.5rem] border transition-all duration-500 shadow-sm flex flex-col justify-center
                    ${!currentStatus
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-900/20'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-indigo-200 text-left'}`}>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${!currentStatus ? 'text-gray-400' : 'text-gray-400 group-hover:text-indigo-400'}`}>Total Services</span>
                <span className={`text-2xl font-black tabular-nums ${!currentStatus ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{total}</span>
            </button>

            {/* Healthy Filter */}
            <button
                onClick={() => setStatus('UP')}
                className={`group relative p-4 rounded-[1.5rem] border transition-all duration-500 shadow-sm flex flex-col justify-center
                    ${currentStatus === 'UP'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-emerald-200 text-left'}`}>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${currentStatus === 'UP' ? 'text-emerald-100' : 'text-gray-400 group-hover:text-emerald-400'}`}>Healthy</span>
                <span className={`text-2xl font-black tabular-nums ${currentStatus === 'UP' ? 'text-white' : 'text-emerald-600'}`}>{healthy}</span>
            </button>

            {/* Issues Filter */}
            <button
                onClick={() => setStatus('DOWN')}
                className={`group relative p-4 rounded-[1.5rem] border transition-all duration-500 shadow-sm flex flex-col justify-center
                    ${currentStatus === 'DOWN'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xl shadow-rose-600/20'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-rose-200 text-left'}`}>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${currentStatus === 'DOWN' ? 'text-rose-100' : 'text-gray-400 group-hover:text-rose-400'}`}>Issues</span>
                <span className={`text-2xl font-black tabular-nums ${currentStatus === 'DOWN' ? 'text-white' : 'text-rose-600'}`}>{down}</span>
            </button>
        </div>
    )
}
