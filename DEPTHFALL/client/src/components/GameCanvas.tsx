import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { DepthfallScene, SceneCallbacks } from '../game/DepthfallScene';

interface GameCanvasProps extends SceneCallbacks {}

export function GameCanvas(props: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const callbacksRef = useRef<SceneCallbacks>(props);

  const syncCallbacksToScene = (game: Phaser.Game): boolean => {
    const scene = game.scene.keys['Depthfall'] as DepthfallScene | undefined;
    if (!scene) return false;
    scene.updateCallbacks(callbacksRef.current);
    return true;
  };

  useEffect(() => {
    callbacksRef.current = props;
    if (gameRef.current) syncCallbacksToScene(gameRef.current);
  }, [props.onUpdateUI, props.onGameOver, props.onEnding]);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerRef.current,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: true // enable physics debug boxes for troubleshooting
        }
      },
      scene: [DepthfallScene]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    const sceneSyncInterval = window.setInterval(() => {
      if (syncCallbacksToScene(game)) {
        window.clearInterval(sceneSyncInterval);
      }
    }, 50);

    game.events.once('ready', () => {
      syncCallbacksToScene(game);
    });

    const handleResize = () => {
      game.scale.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.clearInterval(sceneSyncInterval);
      window.removeEventListener('resize', handleResize);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full absolute inset-0 z-0 bg-black" />;
}
