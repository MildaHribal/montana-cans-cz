/**
 * Typed photo manifest for the whole site.
 *
 * Every photo lives in `public/photos/<folder>/<nn>.webp` and is sourced from
 * Pexels (Pexels License — free for commercial use, no attribution required).
 *
 * `src` is always PUBLIC-RELATIVE. Callers must wrap it themselves:
 *
 *   import { asset } from '@/lib/basePath';
 *   import { WALLS, photo } from '@/lib/photos';
 *   <img src={asset(photo(WALLS, i).src)} alt={photo(WALLS, i).alt} />
 *
 * Never hardcode a "/photos/..." string in a component — add it here instead.
 */

export type Photo = {
  /** Public-relative path, e.g. "/photos/wall/01.webp". Wrap in `asset()`. */
  src: string;
  /** Intrinsic width in px. */
  w: number;
  /** Intrinsic height in px. */
  h: number;
  /** Czech alt text. Empty string = purely decorative. */
  alt: string;
};

/* -------------------------------------------------------------------------- */
/* WALLS — 1920x1080 graffiti + raw concrete textures for dark section backgrounds */
/* -------------------------------------------------------------------------- */

export const WALLS: Photo[] = [
  { src: '/photos/wall/01.webp', w: 1920, h: 1080, alt: 'Úzká ulička s graffiti od země až po střechu, v dálce svítí lampa' },
  { src: '/photos/wall/02.webp', w: 1920, h: 1080, alt: 'Vybydlený interiér pokrytý tagy a graffiti po všech stěnách' },
  { src: '/photos/wall/03.webp', w: 1920, h: 1080, alt: 'Slepá ulička s modrou nasprejovanou postavou na zdi' },
  { src: '/photos/wall/04.webp', w: 1920, h: 1080, alt: 'Dlouhá betonová zeď posetá vrstvami tagů a pieců' },
  { src: '/photos/wall/05.webp', w: 1920, h: 1080, alt: 'Průchod mezi domy s barevným graffiti na obou stěnách' },
  { src: '/photos/wall/06.webp', w: 1920, h: 1080, alt: 'Šedá betonová zeď s vybledlým graffiti podél chodníku' },
  { src: '/photos/wall/07.webp', w: 1920, h: 1080, alt: 'Lisabonská ulička s barevnými pieces po obou stranách' },
  { src: '/photos/wall/08.webp', w: 1920, h: 1080, alt: 'Zeď hustě popsaná tagy nad mokrým chodníkem' },
  { src: '/photos/wall/09.webp', w: 1920, h: 1080, alt: 'Betonové schodiště pokryté černými tagy' },
  { src: '/photos/wall/10.webp', w: 1920, h: 1080, alt: 'Bílá cihlová zeď s černými tagy a nasprejovanými nápisy' },
  { src: '/photos/wall/11.webp', w: 1920, h: 1080, alt: 'Podchod s graffiti po celé délce obou stěn' },
  { src: '/photos/wall/12.webp', w: 1920, h: 1080, alt: 'Modré a černé graffiti na obkladu moderní budovy' },
  { src: '/photos/wall/13.webp', w: 1920, h: 1080, alt: 'Žlutá zeď se stříbrným wildstyle kouskem' },
  { src: '/photos/wall/14.webp', w: 1920, h: 1080, alt: 'Zdivo opuštěné budovy s nasprejovaným nápisem a tagy' },
  { src: '/photos/wall/15.webp', w: 1920, h: 1080, alt: 'Dvorek pomalovaný graffiti s kbelíky a plechovkami barvy' },
  { src: '/photos/wall/16.webp', w: 1920, h: 1080, alt: 'Holá šedá betonová zeď se skvrnami a stopami po bednění' },
];

/* -------------------------------------------------------------------------- */
/* HERO — 2400x1200 dramatic wide shots to sit behind a headline               */
/* -------------------------------------------------------------------------- */

