import React from "react";
import { WidthProvider, Responsive, Layout } from "react-grid-layout";
import { validateLayout } from "../../utils/gridUtils";

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
 * ネストされたグリッドコンテナコンポーネント
 * 高さに応じて動的に行の高さを計算し、12行のグリッドシステムを維持する
 * ドラッグ＆ドロップやリサイズの制約を管理する
 */
export class NestedGridContainer extends React.PureComponent<NestedGridContainerProps, NestedGridContainerState> {
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
    this.initializeContainer();
  }

  componentWillUnmount() {
    this.cleanupResizeObserver();
  }

  /**
   * コンテナの初期化処理
   * 高さの更新とResizeObserverの設定を行う
   */
  private initializeContainer() {
    this.updateHeight();
    this.resizeObserver = new ResizeObserver(() => this.updateHeight());
    if (this.containerRef.current) {
      this.resizeObserver.observe(this.containerRef.current);
    }
  }

  /**
   * ResizeObserverのクリーンアップ
   */
  private cleanupResizeObserver() {
    if (this.containerRef.current) {
      this.resizeObserver.unobserve(this.containerRef.current);
    }
  }

  /**
   * コンテナの高さを更新する
   * DOM要素の実際の高さに基づいて状態を更新
   */
  private updateHeight() {
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
  private onDragStart = (layout: Layout[]) => {
    this.prevLayout = layout;
  }

  /**
   * リサイズ開始時の処理
   * 現在のレイアウトを一時保存する
   */
  private onResizeStart = (layout: Layout[]) => {
    this.prevLayout = layout;
  }

  /**
   * ドラッグ終了時の処理
   * レイアウトの検証を行い、有効な場合は適用、無効な場合は元に戻す
   */
  private onDragStop = (layout: Layout[]) => {
    this.applyLayout(layout);
  }

  /**
   * リサイズ終了時の処理
   * レイアウトの検証を行い、有効な場合は適用、無効な場合は元に戻す
   */
  private onResizeStop = (layout: Layout[]) => {
    this.applyLayout(layout);
  }

  /**
   * レイアウトの適用を試みる
   * アイテムが12行の制限を超えていないか検証し、
   * 有効な場合は新しいレイアウトを適用、無効な場合は前回の有効なレイアウトに戻す
   */
  private applyLayout(layout: Layout[]) {
    if (validateLayout(layout)) {
      this.setState({ layout });
      if (this.props.onLayoutChange) {
        this.props.onLayoutChange(layout);
      }
    } else {
      this.setState({ layout: this.prevLayout });
    }
  }

  render() {
    const { cols, margin, defaultRowHeight, children, ...rest } = this.props;
    const { height, layout } = this.state;

    // 12行のグリッドシステムを維持するため、実際の高さに基づいて行の高さを計算
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
