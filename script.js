// 1. SELECCIONAMOS LOS ELEMENTOS DEL HTML
const form = document.getElementById('plannerForm');
const studentNameInput = document.getElementById('studentName');
const studentGoalInput = document.getElementById('studentGoal');
const subjectsInput = document.getElementById('subjects');
const hoursInput = document.getElementById('hoursPerDay');

const resultSection = document.getElementById('resultSection');
const welcomeMessage = document.getElementById('welcomeMessage');
const tableBody = document.getElementById('tableBody');
const printBtn = document.getElementById('printBtn');
const resetBtn = document.getElementById('resetBtn'); // El botón nuevo

const nameError = document.getElementById('nameError');
const goalError = document.getElementById('goalError');
const subjectsError = document.getElementById('subjectsError');
const hoursError = document.getElementById('hoursError');

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Inyectar contenedor para la Meta y Progreso dinámicamente si no existe
let metaContainer = document.createElement('div');
let progresoHTML = `
    <div class="progress-container"><div class="progress-bar" id="progressBar"></div></div>
    <div class="progreso-texto" id="progressText">Progreso: 0%</div>
`;
welcomeMessage.after(metaContainer);

// 2. FUNCIONES MATEMÁTICAS Y DE TIEMPO
function sumarTiempo(horaBase, minutosSumar) {
    let [horas, minutos] = horaBase.split(':').map(Number);
    minutos += Math.round(minutosSumar);
    horas += Math.floor(minutos / 60);
    minutos = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function limpiarErrores() {
    nameError.textContent = '';
    if(goalError) goalError.textContent = '';
    subjectsError.textContent = '';
    hoursError.textContent = '';
}

function actualizarProgreso() {
    const checkboxes = document.querySelectorAll('.checkbox-materia');
    if (checkboxes.length === 0) return;

    let completados = 0;
    checkboxes.forEach(chk => {
        if (chk.checked) completados++;
    });

    const porcentaje = Math.round((completados / checkboxes.length) * 100);
    document.getElementById('progressBar').style.width = `${porcentaje}%`;
    document.getElementById('progressText').textContent = `Progreso de la semana: ${porcentaje}%`;

    // Guardar el estado de los checkboxes en memoria
    let estadoChecks = {};
    checkboxes.forEach(chk => { estadoChecks[chk.id] = chk.checked; });
    localStorage.setItem('studyChecks', JSON.stringify(estadoChecks));
}

// 3. GENERADOR DE DOM Y HORARIO
function renderizarHorario(datos) {
    welcomeMessage.textContent = `¡Horario Activo para ${datos.nombre}!`;
    
    metaContainer.innerHTML = `
        <div class="meta-destacada">
            <strong>🎯 Tu Gran Meta:</strong> ${datos.meta}
        </div>
        ${progresoHTML}
    `;

    tableBody.innerHTML = ''; 
    let estadoGuardado = JSON.parse(localStorage.getItem('studyChecks')) || {};

    datos.horario.forEach((materiasDelDia, index) => {
        const tr = document.createElement('tr');
        const tdDia = document.createElement('td');
        const tdMateria = document.createElement('td');
        const tdHoras = document.createElement('td');

        tdDia.innerHTML = `<strong>${diasSemana[index]}</strong>`;

        if (materiasDelDia.length === 0) {
            tdMateria.innerHTML = '<em>Día de Recuperación</em>';
            tdHoras.innerHTML = `<span style="color: #27ae60; font-weight: 600;">Libre</span>`;
            tr.classList.add('repaso-row');
        } else {
            const minutosTotales = datos.horas * 60;
            const cantidadPausas = materiasDelDia.length > 1 ? materiasDelDia.length - 1 : 0;
            const minutosPausaTotales = cantidadPausas * 15; 
            const minutosPorMateria = (minutosTotales - minutosPausaTotales) / materiasDelDia.length;
            
            let horaActual = "16:00"; 
            let htmlMaterias = '';

            materiasDelDia.forEach((materia, i) => {
                let horaFin = sumarTiempo(horaActual, minutosPorMateria);
                let checkId = `chk-${index}-${i}`;
                let isChecked = estadoGuardado[checkId] ? 'checked' : '';
                let textClass = isChecked ? 'completado' : '';

                htmlMaterias += `
                    <div style="margin-bottom: 8px;">
                        <input type="checkbox" id="${checkId}" class="checkbox-materia" ${isChecked}>
                        <label for="${checkId}" class="materia-label ${textClass}">
                            <strong>${materia}</strong> <br>
                            <small style="color: #555; margin-left: 25px;">⏱ ${horaActual} a ${horaFin}</small>
                        </label>
                    </div>`;
                
                if (i < materiasDelDia.length - 1) {
                    horaActual = sumarTiempo(horaFin, 15);
                    htmlMaterias += `<span style="color: #e67e22; font-size: 0.85em; display: block; margin: 4px 0 10px 25px;">☕ Pausa de 15 min (hasta ${horaActual})</span>`;
                }
            });

            tdMateria.innerHTML = htmlMaterias;
            const horasPuras = (minutosPorMateria / 60).toFixed(1);
            tdHoras.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">${horasPuras} hrs</span> netas<br><small>(Total: ${datos.horas} hrs)</small>`;
        }

        tr.appendChild(tdDia);
        tr.appendChild(tdMateria);
        tr.appendChild(tdHoras);
        tableBody.appendChild(tr);
    });

    // Activar eventos de checkboxes
    document.querySelectorAll('.checkbox-materia').forEach(chk => {
        chk.addEventListener('change', function() {
            const label = this.nextElementSibling;
            if(this.checked) {
                label.classList.add('completado');
            } else {
                label.classList.remove('completado');
            }
            actualizarProgreso();
        });
    });

    actualizarProgreso();
    form.classList.add('hidden'); // Ocultar formulario
    resultSection.classList.remove('hidden'); // Mostrar resultados
}

// 4. LÓGICA DE EVENTOS (Submit y Reset)
form.addEventListener('submit', function(event) {
    event.preventDefault();
    limpiarErrores();
    let hayErrores = false;

    const nombre = studentNameInput.value.trim();
    const meta = studentGoalInput ? studentGoalInput.value.trim() : 'Sin meta específica';
    const materiasTexto = subjectsInput.value.trim();
    const horas = parseFloat(hoursInput.value);

    if (nombre === '') { nameError.textContent = 'Por favor, ingresa tu nombre.'; hayErrores = true; }
    if (materiasTexto === '') { subjectsError.textContent = 'Ingresa al menos una materia.'; hayErrores = true; }
    
    if (isNaN(horas) || horas <= 0) {
        hoursError.textContent = 'Ingresa un número válido.'; hayErrores = true;
    } else if (horas > 8) {
        hoursError.textContent = '¡Alerta! Estudiar más de 8 horas causa agotamiento.'; hayErrores = true;
    }

    if (hayErrores) return;

    const materiasArray = materiasTexto.split(',').map(m => m.trim()).filter(m => m !== '');
    if (materiasArray.length > (horas * 5) * 2) {
        subjectsError.textContent = `Error: Demasiadas materias para el tiempo disponible.`; return;
    }

    const horarioSemanal = [[], [], [], [], []];
    let diaActual = 0;
    materiasArray.forEach(materia => {
        horarioSemanal[diaActual].push(materia);
        diaActual++;
        if (diaActual > 4) diaActual = 0;
    });

    const datosPlanificador = { nombre, meta, horas, horario: horarioSemanal };
    
    // Guardar en Memoria Local
    localStorage.setItem('studyPlannerData', JSON.stringify(datosPlanificador));
    localStorage.removeItem('studyChecks'); // Reiniciar checks
    
    renderizarHorario(datosPlanificador);
});

// MEMORIA PERMANENTE: Al recargar la página, revisar si hay datos guardados
document.addEventListener('DOMContentLoaded', () => {
    const datosGuardados = localStorage.getItem('studyPlannerData');
    if (datosGuardados) {
        renderizarHorario(JSON.parse(datosGuardados));
    }
});

printBtn.addEventListener('click', () => window.print());

resetBtn.addEventListener('click', () => {
    if(confirm('¿Estás seguro de querer borrar todo tu progreso y horario?')) {
        localStorage.removeItem('studyPlannerData');
        localStorage.removeItem('studyChecks');
        location.reload(); // Recargar la página
    }
});