export const HERO: Photo[] = [
  { src: '/photos/hero/01.webp', w: 2400, h: 1200, alt: 'Noční ulička s graffiti na obou stěnách a světlem v dálce' },
  { src: '/photos/hero/02.webp', w: 2400, h: 1200, alt: 'Betonový podjezd s pilíři pomalovanými graffiti' },
  { src: '/photos/hero/03.webp', w: 2400, h: 1200, alt: 'Rozmazaná postava procházející v noci kolem popsané rolety' },
  { src: '/photos/hero/04.webp', w: 2400, h: 1200, alt: 'Ulička pod železničním mostem s pieces na obou zdech' },
];

/* -------------------------------------------------------------------------- */
/* GOODS — 1200x1200 product-ish shots: spreje, markery, rukavice, blackbooky  */
/* -------------------------------------------------------------------------- */

export const GOODS: Photo[] = [
  { src: '/photos/goods/01.webp', w: 1200, h: 1200, alt: 'Barevné spreje naskládané vedle sebe, pohled shora na víčka' },
  { src: '/photos/goods/02.webp', w: 1200, h: 1200, alt: 'Použité spreje seřazené v regálu, pohled shora' },
  { src: '/photos/goods/03.webp', w: 1200, h: 1200, alt: 'Hromada odložených sprejů se zaschlou barvou' },
  { src: '/photos/goods/04.webp', w: 1200, h: 1200, alt: 'Prázdné spreje pohozené na pomalované zemi' },
  { src: '/photos/goods/05.webp', w: 1200, h: 1200, alt: 'Tmavá bedna plná sprejů, pohled shora' },
  { src: '/photos/goods/06.webp', w: 1200, h: 1200, alt: 'Kartonová krabice se spreji ušpiněnými od barvy' },
  { src: '/photos/goods/07.webp', w: 1200, h: 1200, alt: 'Detail tyrkysových a lososových sprejů se zaschlou barvou' },
  { src: '/photos/goods/08.webp', w: 1200, h: 1200, alt: 'Detail spreje se žlutým víčkem a nasazeným nástavcem' },
  { src: '/photos/goods/09.webp', w: 1200, h: 1200, alt: 'Makro detail trysky spreje' },
  { src: '/photos/goods/10.webp', w: 1200, h: 1200, alt: 'Tři černé spreje stojící na betonu' },
  { src: '/photos/goods/11.webp', w: 1200, h: 1200, alt: 'Odhozené spreje a hadr od barvy na betonovém okraji' },
  { src: '/photos/goods/12.webp', w: 1200, h: 1200, alt: 'Růžový sprej ležící na asfaltu s ostrým stínem' },
  { src: '/photos/goods/13.webp', w: 1200, h: 1200, alt: 'Spreje postavené na chodníku vedle zdi' },
  { src: '/photos/goods/14.webp', w: 1200, h: 1200, alt: 'Spreje a paleta s barvou položené na dlažbě' },
  { src: '/photos/goods/15.webp', w: 1200, h: 1200, alt: 'Použitý sprej vedle modré skvrny barvy na zemi' },
  { src: '/photos/goods/16.webp', w: 1200, h: 1200, alt: 'Prázdné spreje pohozené ve spadaném listí' },
  { src: '/photos/goods/17.webp', w: 1200, h: 1200, alt: 'Spreje a nástavce rozložené na černé plachtě' },
  { src: '/photos/goods/18.webp', w: 1200, h: 1200, alt: 'Hromada paint markerů a popisovačů na stole' },
  { src: '/photos/goods/19.webp', w: 1200, h: 1200, alt: 'Barevná víčka popisovačů naskládaná těsně vedle sebe' },
  { src: '/photos/goods/20.webp', w: 1200, h: 1200, alt: 'Sada tenkých markerů zastrčená v kapse džínů' },
  { src: '/photos/goods/21.webp', w: 1200, h: 1200, alt: 'Ruka držící několik paint markerů nad papírem' },
  { src: '/photos/goods/22.webp', w: 1200, h: 1200, alt: 'Pracovní rukavice zašpiněná od barvy' },
  { src: '/photos/goods/23.webp', w: 1200, h: 1200, alt: 'Pár žluto-červených pracovních rukavic' },
  { src: '/photos/goods/24.webp', w: 1200, h: 1200, alt: 'Otevřený blackbook se skicami očí' },
  { src: '/photos/goods/25.webp', w: 1200, h: 1200, alt: 'Ruka skicující portréty tužkou do blackbooku' },
  { src: '/photos/goods/26.webp', w: 1200, h: 1200, alt: 'Dvě mikiny s kapucí zezadu, černá a smetanová' },
  { src: '/photos/goods/27.webp', w: 1200, h: 1200, alt: 'Černá mikina s kapucí zezadu na šedém pozadí' },
  { src: '/photos/goods/28.webp', w: 1200, h: 1200, alt: 'Postava v černé mikině a šedých kalhotách zezadu' },
];

