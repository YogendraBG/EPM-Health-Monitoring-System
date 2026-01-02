"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Filter } from "lucide-react"

interface EnvironmentFilterProps {
    environments: { id: string; name: string }[]
}

export function EnvironmentFilter({ environments }: EnvironmentFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get currently selected environments from URL (comma-separated)
    const currentFilter = searchParams.get("env")
    const selectedEnvs = currentFilter ? currentFilter.split(",") : []

    const toggleEnv = (envName: string) => {
        let newSelected = [...selectedEnvs]

        if (newSelected.includes(envName)) {
            // Remove if already selected
            newSelected = newSelected.filter(e => e !== envName)
        } else {
            // Add if not selected
            newSelected.push(envName)
        }

        // Update URL
        const params = new URLSearchParams(searchParams)
        if (newSelected.length > 0) {
            params.set("env", newSelected.join(","))
        } else {
            params.delete("env")
        }

        router.push(`/?${params.toString()}`)
    }

    const clearFilter = () => {
        const params = new URLSearchParams(searchParams)
        params.delete("env")
        router.push(`/?${params.toString()}`)
    }

    if (environments.length === 0) return null

    return (
        <div className="flex items-center gap-3 mb-2 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 shrink-0">
                <Filter className="h-3 w-3" />
                <span>Environments</span>
            </div>

            <button
                onClick={clearFilter}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 border uppercase tracking-tight
                    ${selectedEnvs.length === 0
                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/10 dark:bg-white dark:text-gray-900 dark:border-white"
                        : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-800"
                    }`}
            >
                All
            </button>

            {environments.map(env => {
                const isSelected = selectedEnvs.includes(env.name)
                return (
                    <button
                        key={env.id}
                        onClick={() => toggleEnv(env.name)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shrink-0 border uppercase tracking-tight
                            ${isSelected
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 dark:bg-indigo-500 dark:border-indigo-500"
                                : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-800 dark:hover:bg-gray-800"
                            }`}
                    >
                        {env.name}
                    </button>
                )
            })}
        </div>
    )
}
