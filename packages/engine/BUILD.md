# Engine Package Build Configuration

## 打包配置说明

本包已从 `tsc` 迁移到 `Rollup`，支持开发模式和生产模式两种打包方式。

## 可用的脚本命令

### 开发模式
```bash
# 开发模式打包（包含source map，不压缩）
npm run build:dev

# 开发模式监听（实时编译）
npm run dev
```

### 生产模式
```bash
# 生产模式打包（压缩，移除console）
npm run build

# 生产模式监听
npm run dev:prod
```

### 其他命令
```bash
# 清理dist目录
npm run clean

# 使用tsc编译（备用）
npm run build:tsc
```

## 输出文件

### 开发模式输出
- `dist/index.esm.js` - ES模块版本（含source map）
- `dist/index.cjs.js` - CommonJS版本（含source map）
- `dist/index.d.ts` - TypeScript声明文件

### 生产模式输出
- `dist/index.esm.js` - ES模块版本（压缩）
- `dist/index.cjs.js` - CommonJS版本（压缩）
- `dist/index.umd.js` - UMD版本（压缩）
- `dist/index.umd.min.js` - UMD版本（压缩+最小化）
- `dist/index.d.ts` - TypeScript声明文件

## 配置特点

1. **开发模式**
   - 包含完整的source map
   - 代码不压缩，便于调试
   - 支持文件监听和热重载

2. **生产模式**
   - 代码压缩优化
   - 移除console.log等调试代码
   - 生成多种模块格式
   - 包含source map用于错误追踪

## 环境变量

- `NODE_ENV=development` - 开发模式
- `NODE_ENV=production` - 生产模式（默认）

## 依赖说明

- **外部依赖**：React被标记为外部依赖，不会被打包
- **Tree-shaking**：支持ES模块的tree-shaking优化
- **类型支持**：自动生成TypeScript声明文件