import { Layer } from '../../../types';

/**
 * レイアウトデータのエクスポート処理
 * @param layers レイヤーデータ
 */
export const exportLayout = (layers: Layer[]) => {
  try {
    const exportData = {
      version: '1.0',
      layers,
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
 * レイアウトデータのインポート処理
 * @param file インポートするファイル
 * @returns Promise<Layer[]>
 */
export const importLayout = (file: File): Promise<Layer[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        if (importData.version !== '1.0') {
          throw new Error('Unsupported version');
        }

        if (!Array.isArray(importData.layers)) {
          throw new Error('Invalid layout data');
        }

        resolve(importData.layers);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
