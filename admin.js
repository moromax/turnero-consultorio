// CONFIGURACIÓN (Asegúrate de poner tus datos aquí)
const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tabla = document.getElementById('tablaTurnos');

// Sumar minutos a una hora HH:MM
function calcularFin(horaInicio, minutos) {
    let [hrs, mins] = horaInicio.split(':').map(Number);
    let date = new Date();
    date.setHours(hrs, mins + minutos);
    return date.toTimeString().substring(0, 5);
}

// Verifica si el nuevo horario choca con uno existente
async function haySolapamiento(id, fecha, inicio, fin) {
    const { data, error } = await _supabase
        .from('turnos')
        .select('id, hora_inicio, hora_fin')
        .eq('fecha', fecha)
        .neq('id', id);

    if (error) return false;

    return data.some(turno => {
        // Choque: (InicioNuevo < FinExistente) && (FinNuevo > InicioExistente)
        return (inicio < turno.hora_fin && fin > turno.hora_inicio);
    });
}

async function obtenerTurnos() {
    const filtroFecha = document.getElementById('filtroFecha').value;
    const filtroDni = document.getElementById('filtroDni').value;

    let consulta = _supabase.from('turnos').select('*').order('hora_inicio', { ascending: true });

    if (filtroFecha) consulta = consulta.eq('fecha', filtroFecha);
    if (filtroDni) consulta = consulta.ilike('dni', `%${filtroDni}%`);

    const { data, error } = await consulta;
    if (error) {
        console.error("Error cargando datos:", error);
    } else {
        renderizarTabla(data);
    }
}

function renderizarTabla(turnos) {
    if (!tabla) return;
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
    const nuevoNombre = prompt("Nombre:", nombreAct) || nombreAct;
    const nuevoDni = prompt("DNI:", dniAct) || dniAct;
    const nuevaFecha = prompt("Fecha (AAAA-MM-DD):", fechaAct) || fechaAct;
    const nuevoTipo = prompt("Tipo (Primera vez / Control):", tipoAct) || tipoAct;
    const nuevaHora = prompt("Hora inicio (HH:MM):", horaAct.substring(0,5)) || horaAct;

    const duracion = nuevoTipo === 'Primera vez' ? 40 : 20;
    const nuevaHoraFin = calcularFin(nuevaHora, duracion);

    // VALIDACIÓN DE CHOQUE
    const solapa = await haySolapamiento(id, nuevaFecha, nuevaHora, nuevaHoraFin);
    
    if (solapa) {
        alert("⚠️ ¡Error! El horario seleccionado se solapa con otro turno agendado.");
        return;
    }

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

    if (error) alert("Error: " + error.message);
    else {
        alert("Turno actualizado correctamente.");
        obtenerTurnos();
    }
}

async function eliminarTurno(id) {
    if (confirm("¿Eliminar este turno?")) {
        const { error } = await _supabase.from('turnos').delete().eq('id', id);
        if (error) alert(error.message);
        else obtenerTurnos();
    }
}

// Iniciar
obtenerTurnos();
