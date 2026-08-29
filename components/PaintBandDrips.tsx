/**
 * The paint running off the bottom of the promo band.
 *
 * One inline SVG, and inside it the band lip and every run are a SINGLE closed
 * path in a single fill — the runs are not shapes stuck under a rectangle, they
 * are the bottom edge of the band deformed downwards. That is what makes a run
 * appear to grow out of the paint instead of hanging off it.
 *
 * The path data is generated, not authored by hand, but it is BAKED IN rather
 * than computed at render time: randomising on the client would desync from the
 * server markup and would also mean the band looked different on every load.
 * The generator lives in the repo history if the layout ever needs reshuffling.
 *
 * Two coats. The darker one behind is offset and sparser, so the fresh accent
 * reads as the most recent of several paint jobs.
 *
 * Layout-safe by construction: the wrapper is absolutely positioned at zero
 * height, so nothing here can move the page or contribute to CLS.
 *
 * The SVG scales with the viewport, which means the runs get physically longer
 * on a wide monitor — far enough, on an ultrawide, to reach the nav links. The
 * max-width cap is what stops that: past 1920px the artwork stops growing and
 * the runs stay the length the clearance under the band was designed for.
 */

const VIEWBOX_H = 50;

/* Band lip + 13 runs. Uneven spacing (75-147px at 1440 wide), lengths 14-34px,
   widths 5-13px, no two neighbours alike in both, and every run at least 2.3x
   longer than it is wide — below that a run stops reading as paint and turns
   into a semicircular scallop on the band edge.
   Runs are deliberately SHORT: the nav sits directly underneath, and paint
   crossing the links reads as damage rather than decoration. */
const FRESH =
  'M0 0H1440V8H1392.9C1389.3 8,1389.5 9.4,1389.5 14.2C1389.5 18.8,1388.2 20,1388.2 22.9C1388.2 26.2,1389.6 27.7,1389.6 27.4C1389.6 34.5,1380.4 34.5,1380.4 27.4C1380.4 27.7,1381.8 26.2,1381.8 22.9C1381.8 20,1380.5 18.8,1380.5 14.2C1380.5 9.4,1380.7 8,1377.1 8H1268.1C1265.4 8,1265.5 9.1,1265.5 12.7C1265.5 16.1,1264.5 17,1264.5 19.2C1264.5 21.7,1265.6 22.8,1265.6 22.4C1265.6 28,1258.4 28,1258.4 22.4C1258.4 22.8,1259.5 21.7,1259.5 19.2C1259.5 17,1258.5 16.1,1258.5 12.7C1258.5 9.1,1258.6 8,1255.9 8H1188.8C1184.8 8,1185 9.7,1185 15.3C1185 20.6,1183.6 22,1183.6 25.4C1183.6 29.3,1185.1 31,1185.1 30.9C1185.1 38.8,1174.9 38.8,1174.9 30.9C1174.9 31,1176.4 29.3,1176.4 25.4C1176.4 22,1175 20.6,1175 15.3C1175 9.7,1175.2 8,1171.2 8H1069.4C1067.4 8,1067.5 8.8,1067.5 11.6C1067.5 14.3,1066.8 15,1066.8 16.7C1066.8 18.6,1067.5 19.5,1067.5 19.4C1067.5 23.4,1062.5 23.4,1062.5 19.4C1062.5 19.5,1063.2 18.6,1063.2 16.7C1063.2 15,1062.5 14.3,1062.5 11.6C1062.5 8.8,1062.6 8,1060.6 8H928.5C923.8 8,924 9.9,924 16.3C924 22.4,922.3 24,922.3 27.8C922.3 32.3,924.1 34.2,924.1 33.9C924.1 43.4,911.9 43.4,911.9 33.9C911.9 34.2,913.7 32.3,913.7 27.8C913.7 24,912 22.4,912 16.3C912 9.9,912.2 8,907.5 8H846.1C843.4 8,843.5 9.3,843.5 13.7C843.5 17.9,842.5 19,842.5 21.6C842.5 24.7,843.6 26,843.6 26.4C843.6 32,836.4 32,836.4 26.4C836.4 26,837.5 24.7,837.5 21.6C837.5 19,836.5 17.9,836.5 13.7C836.5 9.3,836.6 8,833.9 8H714.6C710.3 8,710.5 9.6,710.5 14.8C710.5 19.7,709 21,709 24.1C709 27.8,710.6 29.3,710.6 28.4C710.6 37.1,699.4 37.1,699.4 28.4C699.4 29.3,701 27.8,701 24.1C701 21,699.5 19.7,699.5 14.8C699.5 9.6,699.7 8,695.4 8H617.2C614.9 8,615 9,615 12.2C615 15.2,614.2 16,614.2 17.9C614.2 20.2,615.1 21.1,615.1 20.9C615.1 25.7,608.9 25.7,608.9 20.9C608.9 21.1,609.8 20.2,609.8 17.9C609.8 16,609 15.2,609 12.2C609 9,609.1 8,606.8 8H481.4C476.3 8,476.5 9.8,476.5 15.8C476.5 21.5,474.7 23,474.7 26.6C474.7 30.8,476.6 32.6,476.6 31.4C476.6 41.6,463.4 41.6,463.4 31.4C463.4 32.6,465.3 30.8,465.3 26.6C465.3 23,463.5 21.5,463.5 15.8C463.5 9.8,463.7 8,458.6 8H403.8C399.8 8,400 10,400 16.8C400 23.3,398.6 25,398.6 29.1C398.6 33.8,400.1 35.9,400.1 36.9C400.1 44.8,389.9 44.8,389.9 36.9C389.9 35.9,391.4 33.8,391.4 29.1C391.4 25,390 23.3,390 16.8C390 10,390.2 8,386.2 8H255.2C252.9 8,253 9.2,253 13.2C253 17,252.2 18,252.2 20.4C252.2 23.2,253.1 24.4,253.1 24.9C253.1 29.7,246.9 29.7,246.9 24.9C246.9 24.4,247.8 23.2,247.8 20.4C247.8 18,247 17,247 13.2C247 9.2,247.1 8,244.8 8H178.5C173.8 8,174 9.8,174 15.8C174 21.5,172.3 23,172.3 26.6C172.3 30.8,174.1 32.6,174.1 31.9C174.1 41.4,161.9 41.4,161.9 31.9C161.9 32.6,163.7 30.8,163.7 26.6C163.7 23,162 21.5,162 15.8C162 9.8,162.2 8,157.5 8H69C65.8 8,66 9.6,66 14.8C66 19.7,64.9 21,64.9 24.1C64.9 27.8,66.1 29.3,66.1 29.9C66.1 36.2,57.9 36.2,57.9 29.9C57.9 29.3,59.1 27.8,59.1 24.1C59.1 21,58 19.7,58 14.8C58 9.6,58.1 8,55 8H0Z';

