import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import {
  Heart,
  X,
  Camera,
  Send,
  LogOut,
  User,
  MessageCircle,
  Users,
  Home,
} from 'lucide-react';

/* ---------- Design tokens ----------
Color:
  bg          #F4FAF8  (misty mint-white)
  surface     #FFFFFF
  ink         #223338  (deep slate, main text)
  muted       #74898D
  mint        #3FA796  (primary accent)
  mintSoft    #DFF3EE
  blue        #5B8DEF  (secondary accent)
  blueSoft    #E5ECFB
  lavSoft     #F1E8FB
  danger      #E2574C
Type: "Sora" for headings (rounded geometric, friendly), "Inter" for body/UI.
Layout: centered single-column hero -> stacked swipe deck -> 30/70 split chat.
------------------------------------- */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@400;600;700;800&subset=vietnamese&display=swap');`;

const PROFILES = [
  {
    id: 1,
    name: 'Trần Hoàng Nam',
    major: 'Khoa học máy tính',
    have: ['Code Python'],
    want: ['UI/UX Design'],
    goal: 'Thi Hackathon 2024',
    color: '#3FA796',
  },
  {
    id: 2,
    name: 'Lê Ngọc Hân',
    major: 'Thiết kế Đồ họa',
    have: ['UI/UX', 'Figma'],
    want: ['Lập trình Web'],
    goal: 'Thi Hackathon 2024',
    color: '#5B8DEF',
  },
  {
    id: 3,
    name: 'Nguyễn Minh Trí',
    major: 'Phân tích Dữ liệu',
    have: ['Xử lý số liệu', 'Power BI'],
    want: ['Thuyết trình', 'Làm Slide'],
    goal: 'Bài tập Kinh tế lượng',
    color: '#B08A3E',
  },
  {
    id: 4,
    name: 'Phạm Yến Nhi',
    major: 'Quan hệ Công chúng',
    have: ['Thuyết trình', 'Hoạt ngôn'],
    want: ['Xử lý số liệu', 'Data'],
    goal: 'Bài tập Kinh tế lượng',
    color: '#A85CC1',
  },
  {
    id: 5,
    name: 'Vũ Hải Đăng',
    major: 'Truyền thông Đa phương tiện',
    have: ['Edit Video', 'Quay phim'],
    want: ['Viết kịch bản', 'Ý tưởng'],
    goal: 'Đồ án Sản xuất Video',
    color: '#3FA796',
  },
  {
    id: 6,
    name: 'Đặng Mai Phương',
    major: 'Báo chí',
    have: ['Content Creator', 'Copywriting'],
    want: ['Quay dựng Video'],
    goal: 'Đồ án Sản xuất Video',
    color: '#5B8DEF',
  },
  {
    id: 7,
    name: 'Đinh Văn Khoa',
    major: 'Quản trị Kinh doanh',
    have: ['Lập kế hoạch', 'Leader'],
    want: ['Chạy Ads', 'Marketing'],
    goal: 'Khởi nghiệp Sinh viên',
    color: '#B08A3E',
  },
  {
    id: 8,
    name: 'Lý Thảo My',
    major: 'Digital Marketing',
    have: ['Chạy Ads', 'SEO'],
    want: ['Lãnh đạo', 'Lên ý tưởng'],
    goal: 'Khởi nghiệp Sinh viên',
    color: '#A85CC1',
  },
  {
    id: 9,
    name: 'Bùi Quang Huy',
    major: 'Tài chính Ngân hàng',
    have: ['Lập mô hình tài chính'],
    want: ['Thiết kế Pitch Deck'],
    goal: 'Giải quyết Business Case',
    color: '#3FA796',
  },
  {
    id: 10,
    name: 'Ngô Thùy Linh',
    major: 'Thiết kế Mỹ thuật số',
    have: ['Thiết kế Slide đỉnh cao'],
    want: ['Tính toán tài chính'],
    goal: 'Giải quyết Business Case',
    color: '#5B8DEF',
  },
];

function initials(name) {
  const parts = name.trim().split(' ');
  return (
    (parts[parts.length - 2]?.[0] || '') + (parts[parts.length - 1]?.[0] || '')
  );
}

