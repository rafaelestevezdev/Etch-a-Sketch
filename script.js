/**
 * Etch-a-Sketch - Aplicación de dibujo interactivo
 * 
 * Este script implementa una aplicación simple de dibujo tipo Etch-a-Sketch
 * que permite al usuario dibujar en una cuadrícula, cambiar el tamaño,
 * usar diferentes colores y limpiar el lienzo.
 * 
 * @author: Tu Nombre
 * @version: 1.0.0
 * @lastModified: 2025-04-06
 */

// Constantes de configuración
const DEFAULT_COLOR = 'black';
const DEFAULT_SIZE = 16;
const DEFAULT_MODE = 'color';

// IIFE (Immediately Invoked Function Expression) para encapsular el código y evitar la contaminación del ámbito global
(function() {
    'use strict'; // Habilita el modo estricto para mayor seguridad y mejor detección de errores
    
    // Estado de la aplicación - Mantiene todos los datos de estado en un solo objeto para facilitar el seguimiento
    const state = {
        currentColor: DEFAULT_COLOR,
        currentSize: DEFAULT_SIZE,
        currentMode: DEFAULT_MODE,
        isMouseDown: false
    };

    // Elementos del DOM - Cachea las referencias para mejorar el rendimiento
    const elements = {
        container: document.querySelector('.container'),
        clearBtn: document.querySelector('.clear-btn'),
        randomColorBtn: document.querySelector('.random-color'),
        blackColorBtn: document.querySelector('.black-color'),
        sizeValue: document.querySelector('.size-value'),
        sizeSlider: document.querySelector('#grid-size'),
        instructions: document.querySelector('.instructions')
    };

    /**
     * Inicializa la aplicación
     * Punto de entrada principal que configura todo lo necesario
     */
    function init() {
        // Verifica que todos los elementos del DOM estén presentes
        if (!validateElements()) {
            console.error('No se pudieron encontrar todos los elementos del DOM necesarios.');
            return;
        }
        
        createGrid(state.currentSize);
        setupEventListeners();
        
        // Establece el valor inicial del slider y el texto de tamaño
        elements.sizeSlider.value = state.currentSize;
        updateSizeDisplay(state.currentSize);
    }

    /**
     * Valida que todos los elementos del DOM necesarios estén disponibles
     * @returns {boolean} - Verdadero si todos los elementos están presentes
     */
    function validateElements() {
        for (const key in elements) {
            if (!elements[key]) {
                console.error(`Elemento ${key} no encontrado en el DOM`);
                return false;
            }
        }
        return true;
    }

    /**
     * Configura todos los event listeners
     */
    function setupEventListeners() {
        // Eventos para dibujo
        setupDrawingEvents();
        
        // Eventos para botones
        setupButtonEvents();
        
        // Eventos para el slider
        setupSliderEvents();
        
        // Eventos para prevenir comportamientos no deseados
        preventDefaultBehaviors();
    }

    /**
     * Configura los eventos relacionados con el dibujo
     */
    function setupDrawingEvents() {
        // Manejo de eventos para iniciar y detener el dibujo
        elements.container.addEventListener('mousedown', () => {
            state.isMouseDown = true;
        });

        elements.container.addEventListener('mouseup', () => {
            state.isMouseDown = false;
        });

        elements.container.addEventListener('mouseleave', () => {
            state.isMouseDown = false;
        });
        
        // Añadir soporte para dispositivos táctiles
        elements.container.addEventListener('touchstart', handleTouchStart, { passive: false });
        elements.container.addEventListener('touchmove', handleTouchMove, { passive: false });
        elements.container.addEventListener('touchend', () => {
            state.isMouseDown = false;
        });
    }
    
    /**
     * Maneja el evento de inicio de toque
     * @param {TouchEvent} e - El evento de toque
     */
    function handleTouchStart(e) {
        e.preventDefault(); // Previene el scroll en dispositivos táctiles
        state.isMouseDown = true;
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.classList.contains('cell')) {
            colorCell(target);
        }
    }
    
    /**
     * Maneja el evento de movimiento de toque
     * @param {TouchEvent} e - El evento de toque
     */
    function handleTouchMove(e) {
        e.preventDefault(); // Previene el scroll en dispositivos táctiles
        
        if (!state.isMouseDown) return;
        
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (target && target.classList.contains('cell')) {
            colorCell(target);
        }
    }

    /**
     * Configura los eventos para los botones
     */
    function setupButtonEvents() {
        // Cambiar el color actual a negro
        elements.blackColorBtn.addEventListener('click', () => {
            state.currentColor = DEFAULT_COLOR;
            elements.blackColorBtn.setAttribute('aria-pressed', 'true');
            elements.randomColorBtn.setAttribute('aria-pressed', 'false');
        });

        // Cambiar el color actual a uno aleatorio
        elements.randomColorBtn.addEventListener('click', () => {
            state.currentColor = getRandomColor();
            elements.blackColorBtn.setAttribute('aria-pressed', 'false');
            elements.randomColorBtn.setAttribute('aria-pressed', 'true');
        });

        // Función para limpiar la cuadrícula
        elements.clearBtn.addEventListener('click', clearGrid);
    }

    /**
     * Configura los eventos para el slider de tamaño
     */
    function setupSliderEvents() {
        elements.sizeSlider.addEventListener('input', (e) => {
            updateSizeDisplay(e.target.value);
        });

        elements.sizeSlider.addEventListener('change', (e) => {
            changeGridSize(parseInt(e.target.value));
        });
    }

    /**
     * Previene comportamientos predeterminados no deseados
     */
    function preventDefaultBehaviors() {
        elements.container.addEventListener('dragstart', (e) => {
            e.preventDefault();
        });

        elements.container.addEventListener('selectstart', (e) => {
            e.preventDefault();
        });
    }

    /**
     * Actualiza el texto que muestra el tamaño de la cuadrícula
     * @param {number} size - El tamaño de la cuadrícula
     */
    function updateSizeDisplay(size) {
        elements.sizeValue.textContent = `${size} x ${size}`;
        // Actualiza el atributo aria-valuenow para accesibilidad
        elements.sizeSlider.setAttribute('aria-valuenow', size);
    }

    /**
     * Crea una cuadrícula de tamaño específico
     * @param {number} size - El número de celdas por lado
     */
    function createGrid(size) {
        elements.container.innerHTML = '';

        // Aplica CSS Grid para crear la cuadrícula de manera más eficiente
        elements.container.style.display = 'grid';
        elements.container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        elements.container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        
        // Crea celdas individuales
        for (let i = 0; i < size * size; i++) {
            const cell = createCell();
            elements.container.appendChild(cell);
        }
    }

    /**
     * Crea una celda para la cuadrícula con sus eventos
     * @returns {HTMLDivElement} - El elemento de celda creado
     */
    function createCell() {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('role', 'presentation'); // Rol de presentación para accesibilidad
        
        // Estilos inline mínimos, el resto debe estar en CSS
        cell.style.border = '0.5px solid #ddd';
        
        // Colorear cuando se presiona directamente sobre una celda
        cell.addEventListener('mousedown', (event) => {
            state.isMouseDown = true;
            colorCell(event.target);
        });

        // Colorear al pasar por encima solo si el mouse está presionado
        cell.addEventListener('mouseover', (event) => {
            if (state.isMouseDown) {
                colorCell(event.target);
            }
        });

        return cell;
    }

    /**
     * Colorea una celda con el color actual
     * @param {HTMLElement} cell - La celda a colorear
     */
    function colorCell(cell) {
        switch (state.currentMode) {
            case 'color':
                cell.style.backgroundColor = state.currentColor;
                break;
            // Se pueden implementar otros modos de dibujo como "eraser", "shade", etc.
            default:
                cell.style.backgroundColor = state.currentColor;
        }
    }

    /**
     * Limpia toda la cuadrícula
     */
    function clearGrid() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.style.backgroundColor = '';
        });
    }

    /**
     * Genera un color RGB aleatorio
     * @returns {string} - Color en formato rgb()
     */
    function getRandomColor() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Cambia el tamaño de la cuadrícula
     * @param {number} newSize - El nuevo tamaño de la cuadrícula
     */
    function changeGridSize(newSize) {
        // Validación de entrada para mayor seguridad
        if (newSize < 1 || newSize > 100) {
            console.error('Tamaño de cuadrícula no válido:', newSize);
            return;
        }
        
        state.currentSize = newSize;
        updateSizeDisplay(newSize);
        createGrid(state.currentSize);
    }

    /**
     * Maneja errores inesperados en la aplicación
     * @param {Error} error - El error capturado
     */
    function handleError(error) {
        console.error('Se ha producido un error:', error);
        // Implementar lógica adicional para errores si es necesario
    }

    // Iniciar la aplicación dentro de un try-catch para capturar errores inesperados
    try {
        init();
    } catch (error) {
        handleError(error);
    }
})();