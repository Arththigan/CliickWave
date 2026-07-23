// 3D Animated Scroll Website Engine - CliickWave
// Built using Three.js, GSAP ScrollTrigger, and Lenis Smooth Scroll

const initCliickWave3D = () => {
    // -------------------------------------------------------------
    // 1. Lenis Smooth Scroll Initialization
    // -------------------------------------------------------------
    let lenis;
    try {
        lenis = new Lenis({
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integration of Lenis scroll with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        
        gsap.ticker.lagSmoothing(0);
    } catch(e) {
        console.warn('Lenis smooth scroll not loaded, using default scroll.', e);
    }

    // Register GSAP ScrollTrigger Plugin
    gsap.registerPlugin(ScrollTrigger);

    // -------------------------------------------------------------
    // 2. Three.js Core Setup (Scene, Camera, Renderer)
    // -------------------------------------------------------------
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    
    // Add atmospheric background fog
    scene.fog = new THREE.FogExp2(0xFFFFFF, 0.04);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const maxPixelRatio = isMobile ? 1 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

    // Handle resizing window
    let resizeFrame = null;
    window.addEventListener('resize', () => {
        if (resizeFrame !== null) return;
        resizeFrame = requestAnimationFrame(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
            resizeFrame = null;
        });
    }, { passive: true });

    // -------------------------------------------------------------
    // 3. Lighting System
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85); // Reduced slightly to allow reflections to show
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0x00ffff, 3.2); // Brighter Cyan light for specular reflections
    directionalLight1.position.set(5, 5, 2);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xff00ff, 3.2); // Brighter Magenta light
    directionalLight2.position.set(-5, -5, 2);
    scene.add(directionalLight2);

    const pointLight = new THREE.PointLight(0x8A2BE2, 3, 15); // Light violet glow point
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // -------------------------------------------------------------
    // 4. Background Particle System (Starfield / Floating Sparks)
    // -------------------------------------------------------------
    const particlesCount = isMobile ? 320 : 750;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
        // Distribute in a spherical cloud around the scene
        const radius = 6 + Math.random() * 14;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        positions[i] = radius * Math.sin(phi) * Math.cos(theta); // x
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta); // y
        positions[i + 2] = radius * Math.cos(phi) - 2; // z

        // Colors: gradient mixture of deep purple, pink, cyan
        const mixColor = Math.random();
        if (mixColor < 0.33) {
            colors[i] = 0.41;   // R (6A14B0 tint)
            colors[i + 1] = 0.07; // G
            colors[i + 2] = 0.69; // B
        } else if (mixColor < 0.66) {
            colors[i] = 0.0;    // R (cyan tint)
            colors[i + 1] = 0.8;  // G
            colors[i + 2] = 0.8;  // B
        } else {
            colors[i] = 0.9;    // R (magenta tint)
            colors[i + 1] = 0.0;  // G
            colors[i + 2] = 0.7;  // B
        }
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom points material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);

    // -------------------------------------------------------------
    // 5. Morphing 3D Glass / Mesh (The Energy Cell)
    // -------------------------------------------------------------
    const meshGroup = new THREE.Group();

    // Keep the stone at one deterministic size. Scroll restoration after a
    // refresh must not leave it on one of the former oversized scale phases.
    const STONE_SCALE = 0.9;
    meshGroup.scale.setScalar(STONE_SCALE);

    // Central Faceted Mesh
    const mainGeometry = new THREE.IcosahedronGeometry(1.8, isMobile ? 2 : 3);
    const originalPositions = mainGeometry.attributes.position.clone();

    const mainMaterial = new THREE.MeshStandardMaterial({
        color: 0xE8D8FD, // Beautiful soft pastel lavender crystal base
        roughness: 0.1,  // Shiny, smooth surface reflections
        metalness: 0.2,  // Low metalness for glass-like refractions
        emissive: 0x6A14B0, // Deep purple emissive color for inner glow
        emissiveIntensity: 0.16, // Soft glowing aura from inside the crystal faces
        flatShading: true,
        transparent: true,
        opacity: 0.18,   // Base opacity increased slightly for better contrast
        side: THREE.DoubleSide
    });

    const centralMesh = new THREE.Mesh(mainGeometry, mainMaterial);
    meshGroup.add(centralMesh);

    // Glowing Wireframe Overlay
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff, // High-contrast glowing cyan wireframe lines
        wireframe: true,
        transparent: true,
        opacity: 0.18   // Increased wireframe visibility to define the crystal geometry
    });
    const wireframeMesh = new THREE.Mesh(mainGeometry, wireframeMaterial);
    wireframeMesh.scale.setScalar(1.002); // Slightly larger to sit on top cleanly
    meshGroup.add(wireframeMesh);

    // Outer Aura Ring (Faint glowing ring)
    const torusGeometry = new THREE.TorusGeometry(2.3, 0.03, 8, 80);
    const torusMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        transparent: true,
        opacity: 0.2,   // Restored slightly for definition
        wireframe: true
    });
    const auraRing = new THREE.Mesh(torusGeometry, torusMaterial);
    auraRing.rotation.x = Math.PI / 3;
    meshGroup.add(auraRing);

    scene.add(meshGroup);

    // Set initial position
    meshGroup.position.set(0, 0, 0);

    // -------------------------------------------------------------
    // 6. Interactive Mouse Responses
    // -------------------------------------------------------------
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', (e) => {
        // Normalize mouse coordinates (-1 to 1)
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Helper: Create a GSAP-compatible color tween for THREE.js materials
    // GSAP can't directly tween Three.js color hex values, so we tween RGB proxy objects
    const colorProxy = (material) => {
        return {
            r: material.color.r,
            g: material.color.g,
            b: material.color.b,
            update() {
                material.color.setRGB(this.r, this.g, this.b);
            }
        };
    };

    const mainColorProxy = colorProxy(mainMaterial);
    const wireColorProxy = colorProxy(wireframeMaterial);

    // Helper to convert hex to normalized RGB
    const hexToRgb = (hex) => {
        const c = new THREE.Color(hex);
        return { r: c.r, g: c.g, b: c.b };
    };

    // Create a continuous master scroll timeline tied to page scrolling progress
    const scrollTl = gsap.timeline({
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5 // Smooth catch up duration
        }
    });

    // --- Phase 1: Home to About ---
    scrollTl.to(meshGroup.position, { x: 1.6, y: -0.4, z: 0, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xEBE0FA), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(wireColorProxy, { ...hexToRgb(0xF8E2FC), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 0.25, z: Math.PI * 0.1, ease: "none" }, "<");

    // --- Phase 2: About to Services ---
    scrollTl.to(meshGroup.position, { x: -1.7, y: 0.2, z: -1, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xE0F7FA), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(wireColorProxy, { ...hexToRgb(0x00ffff), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 0.6, z: -Math.PI * 0.1, ease: "none" }, "<");

    // --- Phase 3: Services to Why Choose Us ---
    scrollTl.to(meshGroup.position, { x: 1.8, y: 0.3, z: 0, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xFCE4EC), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(wireColorProxy, { ...hexToRgb(0xFFEBEE), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 1.0, z: Math.PI * 0.25, ease: "none" }, "<");

    // --- Phase 4: Why Choose Us to Process Timeline ---
    scrollTl.to(meshGroup.position, { x: 0, y: -0.8, z: -2.5, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xF3E5F5), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(mainMaterial, { opacity: 0.22, ease: "power2.inOut" }, "<")
        .to(wireColorProxy, { ...hexToRgb(0xE8D8FD), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(wireframeMaterial, { opacity: 0.16, ease: "power2.inOut" }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 1.4, ease: "none" }, "<");

    // --- Phase 5: Process to Portfolio & Videos ---
    scrollTl.to(meshGroup.position, { x: -1.6, y: -0.2, z: 0, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xF5EEFC), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(mainMaterial, { opacity: 0.20, ease: "power2.inOut" }, "<")
        .to(wireColorProxy, { ...hexToRgb(0x8A2BE2), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(wireframeMaterial, { opacity: 0.14, ease: "power2.inOut" }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 1.8, z: 0, ease: "none" }, "<");

    // --- Phase 6: Portfolio to Testimonials & Pricing ---
    scrollTl.to(meshGroup.position, { x: 1.5, y: 0.4, z: -0.5, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xEDE7F6), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(mainMaterial, { opacity: 0.18, ease: "power2.inOut" }, "<")
        .to(wireColorProxy, { ...hexToRgb(0xF8E2FC), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(wireframeMaterial, { opacity: 0.12, ease: "power2.inOut" }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 2.2, z: -Math.PI * 0.1, ease: "none" }, "<");

    // --- Phase 7: Pricing to Blog & FAQ ---
    scrollTl.to(meshGroup.position, { x: -1.5, y: -0.3, z: -1, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xE0F2F1), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(wireColorProxy, { ...hexToRgb(0x00ffff), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 2.6, ease: "none" }, "<");

    // --- Phase 8: FAQ to Contact (Footer) ---
    scrollTl.to(meshGroup.position, { x: 0, y: 0.2, z: 0.5, ease: "power2.inOut" })
        .to(mainColorProxy, { ...hexToRgb(0xF5F0FF), ease: "power2.inOut", onUpdate: () => mainColorProxy.update() }, "<")
        .to(mainMaterial, { opacity: 0.22, ease: "power2.inOut" }, "<")
        .to(wireColorProxy, { ...hexToRgb(0x8A2BE2), ease: "power2.inOut", onUpdate: () => wireColorProxy.update() }, "<")
        .to(wireframeMaterial, { opacity: 0.16, ease: "power2.inOut" }, "<")
        .to(particleSystem.rotation, { y: Math.PI * 3.2, z: Math.PI * 0.2, ease: "none" }, "<");


    // -------------------------------------------------------------
    // 8. Original Scroll Reveals handled by IntersectionObserver in script.js
    // -------------------------------------------------------------

    // -------------------------------------------------------------
    // 9. Render Loop (Animation Loop)
    // -------------------------------------------------------------
    const clock = new THREE.Clock();

    let frameCount = 0;
    const geometryUpdateInterval = isMobile ? 3 : 2;

    const animate = () => {
        requestAnimationFrame(animate);

        // Avoid expensive WebGL and geometry work in background tabs.
        if (document.hidden) return;

        const time = clock.getElapsedTime();

        // Slow automatic rotations
        meshGroup.rotation.y = time * 0.08;
        meshGroup.rotation.x = time * 0.04;
        
        auraRing.rotation.z = -time * 0.15;
        
        // Gentle background star rotation
        particleSystem.rotation.x = time * 0.01;

        // Mouse smooth easing (lerp)
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Apply mouse movement to camera (subtle parallax tilt)
        camera.position.x = mouse.x * 0.8;
        camera.position.y = mouse.y * 0.8;
        camera.lookAt(0, 0, 0);

        // --- Geometric Morphing Logic ---
        // We deform the vertices of the icosahedron using a custom trigonometric wave field
        frameCount += 1;
        if (frameCount % geometryUpdateInterval === 0) {
            const positions = mainGeometry.attributes.position;

            for (let i = 0; i < positions.count; i++) {
            // Get original positions of vertices
            const ux = originalPositions.getX(i);
            const uy = originalPositions.getY(i);
            const uz = originalPositions.getZ(i);

            // Compute vector magnitude
            const length = Math.sqrt(ux*ux + uy*uy + uz*uz);
            
            // Build dynamic wave displacement based on space and time
            // We mix multiple frequencies to create a fluid, morphing texture
            const wave = Math.sin(ux * 1.5 + time * 1.2) * Math.cos(uy * 1.5 + time * 1.2) * 0.16 +
                         Math.sin(uz * 2.0 - time * 0.8) * Math.cos(ux * 1.0 + time * 0.6) * 0.12;

            // Offset the vertex slightly along its normal vector (outwards/inwards relative to origin)
            const ratio = 1 + wave;
                positions.setXYZ(i, ux * ratio, uy * ratio, uz * ratio);
            }

            // Update normals less often; this is the most expensive frame task.
            mainGeometry.computeVertexNormals();
            positions.needsUpdate = true;
        }

        renderer.render(scene, camera);
    };

    // Begin render frame loop
    if (prefersReducedMotion) {
        renderer.render(scene, camera);
    } else {
        animate();
    }
};

const scheduleCliickWave3D = () => {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initCliickWave3D, { timeout: 1000 });
    } else {
        setTimeout(initCliickWave3D, 100);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleCliickWave3D, { once: true });
} else {
    scheduleCliickWave3D();
}
