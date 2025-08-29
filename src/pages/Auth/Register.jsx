import { useState } from 'react'
import axios from "../utils/axiosInstance";
import { toast } from 'react-toastify'

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    const onlyNumbers = name === "phone" ? value.replace(/\D/g, "") : value

    setFormData({
      ...formData,
      [name]: onlyNumbers,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      return alert('ยืนยันรหัสผ่านไม่ถูกต้อง')
    }

    if (formData.password.length < 7) {
      return alert("รหัสผ่านต้องมีอย่างน้อย 7 ตัวอักษร")
    }

    try {
      const res = await axios.post('/auth/register', formData)
      console.log(res.data)

      toast.success("สมัครสมาชิกสำเร็จ!", {
        position: "top-center",
        autoClose: 2000,
      })

      setTimeout(() => {
        window.location.reload();
      }, 2100)

    } catch (err) {
      const errMsg = err.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ"
      toast.error(errMsg, { position: "top-center" })
      console.log(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-red-500">สมัครสมาชิก</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="กรอก Username ของท่าน"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="กรอก Email ของท่าน"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="กรอกรหัสผ่านของท่าน 7 ตัวอักษรขึ้นไป"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="กรุณายืนยันรหัสผ่านของท่านอีกครัง"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-red-600 mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="กรอกเบอร์โทรศัพท์ของท่าน"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            inputMode="numeric"
            maxLength={10}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          สมัครสมาชิก
        </button>
      </form>
    </div>
  )
}

export default Register
