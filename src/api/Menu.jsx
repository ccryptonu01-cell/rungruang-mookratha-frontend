import axios from "axios"

export const fetchMenus = async () => {
  return await axios.get("http://localhost:5000/api/menu")
}
