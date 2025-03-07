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
      let waveColor, waveGradient;
      if (color === 'red') {
        waveColor = '#ef4444';
        waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        waveGradient.addColorStop(0, '#ef4444');
        waveGradient.addColorStop(0.5, '#f87171');
        waveGradient.addColorStop(1, '#ef4444');
      } else if (color === 'blue') {
        waveColor = '#3b82f6';
        waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        waveGradient.addColorStop(0, '#3b82f6');
        waveGradient.addColorStop(0.5, '#60a5fa');
        waveGradient.addColorStop(1, '#3b82f6');
      } else if (color === 'green') {
        waveColor = '#10b981';
        waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        waveGradient.addColorStop(0, '#10b981');
        waveGradient.addColorStop(0.5, '#34d399');
        waveGradient.addColorStop(1, '#10b981');
      } else if (color === 'purple') {
        waveColor = '#8b5cf6';
        waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        waveGradient.addColorStop(0, '#8b5cf6');
        waveGradient.addColorStop(0.5, '#a78bfa');
        waveGradient.addColorStop(1, '#8b5cf6');
      } else {
        waveGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        waveGradient.addColorStop(0, '#ef4444');
        waveGradient.addColorStop(0.25, '#3b82f6');
        waveGradient.addColorStop(0.5, '#10b981');
        waveGradient.addColorStop(0.75, '#8b5cf6');
        waveGradient.addColorStop(1, '#ef4444');
      }
      
      // Draw multiple layers of waves with fill
      for (let j = complexity; j >= 1; j--) {
        // First wave - create the path
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);  // Start at bottom left
        
        const amplitude = 80 / j;
        const frequency = 0.005 * j;
        const heightOffset = canvas.height / 2 + 50 + (j * 15);
        
        // Draw the wave from left to right
        for (let i = 0; i <= canvas.width; i += 5) {
          const y = Math.sin((i * frequency) + (phase * speed * j)) * amplitude + heightOffset;
          ctx.lineTo(i, y);
        }
        
        // Complete the path back to the bottom right and then to bottom left
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Fill with gradient and transparency
        if (color === 'rainbow') {
          ctx.fillStyle = waveGradient;
        } else {
          ctx.fillStyle = `${waveColor}${Math.floor(20 + (j * 15)).toString(16)}`;
        }
        ctx.fill();
        
        // Add a subtle stroke
        if (j === 1) {
          ctx.strokeStyle = waveColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
      
      phase += 0.02;
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
  
  // Add Poppins font
  useEffect(() => {
    // Create a link element for the Google Font
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
    
    // Apply the font to the body
    document.body.style.fontFamily = "'Poppins', sans-serif";
    
    // Clean up
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
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

  // Styled dropdown component
  const StyledDropdown = ({ label, value, options, onChange }) => (
    <div className="dropdown-container">
      <label className="text-white text-sm block mb-2">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={onChange}
          className="w-full bg-white bg-opacity-10 text-white px-4 py-3 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-white"
          style={{ 
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 300
          }}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
    </div>
  );
  
  // Styled slider component
  const StyledSlider = ({ label, value, min, max, step, onChange }) => (
    <div>
      <label className="text-white text-sm block mb-2">
        {label}: {typeof value === 'number' ? value.toFixed(1) : value}
      </label>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={onChange}
        className="w-full accent-white"
        style={{
          height: '6px',
          borderRadius: '3px',
          cursor: 'pointer',
          WebkitAppearance: 'none',
          background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(255,255,255,0.2))'
        }}
      />
    </div>
  );
  
  return (
    <div className="relative h-screen w-full overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Render the active animation */}
      {renderAnimation()}
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
        <div>
          <h1 
            className="text-4xl font-light text-white mb-2" 
            style={{ fontWeight: 300, letterSpacing: '1px' }}
          >
            Animation Playground
          </h1>
          <p className="text-white opacity-70" style={{ fontWeight: 300 }}>
            Explore and customise beautiful web animations
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveAnimation('particles')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'particles' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
            style={{ 
              fontWeight: 300, 
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
          >
            Particles
          </button>
          <button 
            onClick={() => setActiveAnimation('waves')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'waves' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
            style={{ 
              fontWeight: 300, 
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
          >
            Waves
          </button>
          <button 
            onClick={() => setActiveAnimation('matrix')}
            className={`px-4 py-2 rounded-full text-white ${activeAnimation === 'matrix' ? 'bg-white bg-opacity-30' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
            style={{ 
              fontWeight: 300, 
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
          >
            Matrix
          </button>
        </div>
      </div>
      
      {/* Controls Panel */}
      <div 
        className="absolute bottom-0 left-0 w-full p-6 bg-black bg-opacity-50 z-10"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <div className="max-w-4xl mx-auto">
          <h2 
            className="text-white text-xl mb-4" 
            style={{ fontWeight: 400, letterSpacing: '0.5px' }}
          >
            Customise Animation
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Color Selection */}
            <StyledDropdown 
              label="Color Theme"
              value={settings.color}
              options={[
                { value: 'red', label: 'Red' },
                { value: 'blue', label: 'Blue' },
                { value: 'green', label: 'Green' },
                { value: 'purple', label: 'Purple' },
                { value: 'rainbow', label: 'Rainbow' }
              ]}
              onChange={(e) => handleSettingChange('color', e.target.value)}
            />
            
            {/* Speed Control */}
            <StyledSlider 
              label="Speed"
              value={settings.speed}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
            />
            
            {/* Animation-specific controls */}
            {activeAnimation === 'particles' && (
              <>
                <StyledSlider 
                  label="Particle Size"
                  value={settings.size}
                  min={1}
                  max={8}
                  step={1}
                  onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
                />
                <div>
                  <label className="text-white text-sm block mb-2">Connections</label>
                  <div className="mt-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="connections"
                      checked={settings.connections}
                      onChange={(e) => handleSettingChange('connections', e.target.checked)}
                      className="mr-2 w-5 h-5 accent-white cursor-pointer"
                    />
                    <label htmlFor="connections" className="text-white cursor-pointer">Show Lines</label>
                  </div>
                </div>
              </>
            )}
            
            {activeAnimation === 'waves' && (
              <StyledSlider 
                label="Complexity"
                value={settings.complexity}
                min={1}
                max={5}
                step={1}
                onChange={(e) => handleSettingChange('complexity', parseInt(e.target.value))}
              />
            )}
            
            {activeAnimation === 'matrix' && (
              <StyledSlider 
                label="Density"
                value={settings.density}
                min={0.5}
                max={2}
                step={0.1}
                onChange={(e) => handleSettingChange('density', parseFloat(e.target.value))}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationShowcaseApp;