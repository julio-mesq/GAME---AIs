// 6 armas: dano, cadência (s), munição, espalhamento, projéteis por tiro, alcance (m), raio de explosão
export const ARMAS = [
  { n: 'Pistola', dano: 50, cad: .35, mun: 12, esp: .01, pel: 1, alc: 80 },
  { n: 'SMG', dano: 25, cad: .08, mun: 30, esp: .03, pel: 1, alc: 70 },
  { n: 'Rifle', dano: 34, cad: .13, mun: 30, esp: .015, pel: 1, alc: 120 },
  { n: 'Shotgun', dano: 30, cad: .9, mun: 6, esp: .08, pel: 8, alc: 35 },
  { n: 'Sniper', dano: 100, cad: 1.2, mun: 5, esp: 0, pel: 1, alc: 300 },
  { n: 'Lança-foguetes', dano: 100, cad: 1.5, mun: 2, esp: 0, pel: 1, alc: 150, area: 8 }
];
