const SUPABASE_URL = 'https://uekuyjoakqnhjltqrrpj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_COB2p3O_OrgFdO3W6EvLvg_DuicBhwj';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerTurnos() {
    const filtroFecha = document.getElementById('filtroFecha').value;
    const filtroDni = document.getElementById('filtroDni').value;
    const tabla = document.getElementById('tablaTurnos');

    let consulta = _supabase.from('turnos').select('*')
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true });

    if (filtroFecha) consulta = consulta.eq('fecha', filtroFecha);
    if (filtroDni) consulta = consulta.ilike('dni', `%${filtroDni}%`);

    const { data, error } = await consulta;
    if (error) return;

    tabla.innerHTML = '';
    data.forEach(turno => {
        // Formatear fecha de AAAA-MM-DD a DD-MM-AAAA
        const [anio, mes, dia] = turno.fecha.split('-');
        const fechaMostrar = `${dia}-${mes}-${anio}`;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${fechaMostrar}</td>
            <td style="font-weight:500;">${turno.hora_inicio.substring(0,5)} - ${turno.hora_fin.substring(0,5)}</td>
            <td>${turno.nombre}</td>
            <td>${turno.dni}</td>
            <td>${turno.tipo_turno}</td>
            <td>
                <button onclick="editarTurno('${turno.id}', '${turno.nombre}', '${turno.dni}')" class="btn-edit">Editar</button>
                <button onclick="eliminarTurno('${turno.id}')" class="btn-delete">Eliminar</button>
            </td>
        `;
        tabla.appendChild(fila);
    });
}

async function editarTurno(id, nombre, dni) {
    const nNombre = prompt("Nombre:", nombre) || nombre;
    const nDni = prompt("DNI:", dni) || dni;
    await _supabase.from('turnos').update({ nombre: nNombre, dni: nDni }).eq('id', id);
    obtenerTurnos();
}

async function eliminarTurno(id) {
    if (confirm("¿Eliminar este turno?")) {
        await _supabase.from('turnos').delete().eq('id', id);
        obtenerTurnos();
    }
}

document.addEventListener('DOMContentLoaded', obtenerTurnos);
