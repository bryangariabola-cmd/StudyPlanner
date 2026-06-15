// 1. SELECCIONAMOS LOS ELEMENTOS DEL HTML
const form = document.getElementById('plannerForm');
const studentNameInput = document.getElementById('studentName');
const subjectsInput = document.getElementById('subjects');
const hoursInput = document.getElementById('hoursPerDay');

const resultSection = document.getElementById('resultSection');
const welcomeMessage = document.getElementById('welcomeMessage');
const tableBody = document.getElementById('tableBody');
const motivationMessage = document.getElementById('motivationMessage');
const printBtn = document.getElementById('printBtn');

const nameError = document.getElementById('nameError');
const subjectsError = document.getElementById('subjectsError');
const hoursError = document.getElementById('hoursError');

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const frases = [
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "La disciplina es el puente entre tus metas y tus logros.",
    "Un pequeño paso cada día construye grandes resultados."
];

function limpiarErrores() {
    nameError.textContent = '';
    subjectsError.textContent = '';
    hoursError.textContent = '';
}

// 2. LÓGICA PRINCIPAL AL GENERAR EL HORARIO
form.addEventListener('submit', function(event) {
    event.preventDefault();
    limpiarErrores();
    let hayErrores = false;

    // --- VALIDACIONES BÁSICAS ---
    const nombre = studentNameInput.value.trim();
    if (nombre === '') {
        nameError.textContent = 'Por favor, ingresa tu nombre.';
        hayErrores = true;
    }

    const materiasTexto = subjectsInput.value.trim();
    if (materiasTexto === '') {
        subjectsError.textContent = 'Por favor, ingresa al menos una materia.';
        hayErrores = true;
    }

    const horas = parseInt(hoursInput.value);
    if (isNaN(horas) || horas < 1 || horas > 12) {
        hoursError.textContent = 'Ingresa un número válido de horas (entre 1 y 12).';
        hayErrores = true;
    }

    if (hayErrores) return;

    // --- PROCESAMIENTO AVANZADO DE DATOS ---
    // Convertimos el texto en un arreglo limpio de materias
    const materiasArray = materiasTexto.split(',').map(m => m.trim()).filter(m => m !== '');

    // Validación avanzada: Evitar que pongan 20 materias para 1 hora diaria
    const horasTotalesSemana = horas * 5;
    if (materiasArray.length > horasTotalesSemana) {
        subjectsError.textContent = `¡Son demasiadas materias (${materiasArray.length}) para tan pocas horas a la semana (${horasTotalesSemana} hrs totales)!`;
        return;
    }

    // --- ALGORITMO DE DISTRIBUCIÓN ---
    // Creamos 5 "cajitas" (arreglos) vacías, una para cada día de la semana
    const horarioSemanal = [[], [], [], [], []];
    
    let diaActual = 0;
    
    // Repartimos las materias
    materiasArray.forEach(materia => {
        horarioSemanal[diaActual].push(materia);
        diaActual++;
        if (diaActual > 4) diaActual = 0; // Si llega al viernes, regresa al lunes
    });

    // Limpiamos la tabla antes de construirla
    tableBody.innerHTML = ''; 

    // --- MANIPULACIÓN DEL DOM (CONSTRUCCIÓN DINÁMICA) ---
    horarioSemanal.forEach((materiasDelDia, index) => {
        const tr = document.createElement('tr');
        const tdDia = document.createElement('td');
        const tdMateria = document.createElement('td');
        const tdHoras = document.createElement('td');

        tdDia.innerHTML = `<strong>${diasSemana[index]}</strong>`;

        if (materiasDelDia.length === 0) {
            // Si sobran días vacíos
            tdMateria.innerHTML = '<em>Repaso General / Descanso</em>';
            tdHoras.textContent = horas + ' hrs libres';
            tr.classList.add('repaso-row');
        } else {
            // Unimos las materias del día
            tdMateria.innerHTML = '• ' + materiasDelDia.join('<br>• ');

            // Calculamos cuánto tiempo le toca a cada materia hoy
            const horasPorMateria = (horas / materiasDelDia.length).toFixed(1);
            tdHoras.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">${horasPorMateria} hrs</span> por materia<br><small>(Total: ${horas} hrs)</small>`;
        }

        tr.appendChild(tdDia);
        tr.appendChild(tdMateria);
        tr.appendChild(tdHoras);
        tableBody.appendChild(tr);
    });

    // --- MOSTRAR RESULTADOS ---
    welcomeMessage.textContent = `¡Planificador optimizado para ${nombre}!`;
    motivationMessage.textContent = frases[Math.floor(Math.random() * frases.length)];
    resultSection.classList.remove('hidden');
});

// 3. EVENTO DE IMPRESIÓN
printBtn.addEventListener('click', function() {
    window.print();
});