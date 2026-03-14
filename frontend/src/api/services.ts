// src/api/services.ts
import api from "./axios";
import { Category, Order, Product } from "../types";

export const login = async (email: string, password: string) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data as { access_token: string };
};

export const getCategories = async () => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};
export const createCategory = (data: { name: string; parentId?: number }) =>
  api.post<Category>("/categories", data).then((r) => r.data);
export const updateCategory = (
  id: number,
  data: { name?: string; parentId?: number },
) => api.put<Category>(`/categories/${id}`, data).then((r) => r.data);
export const deleteCategory = async (id: number) => {
  await api.delete(`/categories/${id}`);
};

export const getProducts = async () => {
  const { data } = await api.get<Product[]>("/products");
  return data;
};
export const createProduct = async (payload: {
  name: string;
  price: number;
  categoryId: number;
}) => {
  const { data } = await api.post<Product>("/products", payload);
  return data;
};
export const updateProduct = async (
  id: number,
  payload: Partial<{ name: string; price: number; categoryId: number }>,
) => {
  const { data } = await api.put<Product>(`/products/${id}`, payload);
  return data;
};
export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};

export const getOrders = () => api.get<Order[]>("/orders").then((r) => r.data);

export const getOrder = (id: number) =>
  api.get<Order>(`/orders/${id}`).then((r) => r.data);

export const createOrder = (data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  address?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  items: { productId: number; quantity: number }[];
}) => api.post<Order>("/orders", data).then((r) => r.data);

export const updateOrder = (
  id: number,
  data: {
    status?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    trackingNumber?: string;
    address?: string;
    notes?: string;
    note?: string;
  },
) => api.put<Order>(`/orders/${id}`, data).then((r) => r.data);

export const deleteOrder = (id: number) =>
  api.delete(`/orders/${id}`).then((r) => r.data);
