import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import satori from 'satori';
import { html as toVdom } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

export const OG_SIZE = { width: 1200, height: 630 } as const;

const require = createRequire(import.meta.url);

// Satori reads ttf/otf/woff but NOT woff2, so these must be the .woff files.
const loadFont = (weight: 400 | 700) =>
  readFileSync(require.resolve(`@fontsource/inter/files/inter-latin-${weight}-normal.woff`));

const fonts = [
  { name: 'Inter', weight: 400 as const, style: 'normal' as const, data: loadFont(400) },
  { name: 'Inter', weight: 700 as const, style: 'normal' as const, data: loadFont(700) },
];

const COLORS = {
  bg: '#0a0a0a',
  text: '#f5f5f5',
  muted: '#a3a3a3',
  faint: '#737373',
  rule: '#262626',
};

// Echoes the pricing badge colours used on the site itself.
const DOTS = ['#34d399', '#38bdf8', '#a78bfa'];

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!,
  );

// Long questions need to step down or they overflow the 630px canvas.
const headlineSize = (title: string) => {
  if (title.length <= 28) return 84;
  if (title.length <= 44) return 68;
  return 54;
};

export type OgContent = { title: string; subtitle: string };

const template = ({ title, subtitle }: OgContent) => `
  <div style="width:100%;height:100%;background:${COLORS.bg};display:flex;flex-direction:column;padding:72px 80px;font-family:Inter">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;font-size:22px;font-weight:700;letter-spacing:0.18em;color:${COLORS.text}">DEVTOOLS</div>
      <div style="display:flex;gap:8px">
        ${DOTS.map(
          (color) =>
            `<div style="display:flex;width:10px;height:10px;border-radius:999px;background:${color}"></div>`,
        ).join('')}
      </div>
    </div>

    <div style="display:flex;margin-top:28px;height:1px;background:${COLORS.rule}"></div>

    <div style="display:flex;flex-direction:column;margin-top:auto">
      <div style="display:flex;font-size:${headlineSize(title)}px;font-weight:700;color:${COLORS.text};line-height:1.05;letter-spacing:-0.02em">${escapeHtml(title)}</div>
      <div style="display:flex;margin-top:24px;font-size:30px;color:${COLORS.muted};line-height:1.4">${escapeHtml(subtitle)}</div>
    </div>

    <div style="display:flex;margin-top:56px;justify-content:space-between;align-items:center">
      <div style="display:flex;font-size:22px;color:${COLORS.faint}">free developer tools</div>
      <div style="display:flex;font-size:22px;font-weight:700;color:${COLORS.text}">tools.itsbohara.com</div>
    </div>
  </div>
`;

export async function renderOgImage(content: OgContent): Promise<Buffer> {
  const svg = await satori(toVdom(template(content)), { ...OG_SIZE, fonts });
  return new Resvg(svg, { fitTo: { mode: 'width', value: OG_SIZE.width } }).render().asPng();
}
