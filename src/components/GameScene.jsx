import React, { useRef, useEffect } from 'react';
import playerTexture from '../assets/player.png';
import playerData from '../assets/player.json';
import * as THREE from 'three';

const GameScene = () => {
  const mountRef = useRef(null);
  const keysRef = useRef({ ArrowLeft: false, ArrowRight: false });

  // array that contains all the frames of players movement
  const allFrames = Object.values(playerData.frames).map(f => f.frame); // get all frames
  
  // Idle frames (from 0 to 9)
const idleFrames = Object.values(playerData.frames)
  .slice(playerData.meta.frameTags[0].from, playerData.meta.frameTags[0].to + 1)
  .map(f => f.frame);

// Walk frames (from 10 to 17)
const walkFrames = Object.values(playerData.frames)
  .slice(playerData.meta.frameTags[1].from, playerData.meta.frameTags[1].to + 1)
  .map(f => f.frame);

// jumping frame (from 26 to 31)
const jumpFrames = Object.values(playerData.frames)
 .slice(playerData.meta.frameTags[3].from, playerData.meta.frameTags[3].to + 1)
  .map(f => f.frame); 

// running frames (from 18 to 25)
// jumping frame (from 26 to 31)
const runFrames = Object.values(playerData.frames)
.slice(playerData.meta.frameTags[2].from, playerData.meta.frameTags[2].to + 1)
.map(f => f.frame); 

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3; // bring camera closer

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0xdddddd, 1);
    mountRef.current.appendChild(renderer.domElement);

    // Load sprite (idle frame)
    const texture = new THREE.TextureLoader().load(playerTexture);
    const material = new THREE.SpriteMaterial({ map: texture });
    const player = new THREE.Sprite(material);
    player.scale.set(2, 2, 1); // make sprite bigger
    player.position.set(0, 0, 0);
    scene.add(player);

    // Helpers for orientation
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Keyboard events
    const handleKeyDown = window.addEventListener('keydown', e => { if (e.key === ' ') e.preventDefault(); keysRef.current[e.key] = true; });
    const handleKeyUp = window.addEventListener('keyup', e => { if (e.key === ' ') e.preventDefault(); keysRef.current[e.key] = false; });

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // prepping frames for animation 
    function showFrame(frame) {
    const frameWidth = frame.w / texture.image.width;
    const frameHeight = frame.h / texture.image.height;

    texture.repeat.set(frameWidth, frameHeight);
    texture.offset.set(frame.x / texture.image.width, 1 - frameHeight - frame.y / texture.image.height);
    }
    

    // picked frame
    let frameIndex = 0;

    // counting the frames 
    let frameTimer = 0;

    // jumping 
    let isJumping = false;
    let velocityY = 0;
    const gravity = -0.01;
    const jumpStrength = 0.2;
    const groundY = 0;


    // Animation loop
  const animate = () => {
      requestAnimationFrame(animate);
      frameTimer += 1;

      // picking walking or idle frame
    let currentFrames;
  if (keysRef.current[" "] && !isJumping) {
    isJumping = true;
    velocityY = jumpStrength; // upward launch
    currentFrames = jumpFrames;
  }
  if(isJumping){
    velocityY += gravity; // go ahead and apply gravity 
    player.position.y += velocityY;
    currentFrames = jumpFrames;
    // Player Landing 
    if(player.position.y <= groundY){
      isJumping = false;
      velocityY = 0;
    }
  } 
  else if(keysRef.current[" "] && !isJumping){
    isJumping = true;
    velocityY = jumpStrength;
    currentFrames = jumpFrames;
  }
  else if(keysRef.current["Shift"] && (keysRef.current.ArrowLeft || keysRef.current.ArrowRight)) {
    currentFrames = runFrames;
  }
  else if (keysRef.current.ArrowLeft || keysRef.current.ArrowRight) {
  currentFrames = walkFrames;
  } else {
    currentFrames = idleFrames;
  }


    // change frames every 10 ticks
    if (frameTimer > 10) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % currentFrames.length;
      const frame = currentFrames[frameIndex];
      showFrame(frame); // ✅ call once
    }

     // player movement
    if (keysRef.current.ArrowLeft) player.position.x -= 0.05;
    if (keysRef.current.ArrowRight) player.position.x += 0.05;

    renderer.render(scene, camera);
    };

    animate();

    

    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default GameScene;
