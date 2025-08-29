import axiosInstance from "../utils/axiosInstance";

export const fetchMenus = async () => {
  return await axiosInstance.get("/menu")
}
