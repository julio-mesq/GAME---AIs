// Ponto de entrada: liga todos os módulos (mundo, jogador, carros, NPCs, armas, áudio, UI, escolhas, câmera).
import * as THREE from 'three';
import { criarMundo } from './src/world.js';
import { Jogador, teclas } from './src/player.js';
import { Carro } from './src/vehicles.js';
import { criarNPCs } from './src/npcs.js';
import { ARMAS } from './src/weapons.js';
import * as A from './src/audio.js';
import * as UI from './src/ui.js';
import * as Esc from './src/choices.js';
import { atualizarCamera } from './src/pov.js';
import * as FX from './src/effects.js';
import * as M from './src/missions.js';
import { criarClima } from './src/weather.js';

const cv = document.getElementById('c'), $ = id => document.getElementById(id);
const fraco = (navigator.hardwareConcurrency || 4) <= 4; // detecção de dispositivo fraco
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !fraco });
renderer.setPixelRatio(fraco ? 1 : Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); scene.fog = new THREE.Fog(0x87ceeb, 150, fraco ? 500 : 900);
const cam = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, .1, 1500);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });

const ceu = criarMundo(scene), jog = new Jogador(scene), npcs = criarNPCs(scene);
FX.iniciar(scene); M.iniciar(scene); const clima = criarClima(scene);
const cores = [0xff0000, 0x000000, 0xffffff, 0xffcc00, 0x1e90ff];
const carros = Array.from({ length: 12 }, (_, i) => {
  const h = i % 2, rua = (i % 5 - 2) * 100, livre = (Math.random() - .5) * 400;
  return i === 0 ? new Carro(scene, 0, 32, cores[0], 0) : new Carro(scene, h ? livre : rua, h ? rua : livre, cores[i % 5], h * Math.PI / 2);
});

let rodando = false, pov = 0, estrelas = 0, semCrime = 0, arma = 0, tiroT = 0, tempoDia = .25, buf = '', passoT = 0, lento = 0, reduzido = false, crime = 0;
const municao = ARMAS.map(a => a.mun);
$('vol').oninput = e => A.volume(e.target.value / 100);
$('menu').onclick = () => { cv.requestPointerLock?.(); rodando = true; $('menu').classList.add('off'); A.iniciar(); A.click(); };
document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement) { rodando = false; $('menu').classList.remove('off'); } });
addEventListener('mousemove', e => { if (document.pointerLockElement) { jog.yaw -= e.movementX * .0025; jog.pitch = Math.max(-1, Math.min(1, jog.pitch - e.movementY * .0025)); } });

addEventListener('keydown', e => {
  const k = e.code;
  buf = (buf + e.key).toLowerCase().slice(-7);
  if (buf === 'hesoyam') { jog.hp = 100; jog.dinheiro += 250000; UI.notificar('Cheat ativado!'); }
  if (k === 'Tab') e.preventDefault();
  if (!rodando) return;
  if (Esc.aberto()) { // diálogo aberto: 1-3 escolhem
    const o = /^Digit[1-3]$/.test(k) && Esc.escolher(+k.slice(5) - 1);
    if (o) { jog.dinheiro += o.d; if (o.e) { estrelas = Math.min(5, estrelas + o.e); semCrime = 0; } UI.notificar('Karma: ' + Esc.rotulo()); }
    return;
  }
  if (k === 'Tab') { UI.inventario(jog, ARMAS, municao, Esc.rotulo()); UI.alternar('inv'); }
  if (k === 'KeyM') UI.alternar('mapa');
  if (k === 'KeyK') UI.notificar(clima.alternar() ? 'Chuva ligada' : 'Chuva desligada');
  if (k === 'KeyP') document.body.classList.toggle('foto'); // modo foto: esconde o HUD
  if (k === 'KeyB' && jog.veiculo) { jog.veiculo.obj.children[0].material.color.setHex(cores[Math.random() * 5 | 0]); UI.notificar('Cor alterada'); }
  if (k === 'KeyV') { do pov = (pov + 1) % 5; while (pov === 4 && !jog.veiculo); }
  if (k === 'KeyR') { municao[arma] = ARMAS[arma].mun; A.click(); }
  if (/^Digit[1-6]$/.test(k)) { arma = +k.slice(5) - 1; A.click(); }
  if (k === 'KeyH' && jog.veiculo) A.buzina();
  if (k === 'KeyG' && !jog.veiculo && npcs.some(n => !n.policia && n.obj.position.distanceTo(jog.obj.position) < 6)) Esc.abrir();
  if (k === 'KeyE') {
    if (jog.veiculo) { const c = jog.veiculo, p = c.obj.position; jog.obj.position.set(p.x + Math.cos(c.yaw) * 3, 0, p.z - Math.sin(c.yaw) * 3); jog.yaw = c.yaw; jog.veiculo = null; }
    else { const c = carros.find(v => v.obj.position.distanceTo(jog.obj.position) < 8); if (c) jog.veiculo = c; }
    A.click();
  }
});

