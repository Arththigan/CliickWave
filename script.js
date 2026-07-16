document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // 3D Hero Particle Wave (Three.js)
    // =========================================
    let scene, camera, renderer, particleWave, particleMaterial;
    let heroMouse = { x: 0, y: 0 };
    let heroScrollY = 0;

    function initHero3D() {
        const canvas = document.getElementById('hero-3d-canvas');
        if (!canvas || typeof THREE === 'undefined') return;

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0xffffff, 30, 120);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 200);
        camera.position.set(0, 18, 45);
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particle wave geometry
        const cols = 80, rows = 80;
        const spacing = 1.2;
        const geometry = new THREE.PlaneGeometry(
            cols * spacing, rows * spacing, cols, rows
        );

        // Custom shader material for premium gradient particles
        particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColorA: { value: new THREE.Color(0x480A79) },
                uColorB: { value: new THREE.Color(0x6A14B0) },
            },
            vertexShader: `
                uniform float uTime;
                varying float vElevation;
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float wave1 = sin(pos.x * 0.15 + uTime * 0.8) * cos(pos.y * 0.15 + uTime * 0.6) * 2.5;
                    float wave2 = sin(pos.x * 0.08 - uTime * 0.4) * 1.5;
                    pos.z += wave1 + wave2;
                    vElevation = pos.z;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColorA;
                uniform vec3 uColorB;
                varying float vElevation;
                varying vec2 vUv;
                void main() {
                    float mixVal = (vElevation + 4.0) / 8.0;
                    vec3 color = mix(uColorA, uColorB, clamp(mixVal, 0.0, 1.0));
                    float dist = length(vUv - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    gl_FragColor = vec4(color, alpha * 0.9);
                }
            `,
            transparent: true,
            wireframe: true,
        });

        particleWave = new THREE.Mesh(geometry, particleMaterial);
        particleWave.rotation.x = -Math.PI / 2.5;
        scene.add(particleWave);

        // Add floating geometric shapes
        const shapes = [];
        for (let i = 0; i < 8; i++) {
            const shapeType = Math.floor(Math.random() * 3);
            let geom;
            if (shapeType === 0) geom = new THREE.IcosahedronGeometry(0.8, 0);
            else if (shapeType === 1) geom = new THREE.OctahedronGeometry(0.8, 0);
            else geom = new THREE.TetrahedronGeometry(0.9, 0);

            const mat = new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? 0x480A79 : 0x6A14B0,
                flatShading: true,
                transparent: true,
                opacity: 0.4,
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(
                (Math.random() - 0.5) * 60,
                Math.random() * 15 + 5,
                (Math.random() - 0.5) * 40 - 10
            );
            mesh.userData = {
                rotSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02, z: Math.random() * 0.01 },
                floatOffset: Math.random() * Math.PI * 2,
                floatSpeed: 0.5 + Math.random() * 0.5,
                baseY: mesh.position.y,
            };
            scene.add(mesh);
            shapes.push(mesh);
        }

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambient);
        const dirLight = new THREE.DirectionalLight(0x6A14B0, 0.8);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            heroMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            heroMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('scroll', () => {
            heroScrollY = window.scrollY;
        });

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            particleMaterial.uniforms.uTime.value = t;

            // Gentle camera parallax based on mouse
            camera.position.x += (heroMouse.x * 5 - camera.position.x) * 0.03;
            camera.position.y += (18 + heroMouse.y * 3 - heroScrollY * 0.02 - camera.position.y) * 0.03;
            camera.lookAt(0, 0, 0);

            // Animate floating shapes
            scene.children.forEach(child => {
                if (child.userData && child.userData.rotSpeed) {
                    child.rotation.x += child.userData.rotSpeed.x;
                    child.rotation.y += child.userData.rotSpeed.y;
                    child.rotation.z += child.userData.rotSpeed.z;
                    child.position.y = child.userData.baseY + Math.sin(t * child.userData.floatSpeed + child.userData.floatOffset) * 2;
                }
            });

            renderer.render(scene, camera);
        }
        animate();
    }

    initHero3D();

    // =========================================
    // 3D Mouse-Tracking Card Tilt
    // =========================================
    function init3DCardTilt() {
        const cards = document.querySelectorAll(
            '.service-card, .portfolio-item, .team-card, .pricing-card, .blog-card'
        );

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rotateX = ((y - cy) / cy) * -8;
                const rotateY = ((x - cx) / cx) * 8;
                card.style.transform = `translateY(-8px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    init3DCardTilt();

    // =========================================
    // 3D Scroll Parallax
    // =========================================
    function init3DScrollParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
                el.style.transform = `translateZ(${speed * scrollY * 0.1}px)`;
            });
        }, { passive: true });
    }

    init3DScrollParallax();

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
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });

        const closeModal = () => {
            videoModal.classList.remove('open');
            document.body.style.overflow = ''; // Restore scrolling
        };

        closeModalBtn.addEventListener('click', closeModal);
        
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeModal();
            }
        });
    }

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
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Reveal only once
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
