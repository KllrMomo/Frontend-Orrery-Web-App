import * as THREE from 'three';
import CelestialBody from './CelestialBody';

class Planet extends CelestialBody {
    constructor(scene, id, size, color, distance, orbitSpeed, orbitIncline, eccentricity) {
        // Call the parent constructor with the required and optional parameters
        super(scene, size, color, { x: distance, y: 0, z: 0 });

        this.id = id; // Store the planet's id
        this.orbitSpeed = orbitSpeed; // Speed of orbit
        this.angle = Math.random() * Math.PI * 2; // Initial angle for the orbit (randomized)
        this.distance = distance; // Semi-major axis
        this.eccentricity = eccentricity; // Orbit eccentricity
        this.orbitIncline = orbitIncline; // Inclination of the orbit

        // Group for handling orbital rotation
        this.orbitGroup = new THREE.Group();
        this.orbitGroup.rotation.z = orbitIncline; // Tilt the orbit
        this.orbitGroup.add(this.mesh); // Add the planet to the orbital group

        // Assign the id to the mesh's userData
        this.mesh.userData.id = this.id;

        // Add orbital path
        this.createOrbitPath();

        // Add the orbital group (planet and orbit) to the scene
        scene.add(this.orbitGroup);
    }

    // Create the orbit path around the sun
    createOrbitPath() {
        const semiMajorAxis = this.distance;
        const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - Math.pow(this.eccentricity, 2));
        const focusOffset = semiMajorAxis * this.eccentricity;

        // Create the elliptical orbit curve
        const orbitCurve = new THREE.EllipseCurve(
            -focusOffset,
            0, // Center of the ellipse
            semiMajorAxis,
            semiMinorAxis, // Semi-major and semi-minor axis
            0,
            2 * Math.PI, // Full circle
            false, // Not clockwise
            0 // No rotation
        );

        // Get points along the orbit curve and create the geometry for the orbit
        const points = orbitCurve.getPoints(100);
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
            points.map((p) => new THREE.Vector3(p.x, 0, p.y)) // XZ plane
        );

        // Create the line material for the orbit path
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Create the line object for the orbit path
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

        // Add the orbit path to the orbital group
        this.orbitGroup.add(orbitLine);
    }

    // Method to update the planet's position based on its orbit
    updateOrbit() {
        // Update the angle for the orbit
        this.angle += this.orbitSpeed;

        // Calculate elliptical orbit
        const semiMajorAxis = this.distance;
        const semiMinorAxis = semiMajorAxis * Math.sqrt(1 - Math.pow(this.eccentricity, 2));
        const focusOffset = semiMajorAxis * this.eccentricity;

        // Calculate the new X and Z positions based on the angle
        const ellipseX = semiMajorAxis * Math.cos(this.angle) - focusOffset;
        const ellipseZ = semiMinorAxis * Math.sin(this.angle);

        // Update planet's position along the orbit
        this.mesh.position.set(ellipseX, 0, ellipseZ);
    }
}

export default Planet;
