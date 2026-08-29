# Montana Cans CZ — koncept e-shopu

Statický front-endový mockup modernizovaného českého e-shopu se spreji a graffiti
vybavením. Vznikl jako **portfoliová práce a pitch koncept** — ukázka, jak by mohl
vypadat obchod Montana Cans CZ, kdyby dostal současný vizuál, pořádnou typografii
a jednu opravdu zapamatovatelnou funkci navíc.

Je to **čistě prezentační vrstva: žádný backend, žádná databáze, žádná reálná
objednávka ani platební brána.** Katalog je TypeScriptové pole v `lib/products.ts`,
košík žije v `localStorage` a celý web vyjede jako statické HTML do složky `out/`.

> **Disclaimer**
>
> Neoficiální koncept. Projekt není nijak spojený se společností Montana Cans,
> není jí schválený ani sponzorovaný a nepoužívá její oficiální logo ani grafické
> podklady. Logotyp na stránce je vlastní typografická sazba. Názvy produktů, kódy
> odstínů, ceny, recenze i adresy jsou vymyšlené a slouží jen jako výplň konceptu.

---

## Co na tom stojí za vidění

### Barevná stěna

Hlavní funkce celé stránky a důvod, proč sedí hned pod hero sekcí. **112 odstínů**
v osmi barevných rodinách po čtrnácti, v každé rodině seřazených od nejtmavšího
k nejsvětlejšímu — stěna má číst jako regál s barvami, ne jako náhodná mozaika.

Kliknutí na swatch zapíše `--accent` a `--accent-ink` přímo na element `<html>`,
takže se **za běhu přebarví celá stránka** — CTA tlačítka, nadpisy, ukazatel
scrollu, akcenty v patičce, dokonce i logotyp. Kontrastní inkoust se dopočítá
z luminance odstínu, takže fluorescentní žlutá i temně modrá zůstanou čitelné.
Výběr zároveň vyfiltruje mřížku pod stěnou na produkty v dané barvě a rodině.

Detaily: swatche jsou reálná `<button>` v kontejneru s `role="listbox"`, takže
stěna jde projít klávesnicí; readout nad ní reaguje na hover i na focus. Na desktopu
stěnu doplňuje kurzor ve tvaru trysky, který drží aktuální barvu a jede na
`requestAnimationFrame`.

### Celý katalog je kreslený vektor, ne fotka

Všech **56 produktů** je vykreslených jako parametrické SVG v `components/art/`.
Žádný produkt nemá cestu k obrázku — místo toho nese diskriminovaný `art`
deskriptor, který `ProductArt.tsx` přeloží na konkrétní kresbu:

| Renderer | Parametry |
| --- | --- |
| `SprayCan.tsx` | 7 řad (BLACK, GOLD, 94, CHALK, STENCIL, HARDCORE, WATER) × 3 objemy (150/400/600 ml) |
| `Marker.tsx` | 5 šířek hrotu (2–50 mm) × akryl / lak / chrom |
| `Cap.tsx` | fat, skinny, calligraphy, universal, super-fat |
| `Apparel.tsx` | tričko, mikina, crewneck, kšiltovka |
| `Blackbook.tsx` | A4, A5, čtverec |
| `Extras.tsx` | brašna, rukavice, refill, šablona |

Všechny sdílejí jednu **světelnou soustavu** (`components/art/shading.tsx`): plochá
základní barva, přes ni černý gradient pro terminátor a bílý pro odlesk. Dvě
jednobarevné vrstvy místo jednoho černo-bílého gradientu záměrně — SVG interpoluje
stopy v nepřednásobené RGBA, takže přechod z černé do bílé projde uprostřed
*světlejší* šedou a rozmázne přesně to místo, kde má válec odpadat do stínu.
Klíč svítí ze stejného směru u každého produktu, takže mřížka vypadá jako jedno
focení. Nový odstín se přidá řádkem v datech, ne focením.

Každá instance si generuje vlastní `uid` pro SVG identifikátory — `url(#…)` se váže
na první shodu v dokumentu, takže stejný produkt zobrazený dvakrát by jinak zdědil
clip path té první kopie a druhá by zmizela.

