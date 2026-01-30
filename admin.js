// Configuración de Supabase
const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tabla = document.getElementById('tablaTurnos');

// Función para calcular fin (HH:mm) según el tipo de turno
function calcularFin(hora, minutos) {
    let [h, m] = hora.split(':').map(Number);
    let date = new Date();
    date.setHours(h, m + minutos, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

async function obtenerTurnos() {
    const fecha = document.getElementById('filtroFecha').value;
    const dni = document.getElementById('filtroDni').value;

    let query = _supabase.from('turnos').select('*').order('fecha', { ascending: true }).order('hora_inicio', { ascending: true });

    if (fecha) query = query.eq('fecha', fecha);
    if (dni) query = query.ilike('dni', `%${dni}%`);

    const { data, error } = await query;
    if (!error) renderizarTabla(data);
}

function renderizarTabla(turnos) {
    tabla.innerHTML = '';
    turnos.forEach(turno => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${turno.fecha}</td>
            <td>${turno.hora_inicio.substring(0,5)} - ${turno.hora_fin.substring(0,5)}</td>
            <td>${turno.nombre}</td>
            <td>${turno.dni}</td>
            <td>${turno.tipo_turno}</td>
            <td>
                <button onclick="editarTurnoCompleto('${turno.id}', '${turno.nombre}', '${turno.dni}', '${turno.fecha}', '${turno.hora_inicio}', '${turno.tipo_turno}')" class="btn-edit">Editar</button>
                <button onclick="eliminarTurno('${turno.id}')" class="btn-delete">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function editarTurnoCompleto(id, nombreAct, dniAct, fechaAct, horaAct, tipoAct) {
    // Pedir datos paso a paso
    const nuevoNombre = prompt("Nombre del paciente:", nombreAct) || nombreAct;
    const nuevoDni = prompt("DNI (solo números):", dniAct) || dniAct;
    const nuevaFecha = prompt("Fecha (AAAA-MM-DD):", fechaAct) || fechaAct;
    
    let nuevoTipo = prompt("Tipo (Escribe: Primera vez / Control):", tipoAct) || tipoAct;
    // Validar que el tipo sea uno de los dos permitidos
    if (nuevoTipo !== 'Primera vez' && nuevoTipo !== 'Control') {
        alert("Tipo de turno inválido. Se mantendrá el original.");
        nuevoTipo = tipoAct;
    }

    const nuevaHora = prompt("Hora de inicio (HH:MM):", horaAct.substring(0,5)) || horaAct;

    // Validaciones
    if (!/^[0-9]{7,8}$/.test(nuevoDni)) return alert("DNI debe ser de 7 u 8 números.");
    
    const duracion = nuevoTipo === 'Primera vez' ? 40 : 20;
    const nuevaHoraFin = calcularFin(nuevaHora, duracion);

    const { error } = await _supabase
        .from('turnos')
        .update({ 
            nombre: nuevoNombre, 
            dni: nuevoDni, 
            fecha: nuevaFecha, 
            tipo_turno: nuevoTipo,
            hora_inicio: nuevaHora,
            hora_fin: nuevaHoraFin
        })
        .eq('id', id);

    if (error) {
        alert("Error al actualizar: " + error.message);
    } else {
        alert("Turno actualizado correctamente.");
        obtenerTurnos();
    }
}

async function eliminarTurno(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
        const { error } = await _supabase.from('turnos').delete().eq('id', id);
        if (!error) obtenerTurnos();
    }
}

// Cargar turnos al abrir la página
obtenerTurnos();
