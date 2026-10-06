// PDF.js Logic
const url = 'NADO_트레이딩_시스템.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 2.0, // High res for sharp rendering
      canvas = document.querySelector('#pdf-render'),
      ctx = canvas ? canvas.getContext('2d') : null;

if (canvas) {
    // Configure worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // Render the page
    const renderPage = num => {
        pageIsRendering = true;

        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderCtx = {
                canvasContext: ctx,
                viewport
            };

            page.render(renderCtx).promise.then(() => {
                pageIsRendering = false;

                if (pageNumIsPending !== null) {
                    renderPage(pageNumIsPending);
                    pageNumIsPending = null;
                }
            });

            document.querySelector('#page-num').textContent = num;
        });
    };

    const queueRenderPage = num => {
        if (pageIsRendering) {
            pageNumIsPending = num;
        } else {
            renderPage(num);
        }
    };

    const showPrevPage = () => {
        if (pageNum <= 1) {
            pageNum = pdfDoc.numPages; // Loop to end
        } else {
            pageNum--;
        }
        queueRenderPage(pageNum);
    };

    const showNextPage = () => {
        if (pageNum >= pdfDoc.numPages) {
            pageNum = 1; // Loop to start
        } else {
            pageNum++;
        }
        queueRenderPage(pageNum);
    };

    // Load PDF
    pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        document.querySelector('#page-count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    }).catch(err => {
        console.error("PDF load error:", err);
    });

    // Button Events
    document.querySelector('#prev-page').addEventListener('click', showPrevPage);
    document.querySelector('#next-page').addEventListener('click', showNextPage);
    
    // Side Arrow Events
    const prevArrow = document.querySelector('#prev-page-arrow');
    const nextArrow = document.querySelector('#next-page-arrow');
    if (prevArrow) prevArrow.addEventListener('click', showPrevPage);
    if (nextArrow) nextArrow.addEventListener('click', showNextPage);

    // Swipe Gestures for Mobile/Tablet
    let touchStartX = 0;
    let touchEndX = 0;
    
    const canvasContainer = document.querySelector('.canvas-container');
    
    if (canvasContainer) {
        canvasContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        canvasContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const threshold = 50; // minimum distance to be considered a swipe
        if (touchEndX + threshold < touchStartX) {
            // Swiped Left -> Next Page
            showNextPage();
        } else if (touchEndX > touchStartX + threshold) {
            // Swiped Right -> Prev Page
            showPrevPage();
        }
    }
}

// Fullscreen Logic
function openFullscreen() {
    const container = document.getElementById("pdf-viewer-container");
    if (!container) return;
    
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) { /* Safari */
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) { /* IE11 */
        container.msRequestFullscreen();
    }
}

// Theme Toggle Logic
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    
    // Update button icon
    const themeBtn = document.getElementById('btn-theme');
    if (newTheme === 'light') {
        themeBtn.textContent = '🌙';
        themeBtn.setAttribute('title', '다크 모드로 보기');
    } else {
        themeBtn.textContent = '☀️';
        themeBtn.setAttribute('title', '라이트 모드로 보기');
    }
    
    // Save preference to localStorage (optional but good practice)
    localStorage.setItem('nado-theme', newTheme);
}

// Font Size Logic
function setFontSize(size) {
    document.documentElement.setAttribute('data-font-size', size);
    
    // Update active button state
    document.querySelectorAll('.font-size-group button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-font-${size}`).classList.add('active');
    
    // Save preference to localStorage
    localStorage.setItem('nado-fontsize', size);
}

document.addEventListener("DOMContentLoaded", () => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('nado-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const themeBtn = document.getElementById('btn-theme');
        themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    }
    
    const savedFontSize = localStorage.getItem('nado-fontsize');
    if (savedFontSize) {
        setFontSize(savedFontSize);
    }

    // Add smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial styles for animation targets
    const animatedElements = document.querySelectorAll('.feature-card, .logic-step, .profit-list li');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
