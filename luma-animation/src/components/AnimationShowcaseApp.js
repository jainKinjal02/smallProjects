import React, { useState, useEffect, useRef } from 'react';

// Animation components
const ParticleAnimation = ({ color, speed, size, connections }) => {
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
    
    // Setting canvas dimensions
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
        this.size = Math.random() * size + 1;
        this.speedX = Math.random() * (speed * 2) - speed;
        this.speedY = Math.random() * (speed * 2) - speed;
        
        // Use the provided color scheme
        if (color === 'red') {
          this.color = `hsl(${Math.random() * 60 + 330}, 100%, 50%)`;
        } else if (color === 'blue') {
          this.color = `hsl(${Math.random() * 60 + 180}, 100%, 50%)`;
        } else if (color === 'green') {
          this.color = `hsl(${Math.random() * 60 + 90}, 100%, 50%)`;
        } else if (color === 'purple') {
          this.color = `hsl(${Math.random() * 60 + 270}, 100%, 50%)`;
        } else {
          this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
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
      
      // Connect particles with lines if enabled
      if (connections) {
        connectParticles();
      }
      
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
            // Use the connection color based on the particle color scheme
            let connectionColor;
            if (color === 'red') {
              connectionColor = `rgba(255, 100, 130, ${1 - distance/100})`;
            } else if (color === 'blue') {
              connectionColor = `rgba(100, 150, 255, ${1 - distance/100})`;
            } else if (color === 'green') {
              connectionColor = `rgba(100, 255, 130, ${1 - distance/100})`;
            } else if (color === 'purple') {
              connectionColor = `rgba(180, 100, 255, ${1 - distance/100})`;
            } else {
              connectionColor = `rgba(255, 255, 255, ${1 - distance/100})`;
            }
            
            ctx.strokeStyle = connectionColor;
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
  }, [mousePosition, color, speed, size, connections]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full"
      style={{
        background: color === 'red' 
          ? 'linear-gradient(to bottom right, #7f1d1d, #1f2937)'
          : color === 'blue' 
          ? 'linear-gradient(to bottom right, #1e3a8a, #111827)'
          : color === 'green'
          ? 'linear-gradient(to bottom right, #065f46, #111827)'
          : color === 'purple'
          ? 'linear-gradient(to bottom right, #4c1d95, #111827)'
          : 'linear-gradient(to bottom right, #18181b, #000000)'
      }}
    />
  );
};

// Wave Animation Component
const WaveAnimation = ({ color, speed, complexity }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;
    
    // Setting canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Get color based on the prop
      let waveColor;
      if (color === 'red') {
        waveColor = '#ef4444';
      } else if (color === 'blue') {
        waveColor = '#3b82f6';
      } else if (color === 'green') {
        waveColor = '#10b981';
      } else if (color === 'purple') {
        waveColor = '#8b5cf6';
      } else {
        waveColor = '#ffffff';
      }
      
      // Draw multiple waves
      for (let j = 1; j <= complexity; j++) {
        ctx.beginPath();
        
        const amplitude = 50 / j;
        const frequency = 0.01 * j;
        
        for (let i = 0; i < canvas.width; i++) {
          const y = Math.sin((i * frequency) + (phase * speed * j)) * amplitude + canvas.height / 2;
          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        
        ctx.strokeStyle = `${waveColor}${(80 - j*20).toString(16)}`;
        ctx.lineWidth = 3 - j * 0.5;
        ctx.stroke();
      }
      
      phase += 0.05;
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speed, complexity]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full"
      style={{
        background: color === 'red' 
          ? 'linear-gradient(to bottom, #7f1d1d, #1f2937)'
          : color === 'blue' 
          ? 'linear-gradient(to bottom, #1e3a8a, #111827)'
          : color === 'green'
          ? 'linear-gradient(to bottom, #065f46, #111827)'
          : color === 'purple'
          ? 'linear-gradient(to bottom, #4c1d95, #111827)'
          : 'linear-gradient(to bottom, #18181b, #000000)'
      }}
    />
  );
};

