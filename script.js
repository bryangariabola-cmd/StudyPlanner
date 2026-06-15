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

// NUEVO: Algoritmo para calcular horas reales (reloj)
function sumarTiempo(horaBase, minutosSumar) {
    let [horas, minutos] = horaBase.split(':').map(Number);
    minutos += Math.round(minutosSumar);
    horas += Math.floor(minutos / 60);
    minutos = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

// 2. LÓGICA PRINCIPAL AL GENERAR EL HORARIO
form.addEventListener('submit', function(event) {
    event.preventDefault();
    limpiarErrores();
    let hayErrores = false;

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

    const horas = parseFloat(hoursInput.value);
    
    // NUEVO: MANEJO DE CONFLICTOS
    if (isNaN(horas) || horas <= 0) {
        hoursError.textContent = 'Ingresa un número válido de horas.';
        hayErrores = true;
    } else if (horas > 8) {
        hoursError.textContent = '¡Alerta de Conflicto! Estudiar más de 8 horas al día causa agotamiento. Reduce la carga.';
        hayErrores = true;
    }

    if (hayErrores) return;

    const materiasArray = materiasTexto.split(',').map(m => m.trim()).filter(m => m !== '');
    
    // NUEVO: MANEJO DE SUPERPOSICIONES EXTREMAS
    if (materiasArray.length > (horas * 5) * 2) {
        subjectsError.textContent = `¡Error de Superposición! Tienes demasiadas materias para tan poco tiempo.`;
        return;
    }

    const horarioSemanal = [[], [], [], [], []];
    let diaActual = 0;
    
    materiasArray.forEach(materia => {
        horarioSemanal[diaActual].push(materia);
        diaActual++;
        if (diaActual > 4) diaActual = 0;
    });

    tableBody.innerHTML = ''; 

    horarioSemanal.forEach((materiasDelDia, index) => {
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
            // NUEVO: LÓGICA DE TIEMPOS Y PAUSAS INTELIGENTES
            const minutosTotales = horas * 60;
            const cantidadPausas = materiasDelDia.length > 1 ? materiasDelDia.length - 1 : 0;
            const minutosPausaTotales = cantidadPausas * 15; // 15 min de descanso entre materias
            
            const minutosPorMateria = (minutosTotales - minutosPausaTotales) / materiasDelDia.length;
            
            let horaActual = "16:00"; // Simulamos que el estudio siempre empieza a las 4:00 PM
            let htmlMaterias = '';

            materiasDelDia.forEach((materia, i) => {
                let horaFin = sumarTiempo(horaActual, minutosPorMateria);
                htmlMaterias += `• <strong>${materia}</strong> <br><small style="color: #555;">⏱ ${horaActual} a ${horaFin}</small><br>`;
                
                // Si no es la última materia del día, mete una pausa
                if (i < materiasDelDia.length - 1) {
                    horaActual = sumarTiempo(horaFin, 15);
                    htmlMaterias += `<span style="color: #e67e22; font-size: 0.85em; display: block; margin: 4px 0;">☕ Pausa de 15 min (hasta ${horaActual})</span>`;
                }
            });

            tdMateria.innerHTML = htmlMaterias;
            const horasPuras = (minutosPorMateria / 60).toFixed(1);
            tdHoras.innerHTML = `<span style="color: var(--primary-color); font-weight: 600;">${horasPuras} hrs</span> netas<br><small>(Total con pausas: ${horas} hrs)</small>`;
        }

        tr.appendChild(tdDia);
        tr.appendChild(tdMateria);
        tr.appendChild(tdHoras);
        tableBody.appendChild(tr);
    });

    welcomeMessage.textContent = `¡Planificador optimizado para ${nombre}!`;
    motivationMessage.textContent = frases[Math.floor(Math.random() * frases.length)];
    resultSection.classList.remove('hidden');
});

printBtn.addEventListener('click', function() {
    window.print();
});