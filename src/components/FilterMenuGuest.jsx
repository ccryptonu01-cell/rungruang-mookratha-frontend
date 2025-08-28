import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

const FilterMenuGuest = ({ selectedCategoryId, setSelectedCategoryId }) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/g-category");
        setCategories(res.data.categories);
      } catch (err) {
        console.error("ดึงหมวดหมู่ล้มเหลว", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="mt-6">
      <div
        className="flex justify-between items-center mb-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-md font-bold text-black">หมวดหมู่</h3>
        <div className="lg:hidden">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-black" />
          ) : (
            <ChevronDown className="w-5 h-5 text-black" />
          )}
        </div>
      </div>

      <ul className={`space-y-2 ${isOpen ? "block" : "hidden"} lg:block`}>
        <li
          className={`cursor-pointer p-2 rounded ${selectedCategoryId === null
            ? "bg-red-100 font-bold"
            : "hover:bg-gray-200"
            }`}
          onClick={() => setSelectedCategoryId(null)}
        >
          เมนูทั้งหมด
        </li>
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={`cursor-pointer p-2 rounded ${selectedCategoryId === cat.id
              ? "bg-red-100 font-bold"
              : "hover:bg-gray-100"
              }`}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FilterMenuGuest;
