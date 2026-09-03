/**
 * ATMOSPHERE — Dynamic Atmospheric Canvas Particle System
 * Controls ambient particle physics for Clear, Rain, Snow, Storm, Clouds, and Night.
 */

class WeatherCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.particles = [];
    this.condition = 'sunny'; // 'sunny', 'rainy', 'stormy', 'snowy', 'cloudy', 'night'
    this.animationFrameId = null;
    this.lightningFlash = 0; // 0 to 1 intensity

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setCondition(cond) {
    const validConditions = ['sunny', 'rainy', 'stormy', 'snowy', 'cloudy', 'night'];
    const newCond = validConditions.includes(cond) ? cond : 'sunny';
    if (this.condition !== newCond) {
      this.condition = newCond;
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];
    let count = 0;

    switch (this.condition) {
      case 'rainy':
      case 'stormy':
        count = this.condition === 'stormy' ? 140 : 90;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            length: Math.random() * 20 + 10,
            speed: Math.random() * 12 + 10,
            opacity: Math.random() * 0.4 + 0.3,
            splash: false,
            splashRadius: 0
          });
        }
        break;

      case 'snowy':
        count = 70;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 3 + 1,
            speedY: Math.random() * 1.5 + 0.5,
            swaySpeed: Math.random() * 0.02 + 0.01,
            swayAmp: Math.random() * 2 + 1,
            step: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.7 + 0.3
          });
        }
        break;

      case 'night':
        count = 100;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height * 0.8,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random(),
            pulseSpeed: Math.random() * 0.03 + 0.01
          });
        }
        break;

      case 'cloudy':
        count = 15;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * (this.height * 0.5),
            radius: Math.random() * 120 + 80,
            vx: Math.random() * 0.3 + 0.1,
            opacity: Math.random() * 0.08 + 0.02
          });
        }
        break;

      case 'sunny':
      default:
        count = 45;
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            radius: Math.random() * 4 + 2,
            vy: -(Math.random() * 0.4 + 0.2),
            vx: Math.random() * 0.2 - 0.1,
            alpha: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * 0.02
          });
        }
        break;
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Lightning effect for thunderstorms
    if (this.condition === 'stormy') {
      if (Math.random() < 0.008) {
        this.lightningFlash = 0.8;
      }
      if (this.lightningFlash > 0) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.lightningFlash -= 0.05;
      }
    }

    // Render condition specific particle animation
    switch (this.condition) {
      case 'rainy':
      case 'stormy':
        this.updateRain();
        break;
      case 'snowy':
        this.updateSnow();
        break;
      case 'night':
        this.updateStars();
        break;
      case 'cloudy':
        this.updateMist();
        break;
      case 'sunny':
      default:
        this.updateSunMotes();
        break;
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  updateRain() {
    this.ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();

    for (let p of this.particles) {
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x - p.length * 0.2, p.y + p.length);

      p.y += p.speed;
      p.x -= p.speed * 0.2;

      if (p.y > this.height) {
        p.y = -20;
        p.x = Math.random() * (this.width + 100);
      }
    }
    this.ctx.stroke();
  }

  updateSnow() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      p.step += p.swaySpeed;
      p.x += Math.sin(p.step) * p.swayAmp;
      p.y += p.speedY;

      if (p.y > this.height) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
    }
  }

  updateStars() {
    for (let p of this.particles) {
      p.alpha += p.pulseSpeed;
      if (p.alpha > 1 || p.alpha < 0.2) p.pulseSpeed = -p.pulseSpeed;

      this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(p.alpha)})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  updateMist() {
    for (let p of this.particles) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      p.x += p.vx;
      if (p.x - p.radius > this.width) {
        p.x = -p.radius;
      }
    }
  }

  updateSunMotes() {
    for (let p of this.particles) {
      this.ctx.fillStyle = `rgba(251, 191, 36, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();

      p.y += p.vy;
      p.x += p.vx;

      if (p.y < -10) {
        p.y = this.height + 10;
        p.x = Math.random() * this.width;
      }
    }
  }
}

// Global initialization helper
window.weatherCanvas = null;
document.addEventListener('DOMContentLoaded', () => {
  window.weatherCanvas = new WeatherCanvas('weatherCanvas');
});
