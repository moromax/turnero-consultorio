const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerTurnos() {
    const filtroFecha = document.getElementById('filtroFecha').value;
    const filtroDni = document.getElementById('filtroDni').value;
    const tabla = document.getElementById('tablaTurnos');

    // ORDEN CRONOLÓGICO: Primero fecha, luego hora de inicio
    let consulta = _supabase
        .from('turnos')
        .select('*')
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true });

    if (filtroFecha) consulta = consulta.eq('fecha', filtroFecha);
    if (filtroDni) consulta = consulta.ilike('dni', `%${filtroDni}%`);

    const { data, error } = await consulta;
    
    if (error) {
        console.error("Error cargando turnos:", error.message);
        return;
    }

    tabla.innerHTML = '';
    if (data.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">No hay turnos registrados.</td></tr>';
        return;
    }

    data.forEach(turno => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${turno.fecha}</td>
            <td>${turno.hora_inicio.substring(0,5)} - ${turno.hora_fin.substring(0,5)}</td>
            <td>${turno.nombre}</td>
            <td>${turno.dni}</td>
            <td>${turno.tipo_turno}</td>
            <td>
                <button onclick="eliminarTurno('${turno.id}')" class="btn-delete">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function eliminarTurno(id) {
    if (confirm("¿Estás seguro de eliminar este turno?")) {
        const { error } = await _supabase.from('turnos').delete().eq('id', id);
        if (error) alert(error.message);
        else obtenerTurnos();
    }
}

document.addEventListener('DOMContentLoaded', obtenerTurnos);
