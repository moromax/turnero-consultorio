const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tabla = document.getElementById('tablaTurnos');

async function obtenerTurnos() {
    const fecha = document.getElementById('filtroFecha').value;
    const dni = document.getElementById('filtroDni').value;

    let query = _supabase.from('turnos').select('*').order('fecha', { ascending: true }).order('hora_inicio', { ascending: true });

    // Aplicar filtros si existen
    if (fecha) query = query.eq('fecha', fecha);
    if (dni) query = query.ilike('dni', `%${dni}%`);

    const { data, error } = await query;

    if (error) {
        console.error(error);
        return;
    }

    renderizarTabla(data);
}

function renderizarTabla(turnos) {
    tabla.innerHTML = '';
    turnos.forEach(turno => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${turno.fecha}</td>
            <td>${turno.hora_inicio} - ${turno.hora_fin}</td>
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
    if (confirm('¿Estás seguro de que deseas eliminar este turno?')) {
        const { error } = await _supabase.from('turnos').delete().eq('id', id);
        if (error) alert("Error al eliminar");
        else obtenerTurnos(); // Refrescar tabla
    }
}

// Cargar todos los turnos al iniciar
obtenerTurnos();
