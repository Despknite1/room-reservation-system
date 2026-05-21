const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API works!");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ message: "Nieprawidłowy email lub hasło" });
    }

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role`,
      [
        email,
        hashedPassword,
        full_name,
        email === "admin@test.com" ? "admin" : "user",
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration error" });
  }
});

app.get("/rooms", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.name,
        r.capacity,
        r.type,
        r.status,
        r.description,
        COALESCE(
          json_agg(e.name) FILTER (WHERE e.name IS NOT NULL),
          '[]'
        ) AS equipment
      FROM rooms r
      LEFT JOIN room_equipment re ON r.id = re.room_id
      LEFT JOIN equipment e ON re.equipment_id = e.id
      GROUP BY r.id
      ORDER BY r.id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        reservations.id,
        reservations.user_id,
        reservations.room_id,
        to_char(reservations.start_time, 'YYYY-MM-DD HH24:MI:SS') AS start_time,
        to_char(reservations.end_time, 'YYYY-MM-DD HH24:MI:SS') AS end_time,
        reservations.status,
        rooms.name AS room_name
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      ORDER BY reservations.start_time;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.post("/reservations", async (req, res) => {
  try {
    const { room_id, user_id, start_time, end_time } = req.body;

    if (!room_id || !user_id || !start_time || !end_time) {
      return res.status(400).json({
        message: "Brakuje danych rezerwacji",
      });
    }

    const reservationEnd = new Date(end_time);
const now = new Date();

if (reservationEnd < now) {
  return res.status(400).json({
    message: "Nie można zarezerwować terminu z przeszłości",
  });
}

    const existing = await pool.query(
      `SELECT * FROM reservations
       WHERE room_id = $1
       AND start_time = $2
       AND status = 'active'`,
      [room_id, start_time]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        message: "Ten termin jest już zajęty",
      });
    }

    const result = await pool.query(
      `INSERT INTO reservations (user_id, room_id, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [user_id, room_id, start_time, end_time]
    );

    res.json({
      message: "Sala została zarezerwowana",
      reservation: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reservation error" });
  }
});

app.patch("/reservations/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE reservations
       SET status = 'cancelled'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Rezerwacja nie istnieje" });
    }

    res.json({
      message: "Rezerwacja została anulowana",
      reservation: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel reservation error" });
  }
});

app.get("/admin/reservations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        reservations.id,
        reservations.start_time,
        reservations.end_time,
        reservations.status,
        rooms.name AS room_name,
        users.email AS user_email,
        users.full_name AS user_name
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      JOIN users ON reservations.user_id = users.id
      ORDER BY reservations.start_time DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin reservations error" });
  }
});

