"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  opacity: number;
}

export default function GradientOrbs() {
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

    // Create orbs
    const orbs: Orb[] = [
      {
        x: canvas.width * 0.2,
        y: canvas.height * 0.3,
        radius: 150,
        vx: 0.5,
        vy: 0.3,
        color: 'rgba(139, 92, 246, 0.3)', // Purple
        opacity: 0.3,
      },
      {
        x: canvas.width * 0.8,
        y: canvas.height * 0.7,
        radius: 200,
        vx: -0.3,
        vy: -0.4,
        color: 'rgba(236, 72, 153, 0.25)', // Pink
        opacity: 0.25,
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        radius: 180,
        vx: 0.4,
        vy: -0.2,
        color: 'rgba(59, 130, 246, 0.2)', // Blue
        opacity: 0.2,
      },
    ];

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbs.forEach((orb) => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off walls
        if (orb.x - orb.radius < 0 || orb.x + orb.radius > canvas.width) {
          orb.vx *= -1;
        }
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > canvas.height) {
          orb.vy *= -1;
        }

        // Create gradient
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // Draw orb
        ctx.save();
        ctx.globalAlpha = orb.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

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
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-5"
    />
  );
}