import React from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";

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

interface NestedGridLayoutProps {
  className?: string;
  cols: { [key: string]: number };
  rowHeight: number;
  margin: [number, number];
}

interface NestedGridLayoutState {
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
    const { onLayoutChange } = this.props;
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
    this.setState({ layouts: layout });
  };

  /**
   * コンポーネントをレンダリングする
   * コンテナのサイズに応じて動的に行の高さを計算し、
   * グリッドレイアウトを適用して子要素を表示する
   */
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
          onLayoutChange={this.handleNestedLayoutChange}
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

/**
 * ネストされたグリッドレイアウトを管理するメインコンポーネント
 * 複数の入れ子になったグリッドアイテムの配置、サイズ変更、ドラッグ＆ドロップを制御する
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
  handleLayoutChange = (layout: Layout[]) => {
    layout.forEach(layoutItem => {
      const affectedItem = this.findItemInTree(this.state.items, layoutItem.i);
      if (affectedItem) {
        this.updateItemLayout(affectedItem.id, layoutItem);
      }
    });
  };

  /**
   * ツリー構造から指定されたレイアウトIDを持つアイテムを検索する
   * @param nodes - 検索対象のツリー構造
   * @param layoutId - 検索するレイアウトID
   * @returns 見つかったアイテム、または null
   */
  findItemInTree = (nodes: GridItem[], layoutId: string): GridItem | null => {
    for (const node of nodes) {
      if (node.layout.i === layoutId) return node;
      if (node.children.length) {
        const found = this.findItemInTree(node.children, layoutId);
        if (found) return found;
      }
    }
    return null;
  };

  /**
   * 新しいグリッドアイテムを追加する
   * 編集対象が選択されている場合は子要素として追加し、
   * そうでない場合はルートレベルに追加する
   */
  handleAddItem = () => {
    const newItem = {
      id: generateId(),
      layout: {
        i: generateId("layout"),
        x: 0,
        y: 0,
        w: 1,
        h: 1
      },
      children: []
    };

    this.setState(prevState => {
      const { editTargetId } = prevState;
      return {
        ...prevState,
        items: !editTargetId
          ? [...prevState.items, newItem]
          : this.addChildToTree(prevState.items, editTargetId, newItem),
      };
    });
  };

  /**
   * 選択されているグリッドアイテムを削除する
   * 削除後は編集対象をクリアする
   */
  handleRemoveItem = () => {
    const { editTargetId } = this.state;
    if (!editTargetId) return;
    this.setState(prev => ({ items: this.removeFromTree(prev.items, editTargetId), editTargetId: null }));
  };

  /**
   * ツリー構造の指定された親ノードに子要素を追加する
   * @param nodes - 更新対象のツリー構造
   * @param parentId - 親ノードのID
   * @param child - 追加する子要素
   * @returns 更新されたツリー構造
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
          cols={this.props.cols}
          margin={[0, 0]}
          defaultRowHeight={this.props.rowHeight}
          onLayoutChange={(layout) => this.handleLayoutChange(layout)}
          itemId={item.id}
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
          cols={this.props.cols}
          rowHeight={this.props.rowHeight}
          margin={this.props.margin}
          onLayoutChange={this.handleLayoutChange}
          compactType={null}
          preventCollision
        >
          {items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
