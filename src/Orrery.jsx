import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Planet from './Planet';
import Sun from './Sun';

const Orrery = () => {
  const mountRef = useRef(null);
  const planetsRef = useRef([]); // Keep track of planet meshes for raycasting
  const [followPlanet, setFollowPlanet] = useState(null); // Track the planet to follow
  const [resetView, setResetView] = useState(false); // Track whether to reset to sun-centered view

  useEffect(() => {
    // Set up basic scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        10,
        10000000 // Far plane increased for larger orbits
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Raycaster and mouse vector setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // General brightness
    scene.add(ambientLight);

    // Create the Sun
    const sun = new Sun(scene, 80, 0xffff00);
    sun.create();

    // Create planets using the Planet class
    const planets = [
      new Planet(scene, 1, 50, 0x00ff00, 579, 0.001, Math.PI / 13, 0.2056), // Mercury
      new Planet(scene, 2, 9, 0xffa07a, 1082, 0.007, Math.PI / 12, 0.0067), // Venus
      new Planet(scene, 3, 12, 0x0000ff, 1496, 0.005, Math.PI / 19, 0.0167), // Earth
      new Planet(scene, 4, 7, 0xff4500, 2279, 0.003, Math.PI / 14, 0.0934), // Mars
      new Planet(scene, 5, 40, 0xffff00, 7783, 0.001, Math.PI / 15, 0.0489), // Jupiter
      new Planet(scene, 6, 35, 0xffa500, 14270, 0.0008, Math.PI / 13.4, 0.0565), // Saturn
      new Planet(scene, 7, 25, 0x00ffff, 28710, 0.0003, Math.PI / 27, 0.0463), // Uranus
      new Planet(scene, 8, 23, 0x4169e1, 44971, 0.0001, Math.PI / 28, 0.0097), // Neptune
    ];

    // Store planet meshes in reference for raycasting
    planetsRef.current = planets.map(planet => planet.mesh);

    // Adjust camera position to ensure we can view all planets
    camera.position.set(0, 0, 10000); // Set camera far enough to see all planets

    // Orbit controls for user interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Handle mouse click
    const handleClick = (event) => {
      // Calculate mouse position in normalized device coordinates (-1 to +1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the ray
      const intersects = raycaster.intersectObjects(planetsRef.current);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object; // Get the first intersected mesh
        console.log("Planet clicked:", clickedMesh);

        // Find the corresponding Planet instance
        const clickedPlanet = planets.find(planet => planet.mesh === clickedMesh);

        // Set the clicked planet as the one to follow
        setFollowPlanet(clickedPlanet);
        setResetView(false); // Reset view disabled when focusing on planet
      }
    };

    // Add mouse click event listener
    window.addEventListener('click', handleClick);

    // Handle key press for resetting the camera to focus on the Sun
    const handleKeyPress = (event) => {
      if (event.code === 'Space') {
        setFollowPlanet(null); // Stop following any planet
        setResetView(true); // Trigger reset view to Sun
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update planets' orbits
      planets.forEach(planet => planet.updateOrbit());

      // If we are following a planet, update camera to follow it
      if (followPlanet) {
        const planetPosition = new THREE.Vector3(); // Corrected from 'qw'
        // Get the world position of the planet's orbitGroup
        followPlanet.orbitGroup.getWorldPosition(planetPosition);

        // Smoothly move the camera towards the planet
        camera.position.lerp(
            new THREE.Vector3(
                planetPosition.x - 200, // Offset by 200 units to avoid being too close
                planetPosition.y - 200,
                planetPosition.z - 200
            ),
            0.05 // Lerp with smoothing
        );

        camera.lookAt(planetPosition); // Make the camera look at the planet

        controls.enabled = false; // Disable controls when following a planet
      } else if (resetView) {
        // Reset the camera to focus on the Sun
        const sunPosition = new THREE.Vector3(0, 0, 0); // Sun is at the origin
        camera.position.lerp(new THREE.Vector3(0, 0, 10000), 0.05); // Move the camera back
        camera.lookAt(sunPosition); // Look at the Sun's position

        if (camera.position.distanceTo(new THREE.Vector3(0, 0, 10000)) < 50) {
          // Once the camera is reset to a good view, re-enable the controls
          controls.enabled = true;
          setResetView(false); // Stop resetting once done
        }
      } else {
        controls.enabled = true; // Enable controls when not following a planet
      }

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
      window.removeEventListener('click', handleClick); // Remove click listener
      window.removeEventListener('keydown', handleKeyPress); // Remove keydown listener
      controls.dispose();
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [followPlanet, resetView]); // Re-run the effect if followPlanet or resetView changes

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default Orrery;
