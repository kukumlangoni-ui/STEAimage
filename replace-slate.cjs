const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/slate-/g, 'zinc-')
      .replace(/rounded-2xl/g, 'rounded-full') // Make buttons pill-shaped
      .replace(/rounded-xl/g, 'rounded-full') // Make smaller buttons pill-shaped
      .replace(/rounded-3xl/g, 'rounded-3xl') // Keep cards 3xl
      .replace(/border-white\/10/g, 'border-white/5') // Subtler borders
      .replace(/bg-white\/5/g, 'bg-zinc-900/40') // Darker cards
      .replace(/bg-zinc-950\/50/g, 'bg-zinc-900/40')
      .replace(/bg-zinc-900\/50/g, 'bg-zinc-900/40');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
