import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/StoreContext';
import { hotels, rooms, formatCurrency, formatDate } from '@/data/demo';
import { initialChatState, makeMessage, quickPrompts, respond, type ChatState } from '@/lib/chatbot';
import type { ChatMessage, Reservation, RoomCard } from '@/types';
import { Avatar, Badge, statusTone } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Send, Sparkles, Bot, MapPin, Users, BedDouble, Calendar, ListChecks, MessageSquare, LogOut } from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout, myReservations } = useStore();
  const [tab, setTab] = useState<'chat' | 'reservations'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    makeMessage(
      'bot',
      `Welcome back, ${user?.name?.split(' ')[0] ?? 'guest'}! I'm Aurelia, your AI concierge. I can help you find a room, compare prices, or book your stay. What are you in the mood for?`
    ),
  ]);
  const [chatState, setChatState] = useState<ChatState>(initialChatState);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const { addReservation } = useStore();

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg = makeMessage('user', text);
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate bot thinking
    window.setTimeout(() => {
      const { messages: replies, nextState } = respond(text, chatState);
      setChatState(nextState);

      // If a booking was confirmed, persist a reservation.
      if (nextState.confirmedRoomId) {
        const room = rooms.find((r) => r.id === nextState.confirmedRoomId)!;
        const hotel = hotels.find((h) => h.id === room.hotelId)!;
        const nights = Math.max(1, Math.round((new Date(nextState.checkOut!).getTime() - new Date(nextState.checkIn!).getTime()) / 86400000));
        addReservation({
          userId: user!.id,
          userName: user!.name,
          hotelId: hotel.id,
          hotelName: hotel.name,
          roomName: room.name,
          roomType: room.type,
          checkIn: nextState.checkIn!,
          checkOut: nextState.checkOut!,
          nights,
          guests: nextState.guests ?? 2,
          pricePerNight: room.pricePerNight,
          total: nights * room.pricePerNight,
          status: 'confirmed',
        });
      }

      // Stagger multiple replies slightly for a natural feel.
      replies.forEach((r, i) => {
        window.setTimeout(() => {
          setMessages((m) => [...m, makeMessage(r.role, r.text, { cards: r.cards, actions: r.actions })]);
          if (i === replies.length - 1) setTyping(false);
        }, i * 350);
      });
      if (replies.length === 0) setTyping(false);
    }, 550);
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <DashboardHeader title="Concierge" user={user} onLogout={logout} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 overflow-hidden p-4 lg:p-6">
        {/* Left rail: tabs + reservations summary */}
        <aside className="hidden w-72 shrink-0 flex-col lg:flex">
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
            <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={<MessageSquare className="h-4 w-4" />}>
              Chat
            </TabButton>
            <TabButton active={tab === 'reservations'} onClick={() => setTab('reservations')} icon={<ListChecks className="h-4 w-4" />}>
              My Trips
            </TabButton>
          </div>
          <div className="flex-1 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            <ReservationsPanel reservations={myReservations} compact />
          </div>
        </aside>

        {/* Main panel */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {/* Mobile tabs */}
          <div className="grid grid-cols-2 gap-1 border-b border-ink-100 p-1 lg:hidden">
            <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={<MessageSquare className="h-4 w-4" />}>Chat</TabButton>
            <TabButton active={tab === 'reservations'} onClick={() => setTab('reservations')} icon={<ListChecks className="h-4 w-4" />}>My Trips</TabButton>
          </div>

          {tab === 'chat' ? (
            <ChatPanel
              scrollRef={scrollRef}
              messages={messages}
              typing={typing}
              input={input}
              setInput={setInput}
              onSend={send}
              onAction={(label, payload) => {
                if (payload?.startsWith('guests:')) {
                  send(`${payload.split(':')[1]} guests`);
                } else if (payload === 'confirm') {
                  send('confirm');
                } else if (payload === 'cancel') {
                  send('cancel');
                } else if (payload) {
                  // book <roomId>
                  const room = rooms.find((r) => r.id === payload);
                  if (room) {
                    setChatState({ pendingRoomId: room.id, bookingFlow: true });
                    const hotel = hotels.find((h) => h.id === room.hotelId)!;
                    setMessages((m) => [...m, makeMessage('user', `Book the ${room.name}`)]);
                    setTyping(true);
                    window.setTimeout(() => {
                      setMessages((m) => [
                        ...m,
                        makeMessage('bot', `Excellent choice — the ${room.name} at ${hotel.name} (${formatCurrency(room.pricePerNight)}/night, sleeps ${room.capacity}). What date would you like to check in? Try something like "August 14".`),
                      ]);
                      setTyping(false);
                    }, 550);
                  }
                } else {
                  send(label);
                }
              }}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin lg:p-6">
              <ReservationsPanel reservations={myReservations} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardHeader({ title, user, onLogout }: { title: string; user: { name: string; email: string; avatarHue: number } | null; onLogout: () => void }) {
  return (
    <header className="border-b border-ink-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
            <BedDouble className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-serif text-xl leading-none text-ink-900">Aurelia</p>
            <p className="text-[10px] tracking-[0.2em] text-ink-400">{title.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-2.5 sm:flex">
              <Avatar name={user.name} hue={user.avatarHue} size={36} />
              <div className="leading-tight">
                <p className="text-sm font-medium text-ink-900">{user.name}</p>
                <p className="text-xs text-ink-400">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
        active ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700'
      )}
    >
      {icon} {children}
    </button>
  );
}

function ChatPanel({
  scrollRef,
  messages,
  typing,
  input,
  setInput,
  onSend,
  onAction,
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  messages: ChatMessage[];
  typing: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  onAction: (label: string, payload?: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3 lg:px-6">
        <div className="relative">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-teal-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-900">Aurelia Concierge</p>
          <p className="text-xs text-teal-600">Online — typically replies instantly</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ink-50/50 px-4 py-5 scrollbar-thin lg:px-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} onAction={onAction} />
        ))}
        {typing && <TypingBubble />}

        {messages.length <= 1 && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-400">Try asking</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs text-ink-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-ink-100 p-3 lg:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSend(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend(input);
              }
            }}
            rows={1}
            placeholder="Ask about rooms, dates, or booking…"
            className="max-h-32 flex-1 resize-none rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition placeholder:text-ink-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-200 scrollbar-thin"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white transition hover:bg-ink-800 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-ink-400">Aurelia is a demo concierge — reservations are simulated.</p>
      </div>
    </div>
  );
}

