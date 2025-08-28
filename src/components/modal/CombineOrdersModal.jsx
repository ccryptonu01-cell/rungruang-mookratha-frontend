import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "../../fonts/THSarabunNew.js";
import { logoBase64 } from "../../assets/logoBase64";

const CombineOrdersModal = ({ tableId, token, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([tableId]);

  // วันปัจจุบันในรูปแบบ YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("โหลดออเดอร์ผิดพลาด:", err);
      }
    };
    fetchOrders();
  }, [token]);

  useEffect(() => {
    const tables = [...new Set(
      orders
        .filter((o) => new Date(o.createdAt).toISOString().slice(0, 10) === today)
        .map((o) => o.table?.tableNumber)
    )];
    setAvailableTables(tables.filter((t) => typeof t === "number"));
  }, [orders, today]);

  const toggleTableSelect = (tId) => {
    if (!selectedTables.includes(tId)) {
      setSelectedTables((prev) => [...prev, tId]);
    }
  };

  const generateCombinedPDF = () => {
    const doc = new jsPDF();
    doc.addFileToVFS("THSarabunNew.ttf", window.TH_SarabunNew_VFS);
    doc.addFont("THSarabunNew.ttf", "THSarabunNew", "normal");
    doc.setFont("THSarabunNew");

    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoSize = 30;
    const centerX = (pageWidth - logoSize) / 2;
    doc.addImage(logoBase64, "JPEG", centerX, 10, logoSize, logoSize);

    let y = 10 + logoSize + 10;
    doc.setFontSize(18);
    doc.text(`ใบเสร็จรวมโต๊ะ ${selectedTables.join(", ")}`, margin, y);
    y += 10;

    const now = new Date();
    const formattedDateTime = now.toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });
    doc.setFontSize(14);
    doc.text(`วันที่: ${formattedDateTime}`, margin, y);
    y += 10;

    let allItems = [];
    let total = 0;

    const combinedOrders = orders.filter(
      (o) =>
        selectedTables.includes(o.table?.tableNumber) &&
        new Date(o.createdAt).toISOString().slice(0, 10) === today
    );

    combinedOrders.forEach((order) => {
      order?.orderItems?.forEach((item) => {
        const existing = allItems.find((i) => i.name === item.menu.name);
        const price = Number(item.menu.price || 0);
        const qty = Number(item.quantity || 0);

        if (existing) {
          existing.qty += qty;
          existing.total += price * qty;
        } else {
          allItems.push({
            name: item.menu.name,
            qty,
            price,
            total: price * qty,
          });
        }

        total += price * qty;
      });
    });

    autoTable(doc, {
      startY: y,
      head: [["เมนู", "จำนวน", "ราคาต่อหน่วย (บาท)", "รวม (บาท)"]],
      body: allItems.map((item) => [
        item.name,
        item.qty,
        item.price.toFixed(2),
        item.total.toFixed(2),
      ]),
      styles: { font: "THSarabunNew", fontSize: 14 },
      headStyles: {
        fillColor: [230, 230, 230],
        font: "THSarabunNew",
        fontStyle: "normal",
        textColor: 20,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(16);
    doc.text(`รวมทั้งหมด: ${total.toFixed(2)} บาท`, margin, finalY);
    doc.save(`receipt-multi-tables.pdf`);
  };

  const filteredOrders = orders.filter((order) => {
    const tableNumber = order?.table?.tableNumber;
    const created = new Date(order.createdAt).toISOString().slice(0, 10);
    return selectedTables.includes(tableNumber) && created === today;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow w-full max-w-6xl">
        <h2 className="text-lg font-bold mb-2">
          รวมใบเสร็จจากโต๊ะ: {selectedTables.join(", ")}
        </h2>

        <div className="flex flex-wrap gap-3 items-center mb-4">
          <label className="text-sm">เลือกโต๊ะอื่นๆ:</label>
          {availableTables
            .filter((t) => t !== tableId && !selectedTables.includes(t))
            .map((t) => (
              <button
                key={t}
                onClick={() => toggleTableSelect(t)}
                className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-sm"
              >
                โต๊ะ {t}
              </button>
            ))}
        </div>

        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-1 border">โต๊ะ</th>
              <th className="p-1 border">หมายเลขออเดอร์</th>
              <th className="p-1 border">ผู้สั่ง</th>
              <th className="p-1 border">รายการเมนู</th>
              <th className="p-1 border">วันที่</th>
              <th className="p-1 border">ยอดรวม (บาท)</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((o) => (
              <tr key={o.id} className="align-top">
                <td className="border text-center">{o.table?.tableNumber}</td>
                <td className="border text-center">{o.id}</td>
                <td className="border text-center">{o.user?.username || "guest"}</td>
                <td className="border">
                  {o.orderItems?.map((item, i) => (
                    <div key={i}>
                      • {item.menu?.name} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td className="border text-center">
                  {new Date(o.createdAt).toLocaleString("th-TH", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="border text-center">
                  {Number(o.totalPrice || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded"
          >
            ยกเลิก
          </button>
          <button
            disabled={filteredOrders.length === 0}
            onClick={generateCombinedPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          >
            📄 สร้างใบเสร็จ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CombineOrdersModal;
