import { createClient } from "@supabase/supabase-js";
import config from "../supabase-config.json";

// Cliente Supabase central (sem ativar até configurarmos)
export const supabase = createClient(
  config.supabase_url,
  config.supabase_anon
);
