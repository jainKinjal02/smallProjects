import React, { useEffect, useRef } from 'react';
import { useState } from 'react';

const AnimatedHeroSection = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // setting canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    

    const particlesArray = [];
    const numberOfParticles = 100;
    
 
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 60 + 330}, 100%, 50%)`;
      }
      
      update() {
        this.x += this.speedX + (mousePosition.x - canvas.width/2) * 0.01;
        this.y += this.speedY + (mousePosition.y - canvas.height/2) * 0.01;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    init();
    
    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      // Connect particles with lines
      connectParticles();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    // Connect particles with lines if they're close enough
    function connectParticles() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.strokeStyle = `rgba(255, 100, 130, ${1 - distance/100})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePosition]);
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated background */}
      <canvas 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-rose-900 to-gray-900"
      />
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1 flex p-12">
          {/* Left side text */}
          {/* <div className="flex flex-col justify-center text-white w-1/2 z-10">
            <h1 className="text-8xl font-light">New</h1>
            <p className="text-6xl font-light italic ml-10 -mt-4">Dreams</p>
            <div className="mt-12 max-w-md">
              <p className="opacity-90 leading-relaxed">
                Ideate, visualize, create interfaces, and share your
                designs with the world, using our most
                powerful UI components and animations. Available
                now for React and Vue.
              </p>
            </div>
          </div> */}
          
          {/* Right side - silhouette image */}
          <div className="flex-1 flex items-center justify-center relative">
            {/* <div className="absolute right-0 bottom-1/4 text-white text-right">
              <span className="text-8xl opacity-90">of</span>
              <p className="text-6xl font-light italic">imagination</p>
            </div> */}
            
            {/* Silhouette placeholder - in a real project you would use an actual silhouette image */}
            {/* <div className="absolute h-96 w-48 bg-black opacity-80 rounded-md transform translate-x-12">
            <img 
                src="yousef-samuil-H6BAgXoRxao-unsplash.jpg" 
                alt="Silhouette"
                className="w-full h-full object-cover object-center filter brightness-0"
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedHeroSection;