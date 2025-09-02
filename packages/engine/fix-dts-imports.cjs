const fs = require('fs');
const path = require('path');

console.log('Fixing import extensions in declaration files...');

// 修复声明文件中的相对导入路径
function fixImportExtensions(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixImportExtensions(filePath);
    } else if (file.endsWith('.d.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 为相对导入添加.js扩展名
      content = content.replace(/from\s+['"](\.{1,2}\/[^'"]*?)['"]/g, (match, importPath) => {
        if (!importPath.endsWith('.js') && !importPath.endsWith('.json')) {
          return `from '${importPath}.js'`;
        }
        return match;
      });
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed imports in ${filePath}`);
    }
  });
}

fixImportExtensions('dist');
console.log('Declaration files fixed successfully!');