### Knihovna graffiti prvků

`components/graffiti/` je samostatná sada dekoračních SVG komponent — mlha z trysky,
overspray, cákance, kapky, tahy markerem, škrábance, šipky, tagy, throw-upy, páska,
utržené hrany, halftone a stencil text. Stojí na dvou filtračních řetězcích
(`filters.tsx`):

- **RoughEdge** — `feTurbulence` → `feDisplacementMap`. Rozhýbe každý bod tvaru podle
  šumového pole, takže z čisté bézierovy křivky vyleze roztřepený okraj barvy, která
  dopadla na zeď. Bez toho celá knihovna vypadá jako klipart.
- **Speckle** — `feTurbulence` → `feColorMatrix` s prahem v alfa řádku. Hard step
  přes plynulý šum rozpadne mrak na jednotlivé kapičky. To je aerosolové zrno; blur
  není.

Oba mají explicitně `colorInterpolationFilters="sRGB"` (výchozí linearRGB posouvá
střed turbulence a rozladí všechny prahy). Rozptyl prvků jede přes deterministický
LCG generátor, aby server i klient vykreslily identickou kompozici.

### Košík, rychlý náhled a hledání

Tři překryvy nad stránkou sdílí jeden hook `useOverlayShell` (v `CartDrawer.tsx`):
zavření na `Esc`, **focus trap** uvnitř panelu, návrat focusu na prvek, který překryv
otevřel, a **refcountovaný zámek scrollu** (hledání může ležet pod rychlým náhledem,
takže zavření vnitřního nesmí vrátit scroll stránce). Enter/exit fáze respektují
`prefers-reduced-motion`.

- **Košík** persistuje do `localStorage`, ale ukládá jen dvojice `{ id, qty }` —
  položky se při načtení znovu párují proti `PRODUCTS`, takže změna ceny v katalogu
  nezůstane zastíněná starou kopií v prohlížeči a neexistující id prostě vypadne.
  Každý dotyk `localStorage` je obalený `try/catch` (privátní režim, plná kvóta).
- **Hledání** se otevře klávesou `/` odkudkoli ze stránky (pokud zrovna nepíšeš do
  inputu), skládá index bez diakritiky, takže „cerna“ najde „černá“, jede na
  `ArrowUp`/`ArrowDown`/`Home`/`End`/`Enter` a výsledky seskupuje po kategoriích.
- **Rychlý náhled** je vysazený list papíru s kresbou produktu, výběrem varianty
  a množstvím.

### Katalog

Kategorie jako záložky, pět režimů řazení, cenová pásma, přepínač „jen skladem“
a stránkování po dvanácti. Všechno filtrování běží klientsky nad polem v paměti —
za mockupem není API a takhle je každý ovládací prvek okamžitý.

### Statický export

`output: 'export'` a `trailingSlash: true` — build vyrobí `out/` s `index.html` pro
každou stránku. Žádný Node server, nasaditelné na jakýkoli statický hosting.

---

## Sekce stránky

Osm pásem, v tomhle pořadí:

1. **Hero** — plakát přes celou šířku, fotka zdi ztlumená scrimem, cluster sprejů
   s tvrdými nerozmazanými stíny. Nadpis se vykresluje staticky: čekat na animaci
   u toho jediného, co má stránka sdělit, nedávalo smysl. Halo přestřiku kolem
   písma zůstává — to je textura, ne choreografie.
2. **Barevná stěna** — 112 odstínů + mřížka produktů v aktuální barvě.
3. **Katalog** — celý sortiment s filtry.
4. **Reportáž** — editorial pásmo, koláž fotek vylámaná z obsahové kolony.
5. **Manifest** — nárazová typografie, počítadla čísel, značky, zákaznické citace.
6. **Komunita** — nepravidelná zeď snímků z ulice, nalepených místo vyskládaných.
7. **Praktické otázky** — akordeon nad nativními `<details>` a přihlášení k dropům.
8. **Patička** — wordmark v měřítku zdi, kontakty, odkazy.

## Technologie

