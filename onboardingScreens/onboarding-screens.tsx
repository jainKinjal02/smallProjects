import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class for 3D-like effect
    class Particle {
      constructor(x, y, z, radius, color) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.radius = radius;
        this.color = color;
        this.speed = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
      }

      update() {
        // Create a subtle 3D-like movement
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.z += Math.sin(this.angle * 0.5) * 0.1;

        // Wrap around the canvas
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        // Create depth effect with size and opacity
        const scale = 1 - (this.z * 0.1);
        const alpha = 1 - (this.z * 0.2);
        
        ctx.beginPath();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.arc(
          this.x, 
          this.y, 
          this.radius * scale, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Create particles
    const particles = [];
    const particleCount = 150;
    const colors = [
      'rgba(52, 211, 153, 0.5)',   // Emerald
      'rgba(96, 165, 250, 0.5)',   // Blue
      'rgba(168, 85, 247, 0.5)'    // Purple
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random(),
        Math.random() * 3 + 1,
        colors[Math.floor(Math.random() * colors.length)]
      ));
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%' 
      }}
    />
  );
};

const OnboardingScreens = () => {
  const [currentScreen, setCurrentScreen] = useState(0);

  const onboardingData = [
    {
      title: "Welcome to Your App",
      description: "Discover a seamless experience tailored just for you.",
      icon: "🚀",
      background: "bg-blue-100/70"
    },
    {
      title: "Easy Navigation",
      description: "Intuitive design that makes using the app a breeze.",
      icon: "🧭",
      background: "bg-green-100/70"
    },
    {
      title: "Get Started",
      description: "You're all set to explore and enjoy!",
      icon: "✨",
      background: "bg-purple-100/70"
    }
  ];

  const handleNext = () => {
    if (currentScreen < onboardingData.length - 1) {
      setCurrentScreen(currentScreen + 1);
    }
  };

  const handleSkip = () => {
    setCurrentScreen(onboardingData.length - 1);
  };

  const handleComplete = () => {
    alert('Onboarding Complete!');
  };

  const pageVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9,
      rotateY: 90
    },
    in: { 
      opacity: 1, 
      scale: 1,
      rotateY: 0
    },
    out: { 
      opacity: 0, 
      scale: 1.1,
      rotateY: -90
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <BackgroundAnimation />
      
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {onboardingData.map((screen, index) => (
            currentScreen === index && (
              <motion.div 
                key={index}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
                className={`relative p-8 rounded-lg shadow-2xl text-center ${screen.background} backdrop-blur-md`}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="text-6xl mb-6 animate-bounce">
                    {screen.icon}
                  </div>
                  <h2 className="text-2xl font-bold mb-4">{screen.title}</h2>
                  <p className="text-gray-700 mb-8">{screen.description}</p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex justify-between items-center"
                >
                  {currentScreen < onboardingData.length - 1 ? (
                    <>
                      <button 
                        onClick={handleSkip} 
                        className="text-gray-600 hover:text-gray-800 transition"
                      >
                        Skip
                      </button>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNext} 
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
                      >
                        <ArrowRight />
                      </motion.button>
                    </>
                  ) : (
                    <motion.button 
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleComplete} 
                      className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                    >
                      <CheckCircle className="mr-2" /> Get Started
                    </motion.button>
                  )}
                </motion.div>

                <div className="flex justify-center mt-6 space-x-2">
                  {onboardingData.map((_, dotIndex) => (
                    <motion.div 
                      key={dotIndex} 
                      animate={{ 
                        scale: currentScreen === dotIndex ? [1, 1.2, 1] : 1,
                        backgroundColor: currentScreen === dotIndex ? '#3B82F6' : '#D1D5DB'
                      }}
                      className={`h-2 w-2 rounded-full ${
                        currentScreen === dotIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingScreens;
