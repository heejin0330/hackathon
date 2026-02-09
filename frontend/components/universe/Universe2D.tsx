'use client';

import { useEffect, useRef, useState } from 'react';
import { CareerRecommendation } from '@/types';

interface Universe2DProps {
  recommendations: CareerRecommendation[];
  selectedCareerIds: string[];
  onCareerClick?: (careerId: string) => void;
}

export default function Universe2D({
  recommendations,
  selectedCareerIds,
  onCareerClick,
}: Universe2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCareer, setHoveredCareer] = useState<string | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Sun (user) properties
    const sunRadius = 30;
    const baseOrbitRadius = 120;
    const planetRadius = 15;

    // Animation
    let angle = 0;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, width, height);

      // Draw stars background
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw sun (user) - glowing effect
      const sunGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        sunRadius * 2
      );
      sunGradient.addColorStop(0, '#FDB813');
      sunGradient.addColorStop(0.5, '#FFD700');
      sunGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw sun core
      ctx.fillStyle = '#FDB813';
      ctx.beginPath();
      ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw planets (careers)
      recommendations.forEach((career, index) => {
        const orbitRadius = baseOrbitRadius + index * 60;
        const planetAngle = angle + (index * (Math.PI * 2)) / recommendations.length;
        const planetX = centerX + Math.cos(planetAngle) * orbitRadius;
        const planetY = centerY + Math.sin(planetAngle) * orbitRadius;

        // Draw orbit path
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Determine planet color
        const isSelected = selectedCareerIds.includes(career.recommendation_id);
        const isHovered = hoveredCareer === career.recommendation_id;
        let planetColor = '#4285F4'; // Default blue

        if (career.is_custom) {
          planetColor = '#FBBC04'; // Yellow for custom
        } else {
          const colors = ['#4285F4', '#34A853', '#EA4335']; // Blue, Green, Red
          planetColor = colors[index % colors.length];
        }

        // Draw planet
        const currentRadius = isHovered ? planetRadius * 1.3 : planetRadius;
        const planetGradient = ctx.createRadialGradient(
          planetX - currentRadius * 0.3,
          planetY - currentRadius * 0.3,
          0,
          planetX,
          planetY,
          currentRadius
        );
        planetGradient.addColorStop(0, isSelected ? '#ffffff' : planetColor);
        planetGradient.addColorStop(1, planetColor);

        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planetX, planetY, currentRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw selection ring
        if (isSelected) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(planetX, planetY, currentRadius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw planet label
        if (isHovered || isSelected) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(career.career_name, planetX, planetY - currentRadius - 10);
        }
      });

      angle += 0.01;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [recommendations, selectedCareerIds, hoveredCareer]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !onCareerClick) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseOrbitRadius = 120;
    const planetRadius = 15;

    // Check if click is on a planet
    recommendations.forEach((career, index) => {
      const orbitRadius = baseOrbitRadius + index * 60;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (Math.abs(distance - orbitRadius) < planetRadius * 2) {
        onCareerClick(career.recommendation_id);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseOrbitRadius = 120;
    const planetRadius = 15;

    let foundHover = false;

    recommendations.forEach((career, index) => {
      const orbitRadius = baseOrbitRadius + index * 60;
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (Math.abs(distance - orbitRadius) < planetRadius * 2) {
        setHoveredCareer(career.recommendation_id);
        foundHover = true;
        canvas.style.cursor = 'pointer';
      }
    });

    if (!foundHover) {
      setHoveredCareer(null);
      canvas.style.cursor = 'default';
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        className="max-w-full max-h-full"
      />
    </div>
  );
}

