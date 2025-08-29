import axiosInstance from "../utils/axiosInstance";

export const fetchMenus = () => {
  return axiosInstance.get("/menu");
};

export const createInventory = (token, form) => {
  return axiosInstance.post("/admin/inventory", form, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateInventory = (token, id, data) => {
  return axiosInstance.put(`/admin/inventory/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteInventory = (token, id) => {
  return axiosInstance.delete(`/admin/inventory/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};