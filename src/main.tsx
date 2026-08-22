import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 📱 iOS Safari / LINE内ブラウザの固有動作（引っ張りリロード、シート閉じスワイプ、ピンチズーム、長押しメニュー）を安全に抑止
if (typeof window !== 'undefined') {
  // 長押しコンテキストメニューのグローバル抑止
  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, { passive: false });

  // ピンチズーム（2本指拡大縮小）の抑止
  window.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('gesturechange', (e) => {
    e.preventDefault();
  }, { passive: false });
  window.addEventListener('gestureend', (e) => {
    e.preventDefault();
  }, { passive: false });

  // モーダル以外のゲーム盤面での画面バウンススクロール・スワイプダウンを完全防止
  document.addEventListener('touchmove', (e) => {
    let target = e.target as HTMLElement | null;
    let isScrollable = false;
    while (target && target !== document.body) {
      if (
        target.classList?.contains('overflow-y-auto') || 
        target.classList?.contains('overflow-auto') ||
        target.classList?.contains('overflow-y-scroll')
      ) {
        isScrollable = true;
        break;
      }
      target = target.parentElement;
    }
    if (!isScrollable) {
      e.preventDefault();
    }
  }, { passive: false });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
