// Sistema de escolhas (G perto de um NPC). Karma e histórico salvos em localStorage, com fallback em memória.
const K = { karma: 0, hist: [] }, el = () => document.getElementById('escolha'); let aberta = false;
try { Object.assign(K, JSON.parse(localStorage.getItem('gta_escolhas') || '{}')); } catch (e) { /* sem localStorage: usa memória */ }
const salvar = () => { try { localStorage.setItem('gta_escolhas', JSON.stringify(K)); } catch (e) { /* ignora */ } };
export const OPCOES = [{ t: 'Ajudar o estranho', k: 10, d: 0, e: 0 }, { t: 'Ignorar', k: 0, d: 0, e: 0 }, { t: 'Roubar', k: -15, d: 100, e: 1 }];
export const aberto = () => aberta;
export const rotulo = () => K.karma >= 20 ? '😇 Bom' : K.karma <= -20 ? '😈 Mau' : '😐 Neutro';
export function abrir() {
  aberta = true; el().innerHTML = '<h3>Um estranho pede ajuda…</h3>' + OPCOES.map((o, i) => `<button>[${i + 1}] ${o.t}</button>`).join(''); el().classList.add('on');
}
export function escolher(i) {
  const o = OPCOES[i]; if (!o) return null;
  aberta = false; el().classList.remove('on'); K.karma += o.k; K.hist = [...K.hist, o.t].slice(-50); salvar(); return o;
}
// Um de 3 finais (Bom / Neutro / Mau) conforme o karma
export function final() {
  const r = rotulo(), t = r.includes('Bom') ? 'Você virou o herói da cidade.' : r.includes('Mau') ? 'O crime dominou a cidade e seu nome virou lenda.' : 'Você seguiu seu próprio caminho, sem lado nenhum.';
  el().innerHTML = `<h2>FIM — Final ${r}</h2><p>${t}</p>`; el().classList.add('on'); setTimeout(() => el().classList.remove('on'), 9000);
}
