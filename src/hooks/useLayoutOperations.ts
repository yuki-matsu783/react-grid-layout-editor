import { GridItem, Layout, ButtonProps, GridLayoutProps, TextFieldProps, RadioGroupProps } from '../types';

/**
 * レイアウト操作に関する共通ロジックを提供するカスタムフック
 * グリッドレイアウト内のコンポーネントの配置、更新、削除などの操作を管理する
 * @returns レイアウト操作に関する関数群
 */
export const useLayoutOperations = () => {
  /**
   * 指定されたサイズのコンポーネントを配置可能な位置を探索する
   * グリッド内の空きスペースを上から順に探索し、最初に見つかった利用可能な位置を返す
   * @param w - 配置したいコンポーネントの幅
   * @param h - 配置したいコンポーネントの高さ
   * @param targetItems - 現在配置されているアイテムの配列
   * @returns 利用可能な位置の座標と配置可能かどうかのフラグ
   */
  const findAvailablePosition = (w: number, h: number, targetItems: GridItem[]): { x: number, y: number, canPlace: boolean } => {
    // 12x12のグリッドを初期化（false = 空きスペース）
    const grid = Array(12).fill(null).map(() => Array(12).fill(false));

    // 既存のアイテムが占有しているスペースを再帰的にマークする関数
    const markOccupiedSpace = (nodes: GridItem[]) => {
      nodes.forEach(item => {
        const { x, y, w: itemW, h: itemH } = item.layout;
        // 既存アイテムの占有スペースをマーク
        for (let i = x; i < x + itemW && i < 12; i++) {
          for (let j = y; j < y + itemH && j < 12; j++) {
            if (i >= 0 && j >= 0) {
              grid[i][j] = true;
            }
          }
        }
        // グリッドレイアウトの場合は子要素も処理
        if (item.component.type === 'gridLayout' && item.component.props.children.length > 0) {
          markOccupiedSpace(item.component.props.children);
        }
      });
    };

    // 既存アイテムの占有スペースをマーク
    markOccupiedSpace(targetItems);

    // 利用可能な位置を上から順に探索
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
   * 指定されたアイテムのレイアウトを再帰的に更新する
   * グリッドレイアウト内の任意の深さにあるアイテムのレイアウトを更新可能
   * @param nodes - 更新対象のノード配列
   * @param itemId - 更新するアイテムのID
   * @param newLayout - 新しいレイアウト情報
   * @returns 更新されたノード配列
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
   * 指定された親ノードに子ノードを追加する
   * グリッドレイアウトコンポーネントの子要素として新しいアイテムを追加
   * @param nodes - 追加対象のノード配列
   * @param parentId - 親ノードのID
   * @param child - 追加する子ノード
   * @returns 更新されたノード配列
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
   * 指定されたノードをツリーから削除する
   * グリッドレイアウト内の任意の深さにあるアイテムを削除可能
   * @param nodes - 削除対象のノード配列
   * @param targetId - 削除するノードのID
   * @returns 更新されたノード配列
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
   * 指定されたアイテムのプロパティを更新する
   * コンポーネントの種類に応じて適切なプロパティを更新
   * @param nodes - 更新対象のノード配列
   * @param itemId - 更新するアイテムのID
   * @param newProps - 新しいプロパティ（コンポーネントの種類に応じた型）
   * @returns 更新されたノード配列
   */
  const updateItemProps = (
    nodes: GridItem[],
    itemId: string,
    newProps: Partial<ButtonProps | GridLayoutProps | TextFieldProps | RadioGroupProps>
  ): GridItem[] => {
    return nodes.map(node => {
      if (node.id === itemId) {
        // コンポーネントの複製を作成
        const updatedComponent = { ...node.component };
        const componentType = updatedComponent.type;
        
        // コンポーネントの種類に応じてプロパティを更新
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
          case 'radioGroup':
            updatedComponent.props = {
              ...updatedComponent.props,
              ...(newProps as Partial<RadioGroupProps>)
            } as RadioGroupProps;
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
