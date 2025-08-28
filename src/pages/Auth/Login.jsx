// src/pages/auth/Login.jsx
import { useState } from 'react'
import axios from '../../utils/axiosInstance'   // ← ใช้ axios instance ของโปรเจกต์
import { toast } from 'react-toastify'
import useEcomStore from '../../store/ecom-store'
import { useNavigate, Link } from 'react-router-dom'

const Login = () => {
  const navigate = useNavigate()
  const actionLogin = useEcomStore((state) => state.actionLogin)
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      // 1) เรียก actionLogin แล้ว "ต้องได้" response กลับมา
      const res = await actionLogin(formData) // โปรดดูหมายเหตุด้านล่างให้ actionLogin return res

      const { token, payload } = res?.data || {}
      if (!token) {
        throw new Error('ไม่มี token ใน response')
      }

      // เก็บ token และตั้ง header
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // ดึง role + เก็บ role
      const role = String(payload?.role || '').toUpperCase()
      localStorage.setItem('role', role)

      // Redirect ตาม role
      if (role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (role === 'CASHIER') {
        navigate('/cashier', { replace: true })
      } else {
        navigate('/user', { replace: true })
      }

      toast.success('เข้าสู่ระบบสำเร็จ!', { position: 'top-center', autoClose: 1800 })
    } catch (err) {
      console.error(err)
      const errMsg = err?.response?.data?.message || err?.message || 'เข้าสู่ระบบไม่สำเร็จ'
      toast.error(errMsg, { position: 'top-center', autoClose: 2000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-500 font-prompt">เข้าสู่ระบบ</h2>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1 font-prompt">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="กรอก Username ของท่าน"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            autoComplete="username"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-red-600 mb-1 font-prompt">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="กรอกรหัสผ่านของท่าน"
            className="w-full border border-gray-300 rounded px-3 py-2 text-black"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="mb-4 text-right">
          <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline font-prompt">
            ลืมรหัสผ่านใช่ไหม?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full text-white py-2 rounded transition font-prompt ${submitting ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
        >
          {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  )
}

export default Login
