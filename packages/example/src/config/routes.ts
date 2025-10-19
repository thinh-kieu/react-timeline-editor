import { RouteObject } from 'react-router-dom';

// 路由配置接口
export interface RouteConfig {
  id: string;
  path: string;
  componentName: string;
  title: string;
  description: string;
  status: 'ready' | 'planned' | 'development';
}

// 路由配置数组
export const routes: RouteConfig[] = [
  {
    id: 'main',
    path: '/main',
    componentName: 'MainPage',
    title: '主页面',
    description: '所有示例的导航页面',
    status: 'ready'
  },
  {
    id: 'basic',
    path: '/basic',
    componentName: 'BasicExample',
    title: '基础示例',
    description: '展示React基础功能和组件交互',
    status: 'ready'
  },
  {
    id: 'timeline',
    path: '/timeline',
    componentName: 'TimelineExample',
    title: '时间线编辑器',
    description: '时间线编辑器的基本功能演示',
    status: 'ready'
  },
  {
    id: 'animation',
    path: '/animation',
    componentName: 'AnimationExample',
    title: '动画示例',
    description: 'CSS动画效果和过渡演示',
    status: 'ready'
  }];

// 获取可用的路由（状态为ready）
export const getAvailableRoutes = () => {
  return routes.filter(route => route.status === 'ready');
};

// 根据ID查找路由
export const findRouteById = (id: string) => {
  return routes.find(route => route.id === id);
};

// 添加新路由
export const addRoute = (routeConfig: Omit<RouteConfig, 'componentName'>) => {
  const newRoute: RouteConfig = {
    ...routeConfig,
    componentName: capitalizeFirst(routeConfig.id)
  };

  routes.push(newRoute);
  return newRoute;
};

// 辅助函数：首字母大写
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
