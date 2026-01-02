"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function AddServiceForm({ environmentId }: { environmentId: string }) {
    const router = useRouter()
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [token, setToken] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpen, setIsOpen] = useState(false) // Toggle for form visibility

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            await fetch("/api/services", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, url, token, environmentId }),
            })
            setName("")
            setUrl("")
            setToken("")
            setIsOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
                + Add Service
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Service Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Auth Service"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1.5 border"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Health URL</label>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1.5 border"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Token (Optional)</label>
                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Bearer token..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs p-1.5 border"
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-1 px-3 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting ? "Adding..." : "Add"}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 py-1 px-3 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    )
}
