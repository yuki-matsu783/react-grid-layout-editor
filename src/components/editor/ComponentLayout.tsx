import React from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
import { LayoutItem } from "../../types";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * ネストされたグリッドコンテナのプロパティ
 * グリッドレイアウトの基本設定と動作を制御するためのインターフェース
 */
interface NestedGridContainerProps {
  cols: { lg: number; md: number; sm: number; xs: number; xxs: number };
  margin: [number, number];
  defaultRowHeight: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  onLayoutChange?: (layout: Layout[]) => void;
  children?: React.ReactNode;
}

/**
 * ネストされたグリッドコンテナの状態
 * コンテナの高さとレイアウト情報を管理する
 */
interface NestedGridContainerState {
  height: number;
  layout?: Layout[];
}

/**
 * ネストされたグリッドレイアウトのプロパティ
 * 最上位レイアウトコンポーネントの設定を定義するインターフェース
 */
interface NestedGridLayoutProps {
  className?: string;
  cols?: { lg: number; md: number; sm: number; xs: number; xxs: number };
  rowHeight?: number;
  margin?: [number, number];
}

/**
 * グリッドアイテムの定義
 * レイアウト情報と子要素を持つグリッドアイテムの構造
 */
interface GridItem extends LayoutItem {
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  children: GridItem[];
}

/**
 * ツリー構造を持つグリッドアイテム
 * GridItemを拡張し、再帰的な子要素の構造を定義する
 */
type TreeItem = GridItem & {
  children: TreeItem[];
};

/**
 * ネストされたグリッドレイアウトの状態
 * グリッドアイテムのツリー構造、選択状態、編集対象を管理する
 */
interface NestedGridLayoutState {
  items: TreeItem[];
  selectedItemId: string | null;
  editTargetId: string | null;
}

/**
 * ユニークなIDを生成する
 * @param prefix - IDのプレフィックス（デフォルト: "item"）
 * @returns ランダムな文字列を含むユニークなID
 */
function generateId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ネストされたグリッドコンテナコンポーネント
 * 高さに応じて動的に行の高さを計算し、12行のグリッドシステムを維持する
 * ドラッグ＆ドロップやリサイズの制約を管理する
 */
class NestedGridContainer extends React.PureComponent<NestedGridContainerProps, NestedGridContainerState> {
  /** コンテナのDOM要素への参照 */
  private containerRef = React.createRef<HTMLDivElement>();
  private resizeObserver!: ResizeObserver;
  private prevLayout: Layout[] | undefined;

  constructor(props: NestedGridContainerProps) {
    super(props);
    this.state = {
      height: 0
    };
  }

  componentDidMount() {
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => this.updateHeight());
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  componentWillUnmount() {
    if (this.containerRef.current) {
      this.resizeObserver.unobserve(this.containerRef.current);
    }
  }

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
   * ドラッグ開始時の処理
   * 現在のレイアウトを一時保存する
   */
  onDragStart = (layout: Layout[]) => {
    this.prevLayout = layout;
  }

  /**
   * リサイズ開始時の処理
   * 現在のレイアウトを一時保存する
   */
  onResizeStart = (layout: Layout[]) => {
    this.prevLayout = layout;
  }

  /**
   * ドラッグ終了時の処理
   * レイアウトの検証を行い、有効な場合は適用、無効な場合は元に戻す
   */
  onDragStop = (layout: Layout[]) => {
    this.applyLayout(layout);
  }

  /**
   * リサイズ終了時の処理
   * レイアウトの検証を行い、有効な場合は適用、無効な場合は元に戻す
   */
  onResizeStop = (layout: Layout[]) => {
    this.applyLayout(layout);
  }

  /**
   * レイアウトの適用を試みる
   * アイテムが12行の制限を超えていないか検証し、
   * 有効な場合は新しいレイアウトを適用、無効な場合は前回の有効なレイアウトに戻す
   */
  applyLayout(layout: Layout[]) {
    const valid = layout.every((item: Layout) => item.y + item.h <= 12);
    if (valid) {
      this.setState({ layout });
      if (this.props.onLayoutChange) this.props.onLayoutChange(layout);
    } else {
      this.setState({ layout: this.prevLayout });
    }
  }

