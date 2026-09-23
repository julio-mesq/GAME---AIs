// Missão principal em 4 etapas (marcador amarelo + mapa). Ao final, um dos 3 finais conforme o karma.
import * as THREE from 'three';
const MISSOES = [
  { t: 'Vá até o marcador amarelo', x: 200, z: -100, tipo: 'ir', r: 6, d: 300 },
  { t: 'Dirija um carro até o marcador', x: -300, z: 300, tipo: 'carro', r: 8, d: 500 },
  { t: 'Elimine 5 pessoas', tipo: 'matar', n: 5, d: 800 },
  { t: 'Chegue ao marcador com 2+ estrelas', x: 0, z: -600, tipo: 'ir', r: 8, d: 1500, est: 2 }
];
let i = 0, mortes = 0, farol;
function posicionar() { const m = MISSOES[i]; farol.visible = !!m && m.x !== undefined; if (farol.visible) farol.position.set(m.x, 40, m.z); }
export function iniciar(scene) {
  farol = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 80, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: .35, side: THREE.DoubleSide }));
  scene.add(farol); posicionar();
}
export const matou = () => { if (MISSOES[i]?.tipo === 'matar') mortes++; };
export const atual = () => MISSOES[i];
export const texto = () => { const m = MISSOES[i]; return m ? 'Missão: ' + m.t + (m.tipo === 'matar' ? ` (${mortes}/${m.n})` : '') : 'Missão principal concluída'; };
export function atualizar(jog, est) {
  const m = MISSOES[i]; if (!m) return null;
  const p = jog.veiculo ? jog.veiculo.obj.position : jog.obj.position, perto = m.x !== undefined && Math.hypot(p.x - m.x, p.z - m.z) < m.r;
  const ok = m.tipo === 'ir' ? perto && (!m.est || est >= m.est) : m.tipo === 'carro' ? perto && !!jog.veiculo : mortes >= m.n;
  if (!ok) return null;
  jog.dinheiro += m.d; i++; mortes = 0; posicionar(); return { recompensa: m.d, fim: !MISSOES[i] };
}
