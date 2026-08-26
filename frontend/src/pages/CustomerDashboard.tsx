import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '@/store/StoreContext';
import { uid } from '@/data/demo';
import type { ChatMessage } from '@/types';
import { Badge, statusTone } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Send, Sparkles, Bot, BedDouble, Calendar, ListChecks, MessageSquare, LogOut } from 'lucide-react';

export default function CustomerDashboard() {
  const { user, logout, token } = useStore();
  const [tab, setTab] = useState<'chat' | 'reservations'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>(() => []);
  const [input, setInput] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState('');
  const [myReservations, setMyReservations] = useState<any[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const fetchBalance = async () => {
    const response = await fetch("http://localhost:7105/api/Customer/GetBalance", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const res = await response.json();
    if (response.ok) {
      setBalance(res);
    }
    else {
      setBalance("||");
    }
  };

  const ShowMyReservations = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:7105/api/Customer/GetMyReservations", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setMyReservations(result);
        console.log(result)
      } else {

      }
    } catch (e) {
      console.log("error");
    } finally {

    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBalance();
    };
    fetchData();
    setLoading("t");
  }, [loading]);

  useEffect(() => {
    if (tab === 'reservations') {
      ShowMyReservations();
    }
  }, [tab, ShowMyReservations]);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const userMsg = makeMessage('user', text);
    setMessages((m) => [...m, userMsg]);


    const response = await fetch("http://localhost:7105/api/Cmd/TypeCmd", {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-TOKEN": token || "",
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        Request: raw
      }
      ),
    });
    setTyping(true);
    const result = await response.json();
    if (response.ok) {
      setInput('');
      setTyping(false);
      setMessages((m) => [...m, makeMessage("bot", result)]);
      setLoading("a");
    } else {
      console.log(result + " ggggg  ");
    }
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <DashboardHeader title="Concierge" user={user} onLogout={logout} balance={balance} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 overflow-hidden p-4 lg:p-6">

        {/* Main panel */}
        <main className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
          {/* Mobile tabs */}
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-1">
            <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={<MessageSquare className="h-4 w-4" />}>
              Chat
            </TabButton>
            <TabButton active={tab === 'reservations'} onClick={() => setTab('reservations')} icon={<ListChecks className="h-4 w-4" />}>
              My Reservations
            </TabButton>
          </div>

          {tab === 'chat' ? (
            <ChatPanel
              scrollRef={scrollRef}
              messages={messages}
              typing={typing}
              input={input}
              setInput={setInput}
              onSend={send}
            />
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-2 border-b border-ink-100 px-4 py-3 lg:px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white">
                  <ListChecks className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-900">My Reservations</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {myReservations && myReservations.length > 0 ? (
                  <div className="p-4 lg:p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-5 py-3 font-medium">Room Name</th>
                            <th className="px-5 py-3 font-medium">Room Type</th>
                            <th className="px-5 py-3 font-medium">Start Date</th>
                            <th className="px-5 py-3 font-medium">Capacity</th>
                            <th className="px-5 py-3 font-medium">Total Price</th>
                            <th className="px-5 py-3 font-medium">Nights</th>
                            <th className="px-5 py-3 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-50">
                          {myReservations.map((r: any) => (
                            <tr key={r.id} className="transition hover:bg-ink-50/50">
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="leading-tight">
                                    <p className="font-medium text-ink-900">{r.roomName || 'N/A'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3 text-ink-600">{r.roomTypee || 'N/A'}</td>
                              <td className="px-5 py-3 text-ink-600">{r.startDate || 'N/A'}</td>
                              <td className="px-5 py-3 text-ink-600">{r.capacity || 'N/A'}</td>
                              <td className="px-5 py-3 font-serif text-base text-ink-900">{r.totalPrice || 0}</td>
                              <td className="px-5 py-3 text-ink-600">{r.numberOfNights || 0}</td>
                              <td className="px-5 py-3">
                                <Badge tone={statusTone(r.reservationStatus)}>{r.reservationStatus || 'N/A'}</Badge>
                              </td>
                            </tr>
                          ))}
                          {myReservations.length === 0 && (
                            <tr>
                              <td colSpan={7} className="px-5 py-10 text-center text-ink-400">No reservations found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-ink-700">No reservations yet</p>
                    <p className="mt-1 text-xs text-ink-400">Chat with the concierge to book your first stay.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardHeader({ title, user, onLogout, balance }: { title: string; user: { name: string; email: string; avatarHue: number } | null; onLogout: () => void; balance: string }) {
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
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
            <span className="font-serif text-sm font-semibold">$</span>
          </div>
          <div>
            <p className="font-serif text-xl leading-none text-ink-900">{balance}</p>
            <p className="text-[10px] tracking-[0.2em] text-ink-400">BALANCE</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-2.5 sm:flex">
              {/* <Avatar name={user.name} hue={user.avatarHue} size={36} /> */}
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
}: {
  scrollRef: React.RefObject<HTMLDivElement>;
  messages: ChatMessage[];
  typing: boolean;
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
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
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-ink-50/50 px-4 py-5 scrollbar-thin lg:px-6">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
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
        <p className="mt-2 text-center text-[11px] text-ink-400">Aurelia is a concierge .</p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage; }) {
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

function makeMessage(role: ChatMessage['role'], text: string, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id: uid('m'), role, text, timestamp: Date.now(), ...extra };
}

const quickPrompts = [
  'hotel available', 'hotel help'
];



