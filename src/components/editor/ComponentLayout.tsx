import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Box, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import EditIcon from '@mui/icons-material/Edit';
import EditOffIcon from '@mui/icons-material/EditOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import type { Layout, GridItem, ButtonConfig, GridLayoutConfig } from '../../types';
import BoxSettingsPanel from './BoxSettingsPanel';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * ネストされたグリッドコンテナのプロパティ
 */
interface NestedGridContainerProps {
  cols: { [key: string]: number };  // カラム数の設定
  margin: [number, number];         // グリッドアイテム間のマージン
  defaultRowHeight: number;         // デフォルトの行の高さ
  children: React.ReactNode;        // 子要素
  isDraggable?: boolean;           // ドラッグ可能かどうか
  isResizable?: boolean;           // サイズ変更可能かどうか
  onLayoutChange?: (layout: Layout[]) => void;  // レイアウト変更時のコールバック
  itemId?: string;                 // コンテナのID
}

/**
 * ネストされたグリッドコンテナの状態
 */
interface NestedGridContainerState {
  height: number;      // コンテナの高さ
  layouts?: Layout[];  // レイアウト情報
}

/**
 * ボタンコンポーネントのデフォルトプロパティ
 */
const defaultButtonProps: ButtonConfig['props'] = {
  variant: 'contained',
  color: 'primary',
  label: 'ボタン',
  size: 'medium',
  widthPercentage: 80,
  heightPercentage: 50,
  horizontalAlign: 'center',
  verticalAlign: 'center'
};

/**
 * メインレイアウトコンポーネントのプロパティ
 */
interface ComponentLayoutProps {
  className?: string;  // CSSクラス名
  cols: { [key: string]: number };  // カラム数の設定
  rowHeight: number;   // 行の高さ
  margin: [number, number];  // グリッドアイテム間のマージン
}

/**
 * メインレイアウトコンポーネントの状態
 */
interface ComponentLayoutState {
  items: GridItem[];           // グリッドアイテムの配列
  selectedItemId: string | null;  // 選択中のアイテムID
  editTargetId: string | null;    // 編集対象のアイテムID
  fileInputKey: number;           // ファイル入力のキー
}

/**
 * ユニークなID文字列を生成する
 */
