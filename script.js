// Configuración de Supabase
// Reemplaza con tus datos que están en Project Settings -> API
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_KEY = 'TU_ANON_KEY_DE_SUPABASE';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Bloquear fechas anteriores a hoy en el calendario
const fechaInput = document.getElementById('fecha');
const hoy = new Date().toISOString().split('T')[0];
fechaInput.min = hoy;
