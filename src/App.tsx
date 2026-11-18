import React, { useState, useEffect } from 'react';
import './App.css';

// アイテムのデータ型定義
type Item = {
  id: number;
  title: string;
  category: string;
  rating: number;
  memo: string;
  createdAt: number;
};

const CATEGORIES = ['すべて', '活動', 'アイデア', 'タスク', 'お店'];

export default function App() {
  // localStorage から初期データを読み込む（なければ空配列）
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('my_idea_board_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    
  });

  // 入力フォームの状態
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('活動');
  const [rating, setRating] = useState(5);
  const [memo, setMemo] = useState('');

  // 検索・絞り込み・並び替えの状態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [sortBy, setSortBy] = useState<'new' | 'rating'>('new');

  // items が更新されるたびにブラウザの localStorage に保存する
  useEffect(() => {
    localStorage.setItem('my_idea_board_items', JSON.stringify(items));
  }, [items]);

  // 新規アイテムの追加
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newItem: Item = {
      id: Date.now(),
      title,
      category,
      rating,
      memo,
      createdAt: Date.now(),
    };

    setItems([newItem, ...items]);
    // フォームをリセット
    setTitle('');
    setMemo('');
    setRating(5);
  };

  // アイテムの削除
  const handleDeleteItem = (id: number) => {
    if (window.confirm('このカードを削除してもよろしいですか？')) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  // 1. カテゴリで絞り込み ➔ 2. キーワードで検索 ➔ 3. 並び替え
  const filteredItems = items
    .filter((item) => {
      const matchCategory = selectedCategory === 'すべて' || item.category === selectedCategory;
      const matchKeyword = item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                           item.memo.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchKeyword;
    })
    .sort((a, b) => {
      if (sortBy === 'new') {
        return b.createdAt - a.createdAt; // 新しい順
      } else {
        return b.rating - a.rating; // お気に入り度が高い順
      }
    });

  return (
    <div style={styles.container}>
      {/* レスポンシブ切り替え用のインラインメディアクエリ */}
      <style>{`
        @media (max-width: 768px) {
          .responsive-layout {
            flex-direction: column !important;
          }
          .responsive-panel {
            width: 100% !important;
          }
        }
      `}</style>

      <header style={styles.header}>
        <h1 style={styles.title}>🐈 My free Board</h1>
        <p style={styles.subtitle}>ブラウザに自動で保存される、自分だけの特別メモ帳</p>
      </header>

      <div className="responsive-layout" style={styles.mainLayout}>
        {/* 左側：入力フォームパネル */}
        <div className="responsive-panel" style={styles.formPanel}>
          <h2 style={styles.panelTitle}>📝 新しいカードを追加</h2>
          <form onSubmit={handleAddItem} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>タイトル</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：新曲チェック"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                {CATEGORIES.filter(c => c !== 'すべて').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>お気に入り度 (★)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={styles.select}
              >
                <option value={5}>★★★★★ (最高)</option>
                <option value={4}>★★★★☆</option>
                <option value={3}>★★★☆☆</option>
                <option value={2}>★★☆☆☆</option>
                <option value={1}>★☆☆☆☆</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>メモ・詳細</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="自由にメモを残そう..."
                style={styles.textarea}
                rows={3}
              />
            </div>

            <button type="submit" style={styles.submitButton}>
              + カードを追加する
            </button>
          </form>
        </div>

        {/* 右側：一覧・検索・カード表示エリア */}
        <div className="responsive-panel" style={styles.contentPanel}>
          {/* 検索＆コントロールバー */}
          <div style={styles.controlBar}>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="🔍 キーワードで検索..."
              style={styles.searchInput}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'new' | 'rating')}
              style={styles.sortSelect}
            >
              <option value="new">新しい順</option>
              <option value="rating">お気に入り度順</option>
            </select>
          </div>

          {/* カテゴリタブフィルター */}
          <div style={styles.tabContainer}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.tabButton,
                  backgroundColor: selectedCategory === cat ? '#6d9be0' : '#2a2a35',
                  color: selectedCategory === cat ? '#fff' : '#94a3b8',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* カード一覧 */}
          <div style={styles.cardGrid}>
            {filteredItems.length === 0 ? (
              <p style={styles.emptyText}>該当するカードがありません。</p>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span style={styles.cardCategory}>{item.category}</span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      style={styles.deleteButton}
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                  <h3 style={styles.cardTitle}>{item.title}</h3>
                  <div style={styles.cardRating}>
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>
                  <p style={styles.cardMemo}>{item.memo || 'メモなし'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#16161a',
    color: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '30px 16px',
    boxSizing: 'border-box' as const,
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '6px',
    color: '#e2e8f0',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  mainLayout: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'flex-start',
  },
  formPanel: {
    width: '320px',
    backgroundColor: '#21212b',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
    border: '1px solid #2e2e3a',
    boxSizing: 'border-box' as const,
  },
  panelTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    marginBottom: '16px',
    color: '#f1f5f9',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  label: {
    fontSize: '0.8rem',
    color: '#94a3b8',
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #3a3a4a',
    backgroundColor: '#1a1a22',
    color: '#fff',
    fontSize: '0.9rem',
  },
  select: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #3a3a4a',
    backgroundColor: '#1a1a22',
    color: '#fff',
    fontSize: '0.9rem',
  },
  textarea: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #3a3a4a',
    backgroundColor: '#4682b4',
    color: '#fff',
    fontSize: '0.9rem',
    resize: 'vertical' as const,
  },
  submitButton: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#6d9be0',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '6px',
  },
  contentPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  controlBar: {
    display: 'flex',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid #2e2e3a',
    backgroundColor: '#21212b',
    color: '#fff',
    fontSize: '0.9rem',
  },
  sortSelect: {
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #2e2e3a',
    backgroundColor: '#21212b',
    color: '#fff',
    fontSize: '0.9rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  tabButton: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #2e2e3a',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#00ced1',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #2e2e3a',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCategory: {
    fontSize: '0.7rem',
    padding: '3px 8px',
    borderRadius: '6px',
    backgroundColor: '#0099d1',
    color: '#394d12',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '0 4px',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#f1f5f9',
    margin: '0',
  },
  cardRating: {
    color: '#facc15',
    fontSize: '0.9rem',
    letterSpacing: '1px',
  },
  cardMemo: {
    fontSize: '0.85rem',
    color: '#0069d1',
    margin: '0',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center' as const,
    gridColumn: '1 / -1',
    padding: '40px 0',
  },
};