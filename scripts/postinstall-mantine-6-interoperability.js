const fs = require('fs');
const path = require('path');

// Check if __dirname contains a node_modules directory
const nodeModulesIndex = __dirname.indexOf('node_modules');
const packageDir =
  nodeModulesIndex !== -1
    ? path.join(__dirname.slice(0, nodeModulesIndex), 'node_modules', '@mantine6')
    : path.join(__dirname, '..', 'node_modules', '@mantine6');

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