/* -------------------------------------------------------------------------- */
/* EDITORIAL — 1600x1066 reportáž: writeři při práci                           */
/* -------------------------------------------------------------------------- */

export const EDITORIAL: Photo[] = [
  { src: '/photos/editorial/01.webp', w: 1600, h: 1066, alt: 'Ruka se sprejem dokresluje modrozelený kus na zdi' },
  { src: '/photos/editorial/02.webp', w: 1600, h: 1066, alt: 'Tetovaná ruka sprejuje růžovou barvu na pomalovanou zeď' },
  { src: '/photos/editorial/03.webp', w: 1600, h: 1066, alt: 'Ruka nanáší svítivě zelenou výplň spreje na zeď' },
  { src: '/photos/editorial/04.webp', w: 1600, h: 1066, alt: 'Černobílý detail ruky v rukavici se sprejem u čerstvého tagu' },
  { src: '/photos/editorial/05.webp', w: 1600, h: 1066, alt: 'Ruka v rukavici sprejuje v noci, ozářená modrým světlem' },
  { src: '/photos/editorial/06.webp', w: 1600, h: 1066, alt: 'Writer v kapuci píše červený tag na betonový sloup' },
  { src: '/photos/editorial/07.webp', w: 1600, h: 1066, alt: 'Writer v šedé mikině sprejuje sloup v prázdných garážích' },
  { src: '/photos/editorial/08.webp', w: 1600, h: 1066, alt: 'Writer v kšiltovce vyplňuje žlutý kus pod mostem' },
  { src: '/photos/editorial/09.webp', w: 1600, h: 1066, alt: 'Pohled zdola na writera dokončujícího zelený tag na červené zdi' },
  { src: '/photos/editorial/10.webp', w: 1600, h: 1066, alt: 'Ruce chystají sprej nad rozloženými nástavci' },
  { src: '/photos/editorial/11.webp', w: 1600, h: 1066, alt: 'Ruce držící pomalovaný blackbook plný tagů' },
  { src: '/photos/editorial/12.webp', w: 1600, h: 1066, alt: 'Dva writeři na štaflích malují žlutý kus na roletu' },
];

/** 900x1350 portrétní ořezy pěti nejlepších editorial fotek. */
export const EDITORIAL_PORTRAIT: Photo[] = [
  { src: '/photos/editorial/p01.webp', w: 900, h: 1350, alt: 'Ruka v rukavici sprejuje v noci pod modrým světlem' },
  { src: '/photos/editorial/p02.webp', w: 900, h: 1350, alt: 'Writer dokončuje zelený tag na červené zdi, pohled zdola' },
  { src: '/photos/editorial/p03.webp', w: 900, h: 1350, alt: 'Writer v mikině s kapucí sprejuje červený tag na sloup' },
  { src: '/photos/editorial/p04.webp', w: 900, h: 1350, alt: 'Writer v šedé mikině sprejuje v prázdných garážích' },
  { src: '/photos/editorial/p05.webp', w: 900, h: 1350, alt: 'Tetovaná ruka se sprejem u růžového kusu na zdi' },
];

/* -------------------------------------------------------------------------- */
/* COMMUNITY — 620x620 čtverce pro instagramovou zeď                           */
/* -------------------------------------------------------------------------- */

