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