function Avatar({ name, color, size = 64, src }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{
          width: size,
          height: size,
          borderRadius: '9999px',
          objectFit: 'cover',
          border: '3px solid #fff',
          boxShadow: '0 2px 10px rgba(34,51,56,0.12)',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '9999px',
        background: color || '#3FA796',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 700,
        fontSize: size * 0.34,
        border: '3px solid #fff',
        boxShadow: '0 2px 10px rgba(34,51,56,0.12)',
        flexShrink: 0,
      }}
    >
      {initials(name).toUpperCase()}
    </div>
  );
}

function Tag({ children, tone }) {
  const tones = {
    have: { bg: '#DFF3EE', fg: '#1F7A67' },
    want: { bg: '#E5ECFB', fg: '#2C4A99' },
    goal: { bg: '#F1E8FB', fg: '#6B3FA0' },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        fontSize: 12.5,
        fontWeight: 600,
        padding: '5px 10px',
        borderRadius: 999,
        display: 'inline-block',
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {children}
    </span>
  );
}

function Header({
  page,
  setPage,
  isLoggedIn,
  currentUser,
  onLogout,
  onLoginClick,
}) {
  const navItems = [
    { key: 'landing', label: 'Trang chủ', icon: Home },
    { key: 'swipe', label: 'Ghép đội', icon: Users },
    { key: 'chat', label: 'Nhắn tin', icon: MessageCircle },
    { key: 'profile', label: 'Trang cá nhân', icon: User },
  ];
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(244,250,248,0.9)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #DCEAE6',
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          onClick={() => setPage('landing')}
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#223338',
            cursor: 'pointer',
            letterSpacing: -0.3,
          }}
        >
          SkillMatch
        </div>

        {isLoggedIn && (
          <nav style={{ display: 'flex', gap: 4 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setPage(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: active ? '#DFF3EE' : 'transparent',
                    color: active ? '#1F7A67' : '#6B8087',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {isLoggedIn ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar
              name={currentUser.name}
              color={currentUser.color}
              size={34}
              src={currentUser.avatarUrl}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#223338' }}>
              {currentUser.name}
            </span>
            <button
              onClick={onLogout}
              title="Đăng xuất"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: '#FBEAE8',
                color: '#E2574C',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              background: '#3FA796',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Đăng nhập
          </button>
        )}
      </div>
    </div>
  );
}

function Landing({ onCtaClick }) {
  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '96px 24px 64px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-block',
          background: '#DFF3EE',
          color: '#1F7A67',
          fontSize: 13,
          fontWeight: 600,
          padding: '6px 14px',
          borderRadius: 999,
          marginBottom: 24,
        }}
      >
        Nền tảng ghép đội cho sinh viên
      </div>
      <h1
        style={{
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(32px, 5vw, 52px)',
          lineHeight: 1.15,
          color: '#223338',
          letterSpacing: -0.5,
          margin: '0 0 20px',
        }}
      >
        Tìm mảnh ghép hoàn hảo cho dự án
      </h1>
      <p
        style={{
          fontFamily: 'Be Vietnam Pro, sans-serif',
          fontSize: 17,
          color: '#6B8087',
          lineHeight: 1.6,
          maxWidth: 480,
          margin: '0 auto 40px',
        }}
      >
        Kết nối dựa trên kỹ năng thực chiến. Quẹt để tìm đồng đội chạy deadline
        ngay hôm nay!
      </p>
      <button
        onClick={onCtaClick}
        style={{
          fontFamily: 'Be Vietnam Pro, time new roman',
          background: '#3FA796',
          color: '#fff',
          border: 'none',
          padding: '16px 36px',
          borderRadius: 999,
          fontSize: 16,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(63,167,150,0.35)',
        }}
      >
        Bắt đầu ghép đội
      </button>

      <div
        style={{
          marginTop: 80,
          display: 'flex',
          justifyContent: 'center',
          gap: -12,
        }}
      >
        {PROFILES.slice(0, 5).map((p, i) => (
          <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -14 }}>
            <Avatar name={p.name} color={p.color} size={48} />
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: '#9AACAF', marginTop: 12 }}>
        Hơn 10 sinh viên đang tìm đồng đội
      </p>
    </div>
  );
}

