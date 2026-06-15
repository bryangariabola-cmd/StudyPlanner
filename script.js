// 1. SELECCIONAMOS ELEMENTOS HTML
const form = document.getElementById('plannerForm');
const studentNameInput = document.getElementById('studentName');
const studentGoalInput = document.getElementById('studentGoal');
const subjectsInput = document.getElementById('subjects');
const hoursInput = document.getElementById('hoursPerDay');
const startTimeInput = document.getElementById('startTime');

const resultSection = document.getElementById('resultSection');
const welcomeMessage = document.getElementById('welcomeMessage');
const tableBody = document.getElementById('tableBody');
const printBtn = document.getElementById('printBtn');
const resetBtn = document.getElementById('resetBtn');

const nameError = document.getElementById('nameError');
const goalError = document.getElementById('goalError');
const subjectsError = document.getElementById('subjectsError');
const hoursError = document.getElementById('hoursError');

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const frases = [
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "La disciplina es el puente entre tus metas y tus logros.",
    "Un pequeño paso cada día construye grandes resultados."
];

let metaContainer = document.createElement('div');
let progresoHTML = `
    <div id="pomodoroContainer" class="pomodoro-box">
        <h3><i class="fa-solid fa-stopwatch"></i> Modo Enfoque (Pomodoro)</h3>
        <div id="pomodoroTimer">25:00</div>
        <button id="startPomodoro" class="btn-pomodoro">Iniciar 25 min</button>
    </div>
    <div class="progress-container"><div class="progress-bar" id="progressBar"></div></div>
    <div class="progreso-texto" id="progressText">Progreso: 0%</div>
`;
welcomeMessage.after(metaContainer);

// 2. LÓGICA DEL TEMPORIZADOR POMODORO
let pomodoroInterval;
let tiempoRestante = 25 * 60;

