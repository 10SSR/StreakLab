const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, isMaskable) {
  // Simple PNG generator with raw RGBA scanlines
  const rows = [];
  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.38 : 0.42);

  for (let y = 0; y < height; y++) {
    const row = [0]; // filter type 0: None
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Cyber background: dark midnight
      let r = 7;
      let g = 9;
      let b = 19;
      let a = 255;

      // Flame shape approximation
      // y normalized from cy - radius to cy + radius
      const ny = (y - (cy - radius * 0.7)) / (radius * 1.5);
      const nx = Math.abs(dx) / (radius * 0.75);

      if (dist < radius) {
        // Within outer badge circle/square
        if (ny >= 0 && ny <= 1.0) {
          const flameWidth = Math.sin(ny * Math.PI) * 0.85;
          if (nx <= flameWidth) {
            // Inside flame
            // Gradient from violet (139, 92, 246) at bottom to pink (236, 72, 153) to cyan (6, 182, 212) at top
            const t = 1 - ny;
            if (t > 0.5) {
              const u = (t - 0.5) * 2;
              r = Math.round(236 * (1 - u) + 6 * u);
              g = Math.round(72 * (1 - u) + 182 * u);
              b = Math.round(153 * (1 - u) + 212 * u);
            } else {
              const u = t * 2;
              r = Math.round(139 * (1 - u) + 236 * u);
              g = Math.round(92 * (1 - u) + 72 * u);
              b = Math.round(246 * (1 - u) + 153 * u);
            }
            // Inner core
            if (nx <= flameWidth * 0.45 && ny >= 0.25 && ny <= 0.85) {
              r = 255;
              g = 255;
              b = 255;
            }
          }
        }
      }

      row.push(r, g, b, a);
    }
    rows.push(Buffer.from(row));
  }

  const rawData = Buffer.concat(rows);
  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  return Buffer.concat([
    header,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, 'maskable-192.png'), createPng(192, 192, true));
fs.writeFileSync(path.join(iconsDir, 'maskable-512.png'), createPng(512, 512, true));

console.log('Generated valid PNG icons in public/icons/');
