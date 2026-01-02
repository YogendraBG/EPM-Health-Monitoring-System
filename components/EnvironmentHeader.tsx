"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Check, X, Key } from "lucide-react"

interface EnvironmentHeaderProps {
    environment: {
        id: string
        name: string
        token?: string | null
    }
}

export function EnvironmentHeader({ environment }: EnvironmentHeaderProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(environment.name)
    const [token, setToken] = useState(environment.token || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleUpdate = async () => {
        setIsSubmitting(true)
        try {
            await fetch("/api/environments", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: environment.id,
                    name,
                    token: token || null
                }),
            })
            setIsEditing(false)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will delete the environment and ALL its services.")) return

        setIsDeleting(true)
        try {
            await fetch(`/api/environments?id=${environment.id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch (error) {
            console.error(error)
            setIsDeleting(false)
        }
    }

    if (isEditing) {
        return (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                    placeholder="Environment Name"
                />
                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="block w-full max-w-xs rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white p-2 border"
                    placeholder="Global Token (Optional)"
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdate}
                        disabled={isSubmitting}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        title="Save"
                    >
                        <Check className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Cancel"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center group">
            <div className="flex items-center gap-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{environment.name}</h3>
                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">Environment</span>
                {(environment as any).token && (
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                        <Key className="h-3 w-3" />
                        Token Configured
                    </span>
                )}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit Environment"
                >
                    <Pencil className="h-4 w-4" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Environment"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
