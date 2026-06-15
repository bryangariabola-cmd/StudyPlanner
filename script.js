// 1. SELECCIONAMOS LOS ELEMENTOS DEL HTML
// Aquí "conectamos" nuestro JS con las cajas de texto y botones que hicimos en HTML
const form = document.getElementById('plannerForm');
const studentNameInput = document.getElementById('studentName');
const subjectsInput = document.getElementById('subjects');
const hoursInput = document.getElementById('hoursPerDay');

const resultSection = document.getElementById('resultSection');
const welcomeMessage = document.getElementById('welcomeMessage');
const tableBody = document.getElementById('tableBody');
const motivationMessage = document.getElementById('motivationMessage');
const printBtn = document.getElementById('printBtn');

// Elementos para mostrar errores
const nameError = document.getElementById('nameError');
const subjectsError = document.getElementById('subjectsError');
const hoursError = document.getElementById('hoursError');

// Días de la semana que usaremos para la tabla
const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Pequeño catálogo de frases motivacionales
const frases = [
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día. ¡A darle con todo!",
    "La disciplina es el puente entre tus metas y tus logros.",
    "No te detengas hasta que te sientas orgulloso de tus proyectos.",
    "Un pequeño paso cada día construye grandes resultados."
];

// Función para limpiar los textos rojos de error
function limpiarErrores() {
    nameError.textContent = '';
    subjectsError.textContent = '';
    hoursError.textContent = '';
}

// 2. ¿QUÉ PASA CUANDO LE DAN CLIC AL BOTÓN "GENERAR"?
form.addEventListener('submit', function(event) {
    // Evitamos que la página se recargue automáticamente
    event.preventDefault();
    limpiarErrores();

    let hayErrores = false;

    // --- VALIDACIONES ---
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

    // Si detectamos un error, detenemos la máquina aquí mismo
    if (hayErrores) return;


    // --- PROCESAR LOS DATOS ---
    // Tomamos el texto "Mate, Español, Física", lo cortamos por las comas y lo hacemos una lista
    const materiasArray = materiasTexto.split(',').map(materia => materia.trim()).filter(materia => materia !== '');

    // Limpiamos la tabla por si el usuario está generando un segundo horario
    tableBody.innerHTML = ''; 

    // --- CONSTRUIR LA TABLA ---
    // Este ciclo se repetirá 5 veces (una por cada día de la semana)
    for (let i = 0; i < diasSemana.length; i++) {
        const tr = document.createElement('tr'); // Creamos una fila
        const tdDia = document.createElement('td'); // Celda del día
        const tdMateria = document.createElement('td'); // Celda de la materia
        const tdHoras = document.createElement('td'); // Celda de las horas

        tdDia.textContent = diasSemana[i];
        tdHoras.textContent = horas + ' hrs';

        // Lógica clave: Si aún hay materias en la lista, las ponemos. Si ya no hay, ponemos Repaso.
        if (i < materiasArray.length) {
            tdMateria.textContent = materiasArray[i];
        } else {
            tdMateria.textContent = 'Repaso General';
            // Le agregamos la clase CSS que pone la fila color azul clarito
            tr.classList.add('repaso-row'); 
        }

        // Metemos las celdas a la fila, y la fila a la tabla
        tr.appendChild(tdDia);
        tr.appendChild(tdMateria);
        tr.appendChild(tdHoras);
        tableBody.appendChild(tr);
    }

    // --- MOSTRAR LOS RESULTADOS ---
    // Personalizamos el título
    welcomeMessage.textContent = `¡Hola, ${nombre}! Aquí está tu plan de estudio:`;
    
    // Elegimos una frase motivacional al azar
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    motivationMessage.textContent = fraseAleatoria;

    // Hacemos aparecer la tabla quitándole la clase 'hidden' (oculto)
    resultSection.classList.remove('hidden');
});

// 3. ¿QUÉ PASA CUANDO LE DAN CLIC A IMPRIMIR?
printBtn.addEventListener('click', function() {
    window.print(); // Abre la ventana nativa de impresión de la Mac
});