function actualizarReloj() {
    let min = Math.floor(tiempoRestante / 60);
    let sec = tiempoRestante % 60;
    document.getElementById('pomodoroTimer').textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

document.addEventListener('click', function(e) {
    if(e.target && e.target.id === 'startPomodoro'){
        let btn = e.target;
        if(btn.textContent === 'Iniciar 25 min' || btn.textContent === 'Reanudar') {
            btn.textContent = 'Pausar';
            pomodoroInterval = setInterval(() => {
                tiempoRestante--;
                actualizarReloj();
                if(tiempoRestante <= 0) {
                    clearInterval(pomodoroInterval);
                    alert("¡Ding! 🔔 Bloque de enfoque terminado. Tómate 5 minutos de pausa activa.");
                    tiempoRestante = 25 * 60;
                    actualizarReloj();
                    btn.textContent = 'Iniciar 25 min';
                }
            }, 1000);
        } else {
            clearInterval(pomodoroInterval);
            btn.textContent = 'Reanudar';
        }
    }
});

// 3. FUNCIONES DE CÁLCULO DE TIEMPO Y ASISTENCIA
function sumarTiempo(horaBase, minutosSumar) {
    let [horas, minutos] = horaBase.split(':').map(Number);
    minutos += Math.round(minutosSumar);
    horas += Math.floor(minutos / 60);
    horas = horas % 24; 
    minutos = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function convertirAMinutos(horaTexto) {
    let [horas, minutos] = horaTexto.split(':').map(Number);
    return (horas * 60) + minutos;
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
    checkboxes.forEach(chk => { if (chk.checked) completados++; });
    const porcentaje = Math.round((completados / checkboxes.length) * 100);
    document.getElementById('progressBar').style.width = `${porcentaje}%`;
    document.getElementById('progressText').textContent = `Progreso de la semana: ${porcentaje}%`;
    
    let estadoChecks = {};
    checkboxes.forEach(chk => { estadoChecks[chk.id] = chk.checked; });
    localStorage.setItem('studyChecks', JSON.stringify(estadoChecks));
}

// 4. GENERADOR Y RENDERIZADOR DEL HORARIO DINÁMICO
function renderizarHorario(datos) {
    welcomeMessage.textContent = `¡Horario Activo para ${datos.nombre}!`;
    
    metaContainer.innerHTML = `
        <div class="meta-destacada"><strong>🎯 Tu Gran Meta:</strong> ${datos.meta}</div>
        ${progresoHTML}
    `;

    tableBody.innerHTML = ''; 
    let estadoGuardado = JSON.parse(localStorage.getItem('studyChecks')) || {};
    let mostrarAlertaSueno = false;

    datos.horario.forEach((materiasDelDia, index) => {
        const tr = document.createElement('tr');
        const tdDia = document.createElement('td');
        const tdMateria = document.createElement('td');
        const tdHoras = document.createElement('td');

        tdDia.innerHTML = `<strong>${diasSemana[index]}</strong>`;

        if (materiasDelDia.length === 0) {
            tdMateria.innerHTML = '<em>Día de Recuperación Estructural</em>';
            tdHoras.innerHTML = `<span style="color: #27ae60; font-weight: 600;">Libre</span>`;
            tr.classList.add('repaso-row');
        } else {
            const minutosTotales = datos.horas * 60;
            const cantidadPausas = materiasDelDia.length > 1 ? materiasDelDia.length - 1 : 0;
            const minutosPausaTotales = cantidadPausas * 15; 
            const minutosPorMateria = (minutosTotales - minutosPausaTotales) / materiasDelDia.length;
            
            let horaActual = datos.horaInicio; 
            let htmlMaterias = '';

            materiasDelDia.forEach((materia, i) => {
                let horaFin = sumarTiempo(horaActual, minutosPorMateria);
                
                // GUARDIÁN DEL SUEÑO: Si termina después de las 23:30 (1410 min) o antes de las 5 AM
                if (convertirAMinutos(horaFin) >= 1410 || convertirAMinutos(horaFin) < 300) {
                    mostrarAlertaSueno = true;
                }

                let checkId = `chk-${index}-${i}`;
                let isChecked = estadoGuardado[checkId] ? 'checked' : '';
                let textClass = isChecked ? 'completado' : '';

                htmlMaterias += `
                    <div style="margin-bottom: 10px;">
                        <input type="checkbox" id="${checkId}" class="checkbox-materia" ${isChecked}>
                        <label for="${checkId}" class="materia-label ${textClass}">
                            <strong>${materia}</strong> <br>
                            <small style="color: #555; margin-left: 25px;"><i class="fa-regular fa-clock"></i> ${horaActual} a ${horaFin}</small>
                        </label>
                    </div>`;
                
                if (i < materiasDelDia.length - 1) {
                    horaActual = sumarTiempo(horaFin, 15);
                    htmlMaterias += `<span style="color: #e67e22; font-size: 0.85em; display: block; margin: 4px 0 10px 25px;"><i class="fa-solid fa-mug-hot"></i> Pausa de 15 min (hasta ${horaActual})</span>`;
                }
            });

            tdMateria.innerHTML = htmlMaterias;
            const horasPuras = (minutosPorMateria / 60).toFixed(1);
            tdHoras.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">${horasPuras} hrs</span> netas<br><small style="color:#777;">(Carga total: ${datos.horas} hrs)</small>`;
        }
        tr.appendChild(tdDia); tr.appendChild(tdMateria); tr.appendChild(tdHoras);
        tableBody.appendChild(tr);
    });

    if (mostrarAlertaSueno) {
        metaContainer.innerHTML += `<div class="alerta-sueno"><i class="fa-solid fa-moon"></i> ⚠️ Alerta de Higiene del Sueño: Tu plan de estudio se extiende hasta la madrugada. ¡Prioriza el descanso para una mejor retención cognitiva!</div>`;
    }

    document.querySelectorAll('.checkbox-materia').forEach(chk => {
        chk.addEventListener('change', function() {
            this.nextElementSibling.classList.toggle('completado', this.checked);
            actualizarProgreso();
        });
    });

    actualizarProgreso();
    motivationMessage.textContent = frases[Math.floor(Math.random() * frases.length)];
    form.classList.add('hidden');
    resultSection.classList.remove('hidden');
}

// 5. MANEJO DE EVENTOS (SUBMIT Y RESET)
form.addEventListener('submit', function(event) {
    event.preventDefault();
    limpiarErrores();
    let hayErrores = false;

    const nombre = studentNameInput.value.trim();
    const meta = studentGoalInput ? studentGoalInput.value.trim() : 'Sin meta';
    const materiasTexto = subjectsInput.value.trim();
    const horas = parseFloat(hoursInput.value);
    const horaInicio = startTimeInput ? startTimeInput.value : '16:00';

    if (nombre === '') { nameError.textContent = 'Por favor, ingresa tu nombre.'; hayErrores = true; }
    if (materiasTexto === '') { subjectsError.textContent = 'Ingresa al menos una materia.'; hayErrores = true; }
    if (isNaN(horas) || horas <= 0) { hoursError.textContent = 'Ingresa un número válido de horas.'; hayErrores = true; } 
    else if (horas > 8) { hoursError.textContent = '¡Conflicto! Trabajar más de 8 horas causa agotamiento extremo.'; hayErrores = true; }

    if (hayErrores) return;

    const materiasArray = materiasTexto.split(',').map(m => m.trim()).filter(m => m !== '');
    if (materiasArray.length > (horas * 5) * 2) {
        subjectsError.textContent = `Error de Superposición: Demasiadas materias para el tiempo disponible.`; return;
    }

    const horarioSemanal = [[], [], [], [], []];
    let diaActual = 0;
    materiasArray.forEach(materia => {
        horarioSemanal[diaActual].push(materia);
        diaActual++;
        if (diaActual > 4) diaActual = 0;
    });

    const datosPlanificador = { nombre, meta, horas, horaInicio, horario: horarioSemanal };
    localStorage.setItem('studyPlannerData', JSON.stringify(datosPlanificador));
    localStorage.removeItem('studyChecks'); 
    renderizarHorario(datosPlanificador);
});

// MEMORIA: Autocarga al recargar página
document.addEventListener('DOMContentLoaded', () => {
    const datosGuardados = localStorage.getItem('studyPlannerData');
    if (datosGuardados) renderizarHorario(JSON.parse(datosGuardados));
});

printBtn.addEventListener('click', () => window.print());
resetBtn.addEventListener('click', () => {
    if(confirm('¿Estás seguro de querer borrar tu progreso y reiniciar la aplicación?')) {
        localStorage.clear();
        location.reload();
    }
});