// js/main.js
class Zombietown {
    constructor() {
        this.WIDTH = 800;
        this.HEIGHT = 600;
        this.WORLD_SIZE = 64.0;
        this.WORLD_MIN = -this.WORLD_SIZE;
        this.WORLD_MAX = this.WORLD_SIZE;
        this.ZOMBIE_SPAWN_RADIUS = 6.0;
        this.ZOMBIE_BOUNDARY = 12.0;
        this.ZOMBIE_MIN = -this.ZOMBIE_BOUNDARY;
        this.ZOMBIE_MAX = this.ZOMBIE_BOUNDARY;

        this.zombies = [];
        this.score = 0;
        this.wave = 1;
        this.lastWaveTime = 0;
        this.zombiesKilled = 0;
        this.zombiesNeededForNextWave = 10;
        this.gameStarted = false;
        this.cameraAngleY = 0;

        this.clock = new THREE.Clock();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        // --- Setup Three.js ---
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.05);

        this.camera = new THREE.PerspectiveCamera(60, this.WIDTH / this.HEIGHT, 0.1, 200);
        this.camera.position.set(0, 10, 15); // Adjusted position
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        this.renderer.setClearColor(0x000000);

        // --- Lighting ---
        const ambientLight = new THREE.AmbientLight(0x606060);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 0.5).normalize();
        this.scene.add(directionalLight);

        // --- Create Platform ---
        this.createPlatform();

        // --- Setup UI ---
        this.guiScreen = new GUIScreen('menuCanvas');
        this.setupEventListeners();

        // --- Start Loop ---
        this.animate();
    }

    createPlatform() {
        // <-- Обновленный путь к текстуре травы
        const grassTexture = Textures.loadTexture('grass.png');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(
            (this.WORLD_MAX - this.WORLD_MIN) / 4,
            (this.WORLD_MAX - this.WORLD_MIN) / 4
        );

        const platformGeometry = new THREE.PlaneGeometry(
            this.WORLD_MAX - this.WORLD_MIN,
            this.WORLD_MAX - this.WORLD_MIN
        );
        const platformMaterial = new THREE.MeshBasicMaterial({
            map: grassTexture,
            side: THREE.DoubleSide // Make it visible from both sides
        });
        this.platform = new THREE.Mesh(platformGeometry, platformMaterial);
        this.platform.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        this.platform.position.y = 0;
        this.scene.add(this.platform);

        // Grid helper (optional, for visual reference)
        // const gridHelper = new THREE.GridHelper(this.WORLD_SIZE * 2, 10, 0x707070, 0x707070);
        // gridHelper.position.y = 0.01; // Slightly above the platform
        // this.scene.add(gridHelper);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize(), false);
        document.getElementById('gameCanvas').addEventListener('click', (event) => this.onCanvasClick(event), false);
        document.getElementById('menuCanvas').addEventListener('click', (event) => this.onMenuCanvasClick(event), false);
        document.getElementById('menuCanvas').addEventListener('mousemove', (event) => this.onMenuCanvasMouseMove(event), false);
    }

    onWindowResize() {
        this.camera.aspect = this.WIDTH / this.HEIGHT;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.WIDTH, this.HEIGHT);
        // Resize menu canvas if needed, though it's absolute positioned
        this.guiScreen.canvas.width = this.WIDTH;
        this.guiScreen.canvas.height = this.HEIGHT;
    }

    onCanvasClick(event) {
        if (!this.gameStarted) return;

        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / this.WIDTH) * 2 - 1;
        this.mouse.y = -(event.clientY / this.HEIGHT) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // See if the ray intersects any zombies
        const intersects = this.raycaster.intersectObjects(
            this.zombies.map(z => z.group).filter(g => g.parent === this.scene) // Only check visible zombies
        );

        if (intersects.length > 0) {
            // Find the corresponding Zombie object
            const clickedObject = intersects[0].object;
            // Traverse up to find the group (zombie root)
            let zombieGroup = clickedObject;
            while (zombieGroup && !(zombieGroup.userData && zombieGroup.userData.isZombie)) {
                zombieGroup = zombieGroup.parent;
            }
            if (zombieGroup) {
                const zombie = this.zombies.find(z => z.group === zombieGroup);
                if (zombie && !zombie.isDying) {
                    zombie.hit();
                }
            }
        }
    }

    // Menu interactions
    onMenuCanvasClick(event) {
        if (this.gameStarted) return;
        const rect = this.guiScreen.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (mouseX >= 350 && mouseX <= 450 && mouseY >= 300 && mouseY <= 340) {
            this.startGame();
        }
    }

    onMenuCanvasMouseMove(event) {
        if (this.gameStarted) return;
        const rect = this.guiScreen.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const isOver = mouseX >= 350 && mouseX <= 450 && mouseY >= 300 && mouseY <= 340;
        // Update menu rendering based on hover state
        // We'll trigger a redraw in the animate loop based on this state
        this.isMouseOverButton = isOver;
        this.guiScreen.canvas.classList.add('playable'); // Enable pointer events
    }

    startGame() {
        this.gameStarted = true;
        this.spawnInitialZombies();
        this.lastWaveTime = performance.now();
        this.guiScreen.canvas.classList.remove('playable'); // Disable pointer events when game starts
    }

    spawnInitialZombies() {
        const initialZombies = 64 + Math.floor(Math.random() * 37);
        for (let i = 0; i < initialZombies; i++) {
            this.spawnZombie();
        }
    }

    spawnZombie() {
        const angle = Math.random() * 2 * Math.PI;
        const radius = Math.random() * this.ZOMBIE_SPAWN_RADIUS;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const zombie = new Zombie(x, 0, z);
        // Mark the group for identification during picking
        zombie.group.userData = { isZombie: true };
        this.zombies.push(zombie);
    }

    update() {
        if (!this.gameStarted) return;

        const currentTime = performance.now();
        const delta = this.clock.getDelta();

        // Wave logic
        if (currentTime - this.lastWaveTime > 30000) {
            this.wave++;
            this.zombiesNeededForNextWave = 10 + (this.wave * 5);
            this.lastWaveTime = currentTime;
            const additionalZombies = 5 + (this.wave * 3);
            for (let i = 0; i < additionalZombies; i++) {
                this.spawnZombie();
            }
        }

        // Camera rotation
        this.cameraAngleY += 0.5 * delta; // Adjust speed as needed
        if (this.cameraAngleY >= 360.0) this.cameraAngleY = 0.0;
        // Apply camera rotation
        const radius = 15; // Distance from center
        this.camera.position.x = radius * Math.sin(this.cameraAngleY);
        this.camera.position.z = radius * Math.cos(this.cameraAngleY);
        this.camera.lookAt(0, 0, 0);

        // Update zombies
        for (let i = this.zombies.length - 1; i >= 0; i--) {
            const zombie = this.zombies[i];
            zombie.tick();

            if (!zombie.isDying) {
                const baseSpeed = 0.03;
                const speed = baseSpeed + (this.wave * 0.005);
                const moveX = Math.sin(zombie.rot) * speed;
                const moveZ = Math.cos(zombie.rot) * speed;
                zombie.x += moveX;
                zombie.z += moveZ;

                // Boundary check
                if (zombie.x < this.ZOMBIE_MIN) { zombie.x = this.ZOMBIE_MIN; zombie.rot = Math.random() * Math.PI * 2; }
                if (zombie.x > this.ZOMBIE_MAX) { zombie.x = this.ZOMBIE_MAX; zombie.rot = Math.random() * Math.PI * 2; }
                if (zombie.z < this.ZOMBIE_MIN) { zombie.z = this.ZOMBIE_MIN; zombie.rot = Math.random() * Math.PI * 2; }
                if (zombie.z > this.ZOMBIE_MAX) { zombie.z = this.ZOMBIE_MAX; zombie.rot = Math.random() * Math.PI * 2; }
            }

            if (zombie.isDead()) {
                // Remove from scene and array
                if (zombie.group.parent === this.scene) {
                    this.scene.remove(zombie.group);
                }
                this.zombies.splice(i, 1);
                this.score += 10 * this.wave;
                this.zombiesKilled++;

                if (this.zombiesKilled >= this.zombiesNeededForNextWave) {
                    this.wave++;
                    this.zombiesKilled = 0;
                    this.zombiesNeededForNextWave = 10 + (this.wave * 5);
                    this.lastWaveTime = currentTime;
                    const additionalZombies = 5 + (this.wave * 3);
                    for (let j = 0; j < additionalZombies; j++) {
                        this.spawnZombie();
                    }
                }
            }
        }
    }

    render(alpha) { // alpha for interpolation
        if (this.gameStarted) {
            // Render 3D scene
            this.renderer.render(this.scene, this.camera);

            // Update and render zombies with interpolation
            for (const zombie of this.zombies) {
                // Store previous positions for interpolation
                zombie.xo = zombie.x;
                zombie.yo = zombie.y;
                zombie.zo = zombie.z;
                
                zombie.render(this.scene, this.clock.getDelta(), alpha);
            }

            // Render GUI (score, wave, etc.)
            this.guiScreen.render(this.score, this.wave, this.zombies.length);
        } else {
            // Render menu
            this.guiScreen.renderMenu(this.isMouseOverButton);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        const currentTime = performance.now();
        
        // Simple game loop integration
        this.update();

        // For smoother animation, you might want to separate update and render logic
        // and use a fixed timestep for updates. Here's a basic approach:
        this.render(1.0); // Pass alpha=1.0 for no interpolation in this simple version
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Zombietown();
});