app.patch("/admin/rooms/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["available", "repair"].includes(status)) {
      return res.status(400).json({ message: "Nieprawidłowy status sali" });
    }

    const result = await pool.query(
      `UPDATE rooms
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Sala nie istnieje" });
    }

    res.json({
      message: "Status sali został zmieniony",
      room: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Room status update error" });
  }
});

app.get("/equipment", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM equipment ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Equipment load error" });
  }
});

app.post("/admin/equipment", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Nazwa wyposażenia jest wymagana" });
    }

    const result = await pool.query(
      `INSERT INTO equipment (name)
       VALUES ($1)
       RETURNING *`,
      [name.trim()]
    );

    res.json({
      message: "Wyposażenie zostało dodane",
      equipment: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Equipment create error" });
  }
});

app.delete("/admin/equipment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM room_equipment WHERE equipment_id = $1", [id]);

    const result = await pool.query(
      "DELETE FROM equipment WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wyposażenie nie istnieje" });
    }

    res.json({ message: "Wyposażenie zostało usunięte" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Equipment delete error" });
  }
});

app.post("/admin/rooms", async (req, res) => {
  try {
    const { name, capacity, type, status, description, equipmentIds } = req.body;

    const roomResult = await pool.query(
      `INSERT INTO rooms (name, capacity, type, status, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, capacity, type, status || "available", description || ""]
    );

    const room = roomResult.rows[0];

    if (Array.isArray(equipmentIds)) {
      for (const equipmentId of equipmentIds) {
        await pool.query(
          `INSERT INTO room_equipment (room_id, equipment_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [room.id, equipmentId]
        );
      }
    }

    res.json({
      message: "Sala została dodana",
      room,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Room create error" });
  }
});

app.put("/admin/rooms/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, type, status, description, equipmentIds } = req.body;

    const roomResult = await pool.query(
      `UPDATE rooms
       SET name = $1,
           capacity = $2,
           type = $3,
           status = $4,
           description = $5
       WHERE id = $6
       RETURNING *`,
      [name, capacity, type, status, description, id]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ message: "Sala nie istnieje" });
    }

    await pool.query("DELETE FROM room_equipment WHERE room_id = $1", [id]);

    if (Array.isArray(equipmentIds)) {
      for (const equipmentId of equipmentIds) {
        await pool.query(
          `INSERT INTO room_equipment (room_id, equipment_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, equipmentId]
        );
      }
    }

    res.json({
      message: "Sala została zaktualizowana",
      room: roomResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Room update error" });
  }
});

function escapeCsvValue(value) {
  if (value === null || value === undefined) return "";

  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  return `"${escapedValue}"`;
}

app.get("/admin/export-csv", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        reservations.id,
        rooms.name AS room_name,
        users.email AS user_email,
        COALESCE(users.full_name, '') AS user_name,
        to_char(reservations.start_time, 'YYYY-MM-DD HH24:MI:SS') AS start_time,
        to_char(reservations.end_time, 'YYYY-MM-DD HH24:MI:SS') AS end_time,
        reservations.status
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      JOIN users ON reservations.user_id = users.id
      ORDER BY reservations.start_time DESC;
    `);

    const headers = [
      "ID",
      "Sala",
      "Email użytkownika",
      "Imię i nazwisko",
      "Od",
      "Do",
      "Status",
    ];

    const rows = result.rows.map((reservation) => [
      reservation.id,
      reservation.room_name,
      reservation.user_email,
      reservation.user_name,
      reservation.start_time,
      reservation.end_time,
      reservation.status,
    ]);

    const csvContent = [
      headers.map(escapeCsvValue).join(";"),
      ...rows.map((row) => row.map(escapeCsvValue).join(";")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reservations-report.csv"'
    );

    res.send("\uFEFF" + csvContent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export CSV error" });
  }
});

app.get("/admin/stats", async (req, res) => {
  try {
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*) AS total_reservations,
        COUNT(*) FILTER (WHERE status = 'active') AS active_reservations,
        COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_reservations,
        COUNT(DISTINCT room_id) AS reserved_rooms
      FROM reservations;
    `);

    const topRoomsResult = await pool.query(`
      SELECT
        rooms.name AS room_name,
        COUNT(reservations.id) AS reservations_count
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      GROUP BY rooms.name
      ORDER BY reservations_count DESC
      LIMIT 5;
    `);

    res.json({
      summary: summaryResult.rows[0],
      topRooms: topRoomsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats error" });
  }
});

app.get("/admin/export-pdf", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        reservations.id,
        reservations.start_time,
        reservations.end_time,
        reservations.status,
        rooms.name AS room_name,
        users.email AS user_email,
        users.full_name AS user_name
      FROM reservations
      JOIN rooms ON reservations.room_id = rooms.id
      JOIN users ON reservations.user_id = users.id
      ORDER BY reservations.start_time DESC;
    `);

    const pdfResponse = await fetch("http://localhost:7000/export-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reservations: result.rows,
      }),
    });

    if (!pdfResponse.ok) {
      return res.status(500).json({
        message: "PDF service error",
      });
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reservations-report.pdf"'
    );

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Export PDF error",
    });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});