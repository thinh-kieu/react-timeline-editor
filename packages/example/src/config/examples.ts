export interface ExampleItem {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
  status: 'ready' | 'planned' | 'development';
}

export const examples: ExampleItem[] = [
  {
    id: 'basic',
    title: '基础示例',
    description: '展示React基础功能和组件交互',
    route: '/basic',
    icon: '⚛️',
    color: '#007acc',
    status: 'ready'
  },
  {
    id: 'timeline',
    title: '时间线编辑器',
    description: '时间线编辑器的基本功能演示',
    route: '/timeline',
    icon: '⏰',
    color: '#ff6b6b',
    status: 'ready'
  },
  {
    id: 'animation',
    title: '动画示例',
    description: 'CSS动画效果和过渡演示',
    route: '/animation',
    icon: '🎬',
    color: '#51cf66',
    status: 'ready'
  },
  {
    id: 'advanced',
    title: '高级功能',
    description: '时间线编辑器的高级特性',
    route: '/advanced',
    icon: '🚀',
    color: '#fcc419',
    status: 'planned'
  },
  {
    id: 'integration',
    title: '集成示例',
    description: '与其他库的集成演示',
    route: '/integration',
    icon: '🔗',
    color: '#ae3ec9',
    status: 'planned'
  },
  {
    id: 'customization',
    title: '自定义主题',
    description: '主题定制和样式扩展',
    route: '/customization',
    icon: '🎨',
    color: '#20c997',
    status: 'development'
  }
];
