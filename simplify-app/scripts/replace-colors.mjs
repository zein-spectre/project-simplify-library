import fs from 'fs/promises';
import path from 'path';

async function walk(dir) {
  let files = await fs.readdir(dir);
  for (let file of files) {
    let fullPath = path.join(dir, file);
    let stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      await walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = await fs.readFile(fullPath, 'utf8');
      let newContent = content
        .replace(/\bindigo\b/g, 'primary')
        .replace(/\borange\b/g, 'accent');
      if (content !== newContent) {
        await fs.writeFile(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('./src').then(() => console.log('Done replacing colors!')).catch(console.error);
