import Phaser from 'phaser';

export interface GameState {
  depth: number;
  oxygen: number;
}

export interface SceneCallbacks {
  onUpdateUI: (state: GameState) => void;
  onGameOver: (depth: number, reason: string) => void;
  onEnding: (depth: number) => void;
}

export class DepthfallScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key, A: Phaser.Input.Keyboard.Key, S: Phaser.Input.Keyboard.Key, D: Phaser.Input.Keyboard.Key };
  
  private oxygen: number = 100;
  private isDead: boolean = false;
  private callbacks: SceneCallbacks = {
    onUpdateUI: () => {},
    onGameOver: () => {},
    onEnding: () => {},
  };
  
  private playerLight!: Phaser.GameObjects.Light;
  private pressureOverlay!: Phaser.GameObjects.Rectangle;
  private snowEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;
  
  private jellyfishGroup!: Phaser.Physics.Arcade.Group;
  private octopus!: Phaser.Physics.Arcade.Sprite;
  
  private treasure!: Phaser.Physics.Arcade.Sprite;
  private timeSinceLastUI: number = 0;
  private ambientAudioLoaded: boolean = false;
  private collisionAudioLoaded: boolean = false;
  private readonly startY: number = 100;

  constructor() {
    super('Depthfall');
  }

  init(data?: SceneCallbacks) {
    if (data) this.callbacks = data;
    this.oxygen = 100;
    this.isDead = false;
    this.timeSinceLastUI = 0;
    this.ambientAudioLoaded = false;
    this.collisionAudioLoaded = false;
  }

  updateCallbacks(data: SceneCallbacks) {
    this.callbacks = data;
    this.pushUiUpdate();
  }

  private getDepthMeters(): number {
    if (!this.player) return 0;
    return Math.max(0, Math.floor(this.player.y - this.startY));
  }

  private pushUiUpdate() {
    const state = {
      depth: this.getDepthMeters(),
      oxygen: Math.max(0, this.oxygen),
    };
    this.callbacks.onUpdateUI(state);
  }

  preload() {
    this.load.audio('collision', 'assets/faAAAHh-edited-2026-02-27T08-59-45.wav');
    this.load.audio('death', 'assets/tehelka_omelet_yeh_leh.mp3');

    // Snow particle for water effect
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.clear();
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(2, 2, 2);
    g.generateTexture('snow', 4, 4);

    // EXACT FILE NAMES BASED ON YOUR DOWNLOADS
    this.load.image('diver', 'assets/scuba.png');
    this.load.image('jellyfish', 'assets/octupus.png'); 
    this.load.image('octopus', 'assets/angerfish.png'); 
    this.load.image('treasure', 'assets/tressure.png');
    
    // NEW BACKGROUND IMAGE
    this.load.image('ocean_bg', 'assets/ocean_bg.jpg');
  }

  create() {
    this.physics.world.setBounds(0, 0, 3000, 4000);
    this.lights.enable().setAmbientColor(0x334455);

    this.ambientAudioLoaded = this.cache.audio.exists('ambient');
    this.collisionAudioLoaded = this.cache.audio.exists('collision');

    try {
      if (this.ambientAudioLoaded) {
        this.sound.play('ambient', { loop: true, volume: 0.5 });
      }
    } catch (e) {}
    
    // YEH RAHI TUMHARI REPEATING BACKGROUND!
    // TileSprite se background poore 3000 width aur 4000 height tak repeat hoga bina black screen laye.
    const bg = this.add.tileSprite(1500, 2000, 3000, 4000, 'ocean_bg').setDepth(-100);
    bg.setPipeline('Light2D');
    // Darker tint thoda add kar diya so lights zyada glow karein
    bg.setTint(0x444455);

    // Player setup
    this.player = this.physics.add.sprite(1500, this.startY, 'diver');
    this.player.setDisplaySize(50, 50); 
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.01);
    this.player.setMaxVelocity(200, 250);
    this.player.setPipeline('Light2D');
    
    this.playerLight = this.lights.addLight(1500, 100, 300, 0x00ffff, 1.5);
    
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    }) as any;

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setBounds(0, 0, 3000, 4000);

    this.snowEmitter = this.add.particles(0, 0, 'snow', {
      x: { min: -1500, max: 1500 },
      y: { min: -1000, max: 1500 },
      lifespan: 6000,
      speedY: { min: -10, max: -30 },
      speedX: { min: -15, max: 15 },
      scale: { min: 0.5, max: 1.5 },
      alpha: { start: 0.6, end: 0 },
      quantity: 3,
      blendMode: 'ADD'
    }).setDepth(-10);
    this.snowEmitter.startFollow(this.player);

    this.pressureOverlay = this.add.rectangle(0, 0, 4000, 4000, 0xff0000, 0).setScrollFactor(0).setDepth(100);

    this.spawnEntities();
    this.pushUiUpdate();
  }

  private spawnEntities() {
    this.jellyfishGroup = this.physics.add.group();
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(100, 2900);
      const y = Phaser.Math.Between(300, 3500);
      const jelly = this.jellyfishGroup.create(x, y, 'jellyfish') as Phaser.Physics.Arcade.Sprite;
      jelly.setDisplaySize(40, 40); 
      jelly.setPipeline('Light2D');
      jelly.setData('startY', y);
      jelly.setData('offset', Phaser.Math.Between(0, 100));
      jelly.setData('drift', Phaser.Math.Between(10, 22));
      this.lights.addLight(x, y, 100, 0x00ff00, 0.5); 
    }

    // Big Enemy (Angerfish) spawn
    this.octopus = this.physics.add.sprite(1500, 2000, 'octopus');
    this.octopus.setDisplaySize(100, 100); 
    this.octopus.setPipeline('Light2D');
    this.lights.addLight(this.octopus.x, this.octopus.y, 150, 0x00ff00, 1); 
    
    // Treasure spawn
    this.treasure = this.physics.add.sprite(1500, 3950, 'treasure');
    this.treasure.setDisplaySize(120, 100);
    this.treasure.setImmovable(true);
    this.treasure.setPipeline('Light2D');
    this.lights.addLight(this.treasure.x, this.treasure.y, 250, 0xFFD700, 2.5);

    // Collisions
    this.physics.add.overlap(this.player, this.jellyfishGroup, () => this.handleDamage(10), undefined, this);
    this.physics.add.overlap(this.player, this.octopus, () => this.handleDamage(30), undefined, this); 
    this.physics.add.overlap(this.player, this.treasure, this.triggerEnding, undefined, this);
  }

  private handleDamage(amount: number) {
    if (this.isDead) return;
    this.oxygen = Math.max(0, this.oxygen - amount);
    this.pushUiUpdate();
    
    if (this.oxygen <= 0) {
      this.die('Eaten by Sea Creatures / Out of Oxygen');
      return;
    }
    
    this.cameras.main.shake(200, 0.01);
    this.cameras.main.flash(100, 255, 0, 0, true);
    
    try {
      if (this.collisionAudioLoaded) {
        this.sound.play('collision', { volume: 0.7 });
      }
    } catch (e) {}

    this.player.setVelocity(Phaser.Math.Between(-150, 150), -200); 
  }

  private triggerEnding() {
    if (this.isDead) return;
    this.isDead = true;
    this.physics.pause();
    this.snowEmitter.pause();
    
    this.cameras.main.flash(1000, 255, 215, 0); 
    
    setTimeout(() => {
      this.cameras.main.fadeOut(2000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.callbacks.onEnding(this.getDepthMeters());
      });
    }, 1500);
  }

  private die(reason: string) {
    if (this.isDead) return;
    this.isDead = true;
    this.physics.pause();
    this.player.setTint(0xff0000);
    try {
      if (this.cache.audio.exists('death')) {
        this.sound.play('death', { volume: 0.8 });
      }
    } catch (e) {}
    this.cameras.main.fadeOut(2000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.callbacks.onGameOver(this.getDepthMeters(), reason);
    });
  }

  update(time: number, delta: number) {
    if (this.isDead) return;

    const depth = this.getDepthMeters();
    
    this.oxygen -= delta * 0.001 * (1 + depth / 2000);
    if (this.oxygen <= 0) {
      this.oxygen = 0;
      this.pushUiUpdate();
      this.die('Suffocation');
      return;
    }

    const accel = 400;
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.player.setAccelerationX(-accel);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.player.setAccelerationX(accel);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      this.player.setAccelerationY(-accel * 0.8);
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      this.player.setAccelerationY(accel * 1.2);
    } else {
      this.player.setAccelerationY(100);
    }

    this.playerLight.x = this.player.x;
    this.playerLight.y = this.player.y;

    const ambientR = Math.max(5, 51 - (depth / 4000) * 51);
    const ambientG = Math.max(5, 68 - (depth / 4000) * 68);
    const ambientB = Math.max(10, 85 - (depth / 4000) * 85);
    this.lights.setAmbientColor(Phaser.Display.Color.GetColor(ambientR, ambientG, ambientB));

    if (depth > 1500) {
      const intensity = (depth - 1500) / 2500;
      this.pressureOverlay.alpha = (Math.sin(time / 200) * 0.5 + 0.5) * intensity * 0.3;
    } else {
      this.pressureOverlay.alpha = 0;
    }

    const difficulty = Phaser.Math.Clamp(1 + depth / 900, 1, 4.5);
    this.jellyfishGroup.children.iterate((c) => {
      const jelly = c as Phaser.Physics.Arcade.Sprite;
      const offset = jelly.getData('offset');
      const drift = jelly.getData('drift') as number;
      jelly.setVelocityY(Math.sin((time + offset) / 500) * 30 * difficulty);
      jelly.setVelocityX(Math.cos((time + offset) / 700) * drift * difficulty);
      return true;
    });

    // Big Enemy AI
    if (depth > 500) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.octopus.x, this.octopus.y);
      const aggroRange = 800; 
      if (dist < aggroRange) {
        const speed = 35 * difficulty; 
        this.physics.moveToObject(this.octopus, this.player, speed);
      } else {
        this.octopus.setVelocity(0, 0);
        if (Math.random() < 0.003 * difficulty) {
          this.octopus.setPosition(this.player.x + Phaser.Math.Between(-600, 600), this.player.y - 400);
        }
      }
    }

    this.timeSinceLastUI += delta;
    if (this.timeSinceLastUI > 100) {
      this.pushUiUpdate();
      this.timeSinceLastUI = 0;
    }
  }
}