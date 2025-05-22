import { supabase } from "@/lib/supabaseClient";
import type { Order } from "@/types";

export async function fetchOrders() {
  const { data, error } = await supabase
    .from<Order>("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addOrder(order: Omit<Order, "id" | "created_at">) {
  const { data, error } = await supabase
    .from<Order>("orders")
    .insert([order])
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrder(id: string, changes: Partial<Omit<Order, "id">>) {
  const { data, error } = await supabase
    .from<Order>("orders")
    .update(changes)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
