import { GridItem, Layout, ButtonProps, GridLayoutProps, TextFieldProps } from '../types';

/**
 * レイアウト操作に関する共通ロジックを提供するカスタムフック
 */
export const useLayoutOperations = () => {
  /**
   * 指定された位置が利用可能かどうかを確認し、利用可能な位置を返す
   */
  const findAvailablePosition = (w: number, h: number, targetItems: GridItem[]): { x: number, y: number, canPlace: boolean } => {
    const grid = Array(12).fill(null).map(() => Array(12).fill(false));
    
    const markOccupiedSpace = (nodes: GridItem[]) => {
      nodes.forEach(item => {
        const { x, y, w: itemW, h: itemH } = item.layout;
        for (let i = x; i < x + itemW && i < 12; i++) {
          for (let j = y; j < y + itemH && j < 12; j++) {
            if (i >= 0 && j >= 0) {
              grid[i][j] = true;
            }
          }
        }
        if (item.component.type === 'gridLayout' && item.component.props.children.length > 0) {
          markOccupiedSpace(item.component.props.children);
        }
      });
    };

    markOccupiedSpace(targetItems);

    for (let y = 0; y < 12; y++) {
      for (let x = 0; x <= 12 - w; x++) {
        let canPlace = true;
        for (let i = x; i < x + w && canPlace; i++) {
          for (let j = y; j < y + h && canPlace; j++) {
            if (grid[i][j]) {
              canPlace = false;
            }
          }
        }
        if (canPlace) {
          return { x, y, canPlace: true };
        }
      }
    }
    return { x: 0, y: 0, canPlace: false };
  };

  /**
   * 指定されたアイテムのレイアウトを再帰的に更新
   */
  const updateLayoutInTree = (nodes: GridItem[], itemId: string, newLayout: Layout): GridItem[] => {
    return nodes.map(node => {
      if (node.id === itemId) {
        return {
          ...node,
          layout: {
            ...node.layout,
            ...newLayout
          }
        };
      }
      if (node.component.type === 'gridLayout') {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              ...node.component.props,
              children: updateLayoutInTree(node.component.props.children, itemId, newLayout)
            }
          }
        };
      }
      return node;
    });
  };

  /**
   * 指定された親ノードに子ノードを追加
   */
  const addChildToTree = (nodes: GridItem[], parentId: string, child: GridItem): GridItem[] => {
    return nodes.map(node => {
      if (node.id === parentId && node.component.type === 'gridLayout') {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              ...node.component.props,
              children: [...node.component.props.children, child]
            }
          }
        };
      }
      if (node.component.type === 'gridLayout') {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              ...node.component.props,
              children: addChildToTree(node.component.props.children, parentId, child)
            }
          }
        };
      }
      return node;
    });
  };

  /**
   * 指定されたノードをツリーから削除
   */
  const removeFromTree = (nodes: GridItem[], targetId: string): GridItem[] => {
    return nodes
      .filter(node => node.id !== targetId)
      .map(node => {
        if (node.component.type === 'gridLayout') {
          return {
            ...node,
            component: {
              ...node.component,
              props: {
                ...node.component.props,
                children: removeFromTree(node.component.props.children, targetId)
              }
            }
          };
        }
        return node;
      });
  };

  /**
   * 指定されたアイテムのプロパティを更新
   */
  const updateItemProps = (
    nodes: GridItem[],
    itemId: string,
    newProps: Partial<ButtonProps | GridLayoutProps | TextFieldProps>
  ): GridItem[] => {
    return nodes.map(node => {
      if (node.id === itemId) {
        const updatedComponent = { ...node.component };
        const componentType = updatedComponent.type;
        
        switch (componentType) {
          case 'button':
            updatedComponent.props = {
              ...updatedComponent.props,
              ...(newProps as Partial<ButtonProps>)
            } as ButtonProps;
            break;
          case 'textField':
            updatedComponent.props = {
              ...updatedComponent.props,
              ...(newProps as Partial<TextFieldProps>)
            } as TextFieldProps;
            break;
          case 'gridLayout':
            updatedComponent.props = {
              ...updatedComponent.props,
              ...(newProps as Partial<GridLayoutProps>)
            } as GridLayoutProps;
            break;
          default:
            console.warn(`Unsupported component type: ${componentType}`);
            return node;
        }
        
        return {
          ...node,
          component: updatedComponent
        };
      }
      
      if (node.component.type === 'gridLayout') {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              ...node.component.props,
              children: updateItemProps(node.component.props.children, itemId, newProps)
            }
          }
        };
      }
      
      return node;
    });
  };

  return {
    findAvailablePosition,
    updateLayoutInTree,
    addChildToTree,
    removeFromTree,
    updateItemProps,
  };
};