  render() {
    const { cols, margin, defaultRowHeight, children, ...rest } = this.props;
    const { height, layout } = this.state;
    const rowHeight = height > 0 ? height / 12 : defaultRowHeight;

    return (
      <div ref={this.containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveReactGridLayout
          layouts={{ lg: layout || [] }}
          cols={cols}
          margin={margin}
          rowHeight={rowHeight}
          preventCollision
          onDragStart={this.onDragStart}
          onResizeStart={this.onResizeStart}
          onDragStop={this.onDragStop}
          onResizeStop={this.onResizeStop}
          {...rest}
        >
          {children}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

/**
 * ネストされたグリッドレイアウトコンポーネント
 * ドラッグ＆ドロップ可能な階層構造を持つグリッドレイアウトを提供する
 * 各グリッドアイテムは子要素としてさらにグリッドを含むことができる
 */
export default class NestedGridLayout extends React.PureComponent<NestedGridLayoutProps, NestedGridLayoutState> {
  static defaultProps = {
    className: "layout",
    cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 },
    rowHeight: 50,
    margin: [10, 10]
  };

  constructor(props: NestedGridLayoutProps) {
    super(props);
    const initialItem: TreeItem = {
      id: generateId(),
      x: 0,
      y: 0,
      w: 12,
      h: 4,
      layout: { i: "0", x: 0, y: 0, w: 12, h: 4 },
      children: []
    };

    this.state = {
      items: [initialItem],
      selectedItemId: null,
      editTargetId: null
    };
  }

  /**
   * アイテムを追加する
   * 指定したサイズで配置できない場合は1x1サイズでの配置を試みる
   * それでも配置できない場合はアラートを表示する
   */
  handleAddItem = () => {
    const { editTargetId, items } = this.state;

    // Determine target container's current children heights in rows
    const getNodeChildren = (nodes: TreeItem[], targetId: string): TreeItem[] | null => {
      for (const node of nodes) {
        if (node.id === targetId) return node.children;
        if (node.children.length) {
          const res = getNodeChildren(node.children, targetId);
          if (res) return res;
        }
      }
      return null;
    };

    const targetChildren = !editTargetId
      ? items
      : getNodeChildren(items, editTargetId) || [];

    // まず通常サイズ(4x2)での配置を試みる
    const availableSpace = this.findAvailableSpace(targetChildren, 4, 2);

    let layout: { i: string; x: number; y: number; w: number; h: number };

    if (availableSpace) {
      layout = {
        i: generateId("layout"),
        ...availableSpace
      };
    } else {
      // 通常サイズで配置できない場合、1x1での配置を試みる
      const minimalSpace = this.findAvailableSpace(targetChildren, 1, 1);
      
      if (minimalSpace) {
        layout = {
          i: generateId("layout"),
          ...minimalSpace
        };
      } else {
        // 配置できない場合はアラートを表示
        alert('利用可能なスペースがありません。既存のアイテムを削除するか、別の場所に追加してください。');
        return;
      }
    }

    const newItem: TreeItem = {
      id: generateId(),
      x: layout.x,
      y: layout.y,
      w: layout.w,
      h: layout.h,
      layout,
      children: []
    };

    if (!editTargetId) {
      this.setState(prev => ({ items: [...prev.items, newItem] }));
    } else {
      this.setState(prev => ({ items: this.addChildToTree(prev.items, editTargetId, newItem) }));
    }
  };

  handleRemoveItem = () => {
    const { editTargetId } = this.state;
    if (!editTargetId) return;
    this.setState(prev => ({ items: this.removeFromTree(prev.items, editTargetId), editTargetId: null }));
  };

  /**
   * ツリー構造に新しい子要素を追加する
   * @param nodes 現在のツリー構造
   * @param parentId 親要素のID
   * @param child 追加する子要素
   * @returns 更新されたツリー構造
   */
  addChildToTree = (nodes: TreeItem[], parentId: string, child: TreeItem): TreeItem[] =>
    nodes.map(node => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, child] };
      }
      if (node.children.length) {
        return { ...node, children: this.addChildToTree(node.children, parentId, child) };
      }
      return node;
    });

  /**
   * ツリー構造から指定されたアイテムを削除する
   * @param nodes 現在のツリー構造
   * @param targetId 削除対象のID
   * @returns 更新されたツリー構造
   */
  removeFromTree = (nodes: TreeItem[], targetId: string): TreeItem[] =>
    nodes
      .map(node => {
        if (node.id === targetId) return null;
        if (node.children.length) {
          return { ...node, children: this.removeFromTree(node.children, targetId) };
        }
        return node;
      })
      .filter((node): node is TreeItem => node !== null);

  /**
   * 指定されたサイズのアイテムを配置可能な位置を探す
   * @param children 現在の子要素配列
   * @param requestedW 希望する幅
   * @param requestedH 希望する高さ
   * @returns 配置可能な位置情報。配置不可能な場合はnull
   */
  findAvailableSpace = (children: TreeItem[], requestedW: number, requestedH: number) => {
    // 12x12のグリッドマップを作成（全てfalseで初期化）
    const gridMap = Array(12).fill(null).map(() => Array(12).fill(false));

    // 既存のアイテムで占有されているグリッドをマーク
    children.forEach(child => {
      const { x, y, w, h } = child.layout;
      for (let i = x; i < x + w; i++) {
        for (let j = y; j < y + h; j++) {
          if (i < 12 && j < 12) {
            gridMap[i][j] = true;
          }
        }
      }
    });

    // まず要求されたサイズで配置可能な場所を探す
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x <= 12 - requestedW; x++) {
        let canPlace = true;
        for (let i = x; i < x + requestedW && canPlace; i++) {
          for (let j = y; j < y + requestedH && canPlace; j++) {
            if (j >= 12 || gridMap[i][j]) {
              canPlace = false;
            }
          }
        }
        if (canPlace) {
          return { x, y, w: requestedW, h: requestedH };
        }
      }
    }

    // 要求サイズで配置できない場合、1x1で配置可能な場所を探す
    if (requestedW !== 1 || requestedH !== 1) {
      for (let y = 0; y < 12; y++) {
        for (let x = 0; x < 12; x++) {
          if (!gridMap[x][y]) {
            return { x, y, w: 1, h: 1 };
          }
        }
      }
    }

    return null;
  };

  /**
   * アイテムを選択状態にする
   * @param id 選択するアイテムのID
   */
  handleSelect = (id: string) => this.setState({ selectedItemId: id });

  /**
   * 編集対象の領域を切り替える
   * 現在選択されているアイテムを編集対象にするか、編集を解除する
   */
  toggleEditTarget = () =>
    this.setState(prev => ({ editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId }));

  /**
   * 指定したアイテムの子孫に選択されているアイテムが存在するか確認
   * @param selectedId 検索対象のID
   * @param nodes 検索を行うツリー構造
   * @param excludeSelfId 除外するID（自身のIDを除外する場合に使用）
   * @returns 子孫に選択されているアイテムが存在する場合はtrue
   */
  isNestedItemSelected = (selectedId: string | null, nodes: TreeItem[], excludeSelfId: string | null = null): boolean => {
    if (!selectedId) return false;
    const search = (items: TreeItem[]): boolean =>
      items.some(item => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        return search(item.children);
      });
    return search(nodes);
  };

  /**
   * グリッドアイテムをレンダリングする
   * 選択状態や編集状態に応じて適切なスタイルを適用し、
   * 子要素を再帰的にレンダリングする
   * @param item レンダリングするグリッドアイテム
   */
  renderElement = (item: TreeItem) => {
    const { selectedItemId, editTargetId } = this.state;
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;
    const isChildSelected = this.isNestedItemSelected(editTargetId, item.children, item.id);

    const defaultCols = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };

    return (
      <div
        key={item.layout.i}
        data-grid={item.layout}
        className="grid-item"
        style={{
          border: isSelected ? "2px solid blue" : "1px solid #ccc",
          backgroundColor: isEditTarget ? "#eef" : "#fff",
          position: "relative"
        }}
        onClick={e => { e.stopPropagation(); this.handleSelect(item.id); }}
      >
        <NestedGridContainer
          isDraggable={!isChildSelected}
          isResizable
          cols={this.props.cols || defaultCols}
          margin={[0, 0]}
          defaultRowHeight={this.props.rowHeight || 50}
        >
          {item.children.map(child => this.renderElement(child))}
        </NestedGridContainer>
      </div>
    );
  };

  render() {
    const { selectedItemId, editTargetId, items } = this.state;
    const isRootDraggable = !this.isNestedItemSelected(editTargetId, items);
    const defaultCols = { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 };

    return (
      <div onClick={() => this.setState({ selectedItemId: null })}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={this.handleAddItem}>Add Child</button>
          <button onClick={this.handleRemoveItem}>Remove</button>
          <button onClick={this.toggleEditTarget} disabled={!selectedItemId}>
            {editTargetId === selectedItemId ? "領域内の編集終了" : "領域内を編集"}
          </button>
        </div>
        <ResponsiveReactGridLayout
          isDraggable={isRootDraggable}
          isResizable
          cols={this.props.cols || defaultCols}
          rowHeight={this.props.rowHeight || 50}
          margin={this.props.margin || [10, 10]}
        >
          {items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
