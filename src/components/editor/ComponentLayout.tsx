import React from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
import { Box, Button, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface NestedGridContainerProps {
  cols: { [key: string]: number };
  margin: [number, number];
  defaultRowHeight: number;
  children: React.ReactNode;
  isDraggable?: boolean;
  isResizable?: boolean;
  onLayoutChange?: (layout: Layout[]) => void;
  itemId?: string;
}

interface NestedGridContainerState {
  height: number;
  layouts?: Layout[];
}

interface GridItem {
  id: string;
  layout: Layout;
  children: GridItem[];
}

interface ComponentLayoutProps {
  className?: string;
  cols: { [key: string]: number };
  rowHeight: number;
  margin: [number, number];
}

interface ComponentLayoutState {
  items: GridItem[];
  selectedItemId: string | null;
  editTargetId: string | null;
}

/**
 * ユニークなID文字列を生成する
 * @param prefix - 生成されるIDのプレフィックス（デフォルト: "item"）
 * @returns プレフィックスとランダムな文字列を組み合わせたユニークID
 */
function generateId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 自身の高さを測定し、動的なrowHeight（高さ/12）を提供するグリッドコンテナ
 * 子要素のグリッドレイアウトを管理し、サイズ変更に応じて自動的に調整する
 */
class NestedGridContainer extends React.PureComponent<NestedGridContainerProps, NestedGridContainerState> {
  private containerRef = React.createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null;

  constructor(props: NestedGridContainerProps) {
    super(props);
    this.state = { height: 0 };
    this.resizeObserver = null;
  }

  /**
   * コンポーネントがマウントされた際の処理
   * 高さの初期測定を行い、ResizeObserverを設定して
   * サイズ変更を監視する
   */
  componentDidMount() {
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => this.updateHeight());
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  /**
   * コンポーネントがアンマウントされる際の処理
   * ResizeObserverを解除してメモリリークを防止する
   */
  componentWillUnmount() {
    if (this.resizeObserver && this.containerRef.current) {
      this.resizeObserver.unobserve(this.containerRef.current);
    }
  }

  /**
   * コンテナの高さを測定し、必要に応じてstateを更新する
   * 高さが変更された場合のみstateを更新することで、
   * 不要な再レンダリングを防止する
   */
  updateHeight() {
    const el = this.containerRef.current;
    if (el) {
      const h = el.clientHeight;
      if (h !== this.state.height) {
        this.setState({ height: h });
      }
    }
  }

  /**
   * 子要素のレイアウトが変更された際のハンドラー
   * 親コンポーネントに変更を通知し、内部のレイアウト状態も更新する
   * @param layout - 新しいレイアウト配列
   */
  handleNestedLayoutChange = (layout: Layout[]) => {
    console.log('NestedGridContainer layout change:', layout);
    console.log('Container props:', this.props);
    
    const { onLayoutChange, itemId } = this.props;
    if (onLayoutChange) {
      // layout.iにlayout_プレフィックスを追加して親へ通知
      const updatedLayout = layout.map(item => ({
        ...item,
        i: item.i.startsWith('layout_') ? item.i : `layout_${item.i}`
      }));
      console.log('Notifying parent with layout:', updatedLayout);
      onLayoutChange(updatedLayout);
    }
    this.setState({ layouts: layout });
  };

  /**
   * コンポーネントをレンダリングする
   * コンテナのサイズに応じて動的に行の高さを計算し、
   * グリッドレイアウトを適用して子要素を表示する
   */
  render() {
    const { defaultRowHeight, children, ...rest } = this.props;
    const { height } = this.state;
    const rowHeight = height > 0 ? height / 12 : defaultRowHeight;

    // 常に12カラムのグリッドを使用
    const fixedCols = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };

    return (
      <div ref={this.containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveReactGridLayout
          {...rest}
          cols={fixedCols}
          rowHeight={rowHeight}
          onLayoutChange={this.handleNestedLayoutChange}
          compactType={null}
          preventCollision
        >
          {children}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

/**
 * ネストされたグリッドレイアウトを管理するメインコンポーネント
 * 複数の入れ子になったグリッドアイテムの配置、サイズ変更、ドラッグ＆ドロップを制御する
 */
export default class ComponentLayout extends React.PureComponent<ComponentLayoutProps, ComponentLayoutState> {
  constructor(props: ComponentLayoutProps) {
    super(props);
    const rootId = generateId();
    this.state = {
      items: [
        {
          id: rootId,
          layout: { i: `layout_${rootId}`, x: 0, y: 0, w: 12, h: 4 },
          children: []
        }
      ],
      selectedItemId: null,
      editTargetId: null
    };
  }

  /**
   * 指定されたアイテムのレイアウトを更新する
   * @param itemId - 更新対象のアイテムID
   * @param newLayout - 新しいレイアウト設定
   */
  updateItemLayout = (itemId: string, newLayout: Layout) => {
    this.setState(prevState => ({
      ...prevState,
      items: this.updateLayoutInTree(prevState.items, itemId, newLayout)
    }));
  };

  /**
   * ツリー構造内の特定アイテムのレイアウトを再帰的に更新する
   * @param nodes - 更新対象のツリー構造
   * @param itemId - 更新対象のアイテムID
   * @param newLayout - 新しいレイアウト設定
   * @returns 更新されたツリー構造
   */
  updateLayoutInTree = (nodes: GridItem[], itemId: string, newLayout: Layout): GridItem[] => {
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
      if (node.children.length) {
        return {
          ...node,
          children: this.updateLayoutInTree(node.children, itemId, newLayout)
        };
      }
      return node;
    });
  };

  /**
   * レイアウトの変更を処理し、影響を受けるアイテムを更新する
   * @param layout - 変更後のレイアウト配列
   */
  /**
   * アイテムのレイアウトIDを生成する
   * @param itemId - アイテムのID
   * @returns レイアウトID
   */
  generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   * @param layoutId - レイアウトID
   * @returns アイテムID
   */
  extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  handleLayoutChange = (layout: Layout[]) => {
    console.log('handleLayoutChange called with:', layout);
    
    const processedLayout = layout.map(layoutItem => {
      const itemId = this.extractItemId(layoutItem.i);
      const newLayoutItem = {
        ...layoutItem,
        i: this.generateLayoutId(itemId)
      };
      console.log('Processing layout item:', { original: layoutItem, processed: newLayoutItem });
      return newLayoutItem;
    });

    processedLayout.forEach(layoutItem => {
      const itemId = this.extractItemId(layoutItem.i);
      console.log('Looking for item with id:', itemId);
      const affectedItem = this.findItemInTree(this.state.items, itemId);
      
      if (affectedItem) {
        console.log('Updating layout for item:', affectedItem);
        this.updateItemLayout(affectedItem.id, layoutItem);
      } else {
        console.log('Item not found for layout:', layoutItem);
      }
    });
  };

  /**
   * ツリー構造から指定されたIDを持つアイテムを検索する
   * @param nodes - 検索対象のツリー構造
   * @param id - 検索するアイテムのID
   * @returns 見つかったアイテム、または null
   */
  findItemInTree = (nodes: GridItem[], id: string): GridItem | null => {
    console.log('findItemInTree called with id:', id);
    console.log('searching in nodes:', nodes);
    
    for (const node of nodes) {
      if (node.id === id) {
        console.log('Found node:', node);
        return node;
      }
      if (node.children.length) {
        const found = this.findItemInTree(node.children, id);
        if (found) {
          console.log('Found node in children:', found);
          return found;
        }
      }
    }
    console.log('Node not found');
    return null;
  };

  /**
   * 指定されたサイズのアイテムを配置可能な位置を探す
   * 12x12のグリッド内で、既存のアイテムと重ならない位置を返す
   * @param w - 配置したいアイテムの幅
   * @param h - 配置したいアイテムの高さ
   * @param items - 現在配置されているアイテムの配列
   * @returns 配置可能な位置の座標と配置可能かどうかのフラグ
   */
  findAvailablePosition = (w: number, h: number, items: GridItem[]): { x: number, y: number, canPlace: boolean } => {
    // 12x12のグリッドを作成し、falseで初期化（false = 空いている状態）
    const grid = Array(12).fill(null).map(() => Array(12).fill(false));
    
    // 既存のアイテムで占有されているグリッドをマーク
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
        // 子アイテムも同様に処理
        if (item.children.length > 0) {
          markOccupiedSpace(item.children);
        }
      });
    };

    markOccupiedSpace(items);

    // 利用可能な位置を探す
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x <= 12 - w; x++) {
        let canPlace = true;
        
        // 指定のサイズが配置可能かチェック
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

    // 配置可能な位置が見つからなかった
    return { x: 0, y: 0, canPlace: false };
  };

  /**
   * アイテムの階層の深さを計算する
   * @param itemId - 計算対象のアイテムID
   * @returns 階層の深さ（ルートは0）
   */
  calculateDepth = (itemId: string): number => {
    const calculateDepthRecursive = (nodes: GridItem[], targetId: string, currentDepth: number = 0): number => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return currentDepth;
        }
        const childDepth = calculateDepthRecursive(node.children, targetId, currentDepth + 1);
        if (childDepth !== -1) {
          return childDepth;
        }
      }
      return -1;
    };

    return calculateDepthRecursive(this.state.items, itemId, 0);
  };

  /**
   * 新しいグリッドアイテムを追加する
   * 編集対象が選択されている場合は子要素として追加し、
   * そうでない場合はルートレベルに追加する
   */
  handleAddItem = () => {
    console.log('handleAddItem called');
    const { editTargetId, items } = this.state;

    // 階層の深さをチェック
    if (editTargetId) {
      const depth = this.calculateDepth(editTargetId);
      if (depth >= 4) { // 深さ4のアイテムに追加すると5階層目になるため
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return;
      }
    }
    
    // 追加先の要素を特定（編集対象または全体）
    const targetItems = editTargetId 
      ? this.findItemInTree(items, editTargetId)?.children || []
      : items;
    
    console.log('Target items:', targetItems);
    console.log('Edit target ID:', editTargetId);

    // まず2x2サイズでの配置を試みる
    const defaultPosition = this.findAvailablePosition(2, 2, targetItems);
    console.log('Default position (2x2):', defaultPosition);
    
    // 2x2で配置できない場合は1x1サイズを試みる
    const fallbackPosition = !defaultPosition.canPlace 
      ? this.findAvailablePosition(1, 1, targetItems)
      : defaultPosition;
    
    console.log('Fallback position:', fallbackPosition);

    // 1x1でも配置できない場合はアラートを表示して終了
    if (!fallbackPosition.canPlace) {
      alert('利用可能なスペースがありません。');
      return;
    }

    const itemId = generateId();
    const newItem = {
      id: itemId,
      layout: {
        i: `layout_${itemId}`,
        x: fallbackPosition.x,
        y: fallbackPosition.y,
        w: defaultPosition.canPlace ? 2 : 1,
        h: defaultPosition.canPlace ? 2 : 1
      },
      children: []
    };

    console.log('New item:', newItem);

    this.setState(prevState => {
      const { editTargetId } = prevState;
      const newItems = !editTargetId
        ? [...prevState.items, newItem]
        : this.addChildToTree(prevState.items, editTargetId, newItem);
      
      console.log('Updated items:', newItems);
      return {
        ...prevState,
        items: newItems
      };
    });
  };

  /**
   * 選択されているグリッドアイテムを削除する
   * 削除後は編集対象をクリアする
   */
  handleRemoveItem = () => {
    const { selectedItemId } = this.state;
    if (!selectedItemId) return;
    this.setState(prev => ({ 
      items: this.removeFromTree(prev.items, selectedItemId),
      selectedItemId: null,
      editTargetId: prev.editTargetId === selectedItemId ? null : prev.editTargetId
    }));
  };

  /**
   * ツリー構造の指定された親ノードに子要素を追加する
   * @param nodes - 更新対象のツリー構造
   * @param parentId - 親ノードのID
   * @param child - 追加する子要素
   * @returns 更新されたツリー構造
   */
  addChildToTree = (nodes: GridItem[], parentId: string, child: GridItem): GridItem[] => {
    console.log('addChildToTree called with parentId:', parentId);
    return nodes.map(node => {
      if (node.id === parentId) {
        console.log('Found parent node:', node);
        const updatedNode = { ...node, children: [...node.children, child] };
        console.log('Updated node:', updatedNode);
        return updatedNode;
      }
      if (node.children.length) {
        return { ...node, children: this.addChildToTree(node.children, parentId, child) };
      }
      return node;
    });
  };

  /**
   * ツリー構造から指定されたIDのノードを削除する
   * @param nodes - 更新対象のツリー構造
   * @param targetId - 削除対象のID
   * @returns 更新されたツリー構造
   */
  removeFromTree = (nodes: GridItem[], targetId: string): GridItem[] =>
    nodes
      .map(node => {
        if (node.id === targetId) return null;
        if (node.children.length) {
          return { ...node, children: this.removeFromTree(node.children, targetId) };
        }
        return node;
      })
      .filter((node): node is GridItem => node !== null);

  /**
   * グリッドアイテムを選択状態にする
   * @param id - 選択するアイテムのID
   */
  handleSelect = (id: string): void => this.setState({ selectedItemId: id });

  /**
   * 編集対象の切り替えを行う
   * 現在の編集対象と選択中のアイテムが同じ場合はクリアし、
   * 異なる場合は選択中のアイテムを編集対象に設定する
   */
  toggleEditTarget = () =>
    this.setState(prev => ({ editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId }));

  /**
   * 指定されたIDのアイテムまたはその子孫が選択されているかを確認する
   * @param selectedId - 確認対象の選択ID
   * @param nodes - 検索対象のツリー構造
   * @param excludeSelfId - 除外するID（自身のIDを除外する場合に使用）
   * @returns 選択状態の真偽値
   */
  isNestedItemSelected = (selectedId: string | null, nodes: GridItem[], excludeSelfId: string | null = null): boolean => {
    if (!selectedId) return false;
    const search = (items: GridItem[]): boolean =>
      items.some((item: GridItem) => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        return search(item.children);
      });
    return search(nodes);
  };

  /**
   * グリッドアイテムをレンダリングする
   * 選択状態や編集対象の状態に応じて、スタイルや挙動を変更する
   * @param item - レンダリングするグリッドアイテム
   * @returns レンダリングされたReactノード
   */
  renderElement = (item: GridItem): React.ReactNode => {
    const { selectedItemId, editTargetId } = this.state;
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;
    const isChildSelected = this.isNestedItemSelected(editTargetId, item.children, item.id);

    const handleChildLayoutChange = (layout: Layout[]) => {
      if (isEditTarget) {
        this.handleLayoutChange(layout);
      }
    };

    return (
      <Box
        key={item.layout.i}
        data-grid={item.layout}
        className="grid-item"
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
          border: theme => 
            isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        onClick={e => { e.stopPropagation(); this.handleSelect(item.id); }}
      >
        {item.children.length > 0 && (
          <NestedGridContainer
            isDraggable={isEditTarget}
            isResizable
            cols={this.props.cols}
            margin={[0, 0]}
            defaultRowHeight={this.props.rowHeight}
            onLayoutChange={handleChildLayoutChange}
            itemId={item.id}
          >
            {item.children.map(child => this.renderElement(child))}
          </NestedGridContainer>
        )}
      </Box>
    );
  };

  render() {
    const { selectedItemId, editTargetId, items } = this.state;
    const isRootDraggable = !this.isNestedItemSelected(editTargetId, items);

    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          bgcolor: 'background.default',
          p: 2,
          overflow: 'auto',
          display: 'flex',
        }}
        onClick={() => this.setState({ selectedItemId: null })}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={this.handleAddItem}
                startIcon={<AddBoxIcon />}
              >
                領域を追加
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={this.handleRemoveItem}
                disabled={!selectedItemId}
                startIcon={<DeleteIcon />}
              >
                選択した領域を削除
              </Button>
              <Button
                variant="outlined"
                onClick={this.toggleEditTarget}
                disabled={!editTargetId && !selectedItemId || (!editTargetId && selectedItemId === null)}
                startIcon={
                  editTargetId && (!selectedItemId || selectedItemId === editTargetId) ? <EditOffIcon /> : <EditIcon />
                }
              >
                {editTargetId && (!selectedItemId || selectedItemId === editTargetId) 
                  ? "領域内の編集終了" 
                  : "領域内を編集"
                }
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              border: '1px dashed #ccc',
              borderRadius: 1,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              p: 1,
            }}
          >
            <ResponsiveReactGridLayout
              isDraggable={isRootDraggable}
              isResizable
              cols={this.props.cols}
              rowHeight={this.props.rowHeight}
              margin={this.props.margin}
              onLayoutChange={this.handleLayoutChange}
              compactType={null}
              preventCollision
            >
              {items.map(item => this.renderElement(item))}
            </ResponsiveReactGridLayout>
          </Box>
        </Box>
      </Box>
    );
  }
}
