import React, { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import ProductCard from "../components/card/ProductCard";
import FilterMenuGuest from "../components/FilterMenuGuest";

const Menu = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");

  // โหลดเมนูและหมวดหมู่
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await axios.get("/g-menu");
        setMenus(res.data.menus);
      } catch (err) {
        console.error("ดึงเมนูล้มเหลว:", err);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("/g-category");
        setCategories(res.data.categories);
      } catch (err) {
        console.error("ดึงหมวดหมู่ล้มเหลว:", err);
      }
    };

    fetchMenus();
    fetchCategories();
  }, []);

  const sortMenus = (menus) => {
    switch (sortOrder) {
      case "price-desc":
        return [...menus].sort((a, b) => b.price - a.price);
      case "price-asc":
        return [...menus].sort((a, b) => a.price - b.price);
      default:
        return menus;
    }
  };

  const filteredMenus = sortMenus(
    menus.filter(menu =>
      menu.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // แปลงชื่อหมวดหมู่เป็น id ปลอดภัย
  const getSafeId = name =>
    `category-${name.replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase()}`;

  // จัดกลุ่มเมนูตามหมวดหมู่
  const groupedMenus = categories.map(cat => ({
    categoryName: cat.name,
    safeId: getSafeId(cat.name),
    items: filteredMenus.filter(menu => menu.categoryId === cat.id),
  }));

  // เลื่อนดูเมนูเมื่อคลิกค้นหา
  const handleSearchClick = (menuId) => {
    const el = document.getElementById(`menu-${menuId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(menuId);
      setTimeout(() => setHighlightedId(null), 2000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white rounded-lg shadow-2xl">
      <div className="flex flex-col lg:flex-row min-h-screen font-prompt">
        {/* Sidebar: Search + Filter */}
        <aside className="w-full lg:w-[18%] bg-white p-4 shadow-md sticky top-0 h-fit rounded-md">
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
            <FilterMenuGuest
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
            />
          </div>
        </aside>

        {/* Main Menu */}
        <main className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-6 text-black">เมนูอาหาร</h2>
          <div className="flex justify-end items-center gap-2 mb-4">
            <label htmlFor="sort" className="text-black font-prompt">จัดเรียง:</label>
            <select
              id="sort"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border text-black px-3 py-1 rounded-md font-prompt"
            >
              <option value="default">-- เรียงตามปกติ --</option>
              <option value="price-desc">ราคามาก → น้อย</option>
              <option value="price-asc">ราคาน้อย → มาก</option>
            </select>
          </div>
          {groupedMenus
            .filter(group =>
              selectedCategoryId === null
                ? true
                : group.categoryName === categories.find(cat => cat.id === selectedCategoryId)?.name
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
                      showCartButton={false}
                    />
                  ))}
                </div>
              </div>
            ))}
        </main>
      </div>
    </div>
  );
};

export default Menu;
