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

function generateId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

// Wrapper that measures its own height and provides dynamic rowHeight = height / 12
class NestedGridContainer extends React.PureComponent<NestedGridContainerProps, NestedGridContainerState> {
  constructor(props) {
    super(props);
    this.state = { height: 0 };
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => this.updateHeight());
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  componentWillUnmount() {
    if (this.resizeObserver && this.containerRef.current) {
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

  handleNestedLayoutChange = (layout: Layout[]) => {
    const { onLayoutChange } = this.props;
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
    this.setState({ layouts: layout });
  };

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
          {...rest}
        >
          {children}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}

export default class NestedGridLayout extends React.PureComponent<NestedGridLayoutProps, NestedGridLayoutState> {
  static defaultProps = {
    className: "layout",
    cols: { lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 },
    rowHeight: 50,
    margin: [10, 10]
  };

  constructor(props) {
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

  updateItemLayout = (itemId: string, newLayout: Layout) => {
    this.setState(prevState => ({
      ...prevState,
      items: this.updateLayoutInTree(prevState.items, itemId, newLayout)
    }));
  };

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

  handleLayoutChange = (layout: Layout[]) => {
    layout.forEach(layoutItem => {
      const affectedItem = this.findItemInTree(this.state.items, layoutItem.i);
      if (affectedItem) {
        this.updateItemLayout(affectedItem.id, layoutItem);
      }
    });
  };

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

  handleRemoveItem = () => {
    const { editTargetId } = this.state;
    if (!editTargetId) return;
    this.setState(prev => ({ items: this.removeFromTree(prev.items, editTargetId), editTargetId: null }));
  };

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

  handleSelect = (id: string): void => this.setState({ selectedItemId: id });

  toggleEditTarget = () =>
    this.setState(prev => ({ editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId }));

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
        >
          {items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
