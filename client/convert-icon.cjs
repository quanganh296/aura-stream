const fs = require('fs');
const path = require('path');

const srcPng = path.join(__dirname, 'icon', 'icon.ico');
const destIco = path.join(__dirname, 'build', 'icon.ico');
const destDir = path.join(__dirname, 'build');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (!fs.existsSync(srcPng)) {
  console.error('Source icon.ico not found at:', srcPng);
  process.exit(1);
}

const pngData = fs.readFileSync(srcPng);
const pngSize = pngData.length;

// Create ICO buffer
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type: Icon
header.writeUInt16LE(1, 4); // Number of images

const entry = Buffer.alloc(16);
entry.writeUInt8(0, 0); // Width: 256 (0 means 256)
entry.writeUInt8(0, 1); // Height: 256 (0 means 256)
entry.writeUInt8(0, 2); // Palette: 0
entry.writeUInt8(0, 3); // Reserved
entry.writeUInt16LE(1, 4); // Planes: 1
entry.writeUInt16LE(32, 6); // Bits per pixel: 32
entry.writeUInt32LE(pngSize, 8); // Size of PNG data
entry.writeUInt32LE(22, 12); // Offset of PNG data (6 bytes header + 16 bytes entry = 22)

const icoData = Buffer.concat([header, entry, pngData]);
fs.writeFileSync(destIco, icoData);
console.log('Successfully created Windows ICO icon at:', destIco);
