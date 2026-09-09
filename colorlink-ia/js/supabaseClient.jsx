// Cliente oficial de conexión con Supabase
const SUPABASE_URL = "https://papsmqqiamjofvvcenfl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_c5I6FfYmbiBsdSzaunK2NQ_T8pEmnBy";

// Inicializar cliente global
const supabase = (typeof window !== "undefined" && window.supabase)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
