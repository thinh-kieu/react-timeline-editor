import { defineConfig } from 'dumi';
import path from 'path';

export default defineConfig({
  apiParser: {},
  resolve: {
    // 配置入口文件路径，API 解析将从这里开始
    entryFile: '../timeline/src/index.tsx',
  },
  themeConfig: {
    name: 'Timeline Editor',
    logo: '/assets/icon.png',
    nav: [
      { title: '指南', link: '/' },
      { title: '引擎', link: '/engine' },
      { title: 'API', link: '/data' },
      { title: '示例', link: '/editor-demo' },
    ],
  },

  favicons: ['https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png'],

  outputPath: 'docs-dist',
  locales: [{ id: 'zh-CN', name: '中文' }],
  styles: [`.__dumi-default-menu-header h1 {font-size: 24px}`],

  alias: {
    '@xzdarcy/react-timeline-editor': path.resolve(__dirname, '../timeline/src/index.tsx'),
    '@': path.resolve(__dirname, '../timeline/src'),
  },

  // more config: https://d.umijs.org/config
});
