import fs from 'fs';
const content = fs.readFileSync('src/pages/SalonDetail.tsx', 'utf8');
let braceBalance = 0;
let parenBalance = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let char of line) {
    if (char === '{') braceBalance++;
    if (char === '}') braceBalance--;
    if (char === '(') parenBalance++;
    if (char === ')') parenBalance--;
  }
  if (braceBalance < 0 || parenBalance < 0) {
    console.log(`Balance error at line ${i + 1}: Braces=${braceBalance}, Parens=${parenBalance}`);
    process.exit(1);
  }
}
console.log(`Final state: Braces=${braceBalance}, Parens=${parenBalance}`);
