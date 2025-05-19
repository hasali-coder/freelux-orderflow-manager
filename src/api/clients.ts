import { supabase } from "@/lib/supabaseClient";

export const addClient = async (clientData: {
  name: string;
  email: string;
  phone: string;
  preferredPaymentMethod: string;
  notes?: string;
}) => {
  const { data, error } = await supabase.from("clients").insert([{
    ...clientData
  }]);

  if (error) throw error;
  return data;
};
