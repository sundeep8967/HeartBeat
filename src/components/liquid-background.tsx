"use client";

import { useEffect, useRef } from "react";

export default function LiquidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Liquid animation variables
    const waves = [
      {
        y: canvas.height * 0.7,
        length: 0.01,
        amplitude: 50,
        frequency: 0.01,
        color: 'rgba(139, 92, 246, 0.1)', // Purple
      },
      {
        y: canvas.height * 0.8,
        length: 0.015,
        amplitude: 30,
        frequency: 0.015,
        color: 'rgba(236, 72, 153, 0.1)', // Pink
      },
      {
        y: canvas.height * 0.9,
        length: 0.02,
        amplitude: 40,
        frequency: 0.02,
        color: 'rgba(59, 130, 246, 0.1)', // Blue
      },
    ];

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x++) {
          const y = wave.y + Math.sin(x * wave.length + time * wave.frequency) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      time += 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #f8f9fb 0%, #e9ecef 100%)' }}
    />
  );
}