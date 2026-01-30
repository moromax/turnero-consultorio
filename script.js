// Configuración de Supabase
const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('turnoForm');
const fechaInput = document.getElementById('fecha');
const horaSelect = document.getElementById('hora');
const tipoTurnoSelect = document.getElementById('tipo_turno');
const dniInput = document.getElementById('dni');

const hoyStr = new Date().toISOString().split('T')[0];
fechaInput.min = hoyStr;

function calcularFin(hora, minutos) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m + minutos, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

async function cargarHorarios() {
    const fecha = fechaInput.value;
    const tipo = tipoTurnoSelect.value;
    if (!fecha || !tipo) return;

    horaSelect.innerHTML = '<option>Cargando...</option>';

    const { data: turnosExistentes } = await _supabase
        .from('turnos')
        .select('hora_inicio, hora_fin')
        .eq('fecha', fecha);

    horaSelect.innerHTML = '';
    const duracion = tipo === 'Primera vez' ? 40 : 20;

    // Obtener hora actual para validar hoy
    const ahora = new Date();
    const horaActualStr = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    for (let h = 15; h < 20; h++) {
        for (let m = 0; m < 60; m += 20) {
            let horaInicio = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            let horaFinPotencial = calcularFin(horaInicio, duracion);

            if (horaFinPotencial > "20:00") continue;

            // VALIDACIÓN NUEVA: Si es hoy, no mostrar horas pasadas
            if (fecha === hoyStr && horaInicio <= horaActualStr) continue;

            const ocupado = (turnosExistentes || []).some(t => {
                const tInicio = t.hora_inicio.substring(0, 5);
                const tFin = t.hora_fin.substring(0, 5);
                return (horaInicio < tFin && horaFinPotencial > tInicio);
            });

            if (!ocupado) {
                let opt = document.createElement('option');
                opt.value = horaInicio;
                opt.textContent = `${horaInicio} hs`;
                horaSelect.appendChild(opt);
            }
        }
    }
}

fechaInput.addEventListener('change', cargarHorarios);
tipoTurnoSelect.addEventListener('change', cargarHorarios);

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const dni = dniInput.value;
    const tipo = tipoTurnoSelect.value;
    const fecha = fechaInput.value;
    const hora_inicio = horaSelect.value;

    if (!/^[0-9]{7,8}$/.test(dni)) return alert("DNI inválido.");
    if (!hora_inicio) return alert("Selecciona un horario.");

    const hora_fin = calcularFin(hora_inicio, tipo === 'Primera vez' ? 40 : 20);

    const { error } = await _supabase.from('turnos').insert([{ nombre, dni, tipo_turno: tipo, fecha, hora_inicio, hora_fin }]);

    if (error) {
        alert(error.code === '23505' ? "DNI ya registrado hoy." : "Error: " + error.message);
    } else {
        alert("¡Turno reservado!");
        form.reset();
        horaSelect.innerHTML = '';
    }
});