| Vrstva | Nástroj |
| --- | --- |
| Framework | Next.js 15 (App Router), statický export |
| UI | React 19, TypeScript 5.7 (`strict`) |
| Styly | Tailwind CSS 3 + CSS custom properties |
| Animace | `motion` (hero cluster) + nativní CSS animace |
| Fonty | Antonio, DM Sans, JetBrains Mono přes `next/font/google` |
| Správce balíčků | pnpm |

Runtime závislosti jsou jen `next`, `react`, `react-dom` a `motion` — žádná
komponentová knihovna, žádný ikonový balík. Ikony i produktová grafika jsou psané
SVG v repozitáři.

## Spuštění

Potřebuješ Node.js 20+ (CI staví na 22) a `pnpm`.

```bash
pnpm install
pnpm dev          # http://localhost:3000/
```

Další skripty:

```bash
pnpm typecheck    # tsc --noEmit
pnpm build        # statický export do out/
pnpm lint         # next lint
```

Ve výchozím stavu web běží na rootu domény. Pokud ho chceš servírovat z podsložky,
nastav `BASE_PATH`:

```bash
BASE_PATH=/montana pnpm build
```

Hodnota se propíše do `basePath` i `assetPrefix` v `next.config.js` a zároveň do
`NEXT_PUBLIC_BASE_PATH`, ze kterého ji čte helper `lib/basePath.ts`. Cesty
k fotkám se skládají výhradně přes `asset()`, takže sedí i v klientských
komponentách.

CI (`.github/workflows/ci.yml`) na každý push pouští `pnpm typecheck` a `pnpm build`.

## Nasazení na Cloudflare Pages

Web je čistě statický, takže na Pages jede nativně — **žádný Docker, žádný adaptér,
žádné Functions.** Stačí připojit repozitář a nastavit dvě pole:

| Nastavení | Hodnota |
| --- | --- |
| Framework preset | `Next.js (Static HTML Export)` |
| Build command | `pnpm build` |
| Build output directory | `out` |
| Root directory | `/` |

Postup: **Workers & Pages → Create application → Pages → Import an existing Git
repository**, vybrat repo, doplnit tabulku výše a nechat proběhnout build. Každý
push do `main` pak nasadí sám, pull requesty dostanou preview URL.

Co v repu je připravené, aby to prošlo napoprvé:

- **`.node-version`** drží Node 22. Bez něj Pages sáhne po vlastní výchozí verzi
  a build může spadnout na něčem úplně jiném, než co běží lokálně.
- **`packageManager`** v `package.json` pinuje pnpm 11.3, takže Pages vezme přes
  corepack tutéž verzi, která psala `pnpm-lock.yaml` (lockfile v9).
- **`public/_headers`** se exportem zkopíruje do `out/_headers` a Pages si ho
  načte samo: `/_next/static/*` má content hash v názvu, takže dostane
  `immutable` na rok; fotky se cachují na den se `stale-while-revalidate`, protože
  jejich názvy se při překlopení nemění; a přes všechno jdou základní
  bezpečnostní hlavičky.
- **`wrangler.jsonc`** drží `pages_build_output_dir`, takže funguje i ruční
  `pnpm deploy:cf` (`next build` + `wrangler pages deploy out`) bez argumentů.
  Pro Git integraci není potřeba — build settings si bere dashboard.

Deploy z terminálu, pokud nechceš čekat na Git:

```bash
pnpm deploy:cf
```

Skript se jmenuje `deploy:cf` schválně — `pnpm deploy` je vyhrazený příkaz pnpm
pro workspace balíčky a přebil by ho.

Web se servíruje z rootu domény, takže `BASE_PATH` na Pages nenastavuj — je
potřeba jen při nasazení do podsložky.

## Struktura

