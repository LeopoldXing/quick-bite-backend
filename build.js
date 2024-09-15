const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  try {
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);

      entry.isDirectory()
          ? copyDir(srcPath, destPath)
          : fs.copyFileSync(srcPath, destPath);
    }
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}: ${err}`);
  }
}

if (fs.existsSync('.ebextensions')) {
  copyDir('.ebextensions', 'dist/.ebextensions');
}

if (fs.existsSync('.platform')) {
  copyDir('.platform', 'dist/.platform');
}