// Matrix Rain Animation
const MatrixRainAnimation = ({ color, speed, density }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Setting canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Matrix characters
    const chars = "01100 0110001110101011010101".split("");
    const columns = Math.floor(canvas.width / 20); // Character width
    const drops = [];
    
    for (let i = 0; i < columns * density; i++) {
      drops[i] = Math.floor(Math.random() * -canvas.height);
    }
    
    // Get color based on the prop
    let rainColor;
    if (color === 'red') {
      rainColor = '#ef4444';
    } else if (color === 'blue') {
      rainColor = '#3b82f6';
    } else if (color === 'green') {
      rainColor = '#10b981';
    } else if (color === 'purple') {
      rainColor = '#8b5cf6';
    } else {
      rainColor = '#ffffff';
    }
    
    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = rainColor;
      ctx.font = '15px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 1);
        
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        drops[i] += speed;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, speed, density]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full"
      style={{
        background: 'black'
      }}
    />
  );
};

// Main App Component
const AnimationShowcaseApp = () => {
  const [activeAnimation, setActiveAnimation] = useState('particles');
  const [settings, setSettings] = useState({
    color: 'red',
    speed: 1.5,
    size: 3,
    connections: true,
    complexity: 3,
    density: 1
  });
  
  const renderAnimation = () => {
    switch(activeAnimation) {
      case 'particles':
        return (
          <ParticleAnimation 
            color={settings.color} 
            speed={settings.speed} 
            size={settings.size} 
            connections={settings.connections} 
          />
        );
      case 'waves':
        return (
          <WaveAnimation 
            color={settings.color} 
            speed={settings.speed} 
            complexity={settings.complexity} 
          />
        );
      case 'matrix':
        return (
          <MatrixRainAnimation 
            color={settings.color} 
            speed={settings.speed} 
            density={settings.density} 
          />
        );
      default:
        return <ParticleAnimation />;
    }
  };
  
  const handleSettingChange = (setting, value) => {
    setSettings({ ...settings, [setting]: value });
  };
  
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Render the active animation */}
      {renderAnimation()}
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">Animation Playground</h1>
          <p className="text-white opacity-70">Explore and customize beautiful web animations</p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveAnimation('particles')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'particles' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
          >
            Particles
          </button>
          <button 
            onClick={() => setActiveAnimation('waves')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'waves' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
          >
            Waves
          </button>
          <button 
            onClick={() => setActiveAnimation('matrix')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'matrix' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
          >
            Matrix
          </button>
        </div>
      </div>
      
      {/* Controls Panel */}
      <div className="absolute bottom-0 left-0 w-full p-6 bg-black bg-opacity-50 backdrop-blur-md z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-xl mb-4">Customize Animation</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Color Selection */}
            <div>
              <label className="text-white text-sm block mb-2">Color Theme</label>
              <select 
                value={settings.color}
                onChange={(e) => handleSettingChange('color', e.target.value)}
                className="w-full bg-white bg-opacity-10 text-white px-3 py-2 rounded"
              >
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="purple">Purple</option>
                <option value="rainbow">Rainbow</option>
              </select>
            </div>
            
            {/* Speed Control */}
            <div>
              <label className="text-white text-sm block mb-2">Speed: {settings.speed.toFixed(1)}</label>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={settings.speed}
                onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Animation-specific controls */}
            {activeAnimation === 'particles' && (
              <>
                <div>
                  <label className="text-white text-sm block mb-2">Particle Size: {settings.size}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="8" 
                    step="1" 
                    value={settings.size}
                    onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-white text-sm block mb-2">Connections</label>
                  <div className="mt-2">
                    <input 
                      type="checkbox" 
                      checked={settings.connections}
                      onChange={(e) => handleSettingChange('connections', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-white">Show Lines</span>
                  </div>
                </div>
              </>
            )}
            
            {activeAnimation === 'waves' && (
              <div>
                <label className="text-white text-sm block mb-2">Complexity: {settings.complexity}</label>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={settings.complexity}
                  onChange={(e) => handleSettingChange('complexity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            
            {activeAnimation === 'matrix' && (
              <div>
                <label className="text-white text-sm block mb-2">Density: {settings.density.toFixed(1)}</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={settings.density}
                  onChange={(e) => handleSettingChange('density', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationShowcaseApp;