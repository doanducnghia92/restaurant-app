import { useState, useEffect, useCallback, useRef } from "react";
import { storageGet, storageSet } from "./firebase";

const KEY_MENU = "restaurant:menu";
const KEY_ORDERS = "restaurant:completedOrders";
const KEY_TABLE_ORDERS = "restaurant:tableOrders";
const KEY_KITCHEN = "restaurant:kitchenQueue";

const SEED_MENU = [
  { id: 1, name: "Phở Bò Tái", category: "Phở", price: 65000, cost: 28000, emoji: "🍜", available: true },
  { id: 2, name: "Phở Bò Chín", category: "Phở", price: 65000, cost: 28000, emoji: "🍜", available: true },
  { id: 3, name: "Phở Gà", category: "Phở", price: 60000, cost: 22000, emoji: "🍜", available: true },
  { id: 4, name: "Bún Bò Huế", category: "Bún", price: 65000, cost: 25000, emoji: "🍲", available: true },
  { id: 5, name: "Bún Riêu", category: "Bún", price: 60000, cost: 23000, emoji: "🍲", available: true },
  { id: 6, name: "Cơm Sườn Nướng", category: "Cơm", price: 75000, cost: 32000, emoji: "🍚", available: true },
  { id: 7, name: "Cơm Gà Xối Mỡ", category: "Cơm", price: 70000, cost: 28000, emoji: "🍚", available: true },
  { id: 8, name: "Chả Giò", category: "Khai vị", price: 45000, cost: 15000, emoji: "🥟", available: true },
  { id: 9, name: "Gỏi Cuốn", category: "Khai vị", price: 40000, cost: 14000, emoji: "🫔", available: true },
  { id: 10, name: "Trà Đá", category: "Đồ uống", price: 10000, cost: 2000, emoji: "🧊", available: true },
  { id: 11, name: "Nước Ngọt", category: "Đồ uống", price: 20000, cost: 8000, emoji: "🥤", available: true },
  { id: 12, name: "Bia Saigon", category: "Đồ uống", price: 25000, cost: 12000, emoji: "🍺", available: true },
];

const TABLES = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Bàn ${i + 1}` }));

function genId() {
  return Date.now() + Math.random();
}

function fmt(n) {
  return Number(n).toLocaleString("vi-VN") + "đ";
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [tab, setTab] = useState("order");

  const [menu, setMenuState] = useState(SEED_MENU);
  const [tableOrders, setTableOrdersState] = useState({});
  const [completedOrders, setCompletedOrdersState] = useState([]);
  const [kitchenQueue, setKitchenQueueState] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [notification, setNotification] = useState(null);

  const previousPendingKitchenCount = useRef(0);

  useEffect(() => {
    (async () => {
      const [m, o, t, k] = await Promise.all([
        storageGet(KEY_MENU),
        storageGet(KEY_ORDERS),
        storageGet(KEY_TABLE_ORDERS),
        storageGet(KEY_KITCHEN),
      ]);

      if (m) setMenuState(m);
      if (o) setCompletedOrdersState(o);
      if (t) setTableOrdersState(t);
      if (k) setKitchenQueueState(k);

      setLoading(false);
      setLastSync(new Date());
    })();
  }, []);

  useEffect(() => {
    const poll = async () => {
      const [m, o, t, k] = await Promise.all([
        storageGet(KEY_MENU),
        storageGet(KEY_ORDERS),
        storageGet(KEY_TABLE_ORDERS),
        storageGet(KEY_KITCHEN),
      ]);

      if (m) setMenuState(m);
      if (o) setCompletedOrdersState(o);
      if (t) setTableOrdersState(t);
      if (k) setKitchenQueueState(k);

      setLastSync(new Date());
    };

    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const pendingCount = kitchenQueue.filter(k => !k.done).length;
    if (pendingCount > previousPendingKitchenCount.current && tab === "kitchen") {
      notify("Có order mới gửi vào bếp!", "success");
    }
    previousPendingKitchenCount.current = pendingCount;
  }, [kitchenQueue, tab]);

  const setMenu = useCallback((updater) => {
    setMenuState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storageSet(KEY_MENU, next);
      return next;
    });
  }, []);

  const setTableOrders = useCallback((updater) => {
    setTableOrdersState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storageSet(KEY_TABLE_ORDERS, next);
      return next;
    });
  }, []);

  const setCompletedOrders = useCallback((updater) => {
    setCompletedOrdersState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storageSet(KEY_ORDERS, next);
      return next;
    });
  }, []);

  const setKitchenQueue = useCallback((updater) => {
    setKitchenQueueState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      storageSet(KEY_KITCHEN, next);
      return next;
    });
  }, []);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const manualSync = async () => {
    setSyncing(true);
    const [m, o, t, k] = await Promise.all([
      storageGet(KEY_MENU),
      storageGet(KEY_ORDERS),
      storageGet(KEY_TABLE_ORDERS),
      storageGet(KEY_KITCHEN),
    ]);

    if (m) setMenuState(m);
    if (o) setCompletedOrdersState(o);
    if (t) setTableOrdersState(t);
    if (k) setKitchenQueueState(k);

    setLastSync(new Date());
    setSyncing(false);
    notify("Đã đồng bộ dữ liệu!");
  };

  const addToOrder = (tableId, menuItem) => {
    setTableOrders(prev => {
      const order = prev[tableId] || { items: [], openedAt: new Date().toISOString() };
      const existing = order.items.find(i => i.menuItem.id === menuItem.id);

      const items = existing
        ? order.items.map(i =>
            i.menuItem.id === menuItem.id
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        : [...order.items, { menuItem, qty: 1, note: "" }];

      return { ...prev, [tableId]: { ...order, items } };
    });
  };

  const removeFromOrder = (tableId, menuId) => {
    setTableOrders(prev => {
      const order = prev[tableId];
      if (!order) return prev;

      const items = order.items
        .map(i => i.menuItem.id === menuId ? { ...i, qty: i.qty - 1 } : i)
        .filter(i => i.qty > 0);

      if (items.length === 0) {
        const next = { ...prev };
        delete next[tableId];
        return next;
      }

      return { ...prev, [tableId]: { ...order, items } };
    });
  };

  const updateItemNote = (tableId, menuId, note) => {
    setTableOrders(prev => {
      const order = prev[tableId];
      if (!order) return prev;

      const items = order.items.map(item =>
        item.menuItem.id === menuId
          ? { ...item, note }
          : item
      );

      return { ...prev, [tableId]: { ...order, items } };
    });
  };

  const sendToKitchen = (tableId) => {
    const order = tableOrders[tableId];
    if (!order || order.items.length === 0) return;

    const tableName = TABLES.find(t => t.id === tableId)?.name;

    setKitchenQueue(prev => [
      ...prev,
      {
        id: genId(),
        tableId,
        tableName,
        items: order.items.map(item => ({ ...item, done: false })),
        time: new Date().toISOString(),
        done: false,
      }
    ]);

    notify(`Đã gửi món cho bếp – ${tableName}`);
  };

  const checkout = (tableId) => {
    const order = tableOrders[tableId];
    if (!order || order.items.length === 0) return;

    const tableName = TABLES.find(t => t.id === tableId)?.name;
    const total = order.items.reduce((s, i) => s + i.menuItem.price * i.qty, 0);
    const cost = order.items.reduce((s, i) => s + i.menuItem.cost * i.qty, 0);

    setCompletedOrders(prev => [
      ...prev,
      {
        id: genId(),
        tableId,
        tableName,
        items: order.items,
        total,
        cost,
        profit: total - cost,
        paidAt: new Date().toISOString(),
        date: today(),
      }
    ]);

    setTableOrders(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });

    setKitchenQueue(prev => prev.filter(k => k.tableId !== tableId));

    if (selectedTable === tableId) setSelectedTable(null);
    notify(`Thanh toán ${tableName} – ${fmt(total)}`);
  };

  const markKitchenDone = (id) => {
    setKitchenQueue(prev =>
      prev.map(k =>
        k.id === id
          ? { ...k, done: true, items: k.items.map(i => ({ ...i, done: true })) }
          : k
      )
    );
  };

  const markKitchenItemDone = (orderId, menuId) => {
    setKitchenQueue(prev =>
      prev.map(k => {
        if (k.id !== orderId) return k;

        const items = k.items.map(i =>
          i.menuItem.id === menuId
            ? { ...i, done: !i.done }
            : i
        );

        const done = items.every(i => i.done);
        return { ...k, items, done };
      })
    );
  };

  const upsertMenuItem = (item) => {
    setMenu(prev => {
      const exists = prev.find(m => m.id === item.id);
      return exists ? prev.map(m => m.id === item.id ? item : m) : [...prev, { ...item, id: genId() }];
    });

    notify(item.id ? "Đã cập nhật món" : "Đã thêm món mới");
  };

  const deleteMenuItem = (id) => {
    setMenu(prev => prev.filter(m => m.id !== id));
    notify("Đã xóa món", "error");
  };

  const TABS = [
    { id: "order", label: "Order", icon: "🍽️" },
    { id: "kitchen", label: "Bếp", icon: "👨‍🍳", badge: kitchenQueue.filter(k => !k.done).length },
    { id: "menu", label: "Menu", icon: "📋" },
    { id: "revenue", label: "Doanh thu", icon: "📊" },
    { id: "history", label: "Lịch sử", icon: "🗂️" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f9fafb", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🍜</div>
      <div style={{ fontWeight: 700, fontSize: 18, color: "#1c1917" }}>Đang tải dữ liệu...</div>
      <div style={{ color: "#9ca3af", fontSize: 13 }}>Đồng bộ từ cloud</div>
      <Spinner />
    </div>
  );

  return (
    <div style={s.root}>
      {notification && (
        <div style={{ ...s.notif, background: notification.type === "error" ? "#ef4444" : "#22c55e" }}>
          {notification.msg}
        </div>
      )}

      <header style={s.header}>
        <span style={s.logo}>🍜 Quán Phở - Bánh xèo Ngư</span>
        <div style={s.syncBar}>
          {lastSync && (
            <span style={s.syncTime}>
              🕐 {lastSync.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button style={s.syncBtn} onClick={manualSync} disabled={syncing}>
            {syncing ? "⏳" : "🔄"} Sync
          </button>
        </div>
      </header>

      <nav style={s.nav}>
        {TABS.map(t => (
          <button key={t.id} style={{ ...s.navBtn, ...(tab === t.id ? s.navActive : {}) }} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={s.navLabel}>{t.label}</span>
            {t.badge > 0 && <span style={s.badge}>{t.badge}</span>}
          </button>
        ))}
      </nav>

      <main style={s.main}>
        {tab === "order" && (
          <OrderTab
            tables={TABLES}
            menu={menu}
            tableOrders={tableOrders}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            addToOrder={addToOrder}
            removeFromOrder={removeFromOrder}
            updateItemNote={updateItemNote}
            sendToKitchen={sendToKitchen}
            checkout={checkout}
          />
        )}
        {tab === "kitchen" && <KitchenTab queue={kitchenQueue} markDone={markKitchenDone} markItemDone={markKitchenItemDone} />}
        {tab === "menu" && <MenuTab menu={menu} onSave={upsertMenuItem} onDelete={deleteMenuItem} />}
        {tab === "revenue" && <RevenueTab orders={completedOrders} />}
        {tab === "history" && <HistoryTab orders={completedOrders} />}
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 32, height: 32, border: "3px solid #e5e7eb", borderTop: "3px solid #f97316", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function OrderTab({ tables, menu, tableOrders, selectedTable, setSelectedTable, addToOrder, removeFromOrder, updateItemNote, sendToKitchen, checkout }) {
  const [catFilter, setCatFilter] = useState("Tất cả");
  const cats = ["Tất cả", ...new Set(menu.map(m => m.category))];
  const filtered = catFilter === "Tất cả" ? menu : menu.filter(m => m.category === catFilter);
  const order = selectedTable ? tableOrders[selectedTable] : null;
  const orderTotal = order ? order.items.reduce((s, i) => s + i.menuItem.price * i.qty, 0) : 0;
  const orderCount = order ? order.items.reduce((s, i) => s + i.qty, 0) : 0;

  return (
    <div>
      <div style={s.tableSection}>
        <h2 style={s.sectionTitle}>Chọn bàn</h2>
        <div style={s.tableGrid}>
          {tables.map(t => {
            const hasOrder = !!tableOrders[t.id];
            const isSelected = selectedTable === t.id;
            return (
              <button
                key={t.id}
                style={{ ...s.tableBtn, ...(isSelected ? s.tableBtnSelected : {}), ...(hasOrder && !isSelected ? s.tableBtnOccupied : {}) }}
                onClick={() => setSelectedTable(isSelected ? null : t.id)}
              >
                <span>{hasOrder ? "🔴" : "⚪"}</span>
                <span style={s.tableName}>{t.name}</span>
                {hasOrder && <span style={s.tableCount}>{tableOrders[t.id].items.reduce((s, i) => s + i.qty, 0)} món</span>}
              </button>
            );
          })}
        </div>
      </div>

      {selectedTable ? (
        <div style={s.orderMain}>
          <div style={s.menuPanel}>
            <div style={s.catBar}>
              {cats.map(c => (
                <button key={c} style={{ ...s.catBtn, ...(catFilter === c ? s.catBtnActive : {}) }} onClick={() => setCatFilter(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div style={s.menuGrid}>
              {filtered.filter(m => m.available).map(m => (
                <button key={m.id} style={s.menuCard} onClick={() => addToOrder(selectedTable, m)}>
                  <span style={{ fontSize: 22 }}>{m.emoji}</span>
                  <span style={s.menuName}>{m.name}</span>
                  <span style={s.menuPrice}>{fmt(m.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={s.orderPanel}>
            <div style={s.orderHeader}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{TABLES.find(t => t.id === selectedTable)?.name}</span>
              <span style={{ color: "#6b7280", fontSize: 12 }}>{orderCount} món</span>
            </div>

            <div style={s.orderItems}>
              {!order || order.items.length === 0 ? (
                <div style={s.emptyOrder}>Chưa có món</div>
              ) : (
                order.items.map(item => (
                  <div key={item.menuItem.id} style={s.orderItem}>
                    <span style={{ fontSize: 18 }}>{item.menuItem.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={s.orderItemName}>{item.menuItem.name}</div>
                      <input
                        placeholder="Ghi chú..."
                        value={item.note || ""}
                        onChange={(e) => updateItemNote(selectedTable, item.menuItem.id, e.target.value)}
                        style={s.noteInput}
                      />
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{fmt(item.menuItem.price)}</div>
                    </div>
                    <div style={s.qtyCtrl}>
                      <button style={s.qtyBtn} onClick={() => removeFromOrder(selectedTable, item.menuItem.id)}>-</button>
                      <span style={s.qtyNum}>{item.qty}</span>
                      <button style={s.qtyBtn} onClick={() => addToOrder(selectedTable, item.menuItem)}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={s.orderFooter}>
              <div style={s.totalRow}>
                <span style={{ fontWeight: 600 }}>Tổng</span>
                <span style={s.totalAmt}>{fmt(orderTotal)}</span>
              </div>
              <div style={s.actionRow}>
                <button style={s.btnKitchen} onClick={() => sendToKitchen(selectedTable)} disabled={!order || order.items.length === 0}>👨‍🍳 Báo bếp</button>
                <button style={s.btnCheckout} onClick={() => checkout(selectedTable)} disabled={!order || order.items.length === 0}>💳 Thanh toán</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={s.selectHint}>← Chọn bàn để bắt đầu order</div>
      )}
    </div>
  );
}

function KitchenTab({ queue, markDone, markItemDone }) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const pending = queue.filter(k => !k.done);
  const done = queue.filter(k => k.done).slice(-5).reverse();

  return (
    <div>
      <h2 style={s.sectionTitle}>Màn hình bếp</h2>
      {pending.length === 0 && <div style={s.emptyOrder}>✅ Không có order mới</div>}
      <div style={s.kitchenGrid}>
        {pending.map(k => {
          const mins = Math.floor((Date.now() - new Date(k.time)) / 60000);
          return (
            <div key={k.id} style={{ ...s.kitchenCard, borderColor: mins >= 10 ? "#ef4444" : "#e5e7eb" }}>
              <div style={s.kitchenCardHeader}>
                <span style={s.kitchenTable}>{k.tableName}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: mins >= 10 ? "#ef4444" : "#6b7280" }}>{mins} phút</span>
              </div>

              <ul style={s.kitchenItems}>
                {k.items.map(i => (
                  <li key={i.menuItem.id} style={{ ...s.kitchenItem, opacity: i.done ? 0.45 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ textDecoration: i.done ? "line-through" : "none" }}>
                        {i.menuItem.emoji} {i.menuItem.name}
                      </div>
                      {i.note && (
                        <div style={s.kitchenNote}>📝 {i.note}</div>
                      )}
                    </div>
                    <span style={{ fontWeight: 700, color: "#f97316", marginRight: 8 }}>×{i.qty}</span>
                    <button style={s.itemDoneBtn} onClick={() => markItemDone(k.id, i.menuItem.id)}>
                      {i.done ? "↩" : "✓"}
                    </button>
                  </li>
                ))}
              </ul>

              <button style={s.btnDone} onClick={() => markDone(k.id)}>✅ Hoàn thành cả order</button>
            </div>
          );
        })}
      </div>

      {done.length > 0 && (
        <>
          <h3 style={{ fontSize: 13, color: "#9ca3af", margin: "20px 0 8px", fontWeight: 600 }}>Đã xong gần đây</h3>
          {done.map(k => (
            <div key={k.id} style={s.kitchenDoneItem}>
              <span>{k.tableName}</span>
              <span style={{ color: "#9ca3af", fontSize: 12 }}>{k.items.length} loại món</span>
              <span style={{ color: "#22c55e" }}>✓ Xong</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function MenuTab({ menu, onSave, onDelete }) {
  const BLANK = { name: "", category: "", price: "", cost: "", emoji: "🍽️", available: true };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [catFilter, setCatFilter] = useState("Tất cả");

  const cats = ["Tất cả", ...new Set(menu.map(m => m.category))];
  const filtered = catFilter === "Tất cả" ? menu : menu.filter(m => m.category === catFilter);

  const startEdit = (item) => {
    setEditing(item.id);
    setForm({ ...item, price: String(item.price), cost: String(item.cost) });
  };

  const startNew = () => {
    setEditing("new");
    setForm(BLANK);
  };

  const cancel = () => {
    setEditing(null);
    setForm(BLANK);
  };

  const save = () => {
    if (!form.name || !form.price || !form.category) return;
    onSave({ ...form, id: editing === "new" ? null : editing, price: Number(form.price), cost: Number(form.cost || 0) });
    cancel();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={s.sectionTitle}>Quản lý Menu</h2>
        <button style={s.btnAdd} onClick={startNew}>+ Thêm món</button>
      </div>

      {editing && (
        <div style={s.formCard}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>{editing === "new" ? "Thêm món mới" : "Sửa món"}</h3>
          <div style={s.formGrid}>
            <label style={s.formLabel}>Emoji</label>
            <input style={s.input} value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} />
            <label style={s.formLabel}>Tên món *</label>
            <input style={s.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Phở Bò Tái" />
            <label style={s.formLabel}>Danh mục *</label>
            <input style={s.input} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="VD: Phở, Cơm..." />
            <label style={s.formLabel}>Giá bán *</label>
            <input style={s.input} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="65000" />
            <label style={s.formLabel}>Giá vốn</label>
            <input style={s.input} type="number" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} placeholder="25000" />
            <label style={s.formLabel}>Phục vụ</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
              {form.available ? "Còn món" : "Tạm hết"}
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button style={s.btnSave} onClick={save}>💾 Lưu</button>
            <button style={s.btnCancel} onClick={cancel}>Huỷ</button>
          </div>
        </div>
      )}

      <div style={s.catBar}>
        {cats.map(c => <button key={c} style={{ ...s.catBtn, ...(catFilter === c ? s.catBtnActive : {}) }} onClick={() => setCatFilter(c)}>{c}</button>)}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(m => (
          <div key={m.id} style={{ ...s.menuListItem, opacity: m.available ? 1 : 0.5 }}>
            <span style={{ fontSize: 24 }}>{m.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{m.category} · Vốn: {fmt(m.cost)}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: "#f97316", fontSize: 14 }}>{fmt(m.price)}</div>
              <div style={{ fontSize: 12, color: "#22c55e" }}>+{fmt(m.price - m.cost)}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button style={s.btnEdit} onClick={() => startEdit(m)}>✏️</button>
              <button style={s.btnDel} onClick={() => onDelete(m.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueTab({ orders }) {
  const [range, setRange] = useState("today");
  const [selectedDate, setSelectedDate] = useState(today());
  const now = new Date();

  const filtered = orders.filter(o => {
    const d = new Date(o.paidAt);
    if (range === "today") return o.date === today();
    if (range === "date") return o.date === selectedDate;
    if (range === "week") return (now - d) / 86400000 <= 7;
    if (range === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const totalCost = filtered.reduce((s, o) => s + o.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const orderCount = filtered.length;
  const avgOrder = orderCount ? Math.round(totalRevenue / orderCount) : 0;
  const margin = totalRevenue ? Math.round(totalProfit / totalRevenue * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        <h2 style={s.sectionTitle}>Doanh thu & Lợi nhuận</h2>
        <div style={s.catBar}>
          {[["today", "Hôm nay"], ["date", "Theo ngày"], ["week", "7 ngày"], ["month", "Tháng này"], ["all", "Tất cả"]].map(([v, l]) => (
            <button key={v} style={{ ...s.catBtn, ...(range === v ? s.catBtnActive : {}) }} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
        {range === "date" && (
          <input style={s.input} type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        )}
      </div>

      <div style={s.statsGrid}>
        {[
          { icon: "💰", label: "Doanh thu", value: fmt(totalRevenue), color: "#f97316" },
          { icon: "📦", label: "Giá vốn", value: fmt(totalCost), color: "#6b7280" },
          { icon: "📈", label: "Lợi nhuận", value: fmt(totalProfit), color: "#22c55e" },
          { icon: "🧾", label: "Số đơn", value: orderCount, color: "#3b82f6" },
          { icon: "🍽️", label: "TB/đơn", value: fmt(avgOrder), color: "#8b5cf6" },
          { icon: "📊", label: "Tỷ suất LN", value: totalRevenue ? margin + "%" : "—", color: "#ec4899" },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color, marginTop: 2 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={s.topCard}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>Chi tiết đơn</h3>
        {filtered.length === 0 && <div style={s.emptyOrder}>Chưa có dữ liệu trong khoảng thời gian này</div>}
        {filtered.slice().reverse().map(o => (
          <div key={o.id} style={{ borderBottom: "1px solid #f3f4f6", padding: "8px 0", fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
              <span>{o.tableName}</span>
              <span>{fmt(o.total)}</span>
            </div>
            <div style={{ color: "#9ca3af", marginTop: 2 }}>{new Date(o.paidAt).toLocaleString("vi-VN")}</div>
            <div style={{ marginTop: 4 }}>
              {o.items.map(i => (
                <div key={i.menuItem.id}>• {i.menuItem.name} ×{i.qty}{i.note ? ` — ${i.note}` : ""}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ orders }) {
  const [search, setSearch] = useState("");
  const sorted = [...orders].reverse();
  const filtered = search
    ? sorted.filter(o => o.tableName.includes(search) || o.items.some(i => i.menuItem.name.toLowerCase().includes(search.toLowerCase())))
    : sorted;

  return (
    <div>
      <h2 style={s.sectionTitle}>Lịch sử đơn hàng</h2>
      <input style={{ ...s.input, marginBottom: 12 }} placeholder="🔍 Tìm theo bàn hoặc tên món..." value={search} onChange={e => setSearch(e.target.value)} />
      {filtered.length === 0 && <div style={s.emptyOrder}>Chưa có đơn nào</div>}
      {filtered.map(o => (
        <div key={o.id} style={s.histCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 14, marginRight: 8 }}>{o.tableName}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(o.paidAt).toLocaleString("vi-VN")}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#f97316" }}>{fmt(o.total)}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {o.items.map(i => <span key={i.menuItem.id} style={s.histItem}>{i.menuItem.emoji} {i.menuItem.name} ×{i.qty}{i.note ? ` — ${i.note}` : ""}</span>)}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Lợi nhuận: <strong style={{ color: "#22c55e" }}>{fmt(o.profit)}</strong></div>
        </div>
      ))}
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#f9fafb", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 80 },
  header: { background: "#1c1917", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: 17, fontWeight: 800 },
  syncBar: { display: "flex", alignItems: "center", gap: 8 },
  syncTime: { fontSize: 11, color: "#a8a29e" },
  syncBtn: { background: "#292524", color: "#fff", border: "1px solid #44403c", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontWeight: 600 },
  nav: { display: "flex", background: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50 },
  navBtn: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "9px 4px", background: "none", border: "none", cursor: "pointer", color: "#6b7280", gap: 1, position: "relative" },
  navActive: { color: "#f97316", borderBottom: "2px solid #f97316" },
  navLabel: { fontSize: 10 },
  badge: { position: "absolute", top: 3, right: "50%", transform: "translateX(10px)", background: "#ef4444", color: "#fff", borderRadius: 999, fontSize: 9, fontWeight: 700, padding: "1px 4px" },
  main: { padding: 14, maxWidth: 900, margin: "0 auto" },
  sectionTitle: { margin: "0 0 10px", fontSize: 15, fontWeight: 700, color: "#1c1917" },
  notif: { position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", color: "#fff", padding: "9px 18px", borderRadius: 8, fontWeight: 600, zIndex: 200, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,.2)", whiteSpace: "nowrap" },
  tableSection: { marginBottom: 14 },
  tableGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7 },
  tableBtn: { background: "#fff", border: "2px solid #e5e7eb", borderRadius: 10, padding: "9px 4px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  tableBtnSelected: { border: "2px solid #f97316", background: "#fff7ed" },
  tableBtnOccupied: { border: "2px solid #fca5a5", background: "#fef2f2" },
  tableName: { fontSize: 11, fontWeight: 600, color: "#374151" },
  tableCount: { fontSize: 10, color: "#ef4444", fontWeight: 700 },
  selectHint: { textAlign: "center", color: "#9ca3af", marginTop: 32, fontSize: 13 },
  orderMain: { display: "grid", gridTemplateColumns: "1fr 300px", gap: 10 },
  menuPanel: {},
  catBar: { display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 },
  catBtn: { background: "#f3f4f6", border: "none", borderRadius: 20, padding: "5px 11px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 },
  catBtnActive: { background: "#f97316", color: "#fff" },
  menuGrid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 7 },
  menuCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 9, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 },
  menuName: { fontSize: 12, fontWeight: 600, color: "#1c1917", lineHeight: 1.3 },
  menuPrice: { fontSize: 12, fontWeight: 700, color: "#f97316" },
  orderPanel: { background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column" },
  orderHeader: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" },
  orderItems: { flex: 1, overflowY: "auto", maxHeight: 330 },
  emptyOrder: { textAlign: "center", color: "#9ca3af", padding: 20, fontSize: 13 },
  orderItem: { display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", borderBottom: "1px solid #f9fafb" },
  orderItemName: { fontSize: 12, fontWeight: 600, color: "#374151" },
  noteInput: { marginTop: 4, width: "100%", padding: 6, borderRadius: 6, border: "1px solid #ddd", fontSize: 12, boxSizing: "border-box" },
  qtyCtrl: { display: "flex", alignItems: "center", gap: 5 },
  qtyBtn: { width: 24, height: 24, borderRadius: "50%", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: "center" },
  orderFooter: { padding: 12, borderTop: "1px solid #f3f4f6" },
  totalRow: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  totalAmt: { fontSize: 16, fontWeight: 800, color: "#f97316" },
  actionRow: { display: "flex", gap: 7 },
  btnKitchen: { flex: 1, padding: "8px 0", background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12 },
  btnCheckout: { flex: 1, padding: "8px 0", background: "#f97316", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 12 },
  kitchenGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 },
  kitchenCard: { background: "#fff", border: "2px solid #e5e7eb", borderRadius: 12, padding: 12 },
  kitchenCardHeader: { display: "flex", justifyContent: "space-between", marginBottom: 8 },
  kitchenTable: { fontWeight: 800, fontSize: 14 },
  kitchenItems: { listStyle: "none", padding: 0, margin: "0 0 10px" },
  kitchenItem: { display: "flex", alignItems: "flex-start", gap: 6, padding: "6px 0", fontSize: 12, borderBottom: "1px solid #f3f4f6" },
  kitchenNote: { fontSize: 12, color: "#f59e0b", marginTop: 4 },
  itemDoneBtn: { border: "1px solid #d1d5db", background: "#fff", borderRadius: 6, cursor: "pointer", padding: "2px 6px", fontWeight: 700 },
  btnDone: { width: "100%", padding: "7px 0", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 },
  kitchenDoneItem: { background: "#f9fafb", borderRadius: 8, padding: "7px 12px", display: "flex", gap: 10, alignItems: "center", fontSize: 13, marginBottom: 4 },
  formCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, marginBottom: 14 },
  formGrid: { display: "grid", gridTemplateColumns: "80px 1fr", gap: "7px 10px", alignItems: "center" },
  formLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  input: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
  btnAdd: { background: "#f97316", color: "#fff", border: "none", borderRadius: 8, padding: "7px 13px", cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnSave: { background: "#1c1917", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontWeight: 700, fontSize: 13 },
  btnCancel: { background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13 },
  menuListItem: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "11px 12px", display: "flex", alignItems: "center", gap: 10 },
  btnEdit: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "5px 7px", cursor: "pointer", fontSize: 13 },
  btnDel: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "5px 7px", cursor: "pointer", fontSize: 13 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 },
  statCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "12px 8px", textAlign: "center" },
  topCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 },
  histCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, marginBottom: 8 },
  histItem: { background: "#f3f4f6", borderRadius: 20, padding: "3px 9px", fontSize: 11, color: "#374151" },
};
