// Interface: HUD, minimapa, mapa grande (M), inventário (Tab) e notificações.
import * as A from './audio.js';
const $ = id => document.getElementById(id); let tn;
export function hud(j, est, a, mun, karma) {
  $('hp').style.width = Math.max(0, j.hp) + '%'; $('st').style.width = j.st + '%';
  $('money').textContent = '$' + j.dinheiro + '  ' + karma; $('stars').textContent = '★'.repeat(est);
  $('info').textContent = j.veiculo ? Math.round(Math.abs(j.veiculo.v) * 3.6) + ' km/h' : a.n + ' ' + mun + '/' + a.mun;
}
export function notificar(t) { const e = $('nt'); e.textContent = t; e.classList.add('on'); A.notif(); clearTimeout(tn); tn = setTimeout(() => e.classList.remove('on'), 2500); }
export const alternar = id => $(id).classList.toggle('on');
export function inventario(j, arm, m, k) {
  $('inv').innerHTML = '<h3>Inventário</h3>' + arm.map((a, i) => `<div>[${i + 1}] ${a.n} — ${m[i]}/${a.mun}</div>`).join('') + `<div>Dinheiro: $${j.dinheiro}</div><div>Karma: ${k}</div>`;
}
function desenhar(cv, esc, cx, cz, jog, npcs, carros, m) { // esc = pixels por metro; NPC verde, policial vermelho
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.fillStyle = '#1b2630'; c.fillRect(0, 0, w, h); c.strokeStyle = '#4b5b68'; c.lineWidth = Math.max(2, 14 * esc); c.beginPath();
  for (let k = -10; k <= 10; k++) { const sx = w / 2 + (k * 100 - cx) * esc, sz = h / 2 + (k * 100 - cz) * esc; c.moveTo(sx, 0); c.lineTo(sx, h); c.moveTo(0, sz); c.lineTo(w, sz); }
  c.stroke();
  const pt = (x, z, cor, r) => { c.fillStyle = cor; c.beginPath(); c.arc(w / 2 + (x - cx) * esc, h / 2 + (z - cz) * esc, r, 0, 7); c.fill(); };
  carros.forEach(k => pt(k.obj.position.x, k.obj.position.z, '#ffcc00', 3));
  npcs.forEach(n => pt(n.obj.position.x, n.obj.position.z, n.policia ? '#e74c3c' : '#2ecc71', 3));
  if (m && m.x !== undefined) pt(m.x, m.z, '#00e5ff', 7); // marcador da missão
  const p = (jog.veiculo ? jog.veiculo.obj : jog.obj).position; pt(p.x, p.z, '#fff', 5);
}
export function mapas(jog, npcs, carros, m) {
  const p = (jog.veiculo ? jog.veiculo.obj : jog.obj).position;
  desenhar($('mini'), .8, p.x, p.z, jog, npcs, carros, m);
  if ($('mapa').classList.contains('on')) desenhar($('mapa'), .35, 0, 0, jog, npcs, carros, m);
}
