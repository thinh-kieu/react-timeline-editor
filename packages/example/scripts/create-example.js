#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const componentsDir = path.join(projectRoot, 'src', 'components');
const entriesDir = path.join(projectRoot, 'src', 'entries');
const configFile = path.join(projectRoot, 'src', 'config', 'examples.ts');

// 获取示例名称参数
const exampleName = process.argv[2];

if (!exampleName) {
  console.error('❌ 请提供示例名称，例如: node scripts/create-example.js my-example');
  process.exit(1);
}

// 验证示例名称格式
if (!/^[a-z][a-z0-9-]*$/.test(exampleName)) {
  console.error('❌ 示例名称只能包含小写字母、数字和连字符，且必须以字母开头');
  process.exit(1);
}

// 检查示例是否已存在
const exampleDir = path.join(componentsDir, exampleName);
if (fs.existsSync(exampleDir)) {
  console.error(`❌ 示例 "${exampleName}" 已存在`);
  process.exit(1);
}

// 创建示例文件夹
fs.mkdirSync(exampleDir, { recursive: true });
console.log(`✅ 创建示例文件夹: ${exampleName}`);

// 创建组件文件
const componentContent = `import React from 'react';
import { useNavigate } from 'react-router-dom';
import './${exampleName}.css';

interface ${capitalizeFirst(exampleName)}Props {
  // 组件属性定义
}

const ${capitalizeFirst(exampleName)}: React.FC<${capitalizeFirst(exampleName)}Props> = () => {
  const navigate = useNavigate();

  return (
    <div className="${exampleName}-container">
      <div className="page-header">
        <button
          className="back-button"
          onClick={() => navigate('/main')}
        >
          ← 返回主页面
        </button>
        <h1>${capitalizeFirst(exampleName)} 示例</h1>
      </div>
      <p>这是 ${exampleName} 示例的占位内容</p>
      <div className="${exampleName}-content">
        {/* 示例内容将在这里实现 */}
      </div>
    </div>
  );
};

export default ${capitalizeFirst(exampleName)};
`;

fs.writeFileSync(path.join(exampleDir, `index.tsx`), componentContent);
console.log(`✅ 创建组件文件: ${exampleName}/index.tsx`);

// 创建样式文件
const cssContent = `.${exampleName}-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.${exampleName}-container .page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.${exampleName}-container .back-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 20px;
  font-size: 14px;
}

.${exampleName}-container .back-button:hover {
  background: #0056b3;
}

.${exampleName}-container h1 {
  color: #333;
  margin: 0;
}

.${exampleName}-container p {
  color: #666;
  margin-bottom: 24px;
}

.${exampleName}-content {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 200px;
}`;

fs.writeFileSync(path.join(exampleDir, `index.less`), cssContent);
console.log(`✅ 创建样式文件: ${exampleName}/index.less`);

// 创建入口文件
const entryContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import ${capitalizeFirst(exampleName)} from '../components/${exampleName}';
import './index.less';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <${capitalizeFirst(exampleName)} />
  </React.StrictMode>
);
`;

fs.writeFileSync(path.join(entriesDir, `${exampleName}.tsx`), entryContent);
console.log(`✅ 创建入口文件: ${exampleName}.tsx`);

// 更新配置文件
updateConfigFile(exampleName);

// 更新路由配置
updateRouteConfig(exampleName);

// 更新主入口文件
updateMainEntry(exampleName);

console.log(`\n🎉 示例 "${exampleName}" 创建成功！`);
console.log(`📁 组件位置: src/components/${exampleName}/`);
console.log(`📄 入口文件: src/entries/${exampleName}.tsx`);
console.log(`🔧 配置已自动添加到 src/config/examples.ts`);
console.log(`🛣️  路由配置已自动更新`);
console.log(`🚀 主入口文件已自动更新`);

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateConfigFile(exampleName) {
  const configContent = fs.readFileSync(configFile, 'utf8');

  // 找到示例数组的结束位置
  const examplesEndIndex = configContent.lastIndexOf('];');
  if (examplesEndIndex === -1) {
    console.error('❌ 无法找到配置文件中的示例数组');
    return;
  }

  // 在数组结束前插入新示例
  const newExample = `,
  {
    id: '${exampleName}',
    title: '${capitalizeFirst(exampleName)}',
    description: '${capitalizeFirst(exampleName)} 示例描述',
    route: '/${exampleName}',
    icon: '⭐',
    color: '#${Math.floor(Math.random()*16777215).toString(16)}',
    status: 'development'
  }`;

  const updatedContent = configContent.slice(0, examplesEndIndex) + newExample + configContent.slice(examplesEndIndex);

  fs.writeFileSync(configFile, updatedContent);
  console.log(`✅ 更新配置文件: examples.ts`);
}

function updateRouteConfig(exampleName) {
  const routesFile = path.join(projectRoot, 'src', 'config', 'routes.ts');
  let routesContent = fs.readFileSync(routesFile, 'utf8');

  // 在routes数组末尾添加新路由
  const routeToAdd = `,\n  {\n    id: '${exampleName}',\n    path: '/${exampleName}',\n    componentName: '${capitalizeFirst(exampleName)}',\n    title: '${capitalizeFirst(exampleName)}',\n    description: '${capitalizeFirst(exampleName)} 示例描述',\n    status: 'development'\n  }`;

  // 找到routes数组的结束位置并插入新路由
  const routesArrayEnd = routesContent.indexOf('];');
  if (routesArrayEnd !== -1) {
    routesContent = routesContent.slice(0, routesArrayEnd) + routeToAdd + routesContent.slice(routesArrayEnd);
    fs.writeFileSync(routesFile, routesContent);
    console.log(`✅ 更新路由配置: routes.ts`);
  } else {
    console.error('❌ 无法找到路由配置中的数组结束位置');
  }
}

function updateMainEntry(exampleName) {
  const mainEntryFile = path.join(projectRoot, 'src', 'entries', 'main.tsx');
  let mainEntryContent = fs.readFileSync(mainEntryFile, 'utf8');

  // 添加新组件的导入
  const importToAdd = `\nimport ${capitalizeFirst(exampleName)} from '../components/${exampleName}';`;
  const importSectionEnd = mainEntryContent.indexOf('// 组件映射表');
  if (importSectionEnd !== -1) {
    mainEntryContent = mainEntryContent.slice(0, importSectionEnd) + importToAdd + '\n' + mainEntryContent.slice(importSectionEnd);
  }

  // 在组件映射表中添加新组件
  const componentMapEnd = mainEntryContent.indexOf('};');
  if (componentMapEnd !== -1) {
    const mapToAdd = `\n  ${capitalizeFirst(exampleName)},`;
    mainEntryContent = mainEntryContent.slice(0, componentMapEnd) + mapToAdd + mainEntryContent.slice(componentMapEnd);
  }

  // 写入更新后的主入口文件
  fs.writeFileSync(mainEntryFile, mainEntryContent);
  console.log(`✅ 更新主入口文件: main.tsx`);
}
