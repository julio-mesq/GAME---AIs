// Áudio procedural com Web Audio API: não precisa de arquivos .mp3, então nunca dá erro 404 no GitHub Pages.
let ctx, mestre, musG, sfxG, nivel = .6, mo, si;
export function iniciar() { // precisa ser chamado após um clique do jogador
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    mestre = ctx.createGain(); mestre.gain.value = nivel; mestre.connect(ctx.destination);
    musG = ctx.createGain(); musG.gain.value = .5; musG.connect(mestre);
    sfxG = ctx.createGain(); sfxG.connect(mestre);
    const nt = [220, 262, 330, 392, 330, 262, 196, 262]; let i = 0; // música ambiente em loop
    setInterval(() => { tom(nt[i % 8], .6, .08, 'triangle', musG); if (i % 4 === 0) tom(nt[i % 8] / 2, 1.6, .1, 'sine', musG); i++; }, 450);
  }
  ctx.resume();
}
export const volume = v => { nivel = v; if (mestre) mestre.gain.value = v; };
function tom(f, d, v, t = 'sine', dest = sfxG, atraso = 0) {
  if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(), s = ctx.currentTime + atraso;
  o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, s); g.gain.exponentialRampToValueAtTime(.0001, s + d);
  o.connect(g); g.connect(dest); o.start(s); o.stop(s + d);
}
function ruido(d, f, v) {
  if (!ctx) return; const n = ctx.sampleRate * d | 0, b = ctx.createBuffer(1, n, ctx.sampleRate), x = b.getChannelData(0);
  for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; fl.type = 'lowpass'; fl.frequency.value = f; g.gain.value = v; s.connect(fl); fl.connect(g); g.connect(sfxG); s.start();
}
const SONS = [[.12, 3000, .5], [.07, 4000, .35], [.15, 2000, .6], [.3, 1200, .9], [.4, 900, 1], [.6, 400, 1]]; // um por arma
export const tiro = i => ruido(...SONS[i]);
export const passo = () => ruido(.06, 500, .15);
export const buzina = () => { tom(420, .4, .2, 'square'); tom(520, .4, .15, 'square'); };
export const click = () => tom(800, .05, .15);
export const notif = () => { tom(660, .1, .2); tom(880, .15, .2, 'sine', sfxG, .1); };
export function motor(v) { // v < 0 = desligado
  if (!ctx) return;
  if (v < 0) { if (mo) { mo.stop(); mo = null; } return; }
  if (!mo) { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sawtooth'; g.gain.value = .05; o.connect(g); g.connect(sfxG); o.start(); mo = o; }
  mo.frequency.value = 40 + v * 4;
}
export function sirene(on) {
  if (!ctx) return;
  if (!on) { if (si) { si.stop(); si = null; } return; }
  if (si) return;
  const o = ctx.createOscillator(), l = ctx.createOscillator(), lg = ctx.createGain(), g = ctx.createGain();
  o.type = 'square'; o.frequency.value = 800; l.frequency.value = 1.2; lg.gain.value = 250; g.gain.value = .04;
  l.connect(lg); lg.connect(o.frequency); o.connect(g); g.connect(sfxG); o.start(); l.start();
  si = { stop() { o.stop(); l.stop(); } };
}
