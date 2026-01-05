
'use client'

import { X, Clock, CheckCircle2, XCircle, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface HealthLog {
    id: string
    status: string
    error: string | null
    latency: number | null
    timestamp: string
}

interface Service {
    id: string
    name: string
    url: string
    healthLogs: HealthLog[]
}

interface ServiceDetailModalProps {
    service: Service | null
    onClose: () => void
}

export function ServiceDetailModal({ service, onClose }: ServiceDetailModalProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (service) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            setIsVisible(false)
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [service])

    if (!service) return null

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div
                className={`relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-500 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'}`}
            >
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                                    <Zap className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{service.name}</h2>
                            </div>
                            <p className="text-xs font-medium text-gray-400 truncate max-w-sm">{service.url}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Response History</h3>
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full uppercase">Last 10 Checks</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {service.healthLogs.length > 0 ? (
                                service.healthLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${log.status === 'UP' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                                                {log.status === 'UP' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold uppercase tracking-wider ${log.status === 'UP' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {log.status === 'UP' ? 'Success' : 'Failed'}
                                                    </span>
                                                    {log.error && (
                                                        <span className="text-[10px] text-rose-400 font-medium">— {log.error}</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-0.5">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        {log.latency && (
                                            <div className="flex items-baseline gap-0.5">
                                                <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                                                    {log.latency}
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase">ms</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-sm text-gray-400 font-medium">No history available for this service yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all active:scale-[0.98] shadow-lg shadow-gray-900/10"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    )
}
