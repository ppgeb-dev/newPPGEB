// JavaScript para a página de Disciplinas
document.addEventListener('DOMContentLoaded', function () {
    
    // Animações de entrada para os cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observar todos os cards de disciplina
    document.querySelectorAll('.disciplina-category').forEach(el => {
        observer.observe(el);
    });

  
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerHeight - 20;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });





    // Adiciona classe para animações CSS
    setTimeout(() => {
        document.querySelectorAll('.disciplina-category').forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('animate-in');
            }, index * 100);
        });
    }, 100);


});