export type Role = 'Customer' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarHue: number;
  createdAt: string;
}

export interface Room {
  id: string;
  hotelId: string;
  name: string;
  type: 'Deluxe' | 'Executive Suite' | 'Ocean Suite' | 'Penthouse' | 'Garden Villa';
  pricePerNight: number;
  capacity: number;
  beds: string;
  size: string;
  image: string;
  amenities: string[];
  available: number;
  total: number;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  blurb: string;
}

export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  hotelId: string;
  hotelName: string;
  roomName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  pricePerNight: number;
  total: number;
  status: ReservationStatus;
  createdAt: string;
}

export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: number;
  cards?: RoomCard[];
  actions?: ChatAction[];
}

export interface RoomCard {
  roomId: string;
  hotelName: string;
  roomName: string;
  roomType: string;
  pricePerNight: number;
  image: string;
  amenities: string[];
  available: number;
}

export interface ChatAction {
  label: string;
  kind: 'book' | 'info' | 'browse';
  payload?: string;
}
