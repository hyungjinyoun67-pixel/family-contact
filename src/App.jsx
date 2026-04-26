import { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";

// 이모지 선택 목록
const EMOJIS = ["👨","👩","👧","👦","👴","👵","👮","🚒","🏥","🏫","👨‍⚕️","👩‍⚕️","🚓","🚑","🔥","⭐","❤️","🏠","📞","🆘"];

// 카드 색상 세트 (밝고 예쁜 색)
const CARD_COLORS = [
  { bg:"#fff0f0", border:"#ffb3b3", btn:"#ff6b6b", label:"빨강" },
  { bg:"#fff8e1", border:"#ffe082", btn:"#ffa000", label:"노랑" },
  { bg:"#e8f5e9", border:"#a5d6a7", btn:"#43a047", label:"초록" },
  { bg:"#e3f2fd", border:"#90caf9", btn:"#1e88e5", label:"파랑" },
  { bg:"#f3e5f5", border:"#ce93d8", btn:"#8e24aa", label:"보라" },
  { bg:"#fce4ec", border:"#f48fb1", btn:"#e91e63", label:"분홍" },
  { bg:"#e0f7fa", border:"#80deea", btn:"#00acc1", label:"하늘" },
  { bg:"#fff3e0", border:"#ffcc80", btn:"#fb8c00", label:"주황" },
];

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // 폼 상태
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fEmoji, setFEmoji] = useState("👨");
  const [fColor, setFColor] = useState(0);

  // Firebase 구독
  useEffect(() => {
    const unsub = onValue(ref(db, "contacts"), snap => {
      const data = snap.val();
      if (data) {
        const list = Object.entries(data).map(([id, v]) => ({ id, ...v }));
        list.sort((a, b) => a.order - b.order);
        setContacts(list);
      } else setContacts([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const resetForm = () => { setFName(""); setFPhone(""); setFEmoji("👨"); setFColor(0); };

  const openAdd = () => { resetForm(); setEditItem(null); setShowForm(true); };
  const openEdit = (c) => {
    setFName(c.name); setFPhone(c.phone);
    setFEmoji(c.emoji || "👨");
    setFColor(c.colorIdx || 0);
    setEditItem(c); setShowForm(true);
  };

  const saveContact = () => {
    if (!fName.trim() || !fPhone.trim()) return;
    if (editItem) {
      update(ref(db, `contacts/${editItem.id}`), { name:fName.trim(), phone:fPhone.trim(), emoji:fEmoji, colorIdx:fColor });
    } else {
      const newRef = push(ref(db, "contacts"));
      set(newRef, { name:fName.trim(), phone:fPhone.trim(), emoji:fEmoji, colorIdx:fColor, order:contacts.length, createdAt:Date.now() });
    }
    setShowForm(false); resetForm(); setEditItem(null);
  };

  const deleteContact = (id) => { remove(ref(db, `contacts/${id}`)); setDeleteTarget(null); };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20 }}>
      <div style={{ fontSize:60 }}>📞</div>
      <div style={{ fontSize:24, fontWeight:900, color:"#e53935" }}>불러오는 중...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#fff5f5 0%,#fce4ec 100%)", fontFamily:"'Apple SD Gothic Neo','Noto Sans KR',sans-serif", paddingBottom:120 }}>

      {/* ── 헤더 ── */}
      <div style={{ background:"linear-gradient(135deg,#e53935,#c62828)", padding:"28px 20px 24px", textAlign:"center", boxShadow:"0 4px 20px rgba(229,57,53,0.3)" }}>
        <div style={{ fontSize:56, marginBottom:8 }}>🆘</div>
        <div style={{ fontSize:32, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", lineHeight:1.2 }}>긴급 연락망</div>
        <div style={{ fontSize:18, color:"rgba(255,255,255,0.8)", marginTop:6, fontWeight:600 }}>우리 가족 비상연락처</div>
        {contacts.length > 0 && (
          <div style={{ marginTop:12, background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"6px 16px", display:"inline-block", fontSize:16, color:"#fff", fontWeight:700 }}>
            총 {contacts.length}명 등록됨
          </div>
        )}
      </div>

      <div style={{ padding:"20px 16px 0" }}>

        {/* 빈 화면 */}
        {contacts.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:80, marginBottom:16 }}>📵</div>
            <div style={{ fontSize:26, fontWeight:900, color:"#c62828", marginBottom:8 }}>연락처가 없어요!</div>
            <div style={{ fontSize:18, color:"#e57373", fontWeight:600 }}>아래 버튼으로 추가해보세요</div>
          </div>
        )}

        {/* 연락처 카드 목록 */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {contacts.map((c) => {
            const col = CARD_COLORS[c.colorIdx ?? 0];
            return (
              <div key={c.id} style={{ background:col.bg, borderRadius:24, border:`3px solid ${col.border}`, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
                {/* 카드 본문 */}
                <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", gap:16 }}>
                  {/* 이모지 아이콘 */}
                  <div style={{ width:72, height:72, borderRadius:20, background:"#fff", border:`3px solid ${col.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, flexShrink:0, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
                    {c.emoji || "👤"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:28, fontWeight:900, color:"#1a1a1a", letterSpacing:"-0.5px" }}>{c.name}</div>
                    <div style={{ fontSize:24, fontWeight:800, color:col.btn, marginTop:4, letterSpacing:"0.5px" }}>{c.phone}</div>
                  </div>
                </div>

                {/* 버튼 행 */}
                <div style={{ display:"flex", gap:0, borderTop:`2px solid ${col.border}` }}>
                  {/* 전화 버튼 */}
                  <a href={`tel:${c.phone}`}
                    style={{ flex:2, background:col.btn, border:"none", color:"#fff", padding:"18px", fontSize:22, fontWeight:900, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none", borderRight:`2px solid ${col.border}` }}>
                    📞 전화하기
                  </a>
                  {/* 수정 버튼 */}
                  <button onClick={() => openEdit(c)}
                    style={{ flex:1, background:"#fff", border:"none", color:"#555", padding:"18px", fontSize:20, fontWeight:800, cursor:"pointer", borderRight:`2px solid ${col.border}` }}>
                    ✏️
                  </button>
                  {/* 삭제 버튼 */}
                  <button onClick={() => setDeleteTarget(c)}
                    style={{ flex:1, background:"#fff", border:"none", color:"#e53935", padding:"18px", fontSize:20, fontWeight:800, cursor:"pointer" }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 하단 추가 버튼 ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"14px 16px", background:"linear-gradient(transparent,rgba(255,245,245,0.95) 40%)" }}>
        <button onClick={openAdd}
          style={{ width:"100%", background:"linear-gradient(135deg,#e53935,#c62828)", border:"none", color:"#fff", borderRadius:20, padding:"22px", fontSize:22, fontWeight:900, cursor:"pointer", boxShadow:"0 6px 24px rgba(229,57,53,0.4)", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
          ➕ 연락처 추가하기
        </button>
      </div>

      {/* ── 추가/수정 폼 모달 ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"flex-end" }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); setEditItem(null); } }}>
          <div style={{ background:"#fff", borderRadius:"28px 28px 0 0", padding:"28px 20px 48px", width:"100%", maxWidth:480, margin:"0 auto" }}>
            <div style={{ fontSize:24, fontWeight:900, color:"#c62828", marginBottom:24, textAlign:"center" }}>
              {editItem ? "✏️ 연락처 수정" : "➕ 연락처 추가"}
            </div>

            {/* 이모지 선택 */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#555", marginBottom:10 }}>아이콘 선택</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setFEmoji(e)}
                    style={{ width:48, height:48, borderRadius:14, border: fEmoji===e?"3px solid #e53935":"2px solid #eee", background: fEmoji===e?"#fff5f5":"#fafafa", fontSize:24, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* 색상 선택 */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#555", marginBottom:10 }}>카드 색상</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {CARD_COLORS.map((col, i) => (
                  <button key={i} onClick={() => setFColor(i)}
                    style={{ width:40, height:40, borderRadius:12, background:col.btn, border: fColor===i?"3px solid #333":"3px solid transparent", cursor:"pointer", boxShadow: fColor===i?"0 0 0 2px #fff inset":"none" }} />
                ))}
              </div>
            </div>

            {/* 이름 입력 */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#555", marginBottom:8 }}>이름 *</div>
              <input value={fName} onChange={e=>setFName(e.target.value)}
                placeholder="예: 엄마, 아빠, 할머니"
                style={{ width:"100%", border:"2px solid #eee", borderRadius:14, padding:"16px", fontSize:20, fontWeight:700, outline:"none", color:"#1a1a1a" }} />
            </div>

            {/* 전화번호 입력 */}
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:16, fontWeight:800, color:"#555", marginBottom:8 }}>전화번호 *</div>
              <input value={fPhone} onChange={e=>setFPhone(e.target.value)}
                placeholder="010-0000-0000"
                type="tel" inputMode="tel"
                style={{ width:"100%", border:"2px solid #eee", borderRadius:14, padding:"16px", fontSize:22, fontWeight:800, outline:"none", color:"#1a1a1a", letterSpacing:"1px" }} />
            </div>

            {/* 미리보기 */}
            {(fName || fPhone) && (
              <div style={{ background:CARD_COLORS[fColor].bg, border:`2px solid ${CARD_COLORS[fColor].border}`, borderRadius:16, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ fontSize:32 }}>{fEmoji}</div>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:"#1a1a1a" }}>{fName || "이름"}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:CARD_COLORS[fColor].btn }}>{fPhone || "전화번호"}</div>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }}
                style={{ flex:1, background:"#f5f5f5", border:"none", color:"#888", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer" }}>취소</button>
              <button onClick={saveContact}
                style={{ flex:2, background:"linear-gradient(135deg,#e53935,#c62828)", border:"none", color:"#fff", borderRadius:16, padding:"18px", fontSize:20, fontWeight:900, cursor:"pointer" }}>
                {editItem ? "저장하기" : "추가하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#fff", borderRadius:28, padding:32, width:"100%", maxWidth:340, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:12 }}>{deleteTarget.emoji || "👤"}</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#1a1a1a", marginBottom:8 }}>{deleteTarget.name}</div>
            <div style={{ fontSize:18, color:"#e53935", fontWeight:700, marginBottom:24 }}>삭제할까요?</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{ flex:1, background:"#f5f5f5", border:"none", color:"#888", borderRadius:16, padding:"18px", fontSize:18, fontWeight:800, cursor:"pointer" }}>취소</button>
              <button onClick={() => deleteContact(deleteTarget.id)}
                style={{ flex:1, background:"linear-gradient(135deg,#ef4444,#dc2626)", border:"none", color:"#fff", borderRadius:16, padding:"18px", fontSize:18, fontWeight:900, cursor:"pointer" }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        input::placeholder { color:#ccc; }
        button:active, a:active { transform:scale(0.97); opacity:0.9; }
      `}</style>
    </div>
  );
}