function MessageBubble({ message, onAction }: { message: ChatMessage; onAction: (label: string, payload?: string) => void }) {
  const isBot = message.role === 'bot';
  return (
    <div className={cn('flex animate-fade-up gap-3', !isBot && 'flex-row-reverse')}>
      <div className="shrink-0">
        {isBot ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
            <Bot className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-[11px] font-semibold text-white">You</div>
        )}
      </div>
      <div className={cn('max-w-[78%] space-y-3', !isBot && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line',
            isBot ? 'bg-white text-ink-800 shadow-soft' : 'bg-ink-900 text-white'
          )}
        >
          {renderRich(message.text)}
        </div>

        {message.cards && message.cards.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {message.cards.map((c) => (
              <RoomCardView key={c.roomId} card={c} />
            ))}
          </div>
        )}

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.actions.map((a, i) => (
              <button
                key={i}
                onClick={() => onAction(a.label, a.payload)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                  a.kind === 'book'
                    ? 'border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomCardView({ card }: { card: RoomCard }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-soft transition hover:shadow-card">
      <div className="relative h-28">
        <img src={card.image} alt={card.roomName} className="h-full w-full object-cover" />
        <div className="absolute right-2 top-2">
          <Badge tone={card.available > 2 ? 'success' : 'warning'}>{card.available} left</Badge>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-ink-400">{card.hotelName}</p>
        <p className="text-sm font-semibold text-ink-900">{card.roomName}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {card.amenities.slice(0, 3).map((a) => (
            <span key={a} className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">{a}</span>
          ))}
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-serif text-lg text-ink-900">{formatCurrency(card.pricePerNight)}<span className="text-xs text-ink-400"> /night</span></p>
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex animate-fade-in gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-soft">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 rounded-full bg-ink-300 animate-dot-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

function ReservationsPanel({ reservations, compact }: { reservations: Reservation[]; compact?: boolean }) {
  const sorted = [...reservations].sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
  const upcoming = sorted.filter((r) => r.status === 'confirmed' || r.status === 'pending');
  const past = sorted.filter((r) => r.status === 'completed' || r.status === 'cancelled');

  if (sorted.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
          <Calendar className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-ink-700">No reservations yet</p>
        <p className="mt-1 text-xs text-ink-400">Chat with the concierge to book your first stay.</p>
      </div>
    );
  }

  return (
    <div className={cn('h-full overflow-y-auto scrollbar-thin', compact ? 'p-3' : '')}>
      <div className={cn(compact ? '' : 'max-w-3xl mx-auto')}>
        {upcoming.length > 0 && (
          <Section title="Upcoming" count={upcoming.length} compact={compact}>
            {upcoming.map((r) => <ReservationRow key={r.id} r={r} compact={compact} />)}
          </Section>
        )}
        {past.length > 0 && (
          <Section title="History" count={past.length} compact={compact}>
            {past.map((r) => <ReservationRow key={r.id} r={r} compact={compact} />)}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, count, children, compact }: { title: string; count: number; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className={cn(compact ? 'mb-4' : 'mb-8')}>
      <div className={cn('mb-2 flex items-center gap-2', compact ? 'px-1' : '')}>
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-500">{count}</span>
      </div>
      <div className={cn('space-y-2', !compact && 'sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0')}>{children}</div>
    </div>
  );
}

function ReservationRow({ r, compact }: { r: Reservation; compact?: boolean }) {
  const hotel = hotels.find((h) => h.id === r.hotelId);
  return (
    <div className={cn('rounded-xl border border-ink-100 bg-white p-3 transition hover:shadow-soft', !compact && 'sm:p-4')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{r.hotelName}</p>
          <p className="truncate text-xs text-ink-500">{r.roomName} · {r.roomType}</p>
        </div>
        <Badge tone={statusTone(r.status)}>{r.status}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-600">
        <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-ink-400" />{formatDate(r.checkIn)} → {formatDate(r.checkOut)}</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-ink-400" />{r.guests}</span>
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-ink-400" />{hotel?.location ?? ''}</span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-ink-50 pt-2">
        <span className="text-xs text-ink-400">{r.nights} night{r.nights > 1 ? 's' : ''} × {formatCurrency(r.pricePerNight)}</span>
        <span className="font-serif text-lg text-ink-900">{formatCurrency(r.total)}</span>
      </div>
    </div>
  );
}

/** Render **bold** segments in bot text. */
function renderRich(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-semibold text-ink-900">{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
