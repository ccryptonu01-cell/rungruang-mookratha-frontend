import { Outlet } from "react-router-dom"
import MainNav from "../components/MainNav"
import bgImage from "../assets/BGhome.jpg"

const Layout = () => {
    return (
      <div className="min-h-screen relative">
        <MainNav />
        <main
          className="relative min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
  
          <div className="relative z-10 p-4 text-white">
            <Outlet />
          </div>
        </main>
      </div>
    )
  }

export default Layout
