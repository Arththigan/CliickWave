document.addEventListener('DOMContentLoaded', () => {
    
    // Sticky Header Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('open');
            const isOpen = mobileMenu.classList.contains('open');
            
            // Toggle Phosphor Icon class
            if (isOpen) {
                menuIcon.className = 'ph ph-x';
            } else {
                menuIcon.className = 'ph ph-list';
            }
        });
        
        // Close menu on navigation link clicks
        const mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('open');
                menuIcon.className = 'ph ph-list';
            });
        });
        
        // Close menu on body click
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('open');
                menuIcon.className = 'ph ph-list';
            }
        });
    }

    // Number Counter Animation using IntersectionObserver
    const counters = document.querySelectorAll('.counter');
    
    const startCounting = (counter) => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace('+', '').replace('M', ''); // Clean text in case
            
            const speed = 100; // Lower is faster
            const inc = target / speed;

            if (count < target) {
                const nextVal = count + inc;
                if (nextVal >= target) {
                    counter.innerText = target;
                } else {
                    counter.innerText = Math.ceil(nextVal);
                    setTimeout(updateCount, 15);
                }
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                startCounting(counter);
                observer.unobserve(counter); // Trigger animation only once
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Testimonial Slider
    const slides = document.querySelectorAll('.testimonial-slide');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach(slide => slide.classList.remove('active'));
        slides[index].classList.add('active');
    };

    if (prevBtn && nextBtn && slides.length > 0) {
        nextBtn.addEventListener('click', () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        });

        prevBtn.addEventListener('click', () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        });
        
        // Auto slide every 8 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 8000);
    }

    // FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isOpen = item.classList.contains('active');
            
            // Close all open FAQs
            document.querySelectorAll('.faq-item').forEach(faqItem => {
                faqItem.classList.remove('active');
                faqItem.querySelector('.faq-answer').style.maxHeight = null;
            });
            
            // Toggle target FAQ
            if (!isOpen) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // Back to Top Button
    const backToTopBtn = document.getElementById('back-to-top-btn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Video Reel Showcase Modal
    const playVideoBtn = document.getElementById('play-video-btn');
    const videoModal = document.getElementById('video-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    if (playVideoBtn && videoModal && closeModalBtn) {
        playVideoBtn.addEventListener('click', () => {
            videoModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            const modalVideo = document.getElementById('modal-video');
            if (modalVideo) modalVideo.play();
        });

        const closeModal = () => {
            videoModal.classList.remove('open');
            document.body.style.overflow = '';
            const modalVideo = document.getElementById('modal-video');
            if (modalVideo) { modalVideo.pause(); modalVideo.currentTime = 0; }
        };

        closeModalBtn.addEventListener('click', closeModal);
        
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });
    }

    // Portfolio Tab Switching
    const tabBtns = document.querySelectorAll('.portfolio-tab-btn');
    const tabContents = document.querySelectorAll('.portfolio-tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById('tab-' + target).classList.add('active');

            // Re-process Instagram embeds when Posts tab is activated
            if (target === 'posts' && window.instgrm) {
                window.instgrm.Embeds.process();
            }
        });
    });

    // Simple Form Submission Handler (simulation)
    const contactForm = document.getElementById('project-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for reaching out! We will get in touch with you shortly.');
            contactForm.reset();
        });
    }

    // Scroll Reveal IntersectionObserver
    const revealElements = document.querySelectorAll(
        '.reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right, .reveal-zoom-in'
    );
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                // Remove 'revealed' when element scrolls out of view so it re-animates on next scroll
                entry.target.classList.remove('revealed');
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
});
