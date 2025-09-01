import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import ProductCard from "../../components/card/ProductCard";
import useEcomStore from "../../store/ecom-store";
import FilterMenu from "../../components/admin/Menu/FilterMenu";
import Cart from "../../components/admin/Menu/Cart";

const OrderFood = () => {
  const token = useEcomStore((state) => state.token);
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get("/admin/menu");
        setMenus(res.data.menus);
      } catch (err) {
        console.error("ดึงเมนูล้มเหลว", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("/category", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.categories);
      } catch (err) {
        console.error("ดึงหมวดหมู่ล้มเหลว", err);
      }
    };

    fetchMenus();
    fetchCategories();
  }, [token]);

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSafeId = name =>
    `category-${name.replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase()}`;

  const groupedMenus = categories.map(cat => ({
    categoryName: cat.name,
    safeId: getSafeId(cat.name),
    items: filteredMenus.filter(menu => menu.categoryId === cat.id),
  }));

  const handleSearchClick = (menuId) => {
    const el = document.getElementById(`menu-${menuId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(menuId);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white font-prompt">

      {/* Sidebar: Search + Filter */}
      <aside className="w-full lg:w-[18%] bg-white p-4 shadow-md order-1 lg:order-none sticky top-0 h-fit rounded-md">
        <h2 className="text-xl font-bold mb-4 text-black">ค้นหาเมนู</h2>

        <input
          type="text"
          placeholder="ค้นหาอาหาร..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
        />

        {searchTerm.trim() !== "" && (
          <div className="space-y-2 mb-4">
            {filteredMenus.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-100 p-2 rounded">ไม่พบเมนู</p>
            ) : (
              filteredMenus.map(menu => (
                <div
                  key={menu.id}
                  onClick={() => handleSearchClick(menu.id)}
                  className="cursor-pointer bg-white hover:bg-red-100 rounded p-2 text-gray-800 font-medium shadow-sm border border-gray-200"
                >
                  {menu.name}
                </div>
              ))
            )}
          </div>
        )}

        <div className="text-black mt-4">
          <FilterMenu
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
          />
        </div>
      </aside>

      {/* Main Menu */}
      <main className="flex-1 p-4 order-2 lg:order-none">
        <h2 className="text-2xl font-bold mb-6 text-black">เมนูอาหาร</h2>
        {groupedMenus
          .filter(group =>
            selectedCategoryId === null ? true : categories.find(cat => cat.id === selectedCategoryId)?.name === group.categoryName
          )
          .map(group => (
            <div key={group.categoryName} className="mb-6">
              <h3 className="text-lg font-semibold bg-gray-100 py-2 px-4 rounded text-black">
                {group.categoryName}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-3">
                {group.items.map(menu => (
                  <ProductCard
                    key={menu.id}
                    menu={menu}
                    highlighted={highlightedId === menu.id}
                    showCartButton={true}  // ✅ เพิ่มตรงนี้
                  />
                ))}
              </div>
            </div>
          ))}
      </main>

      {/* Cart */}
      <aside className="w-full lg:w-[20%] bg-white p-4 shadow-md border-t lg:border-l border-gray-200 order-3 lg:order-none">
        <h2 className="text-xl font-bold mb-4 text-black">ตะกร้า</h2>
        <div className="text-black">
          <Cart />
        </div>
      </aside>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg z-50 transition duration-300"
        title="กลับด้านบน"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>

    </div>
  );
};

export default OrderFood;
