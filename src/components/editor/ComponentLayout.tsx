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
      selectedItemId: null
    };
  }

  handleAddItem = () => {
    const { selectedItemId } = this.state;
    const newItem = {
      id: generateId(),
      layout: {
        i: generateId("layout"),
        x: 0,
        y: Infinity,
        w: 4, // 12分割中の幅
        h: 2
      },
      children: []
    };

    if (!selectedItemId) {
      this.setState(prev => ({
        items: [...prev.items, newItem]
      }));
    } else {
      this.setState(prev => ({
        items: this.addChildToTree(prev.items, selectedItemId, newItem)
      }));
    }
  };

  handleRemoveItem = () => {
    const { selectedItemId } = this.state;
    if (!selectedItemId) return;
    this.setState(prev => ({
      items: this.removeFromTree(prev.items, selectedItemId),
      selectedItemId: null
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

  renderElement = (item) => {
    const { selectedItemId } = this.state;
    const isSelected = selectedItemId === item.id;

    return (
      <div
        key={item.layout.i}
        data-grid={item.layout}
        onClick={(e) => {
          e.stopPropagation();
          this.handleSelect(item.id);
        }}
      >
        <div
          className="grid-item no-drag"
          style={{
            border: isSelected ? "2px solid blue" : "1px solid #ccc",
            padding: "5px",
            backgroundColor: isSelected ? "#eef" : "#fff"
          }}
        >
          <ResponsiveReactGridLayout
            isDraggable
            isResizable
            draggableCancel=".no-drag"
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
            rowHeight={50}
            margin={[10, 10]}
          >
            {item.children.map(child => this.renderElement(child))}
          </ResponsiveReactGridLayout>
        </div>
      </div>
    );
  };

  render() {
    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          <button onClick={this.handleAddItem}>Add Child</button>
          <button onClick={this.handleRemoveItem}>Remove</button>
        </div>
        <ResponsiveReactGridLayout
          isDraggable
          isResizable
          draggableCancel=".no-drag"
          cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
          rowHeight={50}
          margin={[10, 10]}
        >
          {this.state.items.map(item => this.renderElement(item))}
        </ResponsiveReactGridLayout>
      </div>
    );
  }
}