function SwipeCard({ profile, dragX, isTop, onPointerDown }) {
  const rotate = isTop ? dragX / 18 : 0;
  const likeOpacity = Math.max(0, Math.min(1, dragX / 90));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / 90));
  return (
    <div
      onPointerDown={isTop ? onPointerDown : undefined}
      style={{
        position: 'absolute',
        inset: 0,
        background: '#fff',
        borderRadius: 28,
        boxShadow: isTop
          ? '0 20px 50px rgba(34,51,56,0.18)'
          : '0 8px 20px rgba(34,51,56,0.08)',
        transform: `translateX(${
          isTop ? dragX : 0
        }px) rotate(${rotate}deg) scale(${isTop ? 1 : 0.96})`,
        transition:
          dragX === 0 ? 'transform 0.35s cubic-bezier(.2,.8,.2,1)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        touchAction: 'pan-y',
        cursor: isTop ? 'grab' : 'default',
        userSelect: 'none',
      }}
    >
      {isTop && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 24,
              border: '3px solid #3FA796',
              color: '#3FA796',
              fontWeight: 800,
              fontFamily: 'Sora, sans-serif',
              fontSize: 22,
              padding: '2px 12px',
              borderRadius: 10,
              opacity: likeOpacity,
              transform: 'rotate(-12deg)',
            }}
          >
            THÍCH
          </div>
          <div
            style={{
              position: 'absolute',
              top: 28,
              right: 24,
              border: '3px solid #E2574C',
              color: '#E2574C',
              fontWeight: 800,
              fontFamily: 'Sora, sans-serif',
              fontSize: 22,
              padding: '2px 12px',
              borderRadius: 10,
              opacity: nopeOpacity,
              transform: 'rotate(12deg)',
            }}
          >
            BỎ QUA
          </div>
        </>
      )}

      <div
        style={{
          background: `linear-gradient(160deg, ${profile.color}22, #F4FAF8)`,
          padding: '36px 0 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar name={profile.name} color={profile.color} size={96} />
        <h3
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: 22,
            color: '#223338',
            margin: '16px 0 2px',
          }}
        >
          {profile.name}
        </h3>
        <p style={{ fontSize: 14, color: '#6B8087', margin: 0 }}>
          {profile.major}
        </p>
      </div>

      <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#9AACAF',
              marginBottom: 6,
              textTransform: 'none',
            }}
          >
            Kỹ năng đang có
          </div>
          {profile.have.map((s) => (
            <Tag tone="have" key={s}>
              {s}
            </Tag>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#9AACAF',
              marginBottom: 6,
            }}
          >
            Kỹ năng tìm kiếm
          </div>
          {profile.want.map((s) => (
            <Tag tone="want" key={s}>
              {s}
            </Tag>
          ))}
        </div>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#9AACAF',
              marginBottom: 6,
            }}
          >
            Mục tiêu / Dự án
          </div>
          <Tag tone="goal">{profile.goal}</Tag>
        </div>
      </div>
    </div>
  );
}

function SwipePage({ deck, onSwipe, onReset }) {
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  function pointerDown(e) {
    dragging.current = true;
    startX.current = e.clientX;
  }
  function pointerMove(e) {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  }
  function pointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (dragX > 90) fireSwipe('right');
    else if (dragX < -90) fireSwipe('left');
    else setDragX(0);
  }

  function fireSwipe(dir) {
    setDragX(dir === 'right' ? 500 : -500);
    setTimeout(() => {
      onSwipe(dir);
      setDragX(0);
    }, 260);
  }

  useEffect(() => {
    window.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    return () => {
      window.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
    };
  });

  const visible = deck.slice(0, 2);

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '0 auto',
        padding: '40px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h2
        style={{
          fontFamily: 'Sora, sans-serif',
          fontWeight: 700,
          fontSize: 24,
          color: '#223338',
          marginBottom: 28,
        }}
      >
        Quẹt để tìm đồng đội
      </h2>

      <div style={{ position: 'relative', width: '100%', height: 480 }}>
        {visible.length === 0 ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#fff',
              borderRadius: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(34,51,56,0.08)',
            }}
          >
            <p style={{ fontSize: 16, color: '#6B8087', marginBottom: 16 }}>
              Bạn đã xem hết hồ sơ rồi!
            </p>
            <button
              onClick={onReset}
              style={{
                background: '#3FA796',
                color: '#fff',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 999,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Xem lại từ đầu
            </button>
          </div>
        ) : (
          visible
            .slice()
            .reverse()
            .map((p, i) => (
              <SwipeCard
                key={p.id}
                profile={p}
                isTop={i === visible.length - 1}
                dragX={i === visible.length - 1 ? dragX : 0}
                onPointerDown={pointerDown}
              />
            ))
        )}
      </div>

      {visible.length > 0 && (
        <div style={{ display: 'flex', gap: 28, marginTop: 32 }}>
          <button
            onClick={() => fireSwipe('left')}
            style={{
              width: 60,
              height: 60,
              borderRadius: '9999px',
              background: '#fff',
              border: '2px solid #FBEAE8',
              color: '#E2574C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(226,87,76,0.18)',
            }}
          >
            <X size={26} />
          </button>
          <button
            onClick={() => fireSwipe('right')}
            style={{
              width: 60,
              height: 60,
              borderRadius: '9999px',
              background: '#3FA796',
              border: 'none',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(63,167,150,0.35)',
            }}
          >
            <Heart size={26} fill="#fff" />
          </button>
        </div>
      )}
    </div>
  );
}

