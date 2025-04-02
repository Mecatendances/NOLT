import axios from "axios";

const API_URL = "http://localhost:4000/dolibarr";

export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await axios.get(`${API_URL}/products/${id}`);
  return response.data;
};
