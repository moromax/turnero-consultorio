// Configuración de Supabase
const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';

// Inicializamos el cliente de Supabase
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Referencias a elementos del DOM
const form = document.getElementById('turnoForm');
const fechaInput = document.getElementById('fecha');
const horaSelect = document.getElementById('hora');
const tipoTurnoSelect = document.getElementById('tipo_turno');
const dniInput = document.getElementById('dni');

// 1. Bloquear fechas anteriores a hoy
const hoy = new Date().toISOString().split('T')[0];
fechaInput.min = hoy;

// 2. Función para sumar minutos a una hora (HH:mm)
function calcularFin(hora, minutos) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m + minutos, 0);
    let horaFin = date.getHours().toString().padStart(2, '0');
    let minFin = date.getMinutes().toString().padStart(2, '0');
    return `${horaFin}:${minFin}`;
}

// 3. Función para cargar horarios disponibles
async function cargarHorarios() {
    const fecha = fechaInput.value;
    const tipo = tipoTurnoSelect.value;
    
    if (!fecha || !tipo) return;

    horaSelect.innerHTML = '<option>Cargando horarios...</option>';

    // Consultamos turnos existentes en la fecha seleccionada
    const { data: turnosExistentes, error } = await _supabase
        .from('turnos')
        .select('hora_inicio, hora_fin')
        .eq('fecha', fecha);

    if (error) {
        console.error("Error al cargar turnos:", error);
        return;
    }

    horaSelect.innerHTML = ''; // Limpiar select
    const duracion = tipo === 'Primera vez' ? 40 : 20;
    
    // Generamos opciones desde las 15:00 hasta las 20:00 cada 20 min
    for (let h = 15; h < 20; h++) {
        for (let m = 0; m < 60; m += 20) {
            let horaInicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            let horaFinPotencial = calcularFin(horaInicio, duracion);

            // Validar que el turno no termine después de las 20:00
            if (horaFinPotencial > "20:00") continue;

            // Verificar si el rango (inicio a fin) choca con algún turno existente
            const ocupado = turnosExistentes.some(t => {
                // Hay solapamiento si:
                return (horaInicio < t.hora_fin && horaFinPotencial > t.hora_inicio);
            });

            if (!ocupado) {
                let opt = document.createElement('option');
                opt.value = horaInicio;
                opt.textContent = `${horaInicio} hs`;
                horaSelect.appendChild(opt);
            }
        }
    }

    if (horaSelect.innerHTML === '') {
        horaSelect.innerHTML = '<option value="">No hay turnos disponibles</option>';
    }
}

// Escuchar cambios para actualizar el combo de horas
fechaInput.addEventListener('change', cargarHorarios);
tipoTurnoSelect.addEventListener('change', cargarHorarios);
