import { useEffect, useState, useContext } from "react"
import { useNavigate, Link } from "react-router"
import { AuthContext } from "../../contexts/AuthContext"
import Form from "./components/Form"
import useLogin from "../../hooks/useLogin"


export default function Login() {
    const navigate = useNavigate()
    const { user, ready } = useContext(AuthContext)
    const { login, isLoading, error } = useLogin()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        if (ready && user) {
            navigate("/")
        }
    }, [user, ready, navigate])

    async function onSubmit(e) {
        e.preventDefault()
        await login(username, password)
    }

    return (
        <main className="bg-zinc-800 text-white min-h-screen flex justify-center items-center">
            <section className="bg-zinc-900 p-8 sm:p-12 md:p-16 rounded-lg shadow-lg shadow-zinc-900 w-full max-w-lg mx-4">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Login</h1>
                {error && (
                    <p className="text-red-300 mb-2">{typeof error === "string" ? error : error.map(err => err.msg).join(", ")}</p>
                )}
                <Form onSubmit={onSubmit} type={"Login"} setUsername={setUsername} setPassword={setPassword} username={username} password={password} isLoading={isLoading} />
                <p className="text-neutral-400">Don't have an account? <Link to="/signup"><span className="text-blue-400 hover:underline">Sign up</span></Link></p>
            </section>
        </main>
    )
}

