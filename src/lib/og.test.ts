import { describe, it, expect } from 'vitest';
import { renderOgImage, OG_SIZE } from './og';

// PNG dimensions live at fixed byte offsets in the IHDR chunk.
const pngSize = (buffer: Buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20),
});

const isPng = (buffer: Buffer) =>
  buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

describe('renderOgImage', () => {
  it('renders a PNG at the declared OG dimensions', async () => {
    const png = await renderOgImage({ title: 'I need to expose localhost', subtitle: '5 free tools' });
    expect(isPng(png)).toBe(true);
    expect(pngSize(png)).toEqual({ width: OG_SIZE.width, height: OG_SIZE.height });
  });

  it('keeps the canvas size for a long title that has to wrap', async () => {
    const png = await renderOgImage({
      title: 'What’s free on some vendor with a genuinely very long product name?',
      subtitle: 'Covers 4 developer needs on its free tier',
    });
    expect(pngSize(png)).toEqual({ width: OG_SIZE.width, height: OG_SIZE.height });
  });

  it('does not let markup in the title break the SVG', async () => {
    const png = await renderOgImage({ title: 'A <script>alert(1)</script> & "quotes"', subtitle: 'x' });
    expect(isPng(png)).toBe(true);
  });
});
