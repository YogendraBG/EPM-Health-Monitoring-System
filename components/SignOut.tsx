
import { signOut } from "@/auth"
import { LogOut } from "lucide-react"

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button
                type="submit"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40"
            >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
            </button>
        </form>
    )
}
