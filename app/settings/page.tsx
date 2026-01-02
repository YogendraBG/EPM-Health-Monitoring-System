
import prisma from "@/lib/prisma"
import { AddEnvironmentForm } from "@/components/AddEnvironmentForm"
import { AddServiceForm } from "@/components/AddServiceForm"
import { ServiceItem } from "@/components/ServiceItem"
import { EnvironmentHeader } from "@/components/EnvironmentHeader"
import { ArrowLeft, Plus, Key } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    const environments = await prisma.environment.findMany({
        include: { services: true },
        orderBy: { order: "asc" },
    })

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="/" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </a>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    </div>
                </div>

                <div className="grid gap-8">
                    <section>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Environment</h2>
                        <AddEnvironmentForm />
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuration</h2>
                        <div className="space-y-6">
                            {environments.map((env: any) => (
                                <div key={env.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                                    <div className="border-b border-gray-200 dark:border-gray-700">
                                        <EnvironmentHeader environment={env} />
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Services</h4>
                                        <ul className="space-y-3 mb-6">
                                            {env.services.map((service: any) => (
                                                <ServiceItem key={service.id} service={service} />
                                            ))}
                                            {env.services.length === 0 && (
                                                <li className="text-sm text-gray-400 italic">No services added yet.</li>
                                            )}
                                        </ul>
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <AddServiceForm environmentId={env.id} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {environments.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    No environments configured. Add one above.
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
