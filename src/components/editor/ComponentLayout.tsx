import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";
import { Layout, TreeItem } from "../../types";
import { NestedGridContainer } from "./NestedGridContainer";
import {
  generateId,
  findAvailableSpace,
  addChildToTree,
  removeFromTree,
  isNestedItemSelected,
  getNodeChildren
} from "../../utils/gridUtils";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

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
 * ネストされたグリッドレイアウトの状態
 * グリッドアイテムのツリー構造、選択状態、編集対象を管理する
 */
interface NestedGridLayoutState {
  items: TreeItem[];
  selectedItemId: string | null;
  editTargetId: string | null;
}

/**
 * ネストされたグリッドレイアウトコンポーネント
 * ドラッグ＆ドロップ可能な階層構造を持つグリッドレイアウトを提供する
 * 各グリッドアイテムは子要素としてさらにグリッドを含むことができる
 */
export default class NestedGridLayout extends React.PureComponent<NestedGridLayoutProps, NestedGridLayoutState> {
  /**
   * デフォルトのプロパティ値
   */
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

    const targetChildren = !editTargetId
      ? items
      : getNodeChildren(items, editTargetId) || [];

    // まず通常サイズ(4x2)での配置を試みる
    const availableSpace = findAvailableSpace(targetChildren, 4, 2);

    let layout: Layout;

    if (availableSpace) {
      layout = {
        i: generateId("layout"),
        ...availableSpace
      };
    } else {
      // 通常サイズで配置できない場合、1x1での配置を試みる
      const minimalSpace = findAvailableSpace(targetChildren, 1, 1);
      
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
      this.setState(prev => ({ items: addChildToTree(prev.items, editTargetId, newItem) }));
    }
  };

  /**
   * 選択されているアイテムを削除する
   */
  handleRemoveItem = () => {
    const { editTargetId } = this.state;
    if (!editTargetId) return;
    this.setState(prev => ({ 
      items: removeFromTree(prev.items, editTargetId),
      editTargetId: null
    }));
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
    this.setState(prev => ({
      editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId
    }));

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
    const isChildSelected = isNestedItemSelected(editTargetId, item.children, item.id);

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
    const isRootDraggable = !isNestedItemSelected(editTargetId, items);
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
