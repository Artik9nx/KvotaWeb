// js/Zombie.js
class Zombie {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.xo = x;
        this.yo = y;
        this.zo = z;

        this.rot = Math.random() * Math.PI * 2;
        this.timeOffs = Math.random() * 1239813.0;
        this.speed = 1.0;
        this.rotA = (Math.random() + 1.0) * 0.01;

        this.isDying = false;
        this.deathTimer = 0.0;
        this.fallSpeed = 0.0;
        this.deathRotX = 0.0;
        this.deathRotZ = 0.0;
        this.deathRotSpeedX = (Math.random() - 0.5) * 10.0;
        this.deathRotSpeedZ = (Math.random() - 0.5) * 10.0;

        this.group = new THREE.Group();

        // <-- Обновленный путь к текстуре
        const charTexture = Textures.loadTexture('char.png');

        // Create body parts using BoxGeometry and MeshBasicMaterial
        // Note: Coordinates and sizes are adjusted for Three.js and a typical scale
        const sizeFactor = 0.06; // Overall scale factor

        // Head
        const headGeometry = new THREE.BoxGeometry(8 * sizeFactor, 8 * sizeFactor, 8 * sizeFactor);
        const headMaterial = new THREE.MeshBasicMaterial({ map: charTexture, color: 0xffffff });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 14 * sizeFactor, 0); // Adjusted Y position
        this.group.add(this.head);

        // Body
        const bodyGeometry = new THREE.BoxGeometry(8 * sizeFactor, 12 * sizeFactor, 4 * sizeFactor);
        const bodyMaterial = new THREE.MeshBasicMaterial({ map: charTexture, color: 0xffffff });
        this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.body.position.set(0, 6 * sizeFactor, 0);
        this.group.add(this.body);

        // Arm0 (Left)
        const armGeometry = new THREE.BoxGeometry(4 * sizeFactor, 12 * sizeFactor, 4 * sizeFactor);
        const armMaterial = new THREE.MeshBasicMaterial({ map: charTexture, color: 0xffffff });
        this.arm0 = new THREE.Mesh(armGeometry, armMaterial);
        this.arm0.position.set(-6 * sizeFactor, 8 * sizeFactor, 0);
        this.group.add(this.arm0);

        // Arm1 (Right)
        this.arm1 = new THREE.Mesh(armGeometry, armMaterial);
        this.arm1.position.set(6 * sizeFactor, 8 * sizeFactor, 0);
        this.group.add(this.arm1);

        // Leg0 (Left)
        const legGeometry = new THREE.BoxGeometry(4 * sizeFactor, 12 * sizeFactor, 4 * sizeFactor);
        const legMaterial = new THREE.MeshBasicMaterial({ map: charTexture, color: 0xffffff });
        this.leg0 = new THREE.Mesh(legGeometry, legMaterial);
        this.leg0.position.set(-2 * sizeFactor, 0, 0);
        this.group.add(this.leg0);

        // Leg1 (Right)
        this.leg1 = new THREE.Mesh(legGeometry, legMaterial);
        this.leg1.position.set(2 * sizeFactor, 0, 0);
        this.group.add(this.leg1);

        // Initial position of the zombie group
        this.group.position.set(this.x, this.y, this.z);
    }

    tick() {
        this.rot += this.rotA;
        this.rotA *= 0.99;
        this.rotA += (Math.random() - Math.random()) * Math.random() * Math.random() * 0.01;

        if (this.isDying) {
            this.fallSpeed += 0.01; // Adjusted fall speed
            this.y -= this.fallSpeed;
            this.deathTimer += 0.016; // Approximate for 60fps
            this.deathRotX += this.deathRotSpeedX * 0.016;
            this.deathRotZ += this.deathRotSpeedZ * 0.016;
            
            // Apply death rotation and position
            this.group.rotation.x = this.deathRotX;
            this.group.rotation.z = this.deathRotZ;
            this.group.position.y = this.y;
        }
    }

    hit() {
        if (!this.isDying) {
            this.isDying = true;
            this.deathTimer = 0.0;
            this.fallSpeed = 0.0;
            // Death rotation speeds are set in constructor
        }
    }

    isDead() {
        return this.isDying && this.deathTimer >= 3.0;
    }

    render(scene, delta, alpha) {
        // Interpolation for smooth animation (simplified)
        const interpX = this.xo + (this.x - this.xo) * alpha;
        const interpY = this.yo + (this.y - this.yo) * alpha;
        const interpZ = this.zo + (this.z - this.zo) * alpha;

        this.group.position.set(interpX, interpY, interpZ);

        if (!this.isDying) {
            const time = performance.now() / 1000 * 10 * this.speed + this.timeOffs;

            // Animate parts (simplified compared to original trigonometry)
            this.head.rotation.y = Math.sin(time * 0.83) * 1.0;
            this.head.rotation.x = Math.sin(time) * 0.8;

            this.arm0.rotation.x = Math.sin(time * 0.6662 + Math.PI) * 2.0;
            this.arm0.rotation.z = (Math.sin(time * 0.2312) + 1.0) * 1.0;

            this.arm1.rotation.x = Math.sin(time * 0.6662) * 2.0;
            this.arm1.rotation.z = (Math.sin(time * 0.2812) - 1.0) * 1.0;

            this.leg0.rotation.x = Math.sin(time * 0.6662) * 1.4;
            this.leg1.rotation.x = Math.sin(time * 0.6662 + Math.PI) * 1.4;

            this.group.rotation.y = this.rot;
            
            // Reset death rotations if not dying
            this.group.rotation.x = 0;
            this.group.rotation.z = 0;
        } // If dying, rotations are handled in tick()

        // Add to scene if not already added
        if (this.group.parent !== scene) {
             scene.add(this.group);
        }
        
        // Update material color based on state
        const color = this.isDying ? 0xffb3b3 : 0xffffff; // Light red when dying
        this.head.material.color.setHex(color);
        this.body.material.color.setHex(color);
        this.arm0.material.color.setHex(color);
        this.arm1.material.color.setHex(color);
        this.leg0.material.color.setHex(color);
        this.leg1.material.color.setHex(color);
    }
}