/* Dried coat: 6 runs, its own lip 2px higher so it peeks above the fresh one. */
const DRIED =
  'M0 0H1440V6H1315.2C1312.9 6,1313 7.9,1313 14.3C1313 20.4,1312.2 22,1312.2 25.8C1312.2 30.3,1313.1 32.2,1313.1 34.9C1313.1 39.7,1306.9 39.7,1306.9 34.9C1306.9 32.2,1307.8 30.3,1307.8 25.8C1307.8 22,1307 20.4,1307 14.3C1307 7.9,1307.1 6,1304.8 6H1018.8C1014.8 6,1015 7.4,1015 12.2C1015 16.8,1013.6 18,1013.6 20.9C1013.6 24.2,1015.1 25.7,1015.1 24.9C1015.1 32.8,1004.9 32.8,1004.9 24.9C1004.9 25.7,1006.4 24.2,1006.4 20.9C1006.4 18,1005 16.8,1005 12.2C1005 7.4,1005.2 6,1001.2 6H796.1C793.4 6,793.5 7.1,793.5 10.7C793.5 14.1,792.5 15,792.5 17.2C792.5 19.7,793.6 20.8,793.6 20.4C793.6 26,786.4 26,786.4 20.4C786.4 20.8,787.5 19.7,787.5 17.2C787.5 15,786.5 14.1,786.5 10.7C786.5 7.1,786.6 6,783.9 6H554.6C550.3 6,550.5 7.6,550.5 12.8C550.5 17.7,549 19,549 22.1C549 25.8,550.6 27.3,550.6 26.4C550.6 35.1,539.4 35.1,539.4 26.4C539.4 27.3,541 25.8,541 22.1C541 19,539.5 17.7,539.5 12.8C539.5 7.6,539.7 6,535.4 6H335.2C332.9 6,333 7.8,333 13.8C333 19.5,332.2 21,332.2 24.6C332.2 28.8,333.1 30.6,333.1 32.9C333.1 37.7,326.9 37.7,326.9 32.9C326.9 30.6,327.8 28.8,327.8 24.6C327.8 21,327 19.5,327 13.8C327 7.8,327.1 6,324.8 6H127.9C124.3 6,124.5 7.3,124.5 11.7C124.5 15.9,123.2 17,123.2 19.6C123.2 22.7,124.6 24,124.6 23.4C124.6 30.5,115.4 30.5,115.4 23.4C115.4 24,116.8 22.7,116.8 19.6C116.8 17,115.5 15.9,115.5 11.7C115.5 7.3,115.7 6,112.1 6H0Z';

export function PaintBandDrips({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 top-full h-0 select-none ${className}`}
    >
      {/* Full-bleed continuation of the band. The artwork's width is capped, so
          without this an ultrawide display would show the band ending a few
          pixels short of the viewport edges. Same colour as the SVG lip, so the
          two are indistinguishable. */}
      <div className="absolute inset-x-0 top-[-2px] h-[9px] bg-[color:var(--accent)]" />
      <svg
        viewBox={`0 0 1440 ${VIEWBOX_H}`}
        preserveAspectRatio="xMidYMin meet"
        className="absolute left-1/2 w-full max-w-[1920px] -translate-x-1/2 h-auto"
        /* -2px so the lip overlaps the DOM band and no hairline seam can show
           between them at fractional device pixel ratios. */
        style={{ top: '-2px' }}
        role="presentation"
      >
        <path d={DRIED} fill="#7a9400" opacity="0.5" />
        <path d={FRESH} fill="var(--accent)" />

        {/* Two beads that let go every few seconds, sitting at the tips of the
            two longest runs (x=395 and x=918) so they read as that run finally
            shedding rather than as loose dots. Offset cycles keep them from
            ever falling in step. `paint-drop` lives in globals.css, where the
            reduced-motion rule parks them on their final, invisible frame. */}
        <ellipse cx="395" cy="40" rx="3.2" ry="4.1" fill="var(--accent)" className="paint-drop" />
        <ellipse
          cx="918"
          cy="38"
          rx="2.8"
          ry="3.6"
          fill="var(--accent)"
          className="paint-drop"
          style={{ animationDelay: '3.4s', animationDuration: '9s' }}
        />
      </svg>
    </div>
  );
}