export const COMMUNITY: Photo[] = [
  { src: '/photos/community/01.webp', w: 620, h: 620, alt: 'Oranžový mural ženské tváře přes celou zeď' },
  { src: '/photos/community/02.webp', w: 620, h: 620, alt: 'Zeď s plastickými maskami a barevným graffiti' },
  { src: '/photos/community/03.webp', w: 620, h: 620, alt: 'Bílý smajlík nasprejovaný na staré cihlové zdi' },
  { src: '/photos/community/04.webp', w: 620, h: 620, alt: 'Černobílá linková malba přes fasádu se skútrem před ní' },
  { src: '/photos/community/05.webp', w: 620, h: 620, alt: 'Vysoký mural ženy na štítu činžovního domu' },
  { src: '/photos/community/06.webp', w: 620, h: 620, alt: 'Barevná ulička s pieces po obou stranách' },
  { src: '/photos/community/07.webp', w: 620, h: 620, alt: 'Tyrkysová zeď s vybledlým portrétem a rostlinami' },
  { src: '/photos/community/08.webp', w: 620, h: 620, alt: 'Mural cyklisty na fasádě u chodníku' },
  { src: '/photos/community/09.webp', w: 620, h: 620, alt: 'Červený drak namalovaný kolem vchodových dveří' },
  { src: '/photos/community/10.webp', w: 620, h: 620, alt: 'Komiksový mural táhnoucí se podél zdi na ulici' },
  { src: '/photos/community/11.webp', w: 620, h: 620, alt: 'Portrét ženy namalovaný na bílé fasádě domu' },
  { src: '/photos/community/12.webp', w: 620, h: 620, alt: 'Černobílý mural skupiny lidí na žluté zdi' },
  { src: '/photos/community/13.webp', w: 620, h: 620, alt: 'Tyrkysové dveře s tagy na konci dvorku' },
  { src: '/photos/community/14.webp', w: 620, h: 620, alt: 'Psychedelický mural s lebkami na žluté fasádě' },
  { src: '/photos/community/15.webp', w: 620, h: 620, alt: 'Mural gejši na cihlové zdi vedle výlohy' },
  { src: '/photos/community/16.webp', w: 620, h: 620, alt: 'Mural ženy se slunečními brýlemi nad venkovním sezením' },
  { src: '/photos/community/17.webp', w: 620, h: 620, alt: 'Ulička s červenobílými pruhy na fasádách a tagy' },
  { src: '/photos/community/18.webp', w: 620, h: 620, alt: 'Velký žlutý wildstyle kus na boku budovy' },
  { src: '/photos/community/19.webp', w: 620, h: 620, alt: 'Mural ženy se zelenými vlasy na boční zdi' },
  { src: '/photos/community/20.webp', w: 620, h: 620, alt: 'Modrošedý portrét na cihlové zdi mezi graffiti' },
];

/* -------------------------------------------------------------------------- */
/* TEXTURES — 1400x1400 overlaye (blend-mode). Dekorativní → alt: ''           */
/* -------------------------------------------------------------------------- */

export const TEXTURES: Photo[] = [
  { src: '/photos/texture/01.webp', w: 1400, h: 1400, alt: '' }, // cákance barvy na betonu
  { src: '/photos/texture/02.webp', w: 1400, h: 1400, alt: '' }, // černobílé strhané plakáty
  { src: '/photos/texture/03.webp', w: 1400, h: 1400, alt: '' }, // odlupující se tyrkysová barva
  { src: '/photos/texture/04.webp', w: 1400, h: 1400, alt: '' }, // popraskaná šedá omítka
  { src: '/photos/texture/05.webp', w: 1400, h: 1400, alt: '' }, // vrstvy roztrhaných plakátů
  { src: '/photos/texture/06.webp', w: 1400, h: 1400, alt: '' }, // loupající se oranžová barva
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Safe modulo indexing — never returns undefined for a non-empty list, so
 * callers can map over arbitrary-length product/post arrays without guards.
 * Negative indices wrap from the end.
 */
export function photo(list: Photo[], i: number): Photo {
  const n = list.length;
  if (n === 0) throw new Error('photo(): empty photo list');
  const idx = ((Math.trunc(i) % n) + n) % n;
  return list[idx]!;
}

/** All photo collections keyed by folder name, handy for tests and debugging. */
export const PHOTO_SETS = {
  wall: WALLS,
  hero: HERO,
  goods: GOODS,
  editorial: EDITORIAL,
  editorialPortrait: EDITORIAL_PORTRAIT,
  community: COMMUNITY,
  texture: TEXTURES,
} as const;
