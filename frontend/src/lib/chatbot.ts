import { hotels, rooms } from '@/data/demo';
import type { ChatAction, ChatMessage, RoomCard } from '@/types';
import { formatCurrency, uid } from '@/data/demo';

export interface ChatState {
  /** Room id the user is in the middle of booking. */
  pendingRoomId?: string;
  /** Pending check-in / check-out / guests captured during a booking flow. */
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  /** Whether we are currently asking for the next booking field. */
  bookingFlow: boolean;
  /** Set when the user confirms a booking — UI reads & clears it to persist a reservation. */
  confirmedRoomId?: string;
}

export const initialChatState: ChatState = { bookingFlow: false };

const greetings = ["Hi there! I'm Aurelia, your AI concierge. Are you looking for a city escape, a beach retreat, or a lakeside getaway?", "Hello! I'd love to help you find the perfect stay. Do you have a destination, dates, or a budget in mind?"];

const helpText = `I can help you with a few things:
• **Browse rooms** — tell me a destination ("Maldives", "Marbella", "Como") or a budget ("under €600")
• **Book a room** — pick a room from any card and I'll walk you through dates & guests
• **See your reservations** — just ask "what are my bookings?"

What would you like to do?`;

const roomToCard = (r: (typeof rooms)[number]): RoomCard => {
  const hotel = hotels.find((h) => h.id === r.hotelId)!;
  return {
    roomId: r.id,
    hotelName: hotel.name,
    roomName: r.name,
    roomType: r.type,
    pricePerNight: r.pricePerNight,
    image: r.image,
    amenities: r.amenities,
    available: r.available,
  };
};

const bookActions = (cards: RoomCard[]): ChatAction[] =>
  cards.map((c) => ({ label: `Book ${c.roomName}`, kind: 'book' as const, payload: c.roomId }));

interface BotReply {
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
  nextState: ChatState;
}

/**
 * Produce a bot reply for a user utterance given the current chat state.
 * Pure function — no side effects, easy to test.
 */
export function respond(input: string, state: ChatState): BotReply {
  const text = input.toLowerCase().trim();
  const msg = (role: 'bot', t: string, extra: Partial<Omit<ChatMessage, 'id' | 'timestamp' | 'role'>> = {}) => ({
    role,
    text: t,
    ...extra,
  });

  // --- Booking flow: capture fields in order ---
  if (state.bookingFlow && state.pendingRoomId) {
    const room = rooms.find((r) => r.id === state.pendingRoomId)!;
    const hotel = hotels.find((h) => h.id === room.hotelId)!;

    // Cancel
    if (/cancel|stop|never mind|abort/.test(text)) {
      return {
        messages: [msg('bot', `No problem — I've cancelled that. ${helpText}`)],
        nextState: { bookingFlow: false },
      };
    }

    // Check-in
    if (!state.checkIn) {
      const date = parseDate(text);
      if (!date) {
        return {
          messages: [msg('bot', "I couldn't read that date. Try something like 'August 14' or '2026-08-14'. Or say 'cancel' to stop.")],
          nextState: state,
        };
      }
      return {
        messages: [msg('bot', `Lovely — checking in ${formatDateLong(date)} at ${hotel.name}. And what date would you like to check out?`)],
        nextState: { ...state, checkIn: date },
      };
    }

    // Check-out
    if (!state.checkOut) {
      const date = parseDate(text);
      if (!date) {
        return {
          messages: [msg('bot', "I couldn't read that date. Try 'August 18' or '2026-08-18'. Or say 'cancel'.")],
          nextState: state,
        };
      }
      if (new Date(date) <= new Date(state.checkIn)) {
        return {
          messages: [msg('bot', "Your check-out needs to be after your check-in. What date would you like to check out?")],
          nextState: state,
        };
      }
      return {
        messages: [msg('bot', `Got it — checking out ${formatDateLong(date)}. How many guests will be staying? (Up to ${room.capacity} for this room)`, {
          actions: Array.from({ length: room.capacity }, (_, i) => ({ label: `${i + 1} guest${i ? 's' : ''}`, kind: 'book' as const, payload: `guests:${i + 1}` })),
        })],
        nextState: { ...state, checkOut: date },
      };
    }

    // Guests
    if (!state.guests) {
      const n = parseGuests(text);
      if (!n || n > room.capacity) {
        return {
          messages: [msg('bot', `This room fits up to ${room.capacity} guests. How many will be staying?`)],
          nextState: state,
        };
      }
      const nights = nightsBetween(state.checkIn, state.checkOut);
      const total = nights * room.pricePerNight;
      return {
        messages: [
          msg('bot', `Here's your booking summary:
• **${room.name}** — ${hotel.name}
• ${formatDateLong(state.checkIn)} → ${formatDateLong(state.checkOut)} (${nights} night${nights > 1 ? 's' : ''})
• ${n} guest${n > 1 ? 's' : ''}
• **${formatCurrency(room.pricePerNight)}/night × ${nights} = ${formatCurrency(total)}**

Shall I confirm this reservation?`, {
            actions: [
              { label: 'Confirm booking', kind: 'book', payload: 'confirm' },
              { label: 'Cancel', kind: 'book', payload: 'cancel' },
            ],
          }),
        ],
        nextState: { ...state, guests: n },
      };
    }

    // Confirm / cancel
    if (state.guests) {
      if (text.includes('confirm') || text === 'yes') {
        return {
          messages: [msg('bot', `Wonderful! Your reservation at ${hotel.name} is **confirmed**. You'll find it under "My Reservations". Is there anything else I can help you with?`)],
          nextState: { bookingFlow: false, confirmedRoomId: state.pendingRoomId },
        };
      }
      if (text.includes('cancel') || text === 'no') {
        return {
          messages: [msg('bot', `No problem, I've set that aside. ${helpText}`)],
          nextState: { bookingFlow: false },
        };
      }
    }
  }

  // --- Greetings ---
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|howdy)\b/.test(text)) {
    return {
      messages: [msg('bot', greetings[Math.floor(Math.random() * greetings.length)])],
      nextState: state,
    };
  }

  // --- Help ---
  if (/(help|what can you|how do|menu|options)/.test(text)) {
    return { messages: [msg('bot', helpText)], nextState: state };
  }

  // --- My reservations ---
  if (/(my |show )?(reservation|booking|stay|trip)s?|what.*book/.test(text)) {
    return {
      messages: [msg('bot', `You can see all your reservations on the **"My Reservations"** tab above our chat. Switch over anytime to review dates, status, and totals.`)],
      nextState: state,
    };
  }

  // --- Destination search ---
  const byDestination = matchDestination(text);
  if (byDestination) {
    const hotel = byDestination;
    const hotelRooms = rooms.filter((r) => r.hotelId === hotel.id).map(roomToCard);
    return {
      messages: [
        msg('bot', `${hotel.name} in ${hotel.location} — ${hotel.blurb} Here are the rooms available right now:`, { cards: hotelRooms, actions: bookActions(hotelRooms) }),
      ],
      nextState: state,
    };
  }

  // --- Budget search ---
  const budget = matchBudget(text);
  if (budget !== null) {
    const matches = rooms
      .filter((r) => r.pricePerNight <= budget)
      .sort((a, b) => a.pricePerNight - b.pricePerNight)
      .map(roomToCard);
    if (matches.length === 0) {
      return {
        messages: [msg('bot', `I couldn't find any rooms under ${formatCurrency(budget)} right now. Our most affordable is ${formatCurrency(Math.min(...rooms.map((r) => r.pricePerNight)))}/night. Want to see it?`)],
        nextState: state,
      };
    }
    return {
      messages: [
        msg('bot', `Here are ${matches.length} room${matches.length > 1 ? 's' : ''} at or under ${formatCurrency(budget)}/night:`, { cards: matches, actions: bookActions(matches) }),
      ],
      nextState: state,
    };
  }

  // --- Room type search ---
  const typeMatch = matchRoomType(text);
  if (typeMatch) {
    const matches = rooms.filter((r) => r.type.toLowerCase().includes(typeMatch)).map(roomToCard);
    if (matches.length) {
      return {
        messages: [msg('bot', `Here are our ${typeMatch} rooms:`, { cards: matches, actions: bookActions(matches) })],
        nextState: state,
      };
    }
  }

  // --- "Show me everything" ---
  if (/(all|everything|every room|browse|what.*available|list)/.test(text)) {
    const all = rooms.map(roomToCard);
    return {
      messages: [msg('bot', `Here's everything across our three properties:`, { cards: all, actions: bookActions(all) })],
      nextState: state,
    };
  }

  // --- Fallback ---
  return {
    messages: [msg('bot', `I'm not quite sure I caught that. ${helpText}`)],
    nextState: state,
  };
}

