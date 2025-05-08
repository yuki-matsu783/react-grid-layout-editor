import type { 
  GridItem, 
  ButtonProps, 
  TextFieldProps, 
  RadioGroupProps, 
  HasChildrenProps,
  BaseLayoutProps,
} from '../../../types';

/**
 * コンポーネントツリーからReactコードを生成するためのカスタムフック
 * react-grid-layoutからMUI Gridへの変換を行う
 */
export const useSourceCodeGenerator = () => {
  /**
   * コンポーネントのインポート文を生成
   */
  const generateImports = (items: GridItem[]): string => {
    const imports = new Set<string>(['import React from "react";']);
    const muiComponents = new Set<string>();

    const addMuiComponent = (name: string) => {
      muiComponents.add(name);
    };

    // コンポーネントツリーを走査してインポートを収集
    const collectImports = (item: GridItem) => {
      const { type } = item.component;
      
      if (type === 'gridLayout') {
        addMuiComponent('Grid');
      } else if (type === 'rowStack' || type === 'colStack') {
        addMuiComponent('Stack');
      } else if (type === 'button') {
        addMuiComponent('Button');
      } else if (type === 'textField') {
        addMuiComponent('TextField');
      } else if (type === 'radioGroup') {
        addMuiComponent('RadioGroup');
        addMuiComponent('FormControl');
        addMuiComponent('FormLabel');
        addMuiComponent('FormControlLabel');
        addMuiComponent('Radio');
      }

      // レイアウトコンポーネントの子要素を処理
      const props = item.component.props as (HasChildrenProps & BaseLayoutProps);
      if ('children' in props && props.children) {
        props.children.forEach(collectImports);
      }
    };

    items.forEach(collectImports);

    // MUIコンポーネントのインポート文を生成
    if (muiComponents.size > 0) {
      imports.add(`import { ${Array.from(muiComponents).sort().join(', ')} } from '@mui/material';`);
    }

    return Array.from(imports).join('\n');
  };

  /**
   * グリッドレイアウトのサイズをMUIのグリッドサイズに変換
   * @param layout グリッドレイアウト情報
   */
  const convertToGridSize = (layout: { w: number; h: number }) => {
    // 12列グリッドを基準にした場合の比率を計算
    const xs = Math.round((layout.w / 12) * 12);
    return { xs };
  };

  /**
   * コンポーネントのプロパティを文字列に変換
   * @param props コンポーネントのプロパティ
   */
  const stringifyProps = (props: Record<string, any>): string => {
    const propStrings: string[] = [];

    Object.entries(props).forEach(([key, value]) => {
      if (key !== 'children' && value !== undefined) {
        if (typeof value === 'string') {
          propStrings.push(`${key}="${value}"`);
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          propStrings.push(`${key}={${value}}`);
        } else if (typeof value === 'object') {
          propStrings.push(`${key}={${JSON.stringify(value)}}`);
        }
      }
    });

    return propStrings.join(' ');
  };

  /**
   * コンポーネントのJSXを生成
   * @param item グリッドアイテム
   * @param indentLevel インデントレベル
   */
  /**
   * グリッドアイテムの基本スタイルを生成
   */
  const generateSectionProps = (item: GridItem) => {
    return {
      'data-grid': item.layout,
      className: "grid-item",
      sx: {
        position: 'relative',
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    };
  };

  /**
   * コンポーネント内部のBoxスタイルを生成
   */
  const generateWrapperProps = (item: GridItem, parentType: 'grid' | 'stack' = 'grid') => {
    const { horizontalAlign, verticalAlign, widthPercentage, heightPercentage, paddingPercentage } = item.component.props;
    const justifyContent = horizontalAlign === 'start' ? 'flex-start'
      : horizontalAlign === 'end' ? 'flex-end'
      : 'center';
    
    const alignItems = verticalAlign === 'start' ? 'flex-start'
      : verticalAlign === 'end' ? 'flex-end'
      : 'center';

    return {
      sx: {
        border: '0.5px dotted #e0e0e0',
        borderRadius: '4px',
        ...(parentType === 'grid' ? {
          width: `${widthPercentage}%`,
          height: `${heightPercentage}%`,
        } : {
          width: item.component.props.width !== undefined ? item.component.props.width : 'auto',
          height: item.component.props.height !== undefined ? item.component.props.height : 'auto',
        }),
        padding: `${paddingPercentage ?? 0}%`,
        overflow: 'auto',
        display: 'flex',
        alignItems,
        justifyContent,
      }
    };
  };

  /**
   * コンポーネントのJSXを生成
   */
  const generateComponentJSX = (item: GridItem, indentLevel: number = 1): string => {
    const indent = '  '.repeat(indentLevel);
    const { type, props } = item.component;
    const sectionProps = generateSectionProps(item);
    const wrapperProps = generateWrapperProps(item);

    // 各コンポーネントタイプに応じたプロパティの型付け
    const componentProps = props as ButtonProps | TextFieldProps | RadioGroupProps | (HasChildrenProps & BaseLayoutProps);

    // レイアウトコンポーネントの場合
    if (type === 'gridLayout') {
      const gridProps = stringifyProps({
        container: true,
        spacing: 0,
        ...props,
      });

      const layoutProps = props as HasChildrenProps & BaseLayoutProps;
      const childrenJSX = layoutProps.children
        .map((child: GridItem) => {
          const gridItemProps = stringifyProps({
            item: true,
            ...convertToGridSize(child.layout),
          });

          return `${indent}  <Grid ${gridItemProps}>\n` +
                 generateComponentJSX(child, indentLevel + 2) +
                 `\n${indent}  </Grid>`;
        })
        .join('\n');

      return `${indent}<Box {...${JSON.stringify(sectionProps)}}>\n` +
             `${indent}  <Box {...${JSON.stringify(wrapperProps)}}>\n` +
             `${indent}    <Grid ${gridProps}>\n${childrenJSX}\n${indent}    </Grid>\n` +
             `${indent}  </Box>\n` +
             `${indent}</Box>`;
    }

    // スタックコンポーネントの場合
    if (type === 'rowStack' || type === 'colStack') {
      const layoutProps = props as HasChildrenProps & BaseLayoutProps;
      const stackStyleProps = stringifyProps({
        direction: type === 'rowStack' ? 'row' : 'column',
        spacing: 0,
        ...props,
      });

      const childrenJSX = layoutProps.children
        .map((child: GridItem) => generateComponentJSX(child, indentLevel + 1))
        .join('\n');

      return `${indent}<Box {...${JSON.stringify(sectionProps)}}>\n` +
             `${indent}  <Box {...${JSON.stringify(wrapperProps)}}>\n` +
             `${indent}    <Stack ${stackStyleProps}>\n${childrenJSX}\n${indent}    </Stack>\n` +
             `${indent}  </Box>\n` +
             `${indent}</Box>`;
    }

    // 基本コンポーネントの場合
    let componentJSX = '';
    switch (type) {
      case 'button':
        const buttonProps = props as ButtonProps;
        componentJSX = `${indent}<Box {...${JSON.stringify(sectionProps)}}>\n` +
                      `${indent}  <Box {...${JSON.stringify(wrapperProps)}}>\n` +
                      `${indent}    <Button ${stringifyProps(props)}>${buttonProps.label || ''}</Button>\n` +
                      `${indent}  </Box>\n` +
                      `${indent}</Box>`;
        break;

      case 'textField':
        componentJSX = `${indent}<Box {...${JSON.stringify(sectionProps)}}>\n` +
                      `${indent}  <Box {...${JSON.stringify(wrapperProps)}}>\n` +
                      `${indent}    <TextField ${stringifyProps(props)} />\n` +
                      `${indent}  </Box>\n` +
                      `${indent}</Box>`;
        break;

      case 'radioGroup':
        const radioGroupProps = stringifyProps({
          ...props,
          defaultValue: props.options?.[0]?.value,
        });
        
        componentJSX = `${indent}<Box {...${JSON.stringify(sectionProps)}}>\n` +
                      `${indent}  <Box {...${JSON.stringify(wrapperProps)}}>\n` +
                      `${indent}    <FormControl component="fieldset">\n` +
                      `${indent}      <FormLabel component="legend">${props.label || ''}</FormLabel>\n` +
                      `${indent}      <RadioGroup ${radioGroupProps}>\n` +
                      props.options?.map((option: { label: string; value: string }) =>
                        `${indent}        <FormControlLabel value="${option.value}" control={<Radio />} label="${option.label}" />`
                      ).join('\n') +
                      `\n${indent}      </RadioGroup>\n` +
                      `${indent}    </FormControl>\n` +
                      `${indent}  </Box>\n` +
                      `${indent}</Box>`;
        break;

      default:
        return `${indent}<div>Unknown component type: ${type}</div>`;
    }

    return componentJSX;
  };

  /**
   * コンポーネントツリーからReactコンポーネントのソースコードを生成
   * @param items コンポーネントツリー
   */
  const generateSourceCode = (items: GridItem[]): string => {
    const imports = generateImports(items);
    const componentCode = items.map(item => generateComponentJSX(item, 1)).join('\n');

    return `${imports}

const GeneratedComponent: React.FC = () => {
  return (
    <>
${componentCode}
    </>
  );
};

export default GeneratedComponent;
`;
  };

  return {
    generateSourceCode
  };
};
