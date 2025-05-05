import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

function generateId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export default class NestedGridLayout extends React.PureComponent {
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

    if (!editTargetId) {
      this.setState(prev => ({
        items: [...prev.items, newItem]
      }));
    } else {
      this.setState(prev => ({
        items: this.addChildToTree(prev.items, editTargetId, newItem)
      }));
    }
  };

  handleRemoveItem = () => {
    const { editTargetId } = this.state;
    if (!editTargetId) return;
    this.setState(prev => ({
      items: this.removeFromTree(prev.items, editTargetId),
      editTargetId: null
    }));
  };

  addChildToTree = (nodes, parentId, child) => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...node.children, child]
        };
      } else if (node.children.length) {
        return {
          ...node,
          children: this.addChildToTree(node.children, parentId, child)
        };
      } else {
        return node;
      }
    });
  };

  removeFromTree = (nodes, targetId) => {
    return nodes
      .map(node => {
        if (node.id === targetId) return null;
        if (node.children.length) {
          return {
            ...node,
            children: this.removeFromTree(node.children, targetId)
          };
        }
        return node;
      })
      .filter(Boolean);
  };

  handleSelect = (id) => {
    this.setState({ selectedItemId: id });
  };

  toggleEditTarget = () => {
    this.setState(prev => ({
      editTargetId: prev.editTargetId === prev.selectedItemId ? null : prev.selectedItemId
    }));
  };

  isNestedItemSelected = (selectedId, nodes, excludeSelfId = null) => {
    if (!selectedId) return false;

    const search = (items) => {
      return items.some(item => {
        if (item.id === selectedId) {
          return excludeSelfId ? item.id !== excludeSelfId : true;
        }
        return search(item.children);
      });
    };

    return search(nodes);
  };

  renderElement = (item) => {
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
          padding: "5px",
          backgroundColor: isEditTarget ? "#eef" : "#fff",
          position: "relative",
        }}
        onClick={(e) => {
          e.stopPropagation();
          this.handleSelect(item.id);
        }}
      >
        <ResponsiveReactGridLayout
          isDraggable={!isChildSelected}
          isResizable
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={50}
          margin={[10, 10]}
        >
          {item.children.map(child => this.renderElement(child))}
        </ResponsiveReactGridLayout>
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
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={50}
          margin={[10, 10]}
        >
          {items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
