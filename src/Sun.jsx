import * as THREE from 'three';
import CelestialBody from './CelestialBody';

class Sun extends CelestialBody {
    constructor(scene,
                size,
                color,
                lightIntensity ,
                lightDistance) {
        // Pass the necessary parameters to the parent CelestialBody class
        super(scene, size, color, { x: 0, y: 0, z: 0 });

        // Create a point light to simulate the Sun's light
        this.light = new THREE.PointLight(0xffffff, lightIntensity, lightDistance);
        this.light.position.set(0, 0, 0); // Set light at the Sun's position

        // Add the light to the scene
        scene.add(this.light);
    }

    // Optionally, you can add other Sun-specific methods here
}

export default Sun;
