// Authentic Chrome Dino runner using genuine 2x assets from alexelzx/chrome-dino
// Implements Chromium physics, sub-box collision detection, and sound FX.

export type GameState = "idle" | "run" | "over";

export interface DinoRunnerOptions {
  canvas: HTMLCanvasElement;
  onPhaseChange?: (phase: GameState) => void;
}

// Canvas logical coordinate system
const WIDTH = 600;
const HEIGHT = 150;
const GROUND_Y = 127;
const BOTTOM_PAD = 10;
const FPS_REF = 1000 / 60; // 16.667ms

// Trex constants
const TREX_WIDTH = 44;
const TREX_HEIGHT = 47;
const TREX_GROUND_Y = HEIGHT - TREX_HEIGHT - BOTTOM_PAD; // 93
const TREX_X = 40;

// Sub-boxes for Trex collision detection (from Chromium source)
const TREX_COLLISION_BOXES = [
  { x: 1, y: -1, w: 30, h: 26 },
  { x: 32, y: 0, w: 8, h: 16 },
  { x: 10, y: 35, w: 14, h: 8 },
  { x: 1, y: 24, w: 29, h: 5 },
  { x: 5, y: 30, w: 21, h: 4 },
  { x: 9, y: 34, w: 15, h: 4 },
];

// Obstacle type definitions
interface ObstacleConfig {
  type: "small" | "large";
  width: number;
  height: number;
  yPos: number;
  multipleSpeed: number;
  minGap: number;
  boxes: { x: number; y: number; w: number; h: number }[];
}

const OBSTACLE_CONFIGS: ObstacleConfig[] = [
  {
    type: "small",
    width: 17,
    height: 35,
    yPos: 105,
    multipleSpeed: 4,
    minGap: 120,
    boxes: [
      { x: 0, y: 7, w: 5, h: 27 },
      { x: 4, y: 0, w: 6, h: 34 },
      { x: 10, y: 4, w: 7, h: 14 },
    ],
  },
  {
    type: "large",
    width: 25,
    height: 50,
    yPos: 90,
    multipleSpeed: 6,
    minGap: 120,
    boxes: [
      { x: 0, y: 12, w: 7, h: 38 },
      { x: 8, y: 0, w: 7, h: 49 },
      { x: 13, y: 10, w: 10, h: 38 },
    ],
  },
];

interface ObstacleInstance {
  config: ObstacleConfig;
  size: number;
  x: number;
  y: number;
  width: number;
  boxes: { x: number; y: number; w: number; h: number }[];
}

interface CloudInstance {
  x: number;
  y: number;
}

export class DinoRunner {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onPhaseChange?: (phase: GameState) => void;

  private phase: GameState = "idle";
  private rafId = 0;
  private lastTime = 0;
  private speed = 6;

  // Trex physics
  private trexY = TREX_GROUND_Y;
  private vy = 0;
  private isJumping = false;
  private animTimer = 0;
  private blinkTimer = 0;
  private isBlinking = false;

  // World layers
  private horizonX = [0, WIDTH];
  private horizonSourceX = [0, 600];
  private obstacles: ObstacleInstance[] = [];
  private clouds: CloudInstance[] = [];
  private nextObstacleDistance = 0;
  private nextCloudDistance = 100;

  // Assets
  private images: Record<string, HTMLImageElement> = {};
  private sounds: Record<string, HTMLAudioElement> = {};
  private assetsLoaded = false;
  private destroyed = false;

  constructor(opts: DinoRunnerOptions) {
    this.canvas = opts.canvas;
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Could not get canvas context");
    this.ctx = context;
    this.onPhaseChange = opts.onPhaseChange;

    this.setupCanvasDimensions();
    this.loadAssets();
  }