function generateId(prefix = "grid"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
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
   * 高さの初期測定を行い、ResizeObserverを設定してサイズ変更を監視する
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
   * 高さが変更された場合のみstateを更新することで、不要な再レンダリングを防止する
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
    const { onLayoutChange } = this.props;
    if (onLayoutChange) {
      const updatedLayout = layout.map(item => ({
        ...item,
        i: item.i.startsWith('layout_') ? item.i : `layout_${item.i}`
      }));
      onLayoutChange(updatedLayout);
    }
    this.setState({ layouts: layout });
  };

  render() {
    const { defaultRowHeight, children, ...rest } = this.props;
    const { height } = this.state;
    const rowHeight = height > 0 ? height / 12 : defaultRowHeight;
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
  private fileInputRef: React.MutableRefObject<HTMLInputElement | null> = React.createRef<HTMLInputElement>();

  constructor(props: ComponentLayoutProps) {
    super(props);
    const rootId = generateId();
    this.state = {
      items: [{
        id: rootId,
        layout: { i: `layout_${rootId}`, x: 0, y: 0, w: 12, h: 4 },
        component: {
          type: 'gridLayout',
          props: {
            children: []
          }
        }
      }],
      selectedItemId: null,
      editTargetId: null,
      fileInputKey: 0
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
   * 指定されたIDを持つアイテムのレイアウトを更新し、
   * グリッドレイアウトアイテムの場合は子要素も再帰的に処理する
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
      if (node.component.type === 'gridLayout' && 'children' in node.component.props) {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              children: this.updateLayoutInTree(node.component.props.children, itemId, newLayout)
            }
          }
        };
      }
      return node;
    });
  };

  /**
   * アイテムIDからレイアウトIDを生成する
   * グリッドレイアウト用の一意の識別子を生成する
   * @param itemId - 元となるアイテムのID
   * @returns レイアウト用のID
   */
  generateLayoutId = (itemId: string): string => {
    return `layout_${itemId}`;
  };

  /**
   * レイアウトIDからアイテムIDを抽出する
   * レイアウト用の識別子から元のアイテムIDを取得する
   * @param layoutId - レイアウトID
   * @returns 元のアイテムID
   */
  extractItemId = (layoutId: string): string => {
    return layoutId.startsWith('layout_') ? layoutId.substring(7) : layoutId;
  };

  /**
   * レイアウトの変更を処理し、影響を受けるアイテムを更新する
   * レイアウトIDの変更を処理し、対応するアイテムのレイアウトを更新する
   * @param layout - 変更後のレイアウト配列
   */
  handleLayoutChange = (layout: Layout[]) => {
    // レイアウトIDを正規化
    const processedLayout = layout.map(layoutItem => {
      const itemId = this.extractItemId(layoutItem.i);
      return {
        ...layoutItem,
        i: this.generateLayoutId(itemId)
      };
    });

    processedLayout.forEach(layoutItem => {
      const itemId = this.extractItemId(layoutItem.i);
      const affectedItem = this.findItemInTree(this.state.items, itemId);
      if (affectedItem) {
        this.updateItemLayout(affectedItem.id, layoutItem);
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
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }
      if (node.component.type === 'gridLayout') {
        const found = this.findItemInTree(node.component.props.children, id);
        if (found) {
          return found;
        }
      }
    }
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
    return { x: 0, y: 0, canPlace: false };
  };

  /**
   * アイテムの階層の深さを計算する
   * ルートレベルを0とし、子要素になるごとに深さが1ずつ増加する
   * @param itemId - 計算対象のアイテムID
   * @returns アイテムの階層の深さ（見つからない場合は-1）
   */
  calculateDepth = (itemId: string): number => {
    /**
     * 再帰的に階層を探索する内部関数
     * @param nodes - 探索対象のノード配列
     * @param targetId - 探索するアイテムのID
     * @param currentDepth - 現在の深さ
     * @returns 見つかった階層の深さ、または-1
     */
    const calculateDepthRecursive = (nodes: GridItem[], targetId: string, currentDepth: number = 0): number => {
      for (const node of nodes) {
        if (node.id === targetId) {
          return currentDepth;
        }
        if (node.component.type === 'gridLayout') {
          const childDepth = calculateDepthRecursive(node.component.props.children, targetId, currentDepth + 1);
          if (childDepth !== -1) {
            return childDepth;
          }
        }
      }
      return -1;
    };

    return calculateDepthRecursive(this.state.items, itemId, 0);
  };

  /**
   * 新しいグリッドアイテムを追加する
   * 編集対象が選択されている場合は子要素として追加し、そうでない場合はルートレベルに追加する
   */
  handleAddItem = () => {
    const { editTargetId, items } = this.state;

    if (editTargetId) {
      const depth = this.calculateDepth(editTargetId);
      if (depth >= 4) {
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return;
      }
    }
    
    const targetItems = editTargetId
      ? (item => item?.component.type === 'gridLayout' ? item.component.props.children : [])(this.findItemInTree(items, editTargetId))
      : items;

    const defaultPosition = this.findAvailablePosition(2, 2, targetItems);
    const fallbackPosition = !defaultPosition.canPlace 
      ? this.findAvailablePosition(1, 1, targetItems)
      : defaultPosition;

    if (!fallbackPosition.canPlace) {
      alert('利用可能なスペースがありません。');
      return;
    }

    const itemId = generateId();
    const newItem: GridItem = {
      id: itemId,
      layout: {
        i: `layout_${itemId}`,
        x: fallbackPosition.x,
        y: fallbackPosition.y,
        w: defaultPosition.canPlace ? 2 : 1,
        h: defaultPosition.canPlace ? 2 : 1
      },
      component: {
        type: 'gridLayout',
        props: {
          children: []
        }
      }
    };

    this.setState(prevState => {
      const newItems = !prevState.editTargetId
        ? [...prevState.items, newItem]
        : this.addChildToTree(prevState.items, prevState.editTargetId, newItem);
      
      return {
        ...prevState,
        items: newItems
      };
    });
  };

  handleAddButton = () => {
    const { editTargetId, items } = this.state;

    if (editTargetId) {
      const depth = this.calculateDepth(editTargetId);
      if (depth >= 4) {
        alert('これ以上階層を深くすることはできません（最大5階層まで）');
        return;
      }
    }
    
    const targetItems = editTargetId 
      ? this.findItemInTree(items, editTargetId)?.component.type === 'gridLayout'
        ? (this.findItemInTree(items, editTargetId)?.component.props as { children: GridItem[] })?.children || []
        : []
      : items;

    const position = this.findAvailablePosition(2, 1, targetItems);

    if (!position.canPlace) {
      alert('利用可能なスペースがありません。');
      return;
    }

    const itemId = generateId('btn');
    const newItem: GridItem = {
      id: itemId,
      layout: {
        i: `layout_${itemId}`,
        x: position.x,
        y: position.y,
        w: 2,
        h: 1
      },
      component: {
        type: 'button',
        props: defaultButtonProps
      }
    };

    this.setState(prevState => {
      const newItems = !prevState.editTargetId
        ? [...prevState.items, newItem]
        : this.addChildToTree(prevState.items, prevState.editTargetId, newItem);
      
      return {
        ...prevState,
        items: newItems
      };
    });
  };

  handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        items: this.state.items,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'layout-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  /**
   * JSONファイルから設定をインポートし、レイアウトを復元する
   * @param event - ファイル選択イベント
   */
  handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importData = JSON.parse(content);
          
          if (importData.version !== '1.0') {
            throw new Error('Unsupported version');
          }

          if (!Array.isArray(importData.items)) {
            throw new Error('Invalid layout data');
          }

          this.setState({
            items: importData.items,
            selectedItemId: null,
            editTargetId: null
          });
        } catch (error) {
          console.error('Import failed:', error);
        }
      };
      reader.readAsText(file);
    } finally {
      this.setState(prev => ({ fileInputKey: prev.fileInputKey + 1 }));
    }
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
   * 指定された親ノードに子要素を追加する
   * グリッドレイアウトの場合のみ子要素を追加し、再帰的に処理を行う
   * @param nodes - 更新対象のツリー構造
   * @param parentId - 親ノードのID
   * @param child - 追加する子要素
   * @returns 更新されたツリー構造
   */
  addChildToTree = (nodes: GridItem[], parentId: string, child: GridItem): GridItem[] => {
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
              children: this.addChildToTree(node.component.props.children, parentId, child)
            }
          }
        };
      }
      return node;
    });
  };

  /**
   * ツリー構造から指定されたIDのノードを削除する
   * 削除対象のノードを取り除き、グリッドレイアウトの場合は子要素も再帰的に処理する
   * @param nodes - 更新対象のツリー構造
   * @param targetId - 削除対象のID
   * @returns 更新されたツリー構造
   */
  /**
   * ボタンのプロパティを更新する
   * @param nodes - 更新対象のツリー構造
   * @param itemId - 更新対象のアイテムID
   * @param newProps - 新しいプロパティ
   * @returns 更新されたツリー構造
   */
  updateItemProps = (nodes: GridItem[], itemId: string, newProps: Partial<ButtonConfig['props']>): GridItem[] => {
    return nodes.map(node => {
      if (node.id === itemId && node.component.type === 'button') {
        return {
          ...node,
          component: {
            ...node.component,
            props: {
              ...node.component.props,
              ...newProps
            }
          }
        };
      }
      if (node.component.type === 'gridLayout' && 'children' in node.component.props) {
        const gridLayout = node.component as GridLayoutConfig;
        return {
          ...node,
          component: {
            ...gridLayout,
            props: {
              children: this.updateItemProps(gridLayout.props.children, itemId, newProps)
            }
          }
        };
      }
      return node;
    });
  };

  removeFromTree = (nodes: GridItem[], targetId: string): GridItem[] => {
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
                children: this.removeFromTree(node.component.props.children, targetId)
              }
            }
          };
        }
        return node;
      });
  };

  /**
   * グリッドアイテムを選択状態にする
   * @param id - 選択するアイテムのID
   */
  handleSelect = (id: string): void => {
    this.setState({ selectedItemId: id });
  };

  /**
   * 編集対象の切り替えを行う
   * 現在の編集対象と選択中のアイテムが同じ場合はクリアし、
   * 異なる場合は選択中のアイテムを編集対象に設定する
   */
  toggleEditTarget = () =>
    this.setState(prev => ({ 
      editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId 
    }));

  /**
   * 指定されたアイテムまたはその子孫が選択されているかを判定する
   * 再帰的にツリー構造を探索し、選択状態を確認する
   * @param selectedId - 確認する選択アイテムのID
   * @param nodes - 探索対象のツリー構造
   * @param excludeSelfId - 除外するアイテムのID（オプション）
   * @returns 選択されているかどうか
   */
  isNestedItemSelected = (selectedId: string | null, nodes: GridItem[], excludeSelfId: string | null = null): boolean => {
    if (!selectedId) return false;
    const search = (items: GridItem[]): boolean =>
      items.some(item => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        if (item.component.type === 'gridLayout') {
          return search(item.component.props.children);
        }
        return false;
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

    const commonBoxProps = {
      key: item.layout.i,
      'data-grid': item.layout,
      className: "grid-item",
      sx: {
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: isEditTarget ? 'rgba(0, 0, 255, 0.05)' : '#ffffff',
        border: (theme: { palette: { primary: { main: string } } }) => 
          isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
        borderRadius: '4px',
        cursor: 'pointer',
      } as const,
      onClick: (e: React.MouseEvent) => { e.stopPropagation(); this.handleSelect(item.id); }
    };

    if (item.component.type === 'button') {
      const {
        variant,
        color,
        label,
        size,
        widthPercentage,
        heightPercentage,
        horizontalAlign,
        verticalAlign,
        disabled
      } = item.component.props;

      // 水平・垂直方向の配置設定をflexboxのalignmentに変換
      const justifyContent = horizontalAlign === 'start' ? 'flex-start' 
        : horizontalAlign === 'end' ? 'flex-end' 
        : 'center';
      
      const alignItems = verticalAlign === 'start' ? 'flex-start'
        : verticalAlign === 'end' ? 'flex-end'
        : 'center';

      return (
        <Box {...commonBoxProps} sx={{ 
          ...commonBoxProps.sx, 
          display: 'flex',
          alignItems,
          justifyContent,
        }}>
          <Button
            variant={variant}
            color={color}
            size={size}
            disabled={disabled}
            sx={{
              width: `${widthPercentage}%`,
              height: `${heightPercentage}%`,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            {label}
          </Button>
        </Box>
      );
    }

    return (
      <Box {...commonBoxProps}>
        {item.component.type === 'gridLayout' && item.component.props.children.length > 0 && (
          <NestedGridContainer
            isDraggable={isEditTarget}
            isResizable
            cols={this.props.cols}
            margin={[0, 0]}
            defaultRowHeight={this.props.rowHeight}
            onLayoutChange={this.handleLayoutChange}
            itemId={item.id}
          >
            {item.component.props.children.map(child => this.renderElement(child))}
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
          height: '100%',
          bgcolor: 'background.default',
          p: 2,
          overflow: 'hidden',
          display: 'flex',
          gap: 2,
        }}
        onClick={() => this.setState({ selectedItemId: null })}
      >
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={this.handleAddItem}
                  startIcon={<AddBoxIcon />}
                >
                  領域を追加
                </Button>
                <Button
                  variant="outlined"
                  onClick={this.handleAddButton}
                  startIcon={<AddBoxIcon />}
                >
                  ボタンを追加
                </Button>
              </Box>
              <Button
                variant="contained"
                color="error"
                onClick={this.handleRemoveItem}
                disabled={!selectedItemId}
                startIcon={<DeleteIcon />}
              >
                選択した領域を削除
              </Button>
              {/* 「領域内を編集」ボタンの活性・表示制御
                * 
                * 編集状態（editTargetId !== null）の場合：
                * 1. 編集状態の領域以外のgridLayoutが選択されている場合 → 「領域内を編集」表示・有効
                * 2. それ以外（選択なし・編集中の領域が選択・ボタンが選択等）→ 「領域内の編集終了」表示・有効
                * 
                * 非編集状態の場合：
                * - gridLayout型の領域が選択されている時のみ → 「領域内を編集」表示・有効
                */}
              <Button
                variant="outlined"
                onClick={this.toggleEditTarget}
                disabled={!editTargetId && (
                  !selectedItemId || 
                  this.findItemInTree(items, selectedItemId)?.component.type !== 'gridLayout'
                )}
                startIcon={
                  editTargetId && (
                    !selectedItemId || 
                    selectedItemId === editTargetId || 
                    this.findItemInTree(items, selectedItemId)?.component.type !== 'gridLayout'
                  ) ? <EditOffIcon /> : <EditIcon />
                }
              >
                {editTargetId && (
                  !selectedItemId || 
                  selectedItemId === editTargetId || 
                  this.findItemInTree(items, selectedItemId)?.component.type !== 'gridLayout'
                ) 
                  ? "領域内の編集終了" 
                  : "領域内を編集"
                }
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => this.fileInputRef.current?.click()}
                startIcon={<FileUploadIcon />}
              >
                インポート
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleExport}
                startIcon={<FileDownloadIcon />}
              >
                エクスポート
              </Button>
              <input
                type="file"
                ref={this.fileInputRef}
                style={{ display: 'none' }}
                accept=".json"
                key={this.state.fileInputKey}
                onChange={this.handleImport}
              />
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
        {/* ボタン設定パネル（常に表示） */}
        <Box 
          sx={{ width: 300, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
            <BoxSettingsPanel
              selectedItem={
                (() => {
                  const item = selectedItemId ? this.findItemInTree(items, selectedItemId) : null;
                  return item && item.component.type === 'button' 
                    ? { id: item.id, component: item.component as ButtonConfig }
                    : null;
                })()
              }
              onUpdate={(id, newProps) => {
                const updatedItems = this.updateItemProps(items, id, newProps);
                this.setState({ items: updatedItems });
              }}
            />
          </Box>
      </Box>
    );
  }
}
