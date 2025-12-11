import { useState, useEffect } from "react";
import { Users, UserPlus, ChevronLeft, ChevronRight, Settings } from "lucide-react"

export default function SideBar({ user, ready, onSectionChange, currentUser, setCurrentUser }) {
    const [users, setUsers] = useState([])
    const [sideBarHidden, setSideBarHidden] = useState(false)
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState({
        name: "friends"
    })

    useEffect(() => {
        async function fetchData() {
            if (!ready || !user) return;
            setLoading(true)
            setError(null)
            try {
                const [userRes, currentUserRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user}`,
                            "Content-Type": "application/json"
                        }
                    }),
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${user}`,
                            "Content-Type": "application/json"
                        }
                    })
                ])

                if (!userRes.ok || !currentUserRes.ok) {
                    throw new Error("Failed to fetch users")
                }

                const userData = await userRes.json()
                const currentUserData = await currentUserRes.json()
                setUsers(userData.users)
                setCurrentUser(currentUserData.user)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user, ready])

    const handleSectionClick = (section) => {
        setActiveSection({ section })
        if (onSectionChange) {
            onSectionChange(section)
        }
    }

    return sideBarHidden ? (
        <aside className="shrink-0">
            <button onClick={() => setSideBarHidden(false)} className="min-h-screen bg-zinc-900 hover:bg-zinc-800 p-2 border-r border-zinc-700 transition-colors cursor-pointer">
                <ChevronRight className="w-5 h-auto" />
            </button>
        </aside>
    ) : (
        <aside className="flex flex-col max-w-fit sm:max-w-60 md:max-w-80 bg-zinc-900 border-r border-zinc-700 min-h-screen shrink-0 overflow-x-hidden">
            <section className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h2 className="font-semibold text-zinc-400 uppercase tracking-wide">Messaging App</h2>
                <button onClick={() => setSideBarHidden(true)} className="text-zinc-400 hover:text-white transition-colors ml-4 cursor-pointer">
                    <ChevronLeft className="w-5 h-auto" />
                </button>
            </section>

            <section className="p-4 border-b border-zinc-800">
                <button onClick={() => handleSectionClick({ name: "friends" })} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors group cursor-pointer w-full ${activeSection.name === "friends" ? "bg-zinc-700 text-white" : "bg-zinc-800 hover:bg-zinc-700"}`}>
                    <Users className={`w-5 h-auto ${activeSection.name === "friends" ? "text-white" : "text-zinc-400 group-hover:text-white"}`} />
                    <span className={`font-medium ${activeSection === "friends" ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>Friends</span>
                </button>
            </section>

            <section className="flex-1 overflow-y-auto overflow-x-hidden">
                {isLoading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-zinc-400">Loading users...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="p-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-sm text-red-400">Error: {error}</p>
                        </div>
                    </div>
                )}

                {!isLoading && !error && users.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <UserPlus className="w-12 h-12 text-zinc-600 mb-3" />
                        <p className="text-sm text-zinc-400">No users found, how are you here?!</p>
                    </div>
                )}

                {!isLoading && !error && users.length > 0 && (
                    <div className="py-2">
                        <div className="px-4 mb-2">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                All Users — {users.filter(u => u.id !== currentUser?.id).length}
                            </p>
                        </div>
                        {users.filter(u => u.id !== currentUser?.id).map((u) => (
                            <button
                                key={u.id}
                                onClick={() => handleSectionClick({ name: "users", id: `${u.id}` })}
                                className={`w-[90%] bg-zinc-800 cursor-pointer mb-2 flex items-center gap-4 px-4 py-2 mx-2 rounded-md transition-colors group ${activeSection === `users`
                                    ? 'bg-zinc-800'
                                    : 'hover:bg-zinc-800'
                                    }`}
                            >
                                <div className="flex-1 min-w-0 text-left">
                                    <p className={`text-sm font-medium truncate ${activeSection === `user-${u.id}`
                                        ? 'text-white'
                                        : 'text-zinc-300 group-hover:text-white'
                                        }`}>
                                        {u.username || 'Unknown User'}
                                    </p>
                                    {u.aboutMe && (
                                        <p className="text-xs text-zinc-500 truncate">
                                            {u.aboutMe}
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </section>

            <section className="p-4 border-t border-zinc-800 bg-zinc-900">
                {currentUser && (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{currentUser.username}</p>
                            <p className="text-sm text-zinc-500 truncate">{currentUser.aboutMe}</p>
                        </div>
                        <button onClick={() => handleSectionClick({ name: "settings" })} className="text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0">
                            <Settings className="w-5 h-auto" />
                        </button>
                    </div>
                )}
            </section>
        </aside>
    )
}
