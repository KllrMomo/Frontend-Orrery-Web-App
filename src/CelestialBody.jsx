import * as THREE from 'three';

class CelestialBody {
    constructor(scene,
                id,
                size,
                color,
                position = { x: 0, y: 0, z: 0 },
                segments = 32, // Default value for segments
                rings = 32, // Default value for rings
                texture = null,
                bumpMap = null,
                normalMap = null,
                materialType = 'standard') { // Default material type
        this.id = id;
        this.scene = scene;
        this.size = size;
        this.segments = segments;
        this.rings = rings;
        this.color = color;
        this.position = position;
        this.texture = texture;
        this.bumpMap = bumpMap;
        this.normalMap = normalMap;
        this.materialType = materialType;

        this.geometry = null;
        this.material = null;
        this.mesh = null;

        // Automatically call create to initialize the celestial body
        this.create();
    }

    // Method to create the celestial body
    create() {
        // Create geometry
        this.geometry = new THREE.SphereGeometry(this.size, this.segments, this.rings);

        // Create material options
        const materialOptions = { color: this.color };

        // Load texture, bumpMap, and normalMap if provided
        if (this.texture) {
            materialOptions.map = new THREE.TextureLoader().load(this.texture,
                undefined,
                undefined,
                (error) => console.error("Failed to load texture:", error)
            );
        }

        if (this.bumpMap) {
            materialOptions.bumpMap = new THREE.TextureLoader().load(this.bumpMap,
                undefined,
                undefined,
                (error) => console.error("Failed to load bump map:", error)
            );
        }

        if (this.normalMap) {
            materialOptions.normalMap = new THREE.TextureLoader().load(this.normalMap,
                undefined,
                undefined,
                (error) => console.error("Failed to load normal map:", error)
            );
        }

        // Select material type
        switch (this.materialType) {
            case 'basic':
                this.material = new THREE.MeshBasicMaterial(materialOptions);
                break;
            case 'lambert':
                this.material = new THREE.MeshLambertMaterial(materialOptions);
                break;
            case 'phong':
                this.material = new THREE.MeshPhongMaterial(materialOptions);
                break;
            case 'standard':
            default:
                this.material = new THREE.MeshStandardMaterial(materialOptions);
                break;
        }

        // Create mesh and set position
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.set(this.position.x, this.position.y, this.position.z);

        // Add the mesh to the scene
        if (this.scene) {
            this.scene.add(this.mesh);
        }
    }

    // Method to remove the celestial body from the scene
    remove() {
        if (this.scene && this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}

export default CelestialBody;