function MatchModal({ profile, currentUser, onMessage, onContinue }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,32,35,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '44px 32px 32px',
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${(i * 37) % 100}%`,
              left: `${(i * 53) % 100}%`,
              width: 6,
              height: 6,
              borderRadius: i % 2 === 0 ? '50%' : 2,
              background: [`#3FA796`, `#5B8DEF`, `#A85CC1`][i % 3],
              opacity: 0.6,
            }}
          />
        ))}
        <h2
          style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 800,
            fontSize: 26,
            color: '#223338',
            margin: '0 0 24px',
            position: 'relative',
          }}
        >
          It's a Match! 🎉
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20,
            position: 'relative',
          }}
        >
          <div style={{ marginRight: -20, zIndex: 1 }}>
            <Avatar
              name={currentUser.name}
              color={currentUser.color}
              size={84}
              src={currentUser.avatarUrl}
            />
          </div>
          <div style={{ zIndex: 2 }}>
            <Avatar name={profile.name} color={profile.color} size={84} />
          </div>
        </div>
        <p style={{ fontSize: 15, color: '#6B8087', marginBottom: 28 }}>
          Bạn và <strong style={{ color: '#223338' }}>{profile.name}</strong> đã
          ghép đội thành công cho "{profile.goal}"
        </p>
        <button
          onClick={onMessage}
          style={{
            width: '100%',
            background: '#3FA796',
            color: '#fff',
            border: 'none',
            padding: '13px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          Nhắn tin ngay
        </button>
        <button
          onClick={onContinue}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#223338',
            border: '2px solid #DCEAE6',
            padding: '11px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
          }}
        >
          Tiếp tục tìm kiếm
        </button>
      </div>
    </div>
  );
}
function ChatPage({
  matches,
  currentUser,
  selectedId,
  setSelectedId,
}: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<any>(null);

  const selected = matches.find((m: any) => m.id === selectedId) || matches[0];

  // 1. Tự động chọn người đầu tiên nếu chưa chọn
  useEffect(() => {
    if (!selectedId && matches.length) {
      setSelectedId(matches[0].id);
    }
  }, [matches, selectedId, setSelectedId]);

  // 2. Tải lịch sử và lắng nghe tin nhắn Realtime
  useEffect(() => {
    if (!selected?.id || !currentUser?.id) return;

    // Tải tin nhắn cũ giữa hai người
    const fetchChatHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${selected.id}),and(sender_id.eq.${selected.id},receiver_id.eq.${currentUser.id})`
        )
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchChatHistory();

    // Đăng ký kênh Realtime để nhận tin nhắn mới ngay lập tức
    const channel = supabase
      .channel(`chat_${selected.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === currentUser.id && newMsg.receiver_id === selected.id) ||
            (newMsg.sender_id === selected.id && newMsg.receiver_id === currentUser.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selected?.id, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Gửi tin nhắn lên bảng messages trên Supabase
  async function send() {
    if (!draft.trim() || !selected || !currentUser?.id) return;

    const textToSend = draft.trim();
    setDraft('');

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selected.id,
      content: textToSend,
    });

    if (error) {
      console.error('Lỗi khi gửi tin nhắn:', error.message);
    }
  }

  if (matches.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        <MessageCircle size={40} color="#9AACAF" style={{ marginBottom: 16 }} />
        <p style={{ color: '#6B8087', fontSize: 15 }}>
          Bạn chưa ghép đội với ai. Quay lại trang Ghép đội để quẹt thử nhé!
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 40px' }}>
      <div
        style={{
          display: 'flex',
          background: '#fff',
          borderRadius: 24,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(34,51,56,0.08)',
          height: 560,
        }}
      >
        {/* Danh sách người ghép đội */}
        <div style={{ width: '30%', borderRight: '1px solid #EDF3F1', overflowY: 'auto' }}>
          {matches.map((m: any) => (
            <div
              key={m.id}
              onClick={() => setSelectedId(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                background: selected?.id === m.id ? '#F4FAF8' : 'transparent',
                borderBottom: '1px solid #F4FAF8',
              }}
            >
              <Avatar name={m.name} color={m.color} size={40} src={m.avatarUrl} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#223338', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12.5, color: '#9AACAF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Trò chuyện ngay
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Khung chat */}
        <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
          {selected && (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #EDF3F1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={selected.name} color={selected.color} size={36} src={selected.avatarUrl} />
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#223338' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#3FA796' }}>Đang hoạt động</div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#9AACAF', fontSize: 13.5 }}>
                    Hãy bắt đầu cuộc trò chuyện!
                  </p>
                )}
                {messages.map((m: any) => {
                  const isMe = m.sender_id === currentUser.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        background: isMe ? '#3FA796' : '#F1F5F4',
                        color: isMe ? '#fff' : '#223338',
                        padding: '10px 14px',
                        borderRadius: 16,
                        maxWidth: '70%',
                        fontSize: 14,
                        lineHeight: 1.4,
                      }}
                    >
                      {m.content}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div style={{ padding: 16, borderTop: '1px solid #EDF3F1', display: 'flex', gap: 10 }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1,
                    border: '1px solid #DCEAE6',
                    borderRadius: 999,
                    padding: '11px 18px',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button
                  onClick={send}
                  style={{
                    background: '#3FA796',
                    border: 'none',
                    color: '#fff',
                    width: 42,
                    height: 42,
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Send size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
function ProfilePage({ currentUser, onSave, showToast }: any) {
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    major: currentUser?.major || '',
    haveText: currentUser?.haveText || '',
    wantText: currentUser?.wantText || '',
    goal: currentUser?.goal || '',
    avatarUrl: currentUser?.avatarUrl || null,
  });
  const fileRef = useRef<any>(null);

  useEffect(() => {
    setForm({
      name: currentUser?.name || '',
      major: currentUser?.major || '',
      haveText: currentUser?.haveText || '',
      wantText: currentUser?.wantText || '',
      goal: currentUser?.goal || '',
      avatarUrl: currentUser?.avatarUrl || null,
    });
  }, [currentUser]);
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, avatarUrl: url }));
  }

  function field(label, key, placeholder) {
    return (
      <div style={{ marginBottom: 16, textAlign: 'left' }}>
        <label
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#6B8087',
            display: 'block',
            marginBottom: 6,
          }}
        >
          {label}
        </label>
        <input
          value={form[key] || ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          style={{
            width: '100%',
            border: '1px solid #DCEAE6',
            background: '#F4FAF8',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 14.5,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 60px' }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 28,
          padding: '36px 30px',
          boxShadow: '0 8px 24px rgba(34,51,56,0.08)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
            marginBottom: 24,
          }}
        >
          <Avatar
            name={form.name || '?'}
            color={form.color}
            size={104}
            src={form.avatarUrl}
          />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#3FA796',
              border: '3px solid #fff',
              width: 34,
              height: 34,
              borderRadius: '9999px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Tải ảnh mới"
          >
            <Camera size={16} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            style={{ display: 'none' }}
          />
        </div>

        {field('Họ và tên', 'name', 'Nguyễn Văn A')}
        {field('Trường / Chuyên ngành', 'major', 'VD: Khoa học máy tính')}
        {field(
          'Kỹ năng đang có',
          'haveText',
          'VD: Code Python, Phân tích dữ liệu'
        )}
        {field('Kỹ năng tìm kiếm', 'wantText', 'VD: Thiết kế UI/UX')}
        {field('Mục tiêu / Tên dự án', 'goal', 'VD: Thi Hackathon 2024')}

        <button
          onClick={() => {
            onSave(form);
            showToast('Đã lưu thay đổi thành công!');
          }}
          style={{
            width: '100%',
            background: '#3FA796',
            color: '#fff',
            border: 'none',
            padding: '13px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            marginTop: 6,
          }}
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function AuthModal({ onClose, onAuth }: any) {
  const [tab, setTab] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function submit() {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ Email và Mật khẩu!');
      return;
    }
    onAuth({
      name,
      email,
      password,
      isSignUp: tab === 'signup'
    });
  }
  const inputStyle = {
    width: '100%',
    border: '1px solid #DCEAE6',
    borderRadius: 14,
    padding: '12px 16px',
    fontSize: 14.5,
    outline: 'none',
    marginBottom: 12,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,32,35,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 26,
          padding: '32px',
          maxWidth: 380,
          width: '100%',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#9AACAF',
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            display: 'flex',
            background: '#F4FAF8',
            borderRadius: 999,
            padding: 4,
            marginBottom: 24,
          }}
        >
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                border: 'none',
                padding: '9px 0',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: 'pointer',
                background: tab === t ? '#3FA796' : 'transparent',
                color: tab === t ? '#fff' : '#6B8087',
              }}
            >
              {t === 'login' ? 'Đăng nhập' : 'Tạo tài khoản mới'}
            </button>
          ))}
        </div>

        {tab === 'signup' && (
          <input
            placeholder="Họ và tên"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        )}
        <input
          placeholder="Email sinh viên"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {tab === 'signup' && (
          <input
            placeholder="Xác nhận mật khẩu"
            type="password"
            style={inputStyle}
          />
        )}

        {tab === 'login' && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#6B8087',
              marginBottom: 16,
            }}
          >
            <input type="checkbox" /> Ghi nhớ tài khoản
          </label>
        )}

        <button
          onClick={submit}
          style={{
            width: '100%',
            background: '#3FA796',
            color: '#fff',
            border: 'none',
            padding: '13px',
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          {tab === 'login' ? 'Vào ghép đội' : 'Đăng ký ngay'}
        </button>

        <button
          onClick={submit}
          style={{
            width: '100%',
            background: '#fff',
            color: '#223338',
            border: '1px solid #DCEAE6',
            padding: '12px',
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3c-7.5 0-13.9 4.3-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 40.6 16.4 45 24 45z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z"
            />
          </svg>
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: '#223338',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 600,
        zIndex: 60,
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
      }}
    >
      {message}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('landing');
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Bạn',
    major: '',
    haveText: '',
    wantText: '',
    goal: '',
    color: '#5B8DEF',
    avatarUrl: null,
  });

  const [deck, setDeck] = useState(PROFILES);
  const [matches, setMatches] = useState([]);
  const [pendingMatch, setPendingMatch] = useState(null);
  const [messages, setMessages] = useState({});
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [toast, setToast] = useState('');
   // Tải danh sách hồ sơ từ Supabase (loại trừ tài khoản đang đăng nhập)
   const fetchDeck = async (currentUserId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId);

    if (!error && data && data.length > 0) {
      const formattedDeck = data.map((p: any) => ({
        id: p.id,
        name: p.full_name || 'Thành viên',
        major: p.major || 'Chưa cập nhật',
        have: p.have_skill ? p.have_skill.split(', ') : [],
        want: p.want_skill ? p.want_skill.split(', ') : [],
        goal: p.goal || 'Tìm đồng đội',
        color: '#3FA796',
        avatarUrl: p.avatar_url || null,
      }));
      setDeck(formattedDeck);
    } else {
      setDeck([]);
    }
  };
  useEffect(() => {
    // Tự động kiểm tra và đồng bộ tài khoản thật từ Supabase khi mở app
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsLoggedIn(true);
          fetchDeck(session.user.id);
          // Lấy dữ liệu hồ sơ từ bảng profiles theo id người dùng đăng nhập
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              name: profile.full_name || session.user.email?.split('@')[0],
              major: profile.major || '',
              haveText: profile.have_skill || '',
              wantText: profile.want_skill || '',
              goal: profile.goal || '',
              color: '#5B8DEF',
              avatarUrl: profile.avatar_url || null,
            });
          } else {
            setCurrentUser((prev: any) => ({
              ...prev,
              id: session.user.id,
              name: session.user.email?.split('@')[0],
            }));
          }
        } else {
          // Nếu chưa đăng nhập hoặc vừa bấm đăng xuất
          setIsLoggedIn(false);
          setCurrentUser({
            name: '',
            major: '',
            haveText: '',
            wantText: '',
            goal: '',
            color: '#5B8DEF',
            avatarUrl: null,
          });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function handleCta() {
    if (isLoggedIn) setPage('swipe');
    else setShowAuth(true);
  }

  async function handleAuth(authData: any) {
    try {
      const { email, password, name, isSignUp } = authData;
      let authUser = null;

      if (isSignUp) {
        // Đăng ký tài khoản mới lên Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
        authUser = data.user;
        showToast('Đăng ký tài khoản thành công!');
      } else {
        // Đăng nhập tài khoản đã có
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        authUser = data.user;
        showToast('Đăng nhập thành công!');
      }

      if (authUser) {
        setShowAuth(false);
        setPage('swipe');
      }
    } catch (err: any) {
      console.error('Lỗi Auth:', err);
      alert('Lỗi xác thực: ' + (err.message || 'Không thể kết nối'));
    }
  }
  async function handleLogout() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setCurrentUser({
      name: '',
      major: '',
      haveText: '',
      wantText: '',
      goal: '',
      color: '#5B8DEF',
      avatarUrl: null,
    });
    setPage('landing');
  }

  function handleSwipe(dir) {
    const top = deck[0];
    setDeck((d) => d.slice(1));
    if (dir === 'right') {
      // simulate the backend's mutual-like check: ~60% of the time the other student already liked you back
      const mutual = Math.random() < 0.6;
      if (mutual && !matches.find((m) => m.id === top.id)) {
        setPendingMatch(top);
      }
    }
  }

  function confirmMatch(goToChat) {
    setMatches((m) =>
      m.find((x) => x.id === pendingMatch.id) ? m : [...m, pendingMatch]
    );
    if (goToChat) {
      setSelectedChatId(pendingMatch.id);
      setPage('chat');
    }
    setPendingMatch(null);
  }
  const handleSaveProfile = async (formData: any) => {
    // Lấy thông tin user đang đăng nhập từ Supabase
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      if (typeof showToast === 'function')
        showToast('Vui lòng đăng nhập để lưu hồ sơ!');
      return;
    }

    // Gửi dữ liệu lên bảng profiles trên Supabase
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: formData.name || '',
      major: formData.major || '',
      have_skill: formData.haveText || (Array.isArray(formData.have) ? formData.have.join(', ') : formData.have) || '',
      want_skill: formData.wantText || (Array.isArray(formData.want) ? formData.want.join(', ') : formData.want) || '',
      goal: formData.goal || '',
      avatar_url: formData.avatarUrl || null,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error('Lỗi khi lưu vào Supabase:', error.message);
      if (typeof showToast === 'function') showToast('Lỗi: ' + error.message);
    } else {
      setCurrentUser(formData);
      if (typeof showToast === 'function')
        showToast('Đã lưu hồ sơ thành công!');
    }
  };
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4FAF8',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <style>{FONT_IMPORT}</style>

      <Header
        page={page}
        setPage={setPage}
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth(true)}
      />

      {page === 'landing' && <Landing onCtaClick={handleCta} />}
      {page === 'swipe' && isLoggedIn && (
        <SwipePage
          deck={deck}
          onSwipe={handleSwipe}
          onReset={() => fetchDeck(currentUser.id)}
        />
      )}
      {page === 'chat' && isLoggedIn && (
        <ChatPage
          matches={matches}
          currentUser={currentUser}
          selectedId={selectedChatId}
          setSelectedId={setSelectedChatId}
        />
      )}
      {page === 'profile' && isLoggedIn && (
        <ProfilePage
          currentUser={currentUser}
          onSave={handleSaveProfile}
          showToast={showToast}
        />
      )}
      {(page === 'swipe' || page === 'chat' || page === 'profile') &&
        !isLoggedIn && <Landing onCtaClick={handleCta} />}

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />
      )}
      {pendingMatch && (
        <MatchModal
          profile={pendingMatch}
          currentUser={currentUser}
          onMessage={() => confirmMatch(true)}
          onContinue={() => confirmMatch(false)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
export default App;
