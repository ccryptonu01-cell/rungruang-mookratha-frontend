import { Outlet, useLocation } from "react-router-dom";
import bgImage from "../assets/BGhome.jpg";
import MainNav from "../components/UserNav";

const Layout = () => {
  const location = useLocation();

  const whiteBgPaths = [
    "/reservation",
    "/user/order-food",
    "/user/my-reservations",
    "/user/my-orders",
    "/user/cancel-reservation",
    "/user/cancel-order",
    "/user/profile",
  ];

  const backPaths = [
    "/user/order-food",
    "/user/my-reservations",
    "/user/my-orders",
    "/user/profile",
    "/user/paymentPage"
  ];

  const isWhiteBg = whiteBgPaths.includes(location.pathname);
  const showBackButton = backPaths.includes(location.pathname);

  return (
    <div className="min-h-screen relative">
      <div className="relative z-20">
        <MainNav onlyBack={showBackButton} />
      </div>

      <main
        className={`min-h-screen ${isWhiteBg ? "bg-white" : "bg-cover bg-center bg-no-repeat"} relative`}
        style={!isWhiteBg ? { backgroundImage: `url(${bgImage})` } : {}}
      >
        {!isWhiteBg && (
          <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
        )}

        <div className="relative z-10 p-4 text-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
