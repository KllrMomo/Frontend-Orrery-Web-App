import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Orrery = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Set up basic scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        10,
        1000000 // Increased far plane for larger scene
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true,
    logarithmicDepthBuffer : true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting setup
    const light = new THREE.PointLight(0xffffff, 30);
    light.position.set(0, 0, 0); // Position the light at the center (Sun)
    scene.add(light);

    // Create the Sun
    const sunGeometry = new THREE.SphereGeometry(80, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Add ambient light for general brightness
    scene.add(ambientLight);

    // Create planets with elliptical orbits
    const createPlanet = (
        size,
        color,
        distance,
        orbitSpeed,
        orbitIncline,
        elipseFactor,
        eccentricity = 0.0 // Add eccentricity parameter with a default value
    ) => {
      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color, // Add emissive color to make planets appear brighter
        emissiveIntensity: 0.5,
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData = {
        distance,
        angle: Math.random() * Math.PI * 2,
        orbitSpeed,
        elipseFactor,
        eccentricity, // Store the eccentricity
      }; // Random starting angle

      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.z = orbitIncline; // Rotate the orbit group around the Z-axis

      // Create the orbit path in the XZ plane
      const semiMajorAxis = distance;
      const semiMinorAxis =
          semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2));
      const focusOffset = semiMajorAxis * eccentricity;

      const orbitCurve = new THREE.EllipseCurve(
          -focusOffset,
          0, // ax, aY - center of the ellipse
          semiMajorAxis,
          semiMinorAxis, // xRadius, yRadius
          0,
          2 * Math.PI, // startAngle, endAngle
          false, // clockwise
          0 // rotation
      );

      const points = orbitCurve.getPoints(100);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
          points.map((p) => new THREE.Vector3(p.x, 0, p.y)) // Orbit in XZ plane
      );
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

      orbitGroup.add(orbitLine); // Add the orbit line to the orbit group
      orbitGroup.add(planet);
      scene.add(orbitGroup);
      return { planet, orbitGroup };
    };

    // Create planets
    const planets = [
      createPlanet(5, 0x00ff00, 579, 0.01, Math.PI / 13, 0, 0.2056), // Mercury
      createPlanet(9, 0xffa07a, 1082, 0.007, Math.PI / 12, 1.3, 0.0067), // Venus
      createPlanet(12, 0x0000ff, 1496, 0.005, Math.PI / 19, 1.0, 0.0167), // Earth
      createPlanet(17, 0xff4500, 2279, 0.003, Math.PI / 14, 1.2, 0.0934), // Mars
      createPlanet(4, 0xffff00, 7783, 0.001, Math.PI / 15, 1.05, 0.0489), // Jupiter
      createPlanet(35, 0xffa500, 14270, 0.0008, Math.PI / 13.4, 1.93, 0.0565), // Saturn
      createPlanet(25, 0x00ffff, 28710, 0.0003, Math.PI / 27, 1.95, 0.0463), // Uranus
      createPlanet(23, 0x4169e1, 44971, 0.0001, Math.PI / 28, 1.83, 0.0097), // Neptune
    ];


    // Set up trails for planets
    const maxTrailLength = 100;
    const trails = planets.map(({ planet }) => {
      const trailVertices = new Float32Array(maxTrailLength * 3); // Array to store the vertices
      const trailGeometry = new THREE.BufferGeometry();
      trailGeometry.setAttribute(
          'position',
          new THREE.BufferAttribute(trailVertices, 3)
      );
      const trailMaterial = new THREE.LineBasicMaterial({ color: 0x808080 });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);
      return { trail, trailVertices, currentLength: 0 };
    });

    // Camera positioning
    camera.position.z = 400;

    // Orbit controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minZoom = 10;
    controls.maxZoom = 1000;

    // Starfield background
    // (Your existing starfield code remains the same)
    // const starGeometry = new THREE.BufferGeometry();
    // const starVertices = [];
    // for (let i = 0; i < 100000; i++) {
    //   starVertices.push((Math.random() - 0.10) * 100);
    //   starVertices.push((Math.random() - 0.10) * 100);
    //   starVertices.push((Math.random() - 0.10) * 100);
    // }
    // starGeometry.setAttribute(
    //     'position',
    //     new THREE.Float32BufferAttribute(starVertices, 4)
    // );
    // const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    // const stars = new THREE.Points(starGeometry, starMaterial);
    // scene.add(stars);

    // Animate planets to move around the Sun
    const animate = () => {
      requestAnimationFrame(animate);

      planets.forEach(({ planet, orbitGroup }, index) => {
        const trail = trails[index];
        planet.userData.angle += planet.userData.orbitSpeed; // Update angle
        const { distance: semiMajorAxis, eccentricity, angle } = planet.userData;
        const semiMinorAxis =
            semiMajorAxis * Math.sqrt(1 - Math.pow(eccentricity, 2));
        const focusOffset = semiMajorAxis * eccentricity;
        const ellipseX = semiMajorAxis * Math.cos(angle) - focusOffset;
        const ellipseZ = semiMinorAxis * Math.sin(angle);
        const ellipseY = semiMinorAxis * Math.sin(angle); // Moving in the Y-axis

        planet.position.set(ellipseX, 0, ellipseZ);

        // Update trail
        const { trailVertices, currentLength } = trail;
        const worldPosition = new THREE.Vector3();
        planet.getWorldPosition(worldPosition);

        if (currentLength < maxTrailLength) {
          trailVertices.set(
              [worldPosition.x, worldPosition.y, worldPosition.z],
              currentLength * 3
          );
          trail.currentLength++;
        } else {
          for (let i = 0; i < maxTrailLength - 1; i++) {
            trailVertices.copyWithin(i * 3, (i + 1) * 3);
          }
          trailVertices.set(
              [worldPosition.x, worldPosition.y, worldPosition.z],
              (maxTrailLength - 1) * 3
          );
        }

        // Notify Three.js to update the trail geometry
        trail.trail.geometry.attributes.position.needsUpdate = true;
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clean up when component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Orrery;
