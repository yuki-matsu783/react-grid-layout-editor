import type { PageLayout, LayoutItem } from '../types';

// MUIコンポーネントのインポート文を生成
const generateImports = (layout: PageLayout): string => {
  const components = new Set<string>();
  
  Object.values(layout.settings.responsive.layouts).forEach(items => {
    items.forEach(item => {
      components.add(item.component.type);
    });
  });

  return `import { ${Array.from(components).join(', ')} } from '@mui/material';`;
};

// レイアウト用の型定義を生成
const generateTypes = (): string => {
  return `
type ResponsiveLayout = {
  [breakpoint: string]: {
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
};
`;
};

// コンポーネントのプロパティを文字列に変換
const stringifyProps = (props: Record<string, any>): string => {
  return Object.entries(props)
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}="${value}"`;
      if (typeof value === 'boolean') return value ? key : null;
      return `${key}={${value}}`;
    })
    .filter(Boolean)
    .join(' ');
};

// スタイルオブジェクトを文字列に変換
const stringifyStyles = (styles: Record<string, any>): string => {
  return Object.entries(styles)
    .map(([key, value]) => `${key}: '${value}'`)
    .join(',\n        ');
};

// コンポーネントをJSXに変換
const generateComponent = (item: LayoutItem): string => {
  const { component } = item;
  const props = stringifyProps(component.props);
  const customStyles = stringifyStyles(component.styles.custom);
  const muiStyles = stringifyStyles(component.styles.mui);

  return `
      <${component.type}
        ${props}
        sx={{
          ${customStyles}
          ${muiStyles ? `\n          ${muiStyles}` : ''}
        }}
      >
      </${component.type}>`;
};

// レイアウトロジックを生成
const generateLayoutLogic = (layout: PageLayout): string => {
  return `
const useResponsiveLayout = (): ResponsiveLayout => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up('sm'));
  const isMd = useMediaQuery(theme.breakpoints.up('md'));
  const isLg = useMediaQuery(theme.breakpoints.up('lg'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  if (isXl) return layouts.xl;
  if (isLg) return layouts.lg;
  if (isMd) return layouts.md;
  if (isSm) return layouts.sm;
  return layouts.xs;
};`;
};

// レイアウトデータを生成
const generateLayoutData = (layout: PageLayout): string => {
  return `
const layouts = {
  ${Object.entries(layout.settings.responsive.layouts)
    .map(([breakpoint, items]) => `
  ${breakpoint}: [
    ${items.map(item => `
    {
      id: '${item.id}',
      x: ${item.x},
      y: ${item.y},
      w: ${item.w},
      h: ${item.h},
    }`).join(',')},
  ]`).join(',')}
};`;
};

// メインコンポーネントを生成
const generateMainComponent = (layout: PageLayout): string => {
  const components = Object.values(layout.settings.responsive.layouts)
    .flat()
    .map(item => generateComponent(item))
    .join('\n');

  return `
export const GeneratedLayout: React.FC = () => {
  const currentLayout = useResponsiveLayout();
  
  return (
    <Box
      sx={{
        display: 'grid',
        gap: ${layout.settings.grid.padding},
        gridTemplateColumns: 'repeat(${layout.settings.grid.columns}, 1fr)',
        padding: ${layout.settings.grid.padding},
      }}
    >
      ${components}
    </Box>
  );
};`;
};

// 完全なコードを生成
export const generateCode = (layout: PageLayout): string => {
  return `import React from 'react';
import { useTheme, useMediaQuery, Box } from '@mui/material';
${generateImports(layout)}

${generateTypes()}

${generateLayoutData(layout)}

${generateLayoutLogic(layout)}

${generateMainComponent(layout)}
`;
};
