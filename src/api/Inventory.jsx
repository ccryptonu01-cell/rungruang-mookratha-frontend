// src/api/Inventory.js
import axios from "axios";

export const fetchMenus = () => {
  return axios.get("http://localhost:5000/api/menu");
};

export const createInventory = (token, form) => {
  return axios.post("http://localhost:5000/api/admin/inventory", form, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const updateInventory = (token, id, data) => {
  return axios.put(`http://localhost:5000/api/admin/inventory/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteInventory = (token, id) => {
  return axios.delete(`http://localhost:5000/api/admin/inventory/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};