const ray = new THREE.Raycaster(), tmp = new THREE.Vector3();
function tracante(a, b) {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: 0xffff00 }));
  scene.add(l); setTimeout(() => { scene.remove(l); l.geometry.dispose(); }, 60);
}
function dano(n, v) { n.hp -= v; crime = Math.max(crime, n.policia ? 2 : 1); if (n.hp <= 0) { jog.dinheiro += 50; M.matou(); n.reset(); } }
function atirar(t) {
  const a = ARMAS[arma];
  if (jog.veiculo || t < tiroT + a.cad || municao[arma] <= 0) return;
  tiroT = t; municao[arma]--; A.tiro(arma); jog.pitch = Math.min(1, jog.pitch + .006 * (arma + 1)); // recuo
  ray.setFromCamera({ x: 0, y: 0 }, cam);
  const o = ray.ray.origin.clone(), ini = jog.obj.position.clone().setY(1.4);
  for (let p = 0; p < a.pel; p++) {
    const d = ray.ray.direction.clone().add(new THREE.Vector3(...[0, 0, 0].map(() => (Math.random() - .5) * a.esp))).normalize(), r = new THREE.Ray(o, d);
    let alvo = null, md = a.alc;
    for (const n of npcs) { tmp.copy(n.obj.position).setY(1.2); const di = tmp.distanceTo(o); if (di < md && r.distanceSqToPoint(tmp) < .5) { alvo = n; md = di; } }
    const fim = o.clone().addScaledVector(d, alvo ? md : Math.min(a.alc, 80));
    tracante(ini, fim);
    if (alvo) dano(alvo, a.dano);
    if (a.area) { FX.explodir(fim, a.area); A.tiro(5); }
    if (a.area) npcs.forEach(n => { if (n.obj.position.distanceTo(fim) < a.area) dano(n, 100); }); // foguete: dano em área
  }
  npcs.forEach(n => { if (n.obj.position.distanceTo(jog.obj.position) < 40) n.fuga = 4; });
  if (crime) { estrelas = Math.min(5, estrelas + crime); semCrime = 0; crime = 0; }
}

let ultimo = performance.now();
function loop(agora) {
  requestAnimationFrame(loop);
  const bruto = (agora - ultimo) / 1000, dt = Math.min(.05, bruto); ultimo = agora;
  if (!rodando) { A.motor(-1); A.sirene(false); return; }
  lento = bruto > 1 / 35 ? lento + bruto : Math.max(0, lento - bruto); // FPS baixo por 3 s => reduz qualidade
  if (lento > 3 && !reduzido) { reduzido = true; renderer.setPixelRatio(1); clima.reduzir(400); UI.notificar('Qualidade reduzida'); }
  tempoDia = (tempoDia + dt / 420) % 1;
  jog.atualizar(dt); carros.forEach(c => c.atualizar(dt, c === jog.veiculo));
  const alvo = jog.veiculo ? jog.veiculo.obj.position : jog.obj.position;
  let dn = 0; npcs.forEach(n => dn += n.atualizar(dt, alvo, estrelas)); jog.hp -= dn;
  carros.forEach(c => { // fumaça com pouca vida; explosão ao chegar a 0
    if (c.hp > 0 && c.hp < 20 && Math.random() < dt * 8) FX.fumaca(c.obj.position);
    if (c.hp <= 0) {
      FX.explodir(c.obj.position, 8); A.tiro(5); npcs.forEach(n => { if (n.obj.position.distanceTo(c.obj.position) < 8) dano(n, 100); });
      if (jog.veiculo === c) { jog.veiculo = null; jog.hp -= 50; jog.obj.position.set(c.obj.position.x + 3, 0, c.obj.position.z); }
      c.hp = 100; c.v = 0; c.yaw = 0; c.obj.position.set(Math.round((Math.random() * 2 - 1) * 5) * 100, 0, (Math.random() - .5) * 400); UI.notificar('Carro explodiu!');
    }
  });
  FX.atualizar(dt); clima.atualizar(dt, alvo);
  if (crime) { estrelas = Math.min(5, estrelas + crime); semCrime = 0; crime = 0; }
  const rm = M.atualizar(jog, estrelas);
  if (rm) { UI.notificar('Missão concluída! +$' + rm.recompensa); if (rm.fim) Esc.final(); }
  $('missao').textContent = M.texto();
  semCrime += dt; if (estrelas > 0 && semCrime > 20) { estrelas--; semCrime = 0; }
  if (jog.hp <= 0) { jog.hp = 100; estrelas = 0; jog.veiculo = null; jog.obj.position.set(6, 0, 30); UI.notificar('Você morreu'); }
  if (teclas.KeyF) atirar(agora / 1000);
  if (!jog.veiculo && (teclas.KeyW || teclas.KeyA || teclas.KeyS || teclas.KeyD) && jog.obj.position.y === 0 && (passoT += dt) > (teclas.ShiftLeft ? .28 : .45)) { passoT = 0; A.passo(); }
  A.motor(jog.veiculo ? Math.abs(jog.veiculo.v) : -1); A.sirene(estrelas > 0);
  jog.obj.visible = !jog.veiculo && pov !== 1;
  atualizarCamera(cam, agora, dt, jog, pov); ceu(tempoDia, alvo);
  UI.hud(jog, estrelas, ARMAS[arma], municao[arma], Esc.rotulo()); UI.mapas(jog, npcs, carros, M.atual());
  renderer.render(scene, cam);
}
requestAnimationFrame(loop);
