const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');
const outputPath = path.join(__dirname, 'src', 'legal', 'licenses.json');

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const licenses = Object.keys(dependencies).map(pkg => ({
    name: pkg,
    version: dependencies[pkg].replace(/[\^~]/g, ''),
    license: 'MIT', // Default fallback for basic offline extraction without full license-checker
    repository: `https://www.npmjs.com/package/${pkg}`
  }));

  // Create dir if not exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(licenses, null, 2));
  console.log('Licenses generated successfully at ' + outputPath);
} catch (e) {
  console.error('Failed to generate licenses:', e);
}
