import { useEffect, useState } from "react";

const API = "http://localhost:5000";

const EQUIPMENT_OPTIONS = [
  "Komputer",
  "Wi-Fi",
  "Projektor",
  "Smartboard",
  "Klimatyzacja",
  "Mikrofon",
  "Głośniki",
  "Tablica klasyczna",
  "Tablica suchościeralna",
  "Kamera",
  "Drukarka 3D",
  "Stanowiska laboratoryjne",
  "Stojak z wodą",
  "Telewizor",
  "System nagłośnienia",
  "Gniazdka przy stolikach",
];

const FIRST_WEEK_START = "2026-05-18";

const MONTH_OPTIONS = [
  { label: "Maj 2026", value: "2026-05-18" },
  { label: "Czerwiec 2026", value: "2026-06-01" },
  { label: "Lipiec 2026", value: "2026-07-06" },
  { label: "Sierpień 2026", value: "2026-08-03" },
  { label: "Wrzesień 2026", value: "2026-09-07" },
];

const DAY_NAMES = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt."];

function addDays(dateString, days) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");

  return `${newYear}-${newMonth}-${newDay}`;
}

function formatCalendarLabel(dateString, index) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const labelDay = String(date.getDate()).padStart(2, "0");
  const labelMonth = String(date.getMonth() + 1).padStart(2, "0");

  return `${DAY_NAMES[index]} ${labelDay}.${labelMonth}`;
}

function getWeekDates(weekStart) {
  return [0, 1, 2, 3, 4].map((dayOffset, index) => {
    const value = addDays(weekStart, dayOffset);

    return {
      label: formatCalendarLabel(value, index),
      value,
    };
  });
}

const HOURS = [
  { start: "08:00:00", end: "09:30:00", label: "08:00" },
  { start: "09:45:00", end: "11:15:00", label: "09:45" },
  { start: "11:30:00", end: "13:00:00", label: "11:30" },
  { start: "13:15:00", end: "14:45:00", label: "13:15" },
  { start: "15:00:00", end: "16:30:00", label: "15:00" },
];