  private setupCanvasDimensions() {
    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    this.canvas.width = WIDTH * dpr;
    this.canvas.height = HEIGHT * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  private loadAssets() {
    const imageDefs: Record<string, string> = {
      trex: "/dino/2x-trex.png",
      obsSmall: "/dino/2x-obstacle-small.png",
      obsLarge: "/dino/2x-obstacle-large.png",
      horizon: "/dino/2x-horizon.png",
      cloud: "/dino/2x-cloud.png",
    };

    const soundDefs: Record<string, string> = {
      jump: "/dino/offline-sound-press.ogg",
      hit: "/dino/offline-sound-hit.ogg",
    };

    let remaining = Object.keys(imageDefs).length;

    Object.entries(imageDefs).forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        remaining--;
        if (remaining <= 0) {
          this.assetsLoaded = true;
          this.drawStaticFrame();
        }
      };
      this.images[key] = img;
    });

    Object.entries(soundDefs).forEach(([key, src]) => {
      try {
        const audio = new Audio(src);
        audio.volume = 0.35;
        this.sounds[key] = audio;
      } catch {
        // audio might fail in restricted environments
      }
    });
  }

  private playSound(name: "jump" | "hit") {
    const sound = this.sounds[name];
    if (!sound) return;
    try {
      sound.currentTime = 0;
      sound.play().catch(() => {});
    } catch {
      // ignore autoplay restriction
    }
  }

  public getPhase(): GameState {
    return this.phase;
  }

  public start() {
    if (!this.assetsLoaded) return;
    this.phase = "run";
    this.speed = 6;
    this.trexY = TREX_GROUND_Y;
    this.vy = 0;
    this.isJumping = false;
    this.obstacles = [];
    this.clouds = [];
    this.horizonX = [0, WIDTH];
    this.horizonSourceX = [0, 600];
    this.nextObstacleDistance = 60;
    this.nextCloudDistance = 50;
    this.lastTime = performance.now();
    this.onPhaseChange?.("run");

    cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame(this.loop);
  }

  public stop() {
    this.phase = "idle";
    cancelAnimationFrame(this.rafId);
    this.obstacles = [];
    this.clouds = [];
    this.trexY = TREX_GROUND_Y;
    this.vy = 0;
    this.isJumping = false;
    this.onPhaseChange?.("idle");
    this.drawStaticFrame();
  }

  public jump() {
    if (this.phase !== "run") return;
    if (!this.isJumping && this.trexY >= TREX_GROUND_Y - 1) {
      this.vy = -10 - this.speed / 10;
      this.isJumping = true;
      this.playSound("jump");
    }
  }

  private gameOver() {
    this.phase = "over";
    cancelAnimationFrame(this.rafId);
    this.playSound("hit");
    this.onPhaseChange?.("over");
    this.render();
  }

  private loop = (now: number) => {
    if (this.destroyed || this.phase !== "run") return;

    const dt = Math.min(now - (this.lastTime || now), 50);
    this.lastTime = now;
    const units = dt / FPS_REF; // ~1.0 at 60 FPS

    this.update(units);
    this.render();

    if (this.phase === "run") {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private update(units: number) {
    // Accelerate speed up to cap of 13
    this.speed = Math.min(13, this.speed + 0.001 * units * 8);

    // Jump physics (Chromium gravity 0.6)
    if (this.isJumping) {
      this.vy += 0.6 * units;
      this.trexY += this.vy * units;
      if (this.trexY >= TREX_GROUND_Y) {
        this.trexY = TREX_GROUND_Y;
        this.vy = 0;
        this.isJumping = false;
      }
    }

    // Scroll ground horizon (two continuous seamless looping segments)
    const groundStep = this.speed * units;
    this.horizonX[0] -= groundStep;
    this.horizonX[1] -= groundStep;

    if (this.horizonX[0] <= -WIDTH) {
      this.horizonX[0] = this.horizonX[1] + WIDTH;
      this.horizonSourceX[0] = Math.random() > 0.5 ? 600 : 0;
    }
    if (this.horizonX[1] <= -WIDTH) {
      this.horizonX[1] = this.horizonX[0] + WIDTH;
      this.horizonSourceX[1] = Math.random() > 0.5 ? 600 : 0;
    }

    // Spawn & scroll clouds
    this.nextCloudDistance -= units;
    if (this.nextCloudDistance <= 0 && this.clouds.length < 5) {
      this.clouds.push({
        x: WIDTH + 20,
        y: 25 + Math.floor(Math.random() * 45),
      });
      this.nextCloudDistance = 70 + Math.floor(Math.random() * 120);
    }
    for (const c of this.clouds) {
      c.x -= this.speed * 0.2 * units;
    }
    this.clouds = this.clouds.filter((c) => c.x > -50);

    // Spawn & scroll obstacles
    this.nextObstacleDistance -= units;
    if (this.nextObstacleDistance <= 0) {
      this.spawnObstacle();
      const minGap = Math.max(70, 110 - Math.floor(this.speed * 4));
      this.nextObstacleDistance = minGap + Math.floor(Math.random() * 60);
    }

    for (const o of this.obstacles) {
      o.x -= this.speed * units;
    }
    this.obstacles = this.obstacles.filter((o) => o.x + o.width > -20);

    // Collision detection (Chromium sub-box AABB)
    for (const obs of this.obstacles) {
      if (this.checkCollision(obs)) {
        this.gameOver();
        return;
      }
    }

    // Animation frame timer
    this.animTimer += units;
  }

  private spawnObstacle() {
    const config =
      Math.random() > 0.45 ? OBSTACLE_CONFIGS[0] : OBSTACLE_CONFIGS[1]; // small or large

    // Single or multiple cacti depending on speed
    let size = 1;
    if (this.speed > config.multipleSpeed) {
      const roll = Math.random();
      if (roll > 0.75) size = 3;
      else if (roll > 0.4) size = 2;
    }

    const totalWidth = config.width * size;
    const boxes = config.boxes.map((b) => ({ ...b }));

    // Adjust middle & right boxes for grouped cacti (Chromium algorithm)
    if (size > 1 && boxes.length >= 3) {
      boxes[1].w = totalWidth - boxes[0].w - boxes[2].w;
      boxes[2].x = totalWidth - boxes[2].w;
    }

    this.obstacles.push({
      config,
      size,
      x: WIDTH + 10,
      y: config.yPos,
      width: totalWidth,
      boxes,
    });
  }

  private checkCollision(obs: ObstacleInstance): boolean {
    // Outer broad-phase check (with 1px adjustment)
    const tBox = {
      x: TREX_X + 1,
      y: this.trexY + 1,
      w: TREX_WIDTH - 2,
      h: TREX_HEIGHT - 2,
    };
    const oBox = {
      x: obs.x + 1,
      y: obs.y + 1,
      w: obs.width - 2,
      h: obs.config.height - 2,
    };

    if (
      tBox.x > oBox.x + oBox.w ||
      tBox.x + tBox.w < oBox.x ||
      tBox.y > oBox.y + oBox.h ||
      tBox.y + tBox.h < oBox.y
    ) {
      return false;
    }

    // Narrow-phase check on exact sub-boxes
    for (const tb of TREX_COLLISION_BOXES) {
      const atb = {
        x: tBox.x + tb.x,
        y: tBox.y + tb.y,
        w: tb.w,
        h: tb.h,
      };
      for (const ob of obs.boxes) {
        const aob = {
          x: oBox.x + ob.x,
          y: oBox.y + ob.y,
          w: ob.w,
          h: ob.h,
        };
        if (
          atb.x < aob.x + aob.w &&
          atb.x + atb.w > aob.x &&
          atb.y < aob.y + aob.h &&
          atb.y + atb.h > aob.y
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public drawStaticFrame() {
    this.render();
  }

  private render() {
    if (!this.assetsLoaded) return;
    const ctx = this.ctx;

    // Clear canvas (transparent, background color comes from parent CSS)
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // 1. Draw Clouds
    const cloudImg = this.images.cloud;
    if (cloudImg) {
      for (const c of this.clouds) {
        // 2x-cloud.png is 92x28
        ctx.drawImage(cloudImg, 0, 0, 92, 28, Math.round(c.x), Math.round(c.y), 46, 14);
      }
    }

    // 2. Draw Horizon Ground
    const horizonImg = this.images.horizon;
    if (horizonImg) {
      // 2x-horizon.png is 2400x24 (each 600px segment is 1200x24)
      for (let i = 0; i < 2; i++) {
        const srcX = this.horizonSourceX[i] * 2;
        ctx.drawImage(
          horizonImg,
          srcX,
          0,
          1200,
          24,
          Math.round(this.horizonX[i]),
          GROUND_Y,
          WIDTH,
          12
        );
      }
    }

    // 3. Draw Obstacles (Cacti)
    for (const obs of this.obstacles) {
      const img = obs.config.type === "small" ? this.images.obsSmall : this.images.obsLarge;
      if (!img) continue;

      const baseWidth = obs.config.width;
      const baseHeight = obs.config.height;
      // In 2x: crop using formula from Chromium
      const sourceX = baseWidth * 2 * obs.size * (0.5 * (obs.size - 1));
      ctx.drawImage(
        img,
        sourceX,
        0,
        baseWidth * 2 * obs.size,
        baseHeight * 2,
        Math.round(obs.x),
        obs.y,
        obs.width,
        baseHeight
      );
    }

    // 4. Draw Trex
    const trexImg = this.images.trex;
    if (trexImg) {
      let frameX = 0;

      if (this.phase === "over") {
        // Crashed frame (x = 220 in 1x, 440 in 2x)
        frameX = 440;
      } else if (this.isJumping) {
        // Jumping / standing stationary
        frameX = 0;
      } else if (this.phase === "run") {
        // Running legs alternate every 6 frames
        const leg = Math.floor(this.animTimer / 6) % 2 === 0;
        frameX = leg ? 176 : 264; // 88*2 or 132*2
      } else {
        // Idle blinking
        this.blinkTimer++;
        if (this.blinkTimer > 180) {
          this.isBlinking = true;
          if (this.blinkTimer > 195) {
            this.blinkTimer = 0;
            this.isBlinking = false;
          }
        }
        frameX = this.isBlinking ? 88 : 0; // 44*2 or 0
      }

      ctx.drawImage(
        trexImg,
        frameX,
        0,
        TREX_WIDTH * 2,
        TREX_HEIGHT * 2,
        TREX_X,
        Math.round(this.trexY),
        TREX_WIDTH,
        TREX_HEIGHT
      );
    }
  }

  public destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.rafId);
  }
}
