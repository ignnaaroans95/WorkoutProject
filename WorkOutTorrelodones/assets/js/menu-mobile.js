document.addEventListener("DOMContentLoaded", () => {
    // Seleccionar elementos principales
    let mobile_btn = document.querySelector(".navbar__mobile-btn");
    let mobile_menu = document.querySelector(".menu-mobile");

    mobile_btn.addEventListener("click", () => {
        let show = document.querySelector(".menu-mobile--show"); // 🔹 Se corrigió la selección de clase

        if (show) {
            mobile_menu.classList.remove("menu-mobile--show");
        } else {
            mobile_menu.classList.add("menu-mobile--show");
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");
    const serviceContent = document.querySelector(".service__content"); // Elemento que contiene los servicios

    // Función para abrir el modal
    function openModal(element) {
        const title = element.querySelector("span").innerText;
        const description = element.getAttribute("data-info");

        document.getElementById("modal-title").innerText = title;
        document.getElementById("modal-description").innerText = description;

        modal.style.display = "flex"; // Necesario para mostrar el modal
        setTimeout(() => {
            modal.classList.add("show");
        }, 10);
    }

    // Función para cerrar el modal
    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none"; // Lo ocultamos después de la animación
        }, 300); // Esperamos a que termine la animación
    }

    // Solo cerrar el modal si el clic es fuera del modal y no dentro de service__content
    window.addEventListener("click", (event) => {
        if (!modalContent.contains(event.target) && !serviceContent.contains(event.target)) {
            closeModal(); // Cerrar modal solo si clic fuera del modal y fuera del servicio
        }
    });

    // Exponer funciones globalmente
    window.openModal = openModal;
    window.closeModal = closeModal;
});

// Initialize Swiper 

var swiper = new Swiper(".mySwiper", {
    effect: "flip",
    grabCursor: true,
    pagination: {
        el: ".swiper-pagination",
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

// Js mENU 
document.addEventListener("DOMContentLoaded", function () {
    const menu = document.querySelector(".layout__menu");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            menu.classList.add("scrolled");
        } else {
            menu.classList.remove("scrolled");
        }
    });
});


