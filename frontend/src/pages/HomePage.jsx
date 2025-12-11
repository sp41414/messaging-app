import { useContext } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "../contexts/AuthContext"


export default function HomePage() {
    const navigate = useNavigate()
    const { user, ready } = useContext(AuthContext)

    useEffect(() => {
        if (ready && !user) {
            navigate("/signup")
        }
    }, [user, ready, navigate])

    return (
        <main className="bg-zinc-800 text-white min-h-screen">

        </main>
    )
}
