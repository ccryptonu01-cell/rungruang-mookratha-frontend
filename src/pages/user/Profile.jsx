import { useEffect, useState } from 'react';
import axios from "../utils/axiosInstance";
import Modal from '../../../src/components/modal/EditPassword';

const ProfileInfo = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProfile(res.data);
        setEditForm({
          username: res.data.username,
          email: res.data.email,
          phone: res.data.phone,
        });
      } catch (err) {
        console.error(err);
        showModal('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์');
      }
    };

    fetchProfile();
  }, []);

  const showModal = (message) => {
    setModalMessage(message);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const res = await axios.put('/auth/profile', editForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      showModal(res.data.message || 'อัปเดตโปรไฟล์สำเร็จ!');
      setProfile(res.data.user);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      showModal('เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    }
  };

  const handleSavePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      showModal('รหัสผ่านใหม่ไม่ตรงกัน!');
      return;
    }

    if (newPassword.trim().length < 6) {
      showModal('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    try {
      const res = await axios.put(
        '/auth/profile',
        { password: newPassword.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      showModal(res.data.message || 'เปลี่ยนรหัสผ่านสำเร็จ!');
      setIsChangingPassword(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      showModal('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
    }
  };

  if (!profile) {
    return (
      <div className="text-center text-gray-500 font-prompt text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-prompt text-black">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-4xl mx-auto text-black">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          ข้อมูลส่วนตัว
        </h2>

        {isEditing ? (
          <div className="space-y-4 text-lg">
            <div>
              <label className="block text-gray-600">ชื่อ:</label>
              <input
                type="text"
                name="username"
                value={editForm.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl"
              />
            </div>

            <div>
              <label className="block text-gray-600">อีเมล:</label>
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl"
              />
            </div>

            <div>
              <label className="block text-gray-600">เบอร์โทร:</label>
              <input
                type="text"
                name="phone"
                value={editForm.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSaveProfile}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xl hover:bg-green-600 transition"
              >
                บันทึก
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 text-black py-2 rounded-lg text-xl hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : isChangingPassword ? (
          <div className="space-y-4 text-lg text-black">
            <div>
              <label className="block text-gray-600">รหัสผ่านใหม่:</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xl"
              />
            </div>

            <div>
              <label className="block text-gray-600">ยืนยันรหัสผ่านใหม่:</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xl"
              />
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSavePassword}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg text-xl hover:bg-green-600 transition"
              >
                บันทึก
              </button>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 bg-gray-300 text-black py-2 rounded-lg text-xl hover:bg-gray-400 transition"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xl text-gray-700">
            <p><span className="font-medium">ชื่อ:</span> {profile.username}</p>
            <p><span className="font-medium">อีเมล:</span> {profile.email}</p>
            <p><span className="font-medium">เบอร์โทร:</span> {profile.phone}</p>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-yellow-400 text-black py-2 rounded-lg hover:bg-yellow-500 transition"
              >
                ✏️ แก้ไขข้อมูล
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                เปลี่ยนรหัสผ่าน
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        show={modalMessage !== ''}
        onClose={() => setModalMessage('')}
        title="แจ้งเตือน"
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
};

export default ProfileInfo;