document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const canvas = document.getElementById('particles-canvas');
    const container = document.getElementById('particles-container');
    const loadingMessage = document.getElementById('loading-message');

    // Si no se encuentra el canvas, salir
    if (!canvas || !container) return;

    // Configuración
    const config = {
        logoUrl: "../assets/img/ciclista.png", // Correct syntax for the logo URL
        particleColor: '#FDFDFD',
        scatteredColor: '#00D2FF', // Color azul turquesa
        secondaryScatteredColor: '#B6FF00', // Color verde lima
        backgroundColor: 'transparent' // Fondo transparente
    };


    // Variables globales
    let ctx;
    let logoImage = new Image();
    let particles = [];
    let textImageData = null;
    let isCanvasReady = false;
    let animationFrameId = null;
    let isResizing = false;
    let isMobile = false;
    let mousePosition = { x: 0, y: 0 };
    let isTouching = false;

    // Inicializar
    function init() {
        ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Cargar la imagen del logo
        logoImage.crossOrigin = "anonymous";
        logoImage.onload = function () {
            loadingMessage.classList.add('hidden');
            isCanvasReady = true;
            updateCanvasSize();
            createLogoImage();
            createInitialParticles();
            animate();
        };

        logoImage.onerror = function (e) {
            console.error("Error loading logo image:", e);
        };

        logoImage.src = config.logoUrl;

        // Event listeners
        window.addEventListener('resize', handleResize);

        // Solo añadir event listeners de mouse/touch al canvas si queremos interacción
        // Como el canvas tiene pointer-events: none, estos eventos no se activarán
        // Si quieres interacción, cambia pointer-events a 'auto' en el CSS
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchend', handleTouchEnd);
    }

    // Actualizar dimensiones del canvas
    function updateCanvasSize() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        if (containerWidth <= 0 || containerHeight <= 0) {
            console.log("Container has invalid dimensions:", containerWidth, containerHeight);
            return false;
        }

        canvas.width = containerWidth;
        canvas.height = containerHeight;
        isMobile = window.innerWidth < 768;

        return true;
    }

    // Crear la imagen del logo en el canvas
    function createLogoImage() {
        if (!ctx || !canvas || !logoImage) return false;

        // Verificar que el canvas tenga dimensiones válidas
        if (canvas.width <= 0 || canvas.height <= 0) {
            console.log("Canvas has invalid dimensions:", canvas.width, canvas.height);
            return false;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Verificar que la imagen tenga dimensiones válidas
        if (logoImage.width <= 0 || logoImage.height <= 0) {
            console.log("Logo image has invalid dimensions:", logoImage.width, logoImage.height);
            return false;
        }

        const logoAspectRatio = logoImage.width / logoImage.height;

        // Ajustar el tamaño del logo según el tamaño del banner
        const maxLogoHeight = isMobile ? 100 : 150;
        const logoHeight = Math.min(maxLogoHeight, canvas.height * 0.4);
        const logoWidth = logoHeight * logoAspectRatio;

        // Centrar el logo en el canvas
        const x = Math.floor((canvas.width - logoWidth) / 2);
        const y = Math.floor((canvas.height - logoHeight) / 2);

        // Dibujar la imagen en el canvas
        ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);

        try {
            // Obtener los datos de la imagen
            textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return true;
        } catch (error) {
            console.error("Error getting image data:", error);
            return false;
        }
    }

    // Crear una partícula
    function createParticle() {
        if (!ctx || !canvas || !textImageData) return null;

        const data = textImageData.data;

        for (let attempt = 0; attempt < 100; attempt++) {
            const x = Math.floor(Math.random() * canvas.width);
            const y = Math.floor(Math.random() * canvas.height);

            // Verificar que las coordenadas sean válidas
            if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

            const index = (y * canvas.width + x) * 4;
            if (index >= 0 && index < data.length && data[index + 3] > 128) {
                // Determinar si la partícula está en la mitad izquierda o derecha del canvas
                const isLeftSide = x < canvas.width / 2;

                return {
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 1.5 + 0.5,
                    color: config.particleColor,
                    scatteredColor: isLeftSide ? config.secondaryScatteredColor : config.scatteredColor,
                    life: Math.random() * 100 + 50,
                    isLeftSide: isLeftSide
                };
            }
        }

        return null;
    }

    // Crear las partículas iniciales
    function createInitialParticles() {
        particles = []; // Limpiar partículas existentes

        // Reducir el número de partículas para mejor rendimiento en el banner
        const baseParticleCount = 3000;
        const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)));

        for (let i = 0; i < particleCount; i++) {
            const particle = createParticle();
            if (particle) particles.push(particle);
        }
    }

    // Animar las partículas
    function animate() {
        if (!ctx || !canvas || !isCanvasReady) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // No dibujamos el fondo para que sea transparente
        // Si quieres un fondo semi-transparente, puedes hacer:
        // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        const mouseX = mousePosition.x;
        const mouseY = mousePosition.y;
        const maxDistance = 240;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < maxDistance && (isTouching || !('ontouchstart' in window))) {
                const force = (maxDistance - distance) / maxDistance;
                const angle = Math.atan2(dy, dx);
                const moveX = Math.cos(angle) * force * 60;
                const moveY = Math.sin(angle) * force * 60;
                p.x = p.baseX - moveX;
                p.y = p.baseY - moveY;

                ctx.fillStyle = p.scatteredColor;
            } else {
                p.x += (p.baseX - p.x) * 0.1;
                p.y += (p.baseY - p.y) * 0.1;
                ctx.fillStyle = p.color;
            }

            ctx.fillRect(p.x, p.y, p.size, p.size);

            p.life--;
            if (p.life <= 0) {
                const newParticle = createParticle();
                if (newParticle) {
                    particles[i] = newParticle;
                } else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }

        // Mantener un número constante de partículas
        const baseParticleCount = 3000;
        const targetParticleCount = Math.floor(
            baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080))
        );

        let attempts = 0;
        while (particles.length < targetParticleCount && attempts < 100) {
            const newParticle = createParticle();
            if (newParticle) particles.push(newParticle);
            attempts++;
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Event handlers
    function handleResize() {
        if (isResizing) return;

        isResizing = true;

        // Usar un debounce para evitar múltiples inicializaciones durante el redimensionamiento
        setTimeout(() => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            updateCanvasSize();
            createLogoImage();
            createInitialParticles();
            animate();

            isResizing = false;
        }, 200);
    }

    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mousePosition.x = e.clientX - rect.left;
        mousePosition.y = e.clientY - rect.top;
    }

    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mousePosition.x = e.touches[0].clientX - rect.left;
            mousePosition.y = e.touches[0].clientY - rect.top;
        }
    }

    function handleTouchStart() {
        isTouching = true;
    }

    function handleTouchEnd() {
        isTouching = false;
        mousePosition.x = 0;
        mousePosition.y = 0;
    }

    function handleMouseLeave() {
        if (!('ontouchstart' in window)) {
            mousePosition.x = 0;
            mousePosition.y = 0;
        }
    }

    // Iniciar
    init();
});


function toggleChatbot() {
    document.getElementById("chatbox").classList.toggle("hidden");
}

async function sendMessage() {
    const input = document.getElementById("chatbox-input");
    const msg = input.value.trim();
    if (!msg) return;

    const messages = document.getElementById("chatbox-messages");
    messages.innerHTML += `<div><strong>Tú:</strong> ${msg}</div>`;

    try {
        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();
        messages.innerHTML += `<div><strong>CoachBot:</strong> ${data.reply || '⚠️ Respuesta vacía'}</div>`;
    } catch (err) {
        console.error("Error de red:", err);
        messages.innerHTML += `<div><strong>CoachBot:</strong> ⚠️ Error al contactar con el servidor.</div>`;
    }

    input.value = "";
    messages.scrollTop = messages.scrollHeight;
}

function openLoginModal() {
  document.getElementById("login-modal").classList.remove("hidden");
  document.body.classList.add("blur-background");
}

function closeLoginModal() {
  document.getElementById("login-modal").classList.add("hidden");
  document.body.classList.remove("blur-background");
}











