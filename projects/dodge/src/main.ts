import kaplay from 'kaplay';

// `global: false` keeps all helpers on `k` (no global pollution, TS-friendly).
const k = kaplay({
  background: [11, 11, 15],
  global: false,
  pixelDensity: Math.min(window.devicePixelRatio || 1, 2),
});

k.scene('game', () => {
  const PLAYER = 46;
  const player = k.add([
    k.rect(PLAYER, PLAYER, { radius: 6 }),
    k.pos(k.width() / 2, k.height() - 80),
    k.area(),
    k.anchor('center'),
    k.color(236, 236, 238),
  ]);

  const SPEED = 380;
  k.onKeyDown('left', () => player.move(-SPEED, 0));
  k.onKeyDown('a', () => player.move(-SPEED, 0));
  k.onKeyDown('right', () => player.move(SPEED, 0));
  k.onKeyDown('d', () => player.move(SPEED, 0));
  k.onMouseMove((pos) => {
    player.pos.x = pos.x;
  });
  player.onUpdate(() => {
    player.pos.x = k.clamp(player.pos.x, PLAYER / 2, k.width() - PLAYER / 2);
  });

  let elapsed = 0;
  const score = k.add([k.text('0', { size: 28 }), k.pos(18, 16)]);
  const hint = k.add([
    k.text('dodge the blocks — move with mouse / arrows', { size: 16 }),
    k.pos(18, k.height() - 30),
    k.color(122, 122, 133),
  ]);
  k.wait(3, () => k.destroy(hint));

  k.onUpdate(() => {
    elapsed += k.dt();
    score.text = Math.floor(elapsed).toString();
  });

  let gap = 0.85;
  function spawn() {
    k.add([
      k.rect(30, 30),
      k.pos(k.rand(20, k.width() - 20), -30),
      k.area(),
      k.anchor('center'),
      k.color(192, 57, 43),
      k.move(k.DOWN, k.rand(200, 360)),
      k.offscreen({ destroy: true }),
      'block',
    ]);
    gap = Math.max(0.32, gap - 0.012);
    k.wait(k.rand(gap * 0.6, gap), spawn);
  }
  spawn();

  player.onCollide('block', () => {
    k.addKaboom(player.pos);
    k.shake(8);
    k.go('over', Math.floor(elapsed));
  });
});

k.scene('over', (finalScore: number) => {
  k.add([
    k.text(`game over\nlasted ${finalScore}s\n\nclick / space to retry`, {
      size: 30,
      align: 'center',
    }),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor('center'),
    k.color(236, 236, 238),
  ]);
  k.onClick(() => k.go('game'));
  k.onKeyPress('space', () => k.go('game'));
});

k.go('game');
