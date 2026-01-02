"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Server, Pencil, Trash2 } from "lucide-react"
import { EditServiceForm } from "./EditServiceForm"

interface ServiceItemProps {
    service: {
        id: string
        name: string
        url: string
        token?: string | null
    }
}

export function ServiceItem({ service }: ServiceItemProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this service?")) return

        setIsDeleting(true)
        try {
            await fetch(`/api/services?id=${service.id}`, {
                method: "DELETE",
            })
            router.refresh()
        } catch (error) {
            console.error("Failed to delete service", error)
            setIsDeleting(false)
        }
    }

    if (isEditing) {
        return (
            <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded border border-indigo-200 dark:border-indigo-800">
                <EditServiceForm service={service} onCancel={() => setIsEditing(false)} />
            </div>
        )
    }

    return (
        <li className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-750 rounded border border-gray-100 dark:border-gray-700 hover:border-gray-300 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
                <Server className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{service.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{service.url}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit Service"
                >
                    <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Delete Service"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </li>
    )
}