function App() {
  const [page, setPage] = useState("home");
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [adminReservations, setAdminReservations] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("");

  const loadRooms = () => {
    fetch(`${API}/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data));
  };

  const loadReservations = () => {
    fetch(`${API}/reservations`)
      .then((res) => res.json())
      .then((data) => setReservations(data));
  };

  const loadAdminReservations = () => {
  fetch(`${API}/admin/reservations`)
    .then((res) => res.json())
    .then((data) => setAdminReservations(data));
};

const loadEquipment = () => {
  fetch(`${API}/equipment`)
    .then((res) => res.json())
    .then((data) => setEquipmentList(data));
};

useEffect(() => {
  loadRooms();
  loadReservations();
  loadEquipment();

  document.body.style.margin = "0";
  document.body.style.background = "#0b1020";
  document.body.style.overflowX = "hidden";

  document.documentElement.style.margin = "0";
  document.documentElement.style.background = "#0b1020";

  const root = document.getElementById("root");
  if (root) {
    root.style.width = "100%";
    root.style.maxWidth = "none";
    root.style.margin = "0";
    root.style.padding = "0";
  }

  let styleTag = document.getElementById("app-soft-ui-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "app-soft-ui-style";
    styleTag.innerHTML = `
      * { box-sizing: border-box; }
      h1 { font-size: clamp(42px, 4.4vw, 74px); line-height: 1.05; margin: 0 0 22px; letter-spacing: -0.04em; }
      h2 { font-size: clamp(24px, 2.1vw, 34px); line-height: 1.15; margin: 0 0 14px; letter-spacing: -0.02em; }
      h3 { font-size: 20px; margin: 0 0 10px; }
      p { font-size: 18px; line-height: 1.45; }
      button, input, select { transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; }
      button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
      button:active:not(:disabled) { transform: translateY(0); }
    `;
    document.head.appendChild(styleTag);
  }
}, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setPage("home");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setPage("home");
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      room.name.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === "" || room.type === typeFilter) &&
      (capacityFilter === "" || room.capacity >= Number(capacityFilter)) &&
      (equipmentFilter === "" || room.equipment?.includes(equipmentFilter))
    );
  });

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <button onClick={() => setPage("home")} style={styles.navButton}>
          Home
        </button>

        <button
          onClick={() => {
            setPage("rooms");
            setSelectedRoom(null);
          }}
          style={styles.navButton}
        >
          Przeglądaj sale
        </button>

        <button
          onClick={() => {
            loadReservations();
            setPage("myReservations");
          }}
          style={styles.navButton}
        >
          Moje rezerwacje
        </button>

        {user?.role === "admin" && (
          <button onClick={() => setPage("admin")} style={styles.adminButton}>
            Administrator
          </button>
        )}

        {!user ? (
          <button onClick={() => setPage("login")} style={styles.loginButton}>
            Login / Rejestracja
          </button>
        ) : (
          <div style={styles.userText}>
            <span>{user.full_name || user.email}</span>
            <button onClick={logout} style={styles.navButton}>
              Wyloguj
            </button>
          </div>
        )}
      </nav>

      {page === "home" && (
        <div style={styles.homePage}>
          <div style={styles.hero}>
            <div style={styles.heroBadge}>System rezerwacji sal</div>

            <h1>System rezerwacji sal na uczelni</h1>

            <p style={styles.heroText}>
              Przeglądaj sale, sprawdzaj wyposażenie, rezerwuj terminy i
              zarządzaj salami w jednym miejscu.
            </p>

            <div style={styles.heroButtons}>
              {!user && (
                <button onClick={() => setPage("login")} style={styles.bigButton}>
                  Login / Rejestracja
                </button>
              )}

              <button onClick={() => setPage("rooms")} style={styles.bigButton}>
                Przeglądaj sale
              </button>
            </div>
          </div>

          <div style={styles.homeInfoGrid}>
            <div style={styles.homeInfoCard}>
              <h2>Jak zacząć?</h2>
              <p>
                Zaloguj się albo utwórz konto, a potem wejdź w
                <strong> Przeglądaj sale</strong> i wybierz salę z listy.
              </p>
            </div>

            <div style={styles.homeInfoCard}>
              <h2>Kolory w kalendarzu</h2>
              <p>
                <strong style={{ color: "#34d399" }}>Zarezerwowano</strong> —
                Twoja rezerwacja. <strong style={{ color: "#fb7185" }}>Zajęto</strong> —
                termin zarezerwowany przez inną osobę.
              </p>
            </div>

            <div style={styles.homeInfoCard}>
              <h2>Niedostępna</h2>
              <p>
                Szary przycisk oznacza termin po czasie albo salę, której nie
                można już zarezerwować.
              </p>
            </div>

            <div style={styles.homeInfoCard}>
              <h2>Panel administratora</h2>
              <p>
                Administrator może dodawać sale, edytować wyposażenie,
                zmieniać status remontu i przeglądać wszystkie rezerwacje.
              </p>
            </div>
          </div>
        </div>
      )}

      {page === "login" && <LoginPage login={login} />}

      {page === "rooms" && !selectedRoom && (
        <>
          <h1>Przeglądaj sale</h1>

          <div style={styles.filters}>
            <input
              placeholder="Szukaj sali..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={styles.input}
            >
              <option value="">Wszystkie typy</option>
              <option value="Wykładowa">Wykładowa</option>
              <option value="Seminaryjna">Seminaryjna</option>
              <option value="Laboratoryjna">Laboratoryjna</option>
              <option value="Komputerowa">Komputerowa</option>
            </select>

            <select
              value={capacityFilter}
              onChange={(e) => setCapacityFilter(e.target.value)}
              style={styles.input}
            >
              <option value="">Dowolna pojemność</option>
              <option value="20">min. 20</option>
              <option value="30">min. 30</option>
              <option value="50">min. 50</option>
              <option value="80">min. 80</option>
              <option value="120">min. 120</option>
            </select>

            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              style={styles.input}
            >
              <option value="">Dowolne wyposażenie</option>
              {EQUIPMENT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.grid}>
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                style={styles.card}
                onClick={() => setSelectedRoom(room)}
              >
                <h2>{room.name}</h2>
                <p>{room.description}</p>
                <p>
                  <strong>Typ:</strong> {room.type}
                </p>
                <p>
                  <strong>Pojemność:</strong> {room.capacity}
                </p>

                <div style={styles.badgesSmall}>
                  {(room.equipment || []).slice(0, 4).map((item) => (
                    <span key={item} style={styles.badgeSmall}>
                      {item}
                    </span>
                  ))}
                </div>

                <span
                  style={{
                    ...styles.status,
                    backgroundColor:
                      room.status === "available" ? "#1f9d55" : "#d9534f",
                  }}
                >
                  {room.status === "available" ? "Dostępna" : "Remont"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {page === "rooms" && selectedRoom && (
        <RoomDetails
          room={selectedRoom}
          user={user}
          reservations={reservations}
          back={() => setSelectedRoom(null)}
          onReservationCreated={loadReservations}
        />
      )}

      {page === "myReservations" && (
  <MyReservations
    user={user}
    rooms={rooms}
    reservations={reservations}
    loadReservations={loadReservations}
    openRoom={(room) => {
      setSelectedRoom(room);
      setPage("rooms");
    }}
  />
)}

      {page === "admin" && (
  <div style={styles.section}>
    <h1>Panel administratora</h1>

    <div style={styles.adminGrid}>
     <button
  style={styles.infoCard}
  onClick={() => setPage("adminRooms")}
>
  Sale
</button>

      <button
  style={styles.infoCard}
  onClick={() => {
    loadEquipment();
    setPage("adminEquipment");
  }}
>
  Wyposażenie
</button>

      <button
        style={styles.infoCard}
        onClick={() => {
          loadAdminReservations();
          setPage("adminReservations");
        }}
      >
        Rezerwacje
      </button>

     <button
  style={styles.infoCard}
  onClick={() => {
    window.open(`${API}/admin/export-pdf`, "_blank");
  }}
>
  Export PDF
</button>
    </div>
  </div>
)}

{page === "adminReservations" && (
  <AdminReservations reservations={adminReservations} />
)}
{page === "adminRooms" && (
  <AdminRooms
    rooms={rooms}
    equipmentList={equipmentList}
    loadRooms={loadRooms}
    loadEquipment={loadEquipment}
  />
)}
{page === "adminEquipment" && (
  <AdminEquipment
    equipmentList={equipmentList}
    loadEquipment={loadEquipment}
    loadRooms={loadRooms}
  />
)}
    </div>
  );
}


function LoginPage({ login }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    const url = mode === "login" ? `${API}/login` : `${API}/register`;

    const body =
      mode === "login"
        ? { email, password }
        : { email, password, full_name: fullName };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          alert(data.message);
        } else {
          login(data);
        }
      });
  };

  return (
    <div style={styles.loginBox}>
      <h1>{mode === "login" ? "Logowanie" : "Rejestracja"}</h1>

      {mode === "register" && (
        <input
          placeholder="Imię i nazwisko"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
        />
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        placeholder="Hasło"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleSubmit} style={styles.bigButton}>
        {mode === "login" ? "Zaloguj" : "Zarejestruj"}
      </button>

      <button
        onClick={() => setMode(mode === "login" ? "register" : "login")}
        style={styles.navButton}
      >
        {mode === "login"
          ? "Nie masz konta? Zarejestruj się"
          : "Masz konto? Zaloguj się"}
      </button>
    </div>
  );
}

function MyReservations({ user, rooms, reservations, loadReservations, openRoom }) {
  const [showArchive, setShowArchive] = useState(false);

  if (!user) {
    return (
      <div style={styles.section}>
        <h1>Moje rezerwacje</h1>
        <p>Musisz się zalogować, aby zobaczyć swoje rezerwacje.</p>
      </div>
    );
  }

  const now = new Date();

  const myReservations = reservations.filter(
    (reservation) => Number(reservation.user_id) === Number(user.id)
  );

  const activeReservations = myReservations.filter((reservation) => {
    const endDate = new Date(reservation.end_time.replace(" ", "T"));
    return reservation.status === "active" && endDate >= now;
  });

  const archiveReservations = myReservations.filter((reservation) => {
    const endDate = new Date(reservation.end_time.replace(" ", "T"));
    return reservation.status !== "active" || endDate < now;
  });

  const cancelReservation = (id) => {
    fetch(`${API}/reservations/${id}/cancel`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        loadReservations();
      });
  };

  const goToRoom = (roomId) => {
    const room = rooms.find((r) => Number(r.id) === Number(roomId));

    if (!room) {
      alert("Nie znaleziono sali");
      return;
    }

    openRoom(room);
  };

  const renderReservation = (reservation, showCancel) => (
    <div key={reservation.id} style={styles.myReservationCard}>
      <div>
        <h2>{reservation.room_name}</h2>

        <p>
          <strong>Od:</strong> {formatDate(reservation.start_time)}
        </p>

        <p>
          <strong>Do:</strong> {formatDate(reservation.end_time)}
        </p>

        <span
          style={{
            ...styles.statusPill,
            backgroundColor:
              reservation.status === "active" ? "#16a34a" : "#64748b",
          }}
        >
          {reservation.status}
        </span>
      </div>

      <div style={styles.compactActionRow}>
        {showCancel && (
          <button
            onClick={() => cancelReservation(reservation.id)}
            style={styles.smallDangerButton}
          >
            Anuluj
          </button>
        )}

        <button
          onClick={() => goToRoom(reservation.room_id)}
          style={styles.smallGrayButton}
        >
          Zobacz salę
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.adminPage}>
      <h1>Moje rezerwacje</h1>

      <div style={styles.reservationColumns}>
        <div style={styles.reservationPanel}>
          <h2>Nadchodzące</h2>

          {activeReservations.length === 0 && (
            <p>Nie masz aktywnych rezerwacji.</p>
          )}

          <div style={styles.compactList}>
            {activeReservations.map((reservation) =>
              renderReservation(reservation, true)
            )}
          </div>
        </div>

        <div style={styles.reservationPanel}>
          <button
            onClick={() => setShowArchive((current) => !current)}
            style={styles.archiveHeaderButton}
          >
            <span>Archiwum rezerwacji</span>
            <span>{showArchive ? "▲" : "▼"}</span>
          </button>

          {!showArchive && (
            <p style={{ opacity: 0.75 }}>
              Kliknij, aby rozwinąć archiwum. Liczba wpisów:{" "}
              {archiveReservations.length}
            </p>
          )}

          {showArchive && archiveReservations.length === 0 && (
            <p>Brak rezerwacji w archiwum.</p>
          )}

          {showArchive && (
            <div style={styles.compactList}>
              {archiveReservations.map((reservation) =>
                renderReservation(reservation, false)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminEquipment({ equipmentList, loadEquipment, loadRooms }) {
  const [newEquipmentName, setNewEquipmentName] = useState("");

  const addEquipment = () => {
    if (newEquipmentName.trim() === "") {
      alert("Wpisz nazwę wyposażenia");
      return;
    }

    fetch(`${API}/admin/equipment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newEquipmentName }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setNewEquipmentName("");
        loadEquipment();
        loadRooms();
      });
  };

  const deleteEquipment = (id) => {
    const confirmDelete = confirm(
      "Czy na pewno chcesz usunąć to wyposażenie? Zniknie też z sal."
    );

    if (!confirmDelete) return;

    fetch(`${API}/admin/equipment/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        loadEquipment();
        loadRooms();
      });
  };

  return (
    <div style={styles.adminPage}>
      <div style={styles.pageHeaderRow}>
        <div>
          <h1>Wyposażenie</h1>
          <p style={styles.mutedText}>
            Zarządzaj globalną listą wyposażenia dostępną przy edycji sal.
          </p>
        </div>

        <div style={styles.formRow}>
          <input
            placeholder="Nazwa, np. Monitor"
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
            style={styles.input}
          />

          <button onClick={addEquipment} style={styles.bigButton}>
            Dodaj
          </button>
        </div>
      </div>

      <div style={styles.adminEquipmentGrid}>
        {equipmentList.map((item) => (
          <div key={item.id} style={styles.adminEquipmentCard}>
            <h3>{item.name}</h3>

            <button
              onClick={() => deleteEquipment(item.id)}
              style={styles.smallDangerButton}
            >
              Usuń
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminRooms({ rooms, equipmentList, loadRooms, loadEquipment }) {
  const emptyForm = {
    name: "",
    capacity: 20,
    type: "Seminaryjna",
    status: "available",
    description: "",
    equipmentIds: [],
  };

  const [showForm, setShowForm] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((room) => room.status === "available").length;
  const repairRooms = rooms.filter((room) => room.status === "repair").length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingRoomId(null);
    setShowForm(false);
  };

  const startCreateRoom = () => {
    setForm(emptyForm);
    setEditingRoomId(null);
    setShowForm(true);
    loadEquipment();
  };

  const startEditRoom = (room) => {
    const selectedEquipmentIds = equipmentList
      .filter((equipment) => room.equipment?.includes(equipment.name))
      .map((equipment) => equipment.id);

    setForm({
      name: room.name,
      capacity: room.capacity,
      type: room.type,
      status: room.status,
      description: room.description || "",
      equipmentIds: selectedEquipmentIds,
    });

    setEditingRoomId(room.id);
    setShowForm(true);
    loadEquipment();
  };

  const toggleEquipment = (equipmentId) => {
    setForm((prev) => {
      const alreadySelected = prev.equipmentIds.includes(equipmentId);

      return {
        ...prev,
        equipmentIds: alreadySelected
          ? prev.equipmentIds.filter((id) => id !== equipmentId)
          : [...prev.equipmentIds, equipmentId],
      };
    });
  };

  const saveRoom = () => {
    if (!form.name.trim()) {
      alert("Wpisz nazwę sali");
      return;
    }

    const url = editingRoomId
      ? `${API}/admin/rooms/${editingRoomId}`
      : `${API}/admin/rooms`;

    const method = editingRoomId ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        capacity: Number(form.capacity),
        type: form.type,
        status: form.status,
        description: form.description,
        equipmentIds: form.equipmentIds,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        loadRooms();
        resetForm();
      });
  };

  const changeRoomStatus = (roomId, status) => {
    fetch(`${API}/admin/rooms/${roomId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        loadRooms();
      });
  };

  return (
    <div style={styles.adminPage}>
      <div style={styles.pageHeaderRow}>
        <div>
          <h1>Sale</h1>
          <p style={styles.mutedText}>Dodawaj sale, edytuj dane i wyposażenie.</p>
        </div>

        <button onClick={startCreateRoom} style={styles.bigButton}>
          Dodaj nową salę
        </button>
      </div>

      <div style={styles.adminStatsGrid}>
        <div style={styles.infoCard}>Wszystkie sale: {totalRooms}</div>
        <div style={styles.infoCard}>Dostępne: {availableRooms}</div>
        <div style={styles.infoCard}>W remoncie: {repairRooms}</div>
      </div>

      {showForm && (
        <div style={styles.adminFormBox}>
          <h2>{editingRoomId ? "Edytuj salę" : "Dodaj salę"}</h2>

          <div style={styles.formRow}>
            <input
              placeholder="Nazwa sali, np. F201"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Pojemność"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={styles.input}
            >
              <option value="Wykładowa">Wykładowa</option>
              <option value="Seminaryjna">Seminaryjna</option>
              <option value="Laboratoryjna">Laboratoryjna</option>
              <option value="Komputerowa">Komputerowa</option>
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={styles.input}
            >
              <option value="available">Dostępna</option>
              <option value="repair">Remont</option>
            </select>
          </div>

          <input
            placeholder="Opis sali"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...styles.input, width: "100%" }}
          />

          <h3>Wyposażenie sali</h3>

          <div style={styles.badges}>
            {equipmentList.map((equipment) => (
              <button
                key={equipment.id}
                onClick={() => toggleEquipment(equipment.id)}
                style={{
                  ...styles.badge,
                  border: form.equipmentIds.includes(equipment.id)
                    ? "2px solid #38bdf8"
                    : "2px solid transparent",
                  cursor: "pointer",
                  color: "white",
                }}
              >
                {equipment.name}
              </button>
            ))}
          </div>

          <div style={styles.compactActionRow}>
            <button onClick={saveRoom} style={styles.bigButton}>
              {editingRoomId ? "Zapisz zmiany" : "Dodaj salę"}
            </button>

            <button onClick={resetForm} style={styles.smallGrayButton}>
              Anuluj
            </button>
          </div>
        </div>
      )}

      <div style={styles.adminCardsGrid}>
        {rooms.map((room) => (
          <div key={room.id} style={styles.adminRoomCard}>
            <div>
              <h2>{room.name}</h2>

              <p><strong>Typ:</strong> {room.type}</p>
              <p><strong>Pojemność:</strong> {room.capacity}</p>
              <p>
                <strong>Status:</strong>{" "}
                {room.status === "available" ? "Dostępna" : "Remont"}
              </p>

              <p style={styles.cardDescription}>{room.description}</p>

              <div style={styles.badgesSmall}>
                {(room.equipment || []).slice(0, 6).map((item) => (
                  <span key={item} style={styles.badgeSmall}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.compactActionRow}>
              <button
                style={styles.smallButton}
                onClick={() => startEditRoom(room)}
              >
                Edytuj
              </button>

              {room.status === "available" ? (
                <button
                  style={styles.smallDangerButton}
                  onClick={() => changeRoomStatus(room.id, "repair")}
                >
                  Remont
                </button>
              ) : (
                <button
                  style={styles.smallGrayButton}
                  onClick={() => changeRoomStatus(room.id, "available")}
                >
                  Przywróć
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminReservations({ reservations }) {
  return (
    <div style={styles.adminPage}>
      <div style={styles.pageHeaderRow}>
        <div>
          <h1>Wszystkie rezerwacje</h1>
          <p style={styles.mutedText}>Kompaktowy podgląd rezerwacji użytkowników.</p>
        </div>
      </div>

      {reservations.length === 0 && <p>Brak rezerwacji.</p>}

      <div style={styles.adminReservationsGrid}>
        {reservations.map((reservation) => (
          <div key={reservation.id} style={styles.adminReservationCard}>
            <h2>{reservation.room_name}</h2>

            <p>
              <strong>Użytkownik:</strong>{" "}
              {reservation.user_name || "Brak imienia"}
            </p>

            <p>
              <strong>Email:</strong> {reservation.user_email}
            </p>

            <p>
              <strong>Od:</strong> {formatDate(reservation.start_time)}
            </p>

            <p>
              <strong>Do:</strong> {formatDate(reservation.end_time)}
            </p>

            <span
              style={{
                ...styles.statusPill,
                backgroundColor:
                  reservation.status === "active" ? "#16a34a" : "#64748b",
              }}
            >
              {reservation.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomDetails({
  room,
  user,
  reservations,
  back,
  onReservationCreated,
}) {
  const [weekStart, setWeekStart] = useState(FIRST_WEEK_START);

  const weekDates = getWeekDates(weekStart);

  const changeWeek = (direction) => {
    setWeekStart((currentWeekStart) => addDays(currentWeekStart, direction * 7));
  };

  const changeMonth = (newMonthStart) => {
    setWeekStart(newMonthStart);
  };

  const reserveRoom = (date, hour) => {
    if (!user) {
      alert("Musisz się zalogować, aby zarezerwować salę");
      return;
    }

    const startTime = `${date.value} ${hour.start}`;
    const endTime = `${date.value} ${hour.end}`;

    fetch(`${API}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_id: room.id,
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        onReservationCreated();
      });
  };

  const getReservationForSlot = (date, hour) => {
    const startTime = `${date.value} ${hour.start}`;

    return reservations.find(
      (reservation) =>
        Number(reservation.room_id) === Number(room.id) &&
        reservation.start_time === startTime &&
        reservation.status === "active"
    );
  };

  const isPastSlot = (date, hour) => {
    const slotEndTime = new Date(`${date.value}T${hour.end}`);
    const now = new Date();

    return slotEndTime < now;
  };

  return (
    <div>
      <button onClick={back} style={styles.backButton}>
        ← Wróć
      </button>

      <div style={styles.detailsCard}>
        <h1>{room.name}</h1>
        <p>{room.description}</p>

        <p>
          <strong>Pojemność:</strong> {room.capacity}
        </p>

        <p>
          <strong>Typ:</strong> {room.type}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {room.status === "available" ? "Dostępna" : "Remont"}
        </p>
      </div>

      <div style={styles.section}>
        <h2>Wyposażenie</h2>

        <div style={styles.badges}>
          {(room.equipment || []).map((item) => (
            <span key={item} style={styles.badge}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.calendarHeader}>
          <div>
            <h2>Kalendarz rezerwacji</h2>
            <p style={{ opacity: 0.75 }}>
              Tydzień od {formatDateOnly(weekStart)}
            </p>
          </div>

          <div style={styles.calendarControls}>
            <button onClick={() => changeWeek(-1)} style={styles.navButton}>
              ← Poprzedni tydzień
            </button>

            <button onClick={() => changeWeek(1)} style={styles.navButton}>
              Następny tydzień →
            </button>

            <select
              value={weekStart}
              onChange={(e) => changeMonth(e.target.value)}
              style={styles.input}
            >
              {MONTH_OPTIONS.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Godzina</th>

              {weekDates.map((date) => (
                <th key={date.value} style={styles.th}>
                  {date.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour.start}>
                <td style={styles.td}>{hour.label}</td>

                {weekDates.map((date) => {
                  const reservation = getReservationForSlot(date, hour);
                  const pastSlot = isPastSlot(date, hour);

                  const isMine =
                    reservation &&
                    user &&
                    Number(reservation.user_id) === Number(user.id);

                  const isTakenByOther =
                    reservation &&
                    (!user || Number(reservation.user_id) !== Number(user.id));

                  return (
                    <td key={`${date.value}-${hour.start}`} style={styles.td}>
                      <button
                        disabled={
                          room.status !== "available" ||
                          Boolean(reservation) ||
                          pastSlot
                        }
                        onClick={() => reserveRoom(date, hour)}
                        style={{
                          ...styles.reserveButton,
                          backgroundColor: pastSlot
                            ? "#777"
                            : isMine
                            ? "#1f9d55"
                            : isTakenByOther
                            ? "#d9534f"
                            : "#00bcd4",
                          cursor:
                            room.status !== "available" ||
                            Boolean(reservation) ||
                            pastSlot
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {pastSlot
                          ? "Niedostępna"
                          : isMine
                          ? "Zarezerwowano"
                          : isTakenByOther
                          ? "Zajęto"
                          : "Rezerwuj"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value) {
  return new Date(value.replace(" ", "T")).toLocaleString("pl-PL");
}

function formatDateOnly(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pl-PL");
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px clamp(36px, 4vw, 70px) 48px",
    background: "linear-gradient(180deg, #071124 0%, #0b1630 100%)",
    width: "100%",
    boxSizing: "border-box",
    color: "#f2f7ff",
    fontFamily: "Inter, Arial, sans-serif",
  },
  navbar: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginBottom: "36px",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "14px 20px",
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid rgba(130, 160, 255, 0.22)",
    cursor: "pointer",
    backgroundColor: "#162447",
    color: "#f2f7ff",
    fontWeight: "800",
    fontSize: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    boxShadow: "0 10px 26px rgba(0, 0, 0, 0.18)",
  },
  loginButton: {
    marginLeft: "auto",
    padding: "14px 20px",
    minHeight: "52px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #4f7cff 0%, #36c2ff 100%)",
    color: "white",
    fontWeight: "800",
    fontSize: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(54, 194, 255, 0.24)",
  },
  adminButton: {
    padding: "14px 20px",
    minHeight: "52px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #7c5cff 0%, #22d3ee 100%)",
    color: "white",
    fontWeight: "800",
    fontSize: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(124, 92, 255, 0.28)",
  },
  userText: {
    marginLeft: "auto",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    fontSize: "20px",
    fontWeight: "800",
  },
  homePage: {
    maxWidth: "1300px",
    margin: "0 auto",
  },
  hero: {
    textAlign: "center",
    maxWidth: "980px",
    margin: "0 auto 34px",
  },
  heroBadge: {
    display: "inline-flex",
    padding: "8px 14px",
    borderRadius: "999px",
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    color: "#7dd3fc",
    border: "1px solid rgba(125, 211, 252, 0.18)",
    fontWeight: "800",
    marginBottom: "18px",
  },
  heroText: {
    fontSize: "22px",
    maxWidth: "980px",
    margin: "0 auto",
    color: "#dbeafe",
  },
  heroButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    margin: "34px 0",
    flexWrap: "wrap",
  },
  homeInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
    marginTop: "34px",
  },
  homeInfoCard: {
    backgroundColor: "#162447",
    padding: "24px",
    borderRadius: "22px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
  },
  bigButton: {
    padding: "15px 24px",
    minHeight: "54px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #4f7cff 0%, #36c2ff 100%)",
    color: "white",
    cursor: "pointer",
    fontWeight: "800",
    fontSize: "17px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    boxShadow: "0 12px 28px rgba(54, 194, 255, 0.24)",
  },
  filters: {
    display: "flex",
    gap: "14px",
    marginBottom: "28px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: "15px 16px",
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid rgba(130, 160, 255, 0.18)",
    backgroundColor: "#111c38",
    color: "#f2f7ff",
    marginBottom: "0",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },
  card: {
    backgroundColor: "#162447",
    padding: "22px",
    borderRadius: "22px",
    cursor: "pointer",
    marginBottom: "0",
    minHeight: "260px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: "10px",
    padding: "10px 18px",
    borderRadius: "999px",
    fontWeight: "900",
    fontSize: "18px",
    minWidth: "120px",
  },
  loginBox: {
    maxWidth: "440px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    backgroundColor: "#162447",
    padding: "28px",
    borderRadius: "24px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.2)",
  },
  section: {
    backgroundColor: "#162447",
    padding: "28px",
    borderRadius: "24px",
    marginBottom: "22px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
  },
  adminGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  infoCard: {
    backgroundColor: "#1a2a52",
    padding: "24px",
    minHeight: "92px",
    borderRadius: "20px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    color: "#f2f7ff",
    fontWeight: "900",
    fontSize: "20px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.15)",
  },
  backButton: {
    marginBottom: "20px",
    padding: "14px 18px",
    minHeight: "50px",
    borderRadius: "14px",
    border: "1px solid rgba(130, 160, 255, 0.18)",
    cursor: "pointer",
    backgroundColor: "#162447",
    color: "#f2f7ff",
    fontWeight: "800",
    fontSize: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    backgroundColor: "#162447",
    padding: "28px",
    borderRadius: "24px",
    marginBottom: "22px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
  },
  badges: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  badge: {
    backgroundColor: "#253866",
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(130, 160, 255, 0.18)",
    fontWeight: "700",
    fontSize: "14px",
  },
  badgesSmall: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
  badgeSmall: {
    backgroundColor: "#253866",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
    border: "1px solid rgba(130, 160, 255, 0.18)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    overflow: "hidden",
  },
  th: {
    border: "1px solid rgba(130, 160, 255, 0.16)",
    padding: "14px",
    backgroundColor: "#1a2a52",
    fontSize: "17px",
  },
  td: {
    border: "1px solid rgba(130, 160, 255, 0.14)",
    padding: "14px",
    textAlign: "center",
    fontSize: "16px",
  },
  reserveButton: {
    padding: "12px 16px",
    minHeight: "46px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    fontWeight: "900",
    fontSize: "15px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
  },
  reservationCard: {
    backgroundColor: "#162447",
    padding: "20px",
    borderRadius: "20px",
    marginBottom: "16px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.16)",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "14px",
  },
  cancelButton: {
    padding: "12px 16px",
    minHeight: "46px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    fontWeight: "900",
    background: "linear-gradient(135deg, #fb7185 0%, #ef4444 100%)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  calendarControls: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "12px",
    alignItems: "center",
  },
  adminPage: {
    padding: "8px 0",
  },
  pageHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "22px",
  },
  mutedText: {
    opacity: 0.78,
    margin: 0,
    fontSize: "19px",
  },
  adminStatsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  adminCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "18px",
    alignItems: "stretch",
  },
  adminRoomCard: {
    backgroundColor: "#162447",
    padding: "20px",
    borderRadius: "22px",
    minHeight: "330px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    justifyContent: "space-between",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
  },
  adminEquipmentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "18px",
    alignItems: "stretch",
  },
  adminEquipmentCard: {
    backgroundColor: "#162447",
    padding: "18px",
    borderRadius: "20px",
    textAlign: "center",
    minHeight: "130px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 12px 26px rgba(0, 0, 0, 0.16)",
  },
  adminReservationsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
    alignItems: "stretch",
  },
  adminReservationCard: {
    backgroundColor: "#162447",
    padding: "18px",
    borderRadius: "20px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 12px 26px rgba(0,0,0,0.16)",
  },
  reservationColumns: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: "22px",
    alignItems: "start",
  },
  reservationPanel: {
    backgroundColor: "#162447",
    padding: "22px",
    borderRadius: "22px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
  },
  myReservationCard: {
    backgroundColor: "#1a2a52",
    padding: "18px",
    borderRadius: "18px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "12px",
  },
  compactList: {
    display: "grid",
    gap: "14px",
  },
  archiveHeaderButton: {
    width: "100%",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    backgroundColor: "#1a2a52",
    color: "#f2f7ff",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "900",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 14px",
    borderRadius: "999px",
    color: "white",
    fontWeight: "900",
    fontSize: "14px",
    marginTop: "8px",
  },
  cardDescription: {
    fontSize: "16px",
    opacity: 0.84,
  },
  smallButton: {
    padding: "12px 16px",
    minHeight: "46px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(135deg, #4f7cff 0%, #36c2ff 100%)",
    fontSize: "15px",
    fontWeight: "900",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    flex: 1,
  },
  smallGrayButton: {
    padding: "12px 16px",
    minHeight: "46px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    backgroundColor: "#64748b",
    fontSize: "15px",
    fontWeight: "900",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    flex: 1,
  },
  smallDangerButton: {
    padding: "12px 16px",
    minHeight: "46px",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    color: "white",
    background: "linear-gradient(135deg, #fb7185 0%, #ef4444 100%)",
    fontSize: "15px",
    fontWeight: "900",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1.2,
    flex: 1,
  },
  compactActionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "14px",
    alignItems: "stretch",
  },
  adminFormBox: {
    backgroundColor: "#162447",
    padding: "22px",
    borderRadius: "22px",
    margin: "20px 0",
    border: "1px solid rgba(130, 160, 255, 0.16)",
    boxShadow: "0 16px 36px rgba(0, 0, 0, 0.18)",
  },
};

export default App;