/**
 * ファイル操作（インポート/エクスポート）に関連する関数を提供するカスタムフック
 */
export const useFileOperations = () => {
  /**
   * 現在のレイアウトをJSONファイルとしてエクスポートする
   * @param items - エクスポートするレイアウトアイテムの配列
   */
  const handleExport = (items: any[]) => {
    try {
      // バージョン情報とアイテムデータを含むエクスポートデータを作成
      const exportData = {
        version: '1.0',
        items,
      };
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // ダウンロードリンクを作成して自動クリック
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
   * JSONファイルからレイアウトをインポートする
   * @param file - インポートするJSONファイル
   * @returns インポートしたレイアウトデータ
   */
  const handleImport = async (file: File): Promise<{ items: any[] } | null> => {
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importData = JSON.parse(content);
            
            // バージョンチェック
            if (importData.version !== '1.0') {
              throw new Error('Unsupported version');
            }

            // データ形式チェック
            if (!Array.isArray(importData.items)) {
              throw new Error('Invalid layout data');
            }

            resolve(importData);
          } catch (error) {
            console.error('Import failed:', error);
            resolve(null);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Import failed:', error);
        resolve(null);
      }
    });
  };

  return {
    handleExport,
    handleImport,
  };
};
