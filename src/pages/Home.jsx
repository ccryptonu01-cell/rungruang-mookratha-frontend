import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useEcomStore from "../store/ecom-store";

const Home = () => {
  const { user, hasHydrated } = useEcomStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasHydrated) return;

    if (user?.role === "ADMIN") {
      navigate("/admin", { replace: true });
    } else if (user?.role === "CASHIER") {
      navigate("/cashier", { replace: true });
    } else if (user?.role === "USER") {
      navigate("/user", { replace: true });
    }
  }, [user, hasHydrated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-10 bg-cover bg-center font-prompt">
      <div className="bg-black/80 rounded-xl p-6 sm:p-10 text-center text-white space-y-4 w-full max-w-xl sm:max-w-2xl md:max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
          รุ่งเรืองหมูกระทะ888
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-medium">
          มาตั้งตี้หมูกระทะกัน ที่รุ่งเรืองหมูกระทะ น้ำจิ้มรสเด็ด อร่อยโดนใจ
        </p>
        <p className="text-xs sm:text-sm md:text-base border-t border-white/30 pt-2">
          เปิดทุกวัน จันทร์–อาทิตย์ 16.00น. - 23.00น.
        </p>
      </div>
    </div>
  );
};

export default Home;
