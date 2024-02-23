const fs = require('fs');
const path = require('path');

// Define the directory of the package
const packageDir = path.join(__dirname, '..','node_modules', '@mantine6');

// Define a recursive function to read directories and files
function replaceInFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      replaceInFiles(filePath);
    } else if (filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/@mantine\/core/g, '@mantine6/core');
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

// Call the function on the package directory
replaceInFiles(packageDir);