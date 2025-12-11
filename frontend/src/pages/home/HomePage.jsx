import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { AuthContext } from "../../contexts/AuthContext"
import SideBar from "./components/SideBar"

export default function HomePage() {
    const { user, ready } = useContext(AuthContext)
    const navigate = useNavigate()
    const [currentSection, setCurrentSection] = useState('friends')

    useEffect(() => {
        if (ready && !user) {
            navigate("/signup")
        }
    }, [user, ready, navigate])

    const handleSectionChange = (section) => {
        setCurrentSection(section)
    }

    return (
        <main className="bg-zinc-800 text-white min-h-screen flex">
            <SideBar user={user} ready={ready} onSectionChange={handleSectionChange} />

            <div className="flex-1 flex flex-col">
                {currentSection.name === 'friends' && (
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">Friends</h1>
                    </div>
                )}

                {currentSection.name === "user" && (
                    <div className="p-6">
                    </div>
                )}
            </div>
        </main>
    )
}