```
.
├── app/
│   ├── layout.tsx           Root layout, fonty, providery, skip link
│   ├── page.tsx             Skládá homepage z osmi sekcí
│   └── globals.css          Design tokeny, textura zdi, base styly
├── components/
│   ├── Nav.tsx              Pásmo slibů + průhledná sticky navigace
│   ├── Hero.tsx             Plakátové hero nad fotkou zdi
│   ├── HeroCan.tsx          Animovaný cluster sprejů
│   ├── ColorWall.tsx        Barevná stěna + filtr produktů
│   ├── Catalog.tsx          Sortiment s filtry, řazením a stránkováním
│   ├── Editorial.tsx        Reportážní koláž
│   ├── Proof.tsx            Manifest, čísla, značky, citace
│   ├── Community.tsx        Nepravidelná zeď snímků
│   ├── Closing.tsx          FAQ akordeon + přihlášení k dropům
│   ├── Footer.tsx           Patička
│   ├── ProductCard.tsx      Karta produktu jako nalepený plakátek
│   ├── CartDrawer.tsx       Košík + sdílený useOverlayShell
│   ├── QuickView.tsx        Rychlý náhled produktu
│   ├── SearchOverlay.tsx    Fulltext přes katalog, hotkey „/“
│   ├── ShopOverlays.tsx     Montuje tři překryvy v kořeni layoutu
│   ├── interactive.tsx      Reveal, Tilt, Counter, Magnetic, ScrollProgress
│   ├── Logotype.tsx         Vlastní typografický wordmark
│   ├── art/                 Vektorová kresba produktů
│   │   ├── ProductArt.tsx   Jediný vstup z dat do artworku
│   │   ├── SprayCan.tsx     Spreje (řada × objem)
│   │   ├── Marker.tsx       Fixy (šířka hrotu × povrch)
│   │   ├── Cap.tsx          Trysky
│   │   ├── Apparel.tsx      Oblečení
│   │   ├── Blackbook.tsx    Blackbooky
│   │   ├── Extras.tsx       Brašna, rukavice, refill, šablona
│   │   └── shading.tsx      Sdílená světelná soustava a gradienty
│   └── graffiti/            Dekorační graffiti prvky
│       ├── filters.tsx      RoughEdge a Speckle, deterministický PRNG
│       ├── Spray.tsx        Mlha z trysky, overspray
│       ├── Marks.tsx        Cákance, kapky, tahy markerem, škrábance
│       ├── Arrows.tsx       Šipky
│       ├── Tag.tsx          Tagy a throw-upy
│       ├── Surfaces.tsx     Páska, utržená hrana, halftone, rámeček
│       └── StencilText.tsx  Stencil sazba
├── lib/
│   ├── colors.ts            112 odstínů s názvy, kódy a rodinami
│   ├── products.ts          Katalog, řazení, formátování cen
│   ├── cart.tsx             Košík (context + localStorage)
│   ├── shop-ui.tsx          Stav rychlého náhledu a hledání
│   ├── photos.ts            Typovaný manifest fotek včetně alt textů
│   └── basePath.ts          Prefixování cest k assetům
├── public/photos/           Atmosférická fotografie (Pexels)
├── next.config.js           Statický export, volitelný BASE_PATH
└── tailwind.config.ts       Design tokeny, stíny, animace
```

## Design systém

**Koncept: zeď, na kterou se lepilo, sprejovalo a přemalovávalo.** Nábytek stránky
je barva a papír, ne chrom — bloky barvy, páska, utržené hrany, stencil. Hierarchii
drží velikost a hmota, ne linky: rámečky jsou výjimka, výchozí dělič je blok barvy.
Sekce dostane jeden hlasitý tah, ne čtyři.

- **Podklad je teplý charcoal**, blíž neosvětlenému betonu než „dark mode“ —
  `--wall: #131217` s odstupňovanými plochami až po `--wall-edge`. Přes celou
  stránku leží fixní aerosolové zrno (SVG `feTurbulence` v data URI) a vinětační
  gradient, obojí `position: fixed`, aby to četlo jako film na objektivu, ne jako
  textura přilepená k obsahu.
- **Barvu dodávají produkty a uživatel.** Rozhraní samo je skoro monochromatické;
  jediný sytý akcent drží `--accent` (výchozí acid lime `#84cc16`), který barevná stěna
  přepisuje za běhu. Tailwind na tuhle proměnnou mapuje třídy `accent`
  a `accent-ink`, takže se zbytek stránky přebarví čistě přes CSS — sekce pod
  stěnou se kvůli tomu nemusí vůbec překreslovat v Reactu.
