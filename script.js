// Configuración de Supabase
// Reemplaza con tus datos que están en Project Settings -> API
const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Bloquear fechas anteriores a hoy en el calendario
const fechaInput = document.getElementById('fecha');
const hoy = new Date().toISOString().split('T')[0];
fechaInput.min = hoy;
