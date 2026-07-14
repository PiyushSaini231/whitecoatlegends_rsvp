import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import * as XLSX from "xlsx";
import { EventConfig, RSVP } from "./src/types";

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
const RSVPS_FILE = path.join(DATA_DIR, "rsvps.json");
const ARCHIVE_FILE = path.join(DATA_DIR, "archives.json");

// Ensure data directory and files exist with defaults
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const defaultConfig: EventConfig = {
    headline: "We cordially invite you to A GRAND PREMIERE",
    series: "WHITE COAT LEGENDS",
    tagline: "A documentary honoring the visionary journey of",
    honoree: "Dr. Milind V. Kirtane",
    honoreeCredentials: "Padma Shri Awardee, Consultant ENT Surgeon, MS, DORL, FNAMS, DSc (Hon)",
    dateTime: "Saturday, 1st August, 07:00 PM onwards",
    venue: "Grand Ballroom, JW Marriott Sahar, Mumbai",
    footerLine: "* Entry by invitation only",
    availabilityOptions: ["Attending", "Not Attending"],
    accentColor: "#D4AF37", // Classic Gold
    primaryColor: "#7a0c1e", // Left gradient (Crimson)
    secondaryColor: "#0a192f", // Right gradient (Navy Blue)
    logoDocflix: "", // To be uploaded or fallback to styled text
    logoMankind: "", // To be uploaded or fallback to styled text
    countdownTarget: "2026-08-01T19:00:00",
    adminPassword: "admin", // Simple default password editable from dashboard
  };

  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), "utf-8");
  }

  if (!fs.existsSync(RSVPS_FILE)) {
    fs.writeFileSync(RSVPS_FILE, JSON.stringify([], null, 2), "utf-8");
  }

  if (!fs.existsSync(ARCHIVE_FILE)) {
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

ensureDataFiles();

// Middleware to parse JSON with generous limit for Base64 image uploads
app.use(express.json({ limit: "15mb" }));

// Helper to read files
function getConfig(): EventConfig {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}

function getRSVPs(): RSVP[] {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(RSVPS_FILE, "utf-8"));
}

// Simple authentication middleware
function authCheck(req: express.Request, res: express.Response, next: express.NextFunction) {
  const passwordHeader = req.headers["x-admin-password"];
  const config = getConfig();
  if (passwordHeader === config.adminPassword) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid password" });
  }
}

// API: Get active configuration (public)
app.get("/api/config", (req, res) => {
  try {
    const config = getConfig();
    // Do not leak admin password to public
    const { adminPassword, ...publicConfig } = config;
    res.json(publicConfig);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get confirmed attendee count (public)
app.get("/api/rsvp/count", (req, res) => {
  try {
    const rsvps = getRSVPs();
    const count = rsvps.filter((r) => r.availability === "Attending").length;
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save configuration (admin only)
app.post("/api/config", authCheck, (req, res) => {
  try {
    const config = getConfig();
    const newConfig = { ...config, ...req.body };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf-8");
    res.json({ message: "Configuration updated successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Post RSVP (public)
app.post("/api/rsvp", (req, res) => {
  try {
    const { name, phone, availability } = req.body;
    if (!name || !phone || !availability) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    // Clean phone number: remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "Please enter a valid 10-digit phone number." });
    }

    const config = getConfig();
    const rsvps = getRSVPs();

    // Check for existing RSVP with this phone number to prevent duplicates
    const existingIndex = rsvps.findIndex((r) => r.phone === cleanPhone);

    const newRsvp: RSVP = {
      id: existingIndex >= 0 ? rsvps[existingIndex].id : Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      name: name.trim(),
      phone: cleanPhone,
      availability,
      eventName: `${config.series} - ${config.honoree}`,
    };

    if (existingIndex >= 0) {
      rsvps[existingIndex] = newRsvp; // Update
    } else {
      rsvps.push(newRsvp); // Append
    }

    fs.writeFileSync(RSVPS_FILE, JSON.stringify(rsvps, null, 2), "utf-8");
    res.json({ message: "RSVP saved successfully!", rsvp: newRsvp });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get all RSVPs (admin only)
app.get("/api/rsvps", authCheck, (req, res) => {
  try {
    const rsvps = getRSVPs();
    res.json(rsvps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Download RSVPs as Excel (admin only, verified via query param password)
app.get("/api/rsvps/excel", (req, res) => {
  try {
    const password = req.query.password as string;
    const config = getConfig();
    if (password !== config.adminPassword) {
      return res.status(401).send("Unauthorized: Invalid password");
    }

    const rsvps = getRSVPs();

    // Build SheetJS Workbook
    const wb = XLSX.utils.book_new();
    const rows = rsvps.map((r) => ({
      "Timestamp": new Date(r.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      "Name": r.name,
      "Phone Number": r.phone,
      "Availability": r.availability,
      "Event Name": r.eventName,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Adjust column widths automatically
    const max_len = rows.reduce((acc, row) => {
      acc.timestamp = Math.max(acc.timestamp, (row["Timestamp"] || "").length);
      acc.name = Math.max(acc.name, (row["Name"] || "").length);
      acc.phone = Math.max(acc.phone, (row["Phone Number"] || "").length);
      acc.availability = Math.max(acc.availability, (row["Availability"] || "").length);
      acc.event = Math.max(acc.event, (row["Event Name"] || "").length);
      return acc;
    }, { timestamp: 12, name: 15, phone: 12, availability: 12, event: 25 });

    ws["!cols"] = [
      { wch: max_len.timestamp + 2 },
      { wch: max_len.name + 2 },
      { wch: max_len.phone + 2 },
      { wch: max_len.availability + 2 },
      { wch: max_len.event + 2 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Active RSVPs");

    // Also include archives if any exist
    try {
      const archives = JSON.parse(fs.readFileSync(ARCHIVE_FILE, "utf-8"));
      if (archives && archives.length > 0) {
        const archivedRows = archives.map((r: any) => ({
          "Timestamp": new Date(r.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          "Name": r.name,
          "Phone Number": r.phone,
          "Availability": r.availability,
          "Event Name": r.eventName,
        }));
        const wsArchived = XLSX.utils.json_to_sheet(archivedRows);
        XLSX.utils.book_append_sheet(wb, wsArchived, "Archived RSVPs");
      }
    } catch (_) {}

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const safeEventName = config.series.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    res.setHeader("Content-Disposition", `attachment; filename="RSVPs_${safeEventName}.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (error: any) {
    res.status(500).send(`Error generating spreadsheet: ${error.message}`);
  }
});

// API: Reset and Archive RSVPs (admin only)
app.post("/api/rsvps/reset", authCheck, (req, res) => {
  try {
    const rsvps = getRSVPs();
    if (rsvps.length === 0) {
      return res.json({ message: "No active RSVPs to archive." });
    }

    // Append to archives
    const archives = JSON.parse(fs.readFileSync(ARCHIVE_FILE, "utf-8")) as RSVP[];
    const updatedArchives = [...archives, ...rsvps];
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(updatedArchives, null, 2), "utf-8");

    // Empty current RSVPs
    fs.writeFileSync(RSVPS_FILE, JSON.stringify([], null, 2), "utf-8");

    res.json({ message: "Current RSVPs archived and starting fresh with a new event!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API Check Credentials
app.post("/api/admin/login", (req, res) => {
  try {
    const { password } = req.body;
    const config = getConfig();
    if (password === config.adminPassword) {
      res.json({ success: true, message: "Logged in successfully!" });
    } else {
      res.status(401).json({ success: false, error: "Incorrect password." });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Hook up Vite Dev Server / Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
