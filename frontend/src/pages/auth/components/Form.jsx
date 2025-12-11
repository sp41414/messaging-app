export default function Form({ onSubmit, type, setUsername, setPassword, username, password, isLoading }) {
    return (
        <form method="POST" onSubmit={onSubmit} className="flex flex-col gap-2 mb-4">
            <label className="text-lg sm:text-xl md:text-2xl font-medium text-zinc-300" htmlFor="username">Username</label>
            <input type="text" placeholder="Username" name="username" id="username" onChange={(e) => setUsername(e.target.value)} value={username} className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"></input>
            <label className="text-lg sm:text-xl md:text-2xl font-medium text-zinc-300" htmlFor="password">Password</label>
            <input type="password" placeholder="••••••" name="password" id="password" onChange={(e) => setPassword(e.target.value)} value={password.value} className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"></input>
            <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg mt-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${isLoading ? "disabled bg-blue-400" : ""}`}
            >
                {isLoading ? (
                    "Loading..."
                ) : (
                    `${type}`
                )}
            </button>
        </form>
    )
}
