import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/StoreContext';
// import {formatCurrency, formatDate } from '@/data/demo';
// import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  BedDouble, LogOut,
  ArrowUpRight, ArrowDownRight,
  ListChecks, BarChart3, Plus, Trash2, X,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout, token } = useStore();
  const [balance, setBalance] = useState('');
  const [reservations, setReservations] = useState<any>([]);
  const [rooms, setRooms] = useState<any>([]);
  const [tab, setTab] = useState<'rooms' | 'reservations' | 'tools'>('rooms');
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showDeleteRoom, setShowDeleteRoom] = useState(false);

  const [addRoomForm, setAddRoomForm] = useState({
    roomName: '',
    floorId: '',
    roomTypee: '',
    capacity: '',
    roomPrice: '',
  });
  const [deleteRoomForm, setDeleteRoomForm] = useState({
    roomName: '',
  });
  const [formErrors, setFormErrors] = useState({
    roomName: '',
    floorId: '',
    roomTypee: '',
    capacity: '',
    roomPrice: '',
  });
  const [deleteFormError, setDeleteFormError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitMessageType, setSubmitMessageType] = useState<'success' | 'error'>('success');

  const validateForm = useCallback(() => {
    const errors = {
      roomName: '',
      floorId: '',
      roomTypee: '',
      capacity: '',
      roomPrice: '',
    };
    let isValid = true;

    if (!addRoomForm.roomName.trim()) {
      errors.roomName = 'Room name is required';
      isValid = false;
    }
    if (!addRoomForm.floorId.trim()) {
      errors.floorId = 'Floor number is required';
      isValid = false;
    }
    if (!addRoomForm.roomTypee.trim()) {
      errors.roomTypee = 'Room type is required';
      isValid = false;
    }
    if (!addRoomForm.capacity.trim()) {
      errors.capacity = 'Capacity is required';
      isValid = false;
    }
    if (!addRoomForm.roomPrice.trim()) {
      errors.roomPrice = 'Price is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [addRoomForm]);

  const ShowAllReservations = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:7105/api/Admin/GetAllReservations", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        setReservations(result);
      } else {

      }
    } catch (e) {
      console.log("error");
    } finally {

    }
  }, []);

  const ShowAllRooms = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:7105/api/Admin/GetAllRooms", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },

      });

      const result = await response.json();

      if (response.ok) {
        setRooms(result);
      } else {

      }
    } catch (e) {
      console.log("error");
    } finally {

    }
  }, []);
  const AddARoom = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("http://localhost:7105/api/Admin/AddRoom", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN":token || "",

        },
        body: JSON.stringify({
          roomName: addRoomForm.roomName,
          floorId: addRoomForm.floorId,
          roomTypee: addRoomForm.roomTypee,
          capacity: addRoomForm.capacity,
          roomPrice: addRoomForm.roomPrice,
        }
        ),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Room added successfully!');
        setSubmitMessageType('success');
        setShowAddRoom(false);
        setAddRoomForm({ roomName: '', floorId: '', roomTypee: '', capacity: '', roomPrice: '' });
        setFormErrors({ roomName: '', floorId: '', roomTypee: '', capacity: '', roomPrice: '' });
      } else {
        setSubmitMessage(result.message || 'Failed to add room');
        setSubmitMessageType('error');
        setFormErrors({ roomName: result.message || 'Failed to add room', floorId: '', roomTypee: '', capacity: '', roomPrice: '' });
      }
    } catch (e) {
      setSubmitMessage('An error occurred');
      setSubmitMessageType('error');
      setFormErrors({ roomName: 'An error occurred', floorId: '', roomTypee: '', capacity: '', roomPrice: '' });
    } finally {

    }
  }, [addRoomForm, validateForm]);

  const DeleteARoom = useCallback(async () => {
    if (!deleteRoomForm.roomName.trim()) {
      setDeleteFormError('Room name is required');
      return;
    }

    try {
      const response = await fetch("http://localhost:7105/api/Admin/DeleteRoom", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": token || "",
        },
        body: JSON.stringify({
          roomName: deleteRoomForm.roomName,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        setSubmitMessage('Room deleted successfully!');
        setSubmitMessageType('success');
        setShowDeleteRoom(false);
        setDeleteRoomForm({ roomName: '' });
        setDeleteFormError('');
      } else {
        setDeleteFormError(result.message || 'Failed to delete room');
        setSubmitMessage(result.message || 'Failed to delete room');
        setSubmitMessageType('error');
      }
    } catch (e) {
      setDeleteFormError('An error occurred');
      setSubmitMessage('An error occurred');
      setSubmitMessageType('error');
    } finally {

    }
  }, [deleteRoomForm]);

   const fetchBalance = async () => {
    const response = await fetch("http://localhost:7105/api/Admin/GetBalance", {
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


  useEffect(() => {
    const fetchData = async () => {
      await fetchBalance();
    };
    fetchData();
    if (tab == "reservations") {
      ShowAllReservations();
    }
    else if (tab == 'rooms') {
      ShowAllRooms();
    }
  }, [ShowAllReservations, tab, ShowAllRooms]);

  useEffect(() => {
    if (submitMessage) {
      const timer = setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitMessage]);


  return (
    <div className="min-h-screen bg-ink-50">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
              <BedDouble className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="font-serif text-xl leading-none text-ink-900">Aurelia</p>
              <p className="text-[10px] tracking-[0.2em] text-ink-400">ADMIN CONSOLE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 sm:flex">
              {/* <Avatar name={user!.name} hue={user!.avatarHue} size={36} /> */}
              <div className="leading-tight">
                <p className="text-sm font-medium text-ink-900">{user!.name}</p>
                <p className="text-xs text-ink-400">Administrator</p>
              </div>
              <div>
                <p className="font-serif text-xl leading-none text-ink-900">{balance}</p>
                <p className="text-[10px] tracking-[0.2em] text-ink-400">BALANCE</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-600 transition hover:border-ink-300 hover:bg-ink-50"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl text-ink-900">Operations overview</h1>
            <p className="mt-1 text-ink-500">Reservations, revenue, and occupancy across all properties.</p>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-ink-100 p-1 w-fit">
          <button
            onClick={() => setTab('rooms')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === 'rooms' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700'
            )}
          >
            <BarChart3 className="h-4 w-4" /> All Rooms
          </button>
          <button
            onClick={() => setTab('reservations')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === 'reservations' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700'
            )}
          >
            <ListChecks className="h-4 w-4" /> All Reservations
          </button>
          <button
            onClick={() => setTab('tools')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              tab === 'tools' ? 'bg-white text-ink-900 shadow-soft' : 'text-ink-500 hover:text-ink-700'
            )}
          >
            <ListChecks className="h-4 w-4" /> Admin Tools
          </button>
        </div>

        {/* KPI cards */}
        {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total revenue"
            value={formatCurrency(stats.totalRevenue)}
            delta="+12.4%"
            up
            icon={<DollarSign className="h-5 w-5" />}
            tone="brand"
          />
          <KpiCard
            label="Reservations"
            value={String(stats.totalReservations)}
            delta={`${stats.pending} pending`}
            icon={<CalendarCheck className="h-5 w-5" />}
            tone="teal"
          />
          <KpiCard
            label="Avg. nightly rate"
            value={formatCurrency(stats.avgNightly)}
            delta="+3.1%"
            up
            icon={<TrendingUp className="h-5 w-5" />}
            tone="neutral"
          />
          <KpiCard
            label="Occupancy"
            value={`${stats.occupancy}%`}
            delta={stats.occupancy >= 70 ? 'Healthy' : 'Low'}
            up={stats.occupancy >= 70}
            icon={<Users className="h-5 w-5" />}
            tone="neutral"
          />
        </div>

         */}

        {tab === 'reservations' && (
          <>
            {/* Reservations table */}
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-soft">
              <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink-900">All reservations</h2>
                  {/* <p className="text-xs text-ink-400">{filtered.length} of {reservations.length} shown</p> */}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3 font-medium">Guest</th>
                      <th className="px-5 py-3 font-medium">rOOM nAME </th>
                      <th className="px-5 py-3 font-medium">start Dates</th>
                      <th className="px-5 py-3 font-medium">TOTAL NUMBER OF Nights</th>
                      <th className="px-5 py-3 font-medium">Total pRICE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {reservations.map((r: any) => (
                      <tr key={r.id} className="transition hover:bg-ink-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            {/* <Avatar name={r.fullName} hue={r.fullName} size={32} /> */}
                            <div className="leading-tight">
                              <p className="font-medium text-ink-900">{r.fullName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-ink-800">Aurelia</p>
                          <p className="text-xs text-ink-400">{r.roomName}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">
                          <p>{r.startDate}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">{r.numberOfNights}</td>
                        <td className="px-5 py-3 font-serif text-base text-ink-900">{r.totalPrice}</td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-ink-400">No reservations match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'rooms' && (
          <>
            {/* Reservations table */}
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-soft">
              <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-ink-900">All Rooms</h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-400">
                      <th className="px-5 py-3 font-medium">rOOM nAME </th>
                      <th className="px-5 py-3 font-medium">Floor number </th>
                      <th className="px-5 py-3 font-medium">Room type</th>
                      <th className="px-5 py-3 font-medium">capacity</th>
                      <th className="px-5 py-3 font-medium">Price Per NIght</th>
                      <th className="px-5 py-3 font-medium">Is Available</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {rooms.map((r: any) => (
                      <tr key={r.id} className="transition hover:bg-ink-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            {/* <Avatar name={r.fullName} hue={r.fullName} size={32} /> */}
                            <div className="leading-tight">
                              <p className="font-medium text-ink-900">{r.roomName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-xs text-ink-400">{r.floorNumber}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">
                          <p className="text-xs text-ink-400">{r.roomTypee}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">
                          <p className="text-xs text-ink-400">{r.capacity}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">
                          <p className="text-xs text-ink-400">{r.roomPricePerNight}</p>
                        </td>
                        <td className="px-5 py-3 text-ink-600">
                          <p className="text-xs text-ink-400">{String(r.isAvailable)}</p>
                        </td>

                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-ink-400">No reservations match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'tools' && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => {
                  setShowAddRoom(true);
                  setSubmitMessage('');
                }}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-soft transition hover:shadow-md hover:border-brand-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-ink-900">Add Room</p>
                  <p className="text-xs text-ink-500">Create a new room</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowDeleteRoom(true);
                  setSubmitMessage('');
                  setDeleteFormError('');
                }}
                className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-soft transition hover:shadow-md hover:border-red-200"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-ink-900">Delete Room</p>
                  <p className="text-xs text-ink-500">Remove a room</p>
                </div>
              </button>
            </div>

            {submitMessage && (
              <div className={cn(
                "mt-4 rounded-xl p-4 text-sm",
                submitMessageType === 'success' ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
              )}>
                {submitMessage}
              </div>
            )}
          </>
        )}

        {/* Add Room Modal */}
        {showAddRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm" onClick={() => setShowAddRoom(false)}>
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-ink-900">Add New Room</h3>
                <button onClick={() => setShowAddRoom(false)} className="p-1 rounded-lg hover:bg-ink-100 transition">
                  <X className="h-5 w-5 text-ink-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={addRoomForm.roomName}
                    onChange={(e) => {
                      setAddRoomForm({ ...addRoomForm, roomName: e.target.value });
                      if (formErrors.roomName) setFormErrors({ ...formErrors, roomName: '' });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      formErrors.roomName ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                    placeholder="Enter room name"
                  />
                  {formErrors.roomName && <p className="mt-1 text-xs text-red-500">{formErrors.roomName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Floor Number</label>
                  <input
                    type="number"
                    value={addRoomForm.floorId}
                    onChange={(e) => {
                      setAddRoomForm({ ...addRoomForm, floorId: e.target.value });
                      if (formErrors.floorId) setFormErrors({ ...formErrors, floorId: '' });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      formErrors.floorId ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                    placeholder="Enter floor number"
                  />
                  {formErrors.floorId && <p className="mt-1 text-xs text-red-500">{formErrors.floorId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Room Type</label>
                  <select
                    value={addRoomForm.roomTypee}
                    onChange={(e) => {
                      setAddRoomForm({ ...addRoomForm, roomTypee: e.target.value });
                      if (formErrors.roomTypee) setFormErrors({ ...formErrors, roomTypee: '' });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      formErrors.roomTypee ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                  >
                    <option value="">Select room type</option>
                    <option value="Superior">Superior</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="JuiorSuite">JuiorSuite</option>
                    <option value="ExecutiveSuite">ExecutiveSuite</option>
                    <option value="FullSuite">FullSuite</option>
                  </select>
                  {formErrors.roomTypee && <p className="mt-1 text-xs text-red-500">{formErrors.roomTypee}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={addRoomForm.capacity}
                    onChange={(e) => {
                      setAddRoomForm({ ...addRoomForm, capacity: e.target.value });
                      if (formErrors.capacity) setFormErrors({ ...formErrors, capacity: '' });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      formErrors.capacity ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                    placeholder="Enter capacity"
                  />
                  {formErrors.capacity && <p className="mt-1 text-xs text-red-500">{formErrors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Price Per Night</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addRoomForm.roomPrice}
                    onChange={(e) => {
                      setAddRoomForm({ ...addRoomForm, roomPrice: e.target.value });
                      if (formErrors.roomPrice) setFormErrors({ ...formErrors, roomPrice: '' });
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      formErrors.roomPrice ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                    placeholder="Enter price per night"
                  />
                  {formErrors.roomPrice && <p className="mt-1 text-xs text-red-500">{formErrors.roomPrice}</p>}
                </div>
                <button
                  onClick={() => {
                    AddARoom();
                  }}
                  className="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  Add Room
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Room Modal */}
        {showDeleteRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 backdrop-blur-sm" onClick={() => {
            setShowDeleteRoom(false);
            setDeleteFormError('');
          }}>
            <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-ink-900">Delete Room</h3>
                <button onClick={() => {
                  setShowDeleteRoom(false);
                  setDeleteFormError('');
                }} className="p-1 rounded-lg hover:bg-ink-100 transition">
                  <X className="h-5 w-5 text-ink-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    value={deleteRoomForm.roomName}
                    onChange={(e) => {
                      setDeleteRoomForm({ ...deleteRoomForm, roomName: e.target.value });
                      if (deleteFormError) setDeleteFormError('');
                    }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1",
                      deleteFormError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-ink-200 focus:border-brand-500 focus:ring-brand-500"
                    )}
                    placeholder="Enter room name to delete"
                  />
                  {deleteFormError && <p className="mt-1 text-xs text-red-500">{deleteFormError}</p>}
                </div>
                <button
                  onClick={() => {
                    DeleteARoom();
                  }}
                  className="w-full rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
                >
                  Delete Room
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function KpiCard({
  label, value, delta, up, icon, tone,
}: {
  label: string; value: string; delta: string; up?: boolean; icon: React.ReactNode; tone: 'brand' | 'teal' | 'neutral';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    teal: 'bg-teal-50 text-teal-600',
    neutral: 'bg-ink-100 text-ink-600',
  };
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft transition hover:shadow-card">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tones[tone])}>{icon}</div>
        <span className={cn('inline-flex items-center gap-1 text-xs font-medium', up ? 'text-teal-600' : 'text-ink-400')}>
          {up !== undefined && (up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />)}
          {delta}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold text-ink-900">{value}</p>
      <p className="text-sm text-ink-400">{label}</p>
    </div>
  );
}


/* ---------- stats helpers ---------- */

interface Stats {
  totalRevenue: number;
  totalReservations: number;
  pending: number;
  avgNightly: number;
  occupancy: number;
  monthly: { month: string; revenue: number }[];
  byHotel: { id: string; name: string; location: string; revenue: number }[];
  topHotelRevenue: number;
}