- **Typografie:** display **Antonio** (kondenzovaný, plakátový; vybraný přes Anton
  a Oswald kvůli plné podpoře latin-ext, aby české háčky a čárky držely stejnou
  váhu jako zbytek nadpisu), body **DM Sans**, kódy a ceny **JetBrains Mono**.
  Mono hlas je záměrně přídělový — jen kódy, skladovost a ceny.
- **Stíny nejsou rozmazané.** `slab`, `slab-sm` a `slab-lg` jsou tvrdé offsety;
  rozmazaný stín čte jako webová kartička, nalepený plakát vrhá ostrou hranu.
- **Utility vrstva** nese `.paint-block` a `.paint-band` (mírně neortogonální
  `clip-path`), `.sprayed` a `.sprayed-accent` (halo přestřiku kolem písma),
  `.tape-strip`, `.sticker`, `.halftone` a plakátové stupně velikosti
  `.type-poster` / `.type-slab` / `.type-lead` postavené na `clamp()`.

### Kam sáhnout při úpravách

| Chci změnit | Soubor |
| --- | --- |
| Odstíny na stěně | `lib/colors.ts` (drž 14 na rodinu, řazeno od tmavé) |
| Produkty a ceny | `lib/products.ts` |
| Kresbu produktu | `components/art/` |
| Dekorační prvky | `components/graffiti/` |
| Barevné tokeny a animace | `app/globals.css`, `tailwind.config.ts` |
| Fotky a jejich alt texty | `lib/photos.ts` (nikdy ne natvrdo v komponentě) |
| Texty | zatím napevno v komponentách — v ostrém nasazení sem půjde CMS |

## Přístupnost

- Skip link na začátek obsahu, `lang="cs"`, viditelný `:focus-visible` (3px obrys
  v barvě pásky s odsazením) globálně pro celou stránku.
- Swatche barevné stěny jsou reálná tlačítka s `aria-label` obsahujícím jméno, kód
  i hex, zabalená do `role="listbox"` / `role="option"`. Prsten výběru je záměrně
  `box-shadow`, ne `outline` — inline outline by přebil globální focus styl a stěna
  by přišla o klávesový prstenec. `aria-live` oznamuje jen skutečný výběr, ne hover.
- Všechny tři překryvy mají `role="dialog"`, `aria-modal`, `aria-labelledby`, focus
  trap na `Tab`/`Shift+Tab`, zavření na `Esc` a návrat focusu na spouštěč. Focus se
  nastavuje s `preventScroll`, aby na mobilu náhled neodroloval pryč od vlastní
  kresby.
- `prefers-reduced-motion` se řeší na obou stranách: globální CSS pravidlo zkracuje
  všechny animace a přechody, a komponenty, které animují z JS (`Reveal`, `Tilt`,
  `Counter`, hero cluster, překryvy), si médium samy čtou a rovnou vykreslí cílový
  stav. `Reveal` navíc padá do „zobrazeno“, když `IntersectionObserver` chybí —
  dekorace nesmí obsah nechat na `opacity: 0`.
- Fotky mají české alt texty vedené v `lib/photos.ts`; dekorativní grafika je
  `aria-hidden` a prázdný `alt`.
- Layout je responzivní od mobilu po široký desktop, bez horizontálního scrollu.

## Fotografie

Fotografie v `public/photos/` (hero, reportáž, komunitní zeď, produktové zátiší,
textury) pocházejí z [Pexels](https://www.pexels.com) a jsou použité v souladu
s [Pexels License](https://www.pexels.com/license/) — volné pro komerční
i nekomerční použití, bez nutnosti uvádět autora. Uvádím to i tak: dík fotografům,
kteří své snímky takhle uvolnili.

Produktová grafika mezi ně nepatří — ta je kreslená jako SVG přímo v repozitáři.

## Licence

Kód je pod licencí MIT — viz [LICENSE](./LICENSE). Licence se vztahuje na kód
projektu, nikoli na fotografie třetích stran (ty se řídí Pexels License) ani na
jakékoli ochranné známky.

---

Autor: **Miloslav Hříbal** · [github.com/MildaHribal](https://github.com/MildaHribal)
