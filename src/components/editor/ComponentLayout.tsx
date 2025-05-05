import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * ユニークなIDを生成する関数
 * @param prefix - IDのプレフィックス
 * @returns 生成されたユニークID
 */
function generateId(prefix = "GridLayout"): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// コンポーネントのプロパティの型定義
interface NestedGridContainerProps {
  cols: { [key: string]: number };
  margin: [number, number];
  defaultRowHeight: number;
  children: React.ReactNode;
  isDraggable?: boolean;
  isResizable?: boolean;
}

interface NestedGridContainerState {
  height: number;
}

/**
 * 高さを自動測定し、動的な行の高さを提供するグリッドコンテナコンポーネント
 * 12分割のグリッドシステムを実装し、親要素のサイズに応じて適切なレイアウトを提供する
 */
class NestedGridContainer extends React.PureComponent<NestedGridContainerProps, NestedGridContainerState> {
  private containerRef: React.RefObject<HTMLDivElement | null>;
  private resizeObserver: ResizeObserver | null;

  constructor(props: NestedGridContainerProps) {
    super(props);
    this.state = { height: 0 };
    this.containerRef = React.createRef<HTMLDivElement>();
    this.resizeObserver = null;
  }

  /**
   * コンポーネントのマウント時の処理
   * - 初期の高さを計算
   * - ResizeObserverを設定して要素のサイズ変更を監視
   */
  componentDidMount() {
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => this.updateHeight());
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  /**
   * コンポーネントのアンマウント時の処理
   * ResizeObserverを解除してメモリリークを防止
   */
  componentWillUnmount() {
    if (this.resizeObserver && this.containerRef.current) {
      this.resizeObserver.unobserve(this.containerRef.current);
    }
  }

  /**
   * コンテナの高さを更新する
   * 現在の要素の高さを測定し、状態を更新する
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

  render() {
    const { cols, margin, defaultRowHeight, children, ...rest } = this.props;
    const { height } = this.state;
    const rowHeight = height > 0 ? height / 12 : defaultRowHeight;

    return (
      <div ref={this.containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ResponsiveReactGridLayout
          cols={cols}
          margin={margin}
          rowHeight={rowHeight}
          compactType={null}
          preventCollision
          {...rest}
        >
          {children}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

// アイテムの型定義
interface GridItem {
  id: string;
  layout: {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  children: GridItem[];
}

interface NestedGridLayoutProps {
  className?: string;
  cols?: { [key: string]: number };
  rowHeight?: number;
  margin?: [number, number];
}

interface NestedGridLayoutState {
  items: GridItem[];
  selectedItemId: string | null;
  editTargetId: string | null;
}

/**
 * ネストされたグリッドレイアウトを管理するメインコンポーネント
 * ドラッグ＆ドロップ可能なグリッドアイテムを提供し、階層構造を持つレイアウトを実現する
 */
export default class NestedGridLayout extends React.PureComponent<NestedGridLayoutProps, NestedGridLayoutState> {
  static defaultProps = {
    className: "layout",
    cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 },
    rowHeight: 50,
    margin: [10, 10] as [number, number]
  };

  constructor(props: NestedGridLayoutProps) {
    super(props);
    this.state = {
      items: [
        {
          id: generateId(),
          layout: { i: "0", x: 0, y: 0, w: 12, h: 4 },
          children: []
        }
      ],
      selectedItemId: null,
      editTargetId: null
    };
  }

  /**
   * 新しいアイテムを追加する
   * 編集対象が選択されている場合は子要素として追加し、
   * そうでない場合はルートレベルに追加する
   */
  handleAddItem = () => {
    const { editTargetId } = this.state;
    const newItem = {
      id: generateId(),
      layout: {
        i: generateId("layout"),
        x: 0,
        y: Infinity,
        w: 4,
        h: 2
      },
      children: []
    };

    // ステート更新後に選択状態を設定するため、非同期で処理
    setTimeout(() => {
      if (!editTargetId) {
        this.setState(prev => ({ 
          items: [...prev.items, newItem],
          selectedItemId: newItem.id
        }));
      } else {
        this.setState(prev => ({ 
          items: this.addChildToTree(prev.items, editTargetId, newItem),
          selectedItemId: newItem.id
        }));
      }
    }, 0);
  };

  /**
   * 選択されているアイテムを削除する
   * 選択状態のアイテムをツリー構造から削除し、選択状態をクリアする
   */
  handleRemoveItem = () => {
    const { selectedItemId } = this.state;
    if (!selectedItemId) return;
    this.setState(prev => ({ 
      items: this.removeFromTree(prev.items, selectedItemId),
      selectedItemId: null,
      editTargetId: null
    }));
  };

  /**
   * ツリー構造内の特定の親ノードに子要素を追加する
   */
  addChildToTree = (nodes: GridItem[], parentId: string, child: GridItem): GridItem[] =>
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
   * ツリー構造から特定のノードを削除する
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
   * アイテムを選択状態にする
   */
  handleSelect = (id: string) => this.setState({ selectedItemId: id });

  /**
   * 編集対象の切り替えを行う
   */
  toggleEditTarget = () =>
    this.setState(prev => ({ editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId }));

  /**
   * 指定されたIDを持つアイテムが、ネストされた構造内で選択されているかチェックする
   */
  isNestedItemSelected = (selectedId: string | null, nodes: GridItem[], excludeSelfId: string | null = null): boolean => {
    if (!selectedId) return false;
    const search = (items: GridItem[]): boolean =>
      items.some(item => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        return search(item.children);
      });
    return search(nodes);
  };

  /**
   * グリッドアイテムを描画する
   */
  renderElement = (item: GridItem) => {
    const { selectedItemId, editTargetId } = this.state;
    const isSelected = selectedItemId === item.id;
    const isEditTarget = editTargetId === item.id;
    const isChildSelected = this.isNestedItemSelected(editTargetId, item.children, item.id);

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
          cols={this.props.cols || NestedGridLayout.defaultProps.cols}
          margin={[0, 0]}
          defaultRowHeight={this.props.rowHeight || NestedGridLayout.defaultProps.rowHeight}
        >
          {item.children.map(child => this.renderElement(child))}
        </NestedGridContainer>
      </div>
    );
  };

  render() {
    const { selectedItemId, editTargetId, items } = this.state;
    const isRootDraggable = !this.isNestedItemSelected(editTargetId, items);

    return (
      <div onClick={e => {
        // アイテム追加直後は選択解除を防ぐ
        if (this.state.selectedItemId) {
          e.stopPropagation();
          this.setState({ selectedItemId: null });
        }
      }}>
        <div style={{ marginBottom: 10 }}>
          <button onClick={e => { e.stopPropagation(); this.handleAddItem(); }}>子要素を追加</button>
          <button onClick={e => { e.stopPropagation(); this.handleRemoveItem(); }}>削除</button>
          <button onClick={e => { e.stopPropagation(); this.toggleEditTarget(); }} disabled={!selectedItemId}>
            {editTargetId === selectedItemId ? "領域内の編集終了" : "領域内を編集"}
          </button>
        </div>
        <ResponsiveReactGridLayout
          isDraggable={isRootDraggable}
          isResizable
          cols={this.props.cols || NestedGridLayout.defaultProps.cols}
          rowHeight={this.props.rowHeight || NestedGridLayout.defaultProps.rowHeight}
          margin={this.props.margin || NestedGridLayout.defaultProps.margin}
          compactType={null}
          preventCollision
        >
          {items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
