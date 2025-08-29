import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const usersWithLowercaseRoles = res.data.users.map((user) => ({
        ...user,
        role: user.role.toLowerCase(),
      }));
      setUsers(usersWithLowercaseRoles);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งานนี้?")) return;
    try {
      await axios.delete(`/admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("ลบผู้ใช้งานสำเร็จ");
      setShowManageModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `/admin/user/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("อัปเดตบทบาทสำเร็จ");
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Error changing role:", err);
      toast.error("เกิดข้อผิดพลาดในการอัปเดตบทบาท");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("กรุณากรอกรหัสผ่านให้ครบถ้วน");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านไม่ตรงกัน");
      return;
    }

    const rolePath = selectedUser.role.toLowerCase();

    try {
      await axios.put(
        `/${rolePath}/user/${selectedUser.id}/password`,
        { password: newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter ตามชื่อ / อีเมล / บทบาท + dropdown
  const filteredUsers = users.filter((user) => {
    const lowerTerm = searchTerm.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(lowerTerm) ||
      user.email.toLowerCase().includes(lowerTerm) ||
      user.role.toLowerCase().includes(lowerTerm);

    const matchesRole =
      selectedRole === "all" || user.role.toLowerCase() === selectedRole;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">จัดการผู้ใช้งาน</h1>

      {/* ช่องค้นหา + กรองบทบาท */}
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อ / อีเมล / บทบาท"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 w-72 shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        />
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
        >
          <option value="all">ทั้งหมด</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      {loading ? (
        <div>กำลังโหลดข้อมูล...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-6 py-3 text-center">#</th>
                <th className="px-6 py-3 text-left">ชื่อผู้ใช้</th>
                <th className="px-6 py-3 text-left">อีเมล</th>
                <th className="px-6 py-3 text-center">บทบาท</th>
                <th className="px-6 py-3 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    ไม่พบข้อมูลผู้ใช้งาน
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-center">{index + 1}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4 text-center capitalize">{user.role}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowManageModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
                      >
                        จัดการ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: จัดการผู้ใช้งาน */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
              จัดการผู้ใช้: {selectedUser?.username}
            </h2>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full text-lg transition"
              >
                ลบผู้ใช้งาน
              </button>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowRoleModal(true);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-full text-lg transition"
              >
                เปลี่ยนบทบาท
              </button>
              <button
                onClick={() => {
                  setShowManageModal(false);
                  setShowPasswordModal(true);
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded w-full text-lg transition"
              >
                เปลี่ยนรหัสผ่าน
              </button>
              <button
                onClick={() => setShowManageModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-full text-lg transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: เปลี่ยนบทบาท */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">เลือกบทบาทใหม่</h2>
            <button
              onClick={() => changeUserRole(selectedUser.id, "admin")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full mb-3 text-lg transition"
            >
              Admin
            </button>
            <button
              onClick={() => changeUserRole(selectedUser.id, "user")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full mb-3 text-lg transition"
            >
              User
            </button>
            <button
              onClick={() => changeUserRole(selectedUser.id, "cashier")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded w-full mb-3 text-lg transition"
            >
              Cashier
            </button>
            <button
              onClick={() => setShowRoleModal(false)}
              className="mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-full text-lg transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96 max-w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              เปลี่ยนรหัสผ่านสำหรับ {selectedUser?.username}
            </h2>
            <input
              type="password"
              placeholder="รหัสผ่านใหม่ 8 ตัวอักษร"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border px-4 py-2 mb-3 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border px-4 py-2 mb-4 rounded focus:outline-none focus:ring focus:ring-blue-200"
            />
            <button
              onClick={handleChangePassword}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mb-3 text-lg transition"
            >
              เปลี่ยนรหัสผ่าน
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-full text-lg transition"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