function matchDestination(text: string) {
  for (const h of hotels) {
    const tokens = [h.name.toLowerCase(), ...h.location.toLowerCase().split(/[,\s]+/)].filter(Boolean);
    if (tokens.some((t) => t.length > 3 && text.includes(t))) return h;
  }
  return null;
}

function matchBudget(text: string): number | null {
  const m = text.match(/(?:under|below|up to|max(?:imum)?|<=?|less than)\s*(?:€|eur\s*)?(\d{3,5})/);
  if (m) return Number(m[1]);
  const m2 = text.match(/(\d{3,5})\s*(?:per night|\/night|a night|eur|€)/);
  if (m2) return Number(m2[1]);
  return null;
}

function matchRoomType(text: string): string | null {
  const types = ['deluxe', 'executive suite', 'ocean suite', 'penthouse', 'garden villa', 'suite', 'villa'];
  for (const t of types) {
    if (text.includes(t)) return t;
  }
  return null;
}

function parseDate(text: string): string | null {
  const now = new Date('2026-07-31T00:00:00Z');
  const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  // ISO
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // "August 14" / "14 August"
  const monthDay = text.match(new RegExp(`(${months.join('|')})\\s+(\\d{1,2})`));
  if (monthDay) {
    const mi = months.indexOf(monthDay[1]);
    return toISO(now.getFullYear() + (mi < now.getMonth() ? 1 : 0), mi, Number(monthDay[2]));
  }
  const dayMonth = text.match(new RegExp(`(\\d{1,2})\\s+(${months.join('|')})`));
  if (dayMonth) {
    const mi = months.indexOf(dayMonth[2]);
    return toISO(now.getFullYear() + (mi < now.getMonth() ? 1 : 0), mi, Number(dayMonth[1]));
  }
  return null;
}

function parseGuests(text: string): number | null {
  const m = text.match(/(\d+)/);
  if (m) return Number(m[1]);
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  for (const [w, n] of Object.entries(words)) {
    if (text.includes(w)) return n;
  }
  return null;
}

const pad = (n: number) => String(n).padStart(2, '0');
function toISO(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}
function formatDateLong(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(iso));
}
function nightsBetween(a: string, b: string): number {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

/** Build a fresh message object with id + timestamp. */
export function makeMessage(role: ChatMessage['role'], text: string, extra: Partial<ChatMessage> = {}): ChatMessage {
  return { id: uid('m'), role, text, timestamp: Date.now(), ...extra };
}

export const quickPrompts = [
  'Show me rooms in the Maldives',
  'What do you have under €600 a night?',
  'Browse all suites',
  'Show me everything',
  'What are my bookings?',
];
