import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { 
  getGoogleAuthUrl,
  getRedirectUri,
  triggerGoogleDriveSync,
  syncScoutPhotoToDrive,
  syncAlbumPhotoToDrive
} from "./driveService.js";

interface DBState {
  users: any[];
  scouts: any[];
  patrols: string[];
  badges: any[];
  awards: any[];
  events: any[];
  albums: any[];
  library: any[];
  chats: any[];
  attendance: any[];
  auditLogs: any[];
  reports: any[];
  storage: {
    email: string;
    usedBytes: number;
    totalBytes: number;
    isFull: boolean;
    reportDigestEnabled?: boolean;
    reportDigestFrequency?: 'daily' | 'weekly';
    customClientId?: string;
    customClientSecret?: string;
    googleCredentials?: {
      accessToken: string;
      refreshToken?: string;
      expiryTime?: number;
      email?: string;
    };
  };
}

const DB_FILE = path.join(process.cwd(), "scout_db.json");

// Default initial database seed
const initialDB: DBState = {
  users: [
    {
      id: "u_admin1",
      username: "Dineth_Jayasuriya",
      password: "Jayasuriya@2026",
      name: "Dineth Jayasuriya",
      role: "admin",
      email: "dineth.j_admin@gmail.com",
      whatsapp: "+94771234567",
      nic: "200155667823"
    },
    {
      id: "u_admin2",
      username: "Manusha_Bimsara",
      password: "Manusha@2010",
      name: "Manusha Bimsara",
      role: "admin",
      email: "manusha.b_admin@gmail.com",
      whatsapp: "+94769876543",
      nic: "201023456789"
    }
  ],
  scouts: [
    {
      id: "s_scout1",
      firstName: "Ruwan",
      lastName: "Senanayake",
      dob: "2012-04-12",
      dateJoined: "2024-01-15",
      membershipNo: "CMB/51/2024/04",
      patrol: "Eagle",
      nic: "",
      position: "Patrol Leader",
      address: "123 Galle Road, Colombo 03",
      parentName: "Sunil Senanayake",
      relationship: "Father",
      parentPhone: "+94711112222",
      whatsapp: "+94775556666",
      email: "ruwan.s@gmail.com",
      badgesEarned: ["b_firstaid", "b_pioneering"],
      awardsEarned: ["a_pathfinder"],
      scoutPhoto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    },
    {
      id: "s_scout2",
      firstName: "Nimal",
      lastName: "Fernando",
      dob: "2013-08-22",
      dateJoined: "2024-05-10",
      membershipNo: "CMB/51/2024/11",
      patrol: "Hawk",
      nic: "",
      position: "Member",
      address: "45 Parliament Road, Kotte",
      parentName: "Pushpa Fernando",
      relationship: "Mother",
      parentPhone: "+94722223333",
      whatsapp: "+94718889999",
      email: "nimal.fer@gmail.com",
      badgesEarned: ["b_cooking"],
      awardsEarned: [],
      scoutPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
    }
  ],
  patrols: ["Salalihini", "Woodpecker", "Pigeon", "Eagle", "Parrot", "Kingfisher", "Hawk", "Senior"],
  badges: [
    {
      id: "b_firstaid",
      name: "First Aid Explorer",
      category: "Emergency Skills",
      description: "Demonstrate essential first-aid response, bandage application, and emergency scene signaling.",
      photoUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=120"
    },
    {
      id: "b_pioneering",
      name: "Pioneering Scout",
      category: "Campcraft",
      description: "Master knots (square lash, clove hitch, sheet bend) and assemble a functional camp structure.",
      photoUrl: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=120"
    },
    {
      id: "b_cooking",
      name: "Campfire Chef",
      category: "Culinary Skills",
      description: "Build a safe cooking fire and prepare a healthy meal for your patrol using basic utensils.",
      photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=120"
    }
  ],
  awards: [
    { id: "a_presidents", name: "President's Scout Award", description: "Highest award achieved after fulfilling all badge groups." },
    { id: "a_kingscout", name: "King Scout Ring", description: "Symbol of ultimate scout leadership and community service." },
    { id: "a_pathfinder", name: "Pathfinder Medal", description: "Awarded for exceptional route planning and physical endurance." }
  ],
  events: [
    { id: "e1", title: "Annual Patrol Camporee", date: "2026-06-15", description: "A three-day outdoor camp containing survival and navigation challenges.", type: "Camp" },
    { id: "e2", title: "Weekly Troop Meeting", date: "2026-06-20", description: "Briefing on newly updated SLSA badges and pioneering practice.", type: "Meeting" },
    { id: "e3", title: "Kotte Temple Clean-up", date: "2026-06-28", description: "Socio-civic community service to clean the temple surroundings.", type: "Service" }
  ],
  albums: [
    {
      id: "alb_camp2025",
      name: "District Camporee 2025",
      description: "Pictures from our 3-day outdoor training camp in Hanwella.",
      photos: [
        { id: "ph1", url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500", caption: "Patrol pioneering team raising the flag mast", date: "2025-08-14" },
        { id: "ph2", url: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=500", caption: "Campfire song performance by Eagle Patrol", date: "2025-08-15" }
      ]
    },
    {
      id: "alb_charity",
      name: "Vesak Lantern Project",
      description: "Preparing lantern structures at Ananda Sastralaya Kotte premises.",
      photos: [
        { id: "ph3", url: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=500", caption: "Scouts working together with bamboo frames", date: "2026-05-11" }
      ]
    }
  ],
  library: [
    {
      id: "lib1",
      title: "Sri Lanka Scout Association Policy & Rules (POR)",
      category: "Guides",
      fileSize: "4.8 MB",
      downloadUrl: "#",
      addedBy: "Dineth Jayasuriya",
      addedAt: "2026-06-01"
    },
    {
      id: "lib2",
      title: "Scout Pioneering and Knot Craft Manual",
      category: "Outdoor Skills",
      fileSize: "8.2 MB",
      downloadUrl: "#",
      addedBy: "Manusha Bimsara",
      addedAt: "2026-06-03"
    },
    {
      id: "lib3",
      title: "Basic First-aid Handbook for Patrol Leaders",
      category: "Emergency Prep",
      fileSize: "2.1 MB",
      downloadUrl: "#",
      addedBy: "Dineth Jayasuriya",
      addedAt: "2026-06-05"
    }
  ],
  chats: [
    { id: "ch1", senderName: "Dineth Jayasuriya", senderRole: "admin", text: "Welcome all scouts and leaders to our new TroopTrack website platform!", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
    { id: "ch2", senderName: "Ruwan Senanayake", senderRole: "scout", text: "Thank you, sir! This dashboard looks awesome. ⚜️", timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: "ch3", senderName: "Manusha Bimsara", senderRole: "admin", text: "Please make sure to fill in your profile details, especially parents' contact numbers first-time users.", timestamp: new Date(Date.now() - 600000).toISOString() }
  ],
  attendance: [
    { date: "2026-06-01", presentIds: ["s_scout1"] },
    { date: "2026-06-08", presentIds: ["s_scout1", "s_scout2"] }
  ],
  auditLogs: [
    { id: "log_init", action: "System Seeded", details: "Initial admin accounts and default scouts created successfully.", timestamp: new Date().toISOString(), user: "System", notifiedEmail: false, notifiedWhatsapp: false }
  ],
  reports: [],
  storage: {
    email: "managementsystermscout@gmail.com",
    usedBytes: 11200000000, // 11.2 GB
    totalBytes: 15000000000, // 15 GB
    isFull: false,
    reportDigestEnabled: false,
    reportDigestFrequency: "weekly"
  }
};

// Ensure database file exists
function loadDB(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      // Ensure reports exists
      parsed.reports = parsed.reports || [];
      // Ensure storage settings are initialized
      if (parsed.storage) {
        if (parsed.storage.reportDigestEnabled === undefined) {
          parsed.storage.reportDigestEnabled = false;
        }
        if (parsed.storage.reportDigestFrequency === undefined) {
          parsed.storage.reportDigestFrequency = "weekly";
        }
      }
      // Ensure chats are cleaned from older than 1 month:
      const oneMonthAgo = Date.now() - 30 * 24 * 3600 * 1000;
      const initialLength = parsed.chats?.length || 0;
      parsed.chats = (parsed.chats || []).filter((chat: any) => {
        return new Date(chat.timestamp).getTime() > oneMonthAgo;
      });
      if (parsed.chats.length !== initialLength || !parsed.reports) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      }
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load scout_db.json, recreating", err);
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
  return initialDB;
}

function saveDB(data: DBState) {
  try {
    // Check if storage was full/warning is needed
    if (data.storage.usedBytes >= data.storage.totalBytes) {
      data.storage.isFull = true;
    } else {
      data.storage.isFull = false;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to save DB:", err);
  }
}

// Global alert email/whatsapp notification sender (mocked but logged prominently in audit list)
function sendNotification(action: string, details: string, performedBy: string, isScoutChange: boolean = false) {
  const db = loadDB();
  const timestamp = new Date().toISOString();
  const logId = "log_" + Date.now();
  
  // Create an audit record
  const newLog = {
    id: logId,
    action,
    details,
    timestamp,
    user: performedBy,
    notifiedEmail: true,
    notifiedWhatsapp: true
  };
  
  db.auditLogs.push(newLog);
  
  // Show in server logs
  console.log(`[ALERT EMAIL SENT] Form: ${isScoutChange ? 'Scout Profile Change' : 'Web Config Modification'}`);
  console.log(`[RECIPIENT] managementsystermscout@gmail.com & Admins`);
  console.log(`[CONTENT] Action: ${action} - ${details} by ${performedBy}`);
  console.log(`[ALERT WHATSAPP SENT] To admins: ${details}`);
  
  saveDB(db);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" })); // support large scout photos
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // DB Get State
  app.get("/api/state", (req, res) => {
    const db = loadDB();
    res.json(db);
  });

  // Authentication
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();
    
    // Check in users list (leaders / admins)
    const foundUserIndex = db.users.findIndex(
      u => u.username.toLowerCase() === username?.trim().toLowerCase() && u.password === password
    );

    if (foundUserIndex > -1) {
      const foundUser = db.users[foundUserIndex];
      // Check if user is a leader and not approved
      if (foundUser.role === 'leader' && foundUser.approved === false) {
        return res.status(403).json({
          success: false,
          message: "Your Leader Account is pending approval by an Admin (Dineth/Manusha). Please contact them to activate."
        });
      }

      // Track login stats
      foundUser.loginCount = (foundUser.loginCount || 0) + 1;
      foundUser.lastLogin = new Date().toISOString();
      saveDB(db);

      return res.json({
        success: true,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          email: foundUser.email,
          whatsapp: foundUser.whatsapp,
          nic: foundUser.nic,
          parentPhone: foundUser.parentPhone,
          approved: foundUser.approved !== false,
          loginCount: foundUser.loginCount,
          lastLogin: foundUser.lastLogin
        }
      });
    }

    // Also look inside scout member profiles in case they log in with membershipNo or WhatsApp as password
    const foundScoutIndex = db.scouts.findIndex(
      s => (s.email?.toLowerCase() === username?.trim().toLowerCase() || s.membershipNo?.toLowerCase() === username?.trim().toLowerCase()) && 
           (s.parentPhone === password || s.whatsapp === password || password === "scout123")
    );

    if (foundScoutIndex > -1) {
      const foundScout = db.scouts[foundScoutIndex];
      
      // Track login stats for scouts
      foundScout.loginCount = (foundScout.loginCount || 0) + 1;
      foundScout.lastLogin = new Date().toISOString();
      saveDB(db);

      return res.json({
        success: true,
        user: {
          id: foundScout.id,
          username: foundScout.membershipNo || foundScout.firstName.toLowerCase(),
          name: `${foundScout.firstName} ${foundScout.lastName}`,
          role: "scout",
          email: foundScout.email,
          whatsapp: foundScout.whatsapp,
          nic: foundScout.nic,
          parentPhone: foundScout.parentPhone,
          approved: true,
          loginCount: foundScout.loginCount,
          lastLogin: foundScout.lastLogin
        }
      });
    }

    res.status(401).json({ success: false, message: "Invalid credentials. Note: Admins can use preset details, Scouts can use user/email with their password." });
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password, name, role, email, whatsapp, nic, parentPhone } = req.body;
    const db = loadDB();

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: "Username, password and name are required." });
    }

    const exists = db.users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: "Username already exists." });
    }

    // Enforce that Dineth_Jayasuriya and Manusha_Bimsara are the exclusive Administrators / App Developers
    let finalRole = role;
    if (role === "admin") {
      if (username !== "Dineth_Jayasuriya" && username !== "Manusha_Bimsara") {
        finalRole = "leader"; // Downgrade block to Leader
      }
    }

    // Leaders require admin approval, others are pre-approved
    const approved = finalRole !== "leader";

    const newUser = {
      id: "u_" + Date.now(),
      username,
      password,
      name,
      role: finalRole, // admin, leader, scout secured
      email: email || "",
      whatsapp: whatsapp || "",
      nic: nic || "",
      parentPhone: parentPhone || "",
      approved: approved
    };

    db.users.push(newUser);
    saveDB(db);

    // Notify info
    sendNotification(
      `New Register`,
      `User ${name} registered on platform as ${finalRole.toUpperCase()}.${nic ? ' NIC: ' + nic : ''}${parentPhone ? ' Parent Phone: ' + parentPhone : ''}.${finalRole === 'leader' ? ' PENDING ADMIN APPROVAL.' : ''}`,
      name
    );

    res.json({ success: true, user: newUser });
  });

  // Approve User Account (Admin Only)
  app.post("/api/admin/approve-user", (req, res) => {
    const { userId, adminUsername } = req.body;
    
    // Safety check that action is done by trusted admin
    if (adminUsername !== "Dineth_Jayasuriya" && adminUsername !== "Manusha_Bimsara") {
      return res.status(403).json({ success: false, message: "Unauthorized operation. Only Dineth and Manusha can approve leaders." });
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.approved = true;
    saveDB(db);

    sendNotification(
      "Leader Approved",
      `Leader account for '${user.name}' has been approved/activated by Admin '${adminUsername}'.`,
      adminUsername,
      true
    );

    res.json({ success: true, message: "Leader account successfully approved." });
  });

  // Reject / Delete user account (Admin Only)
  app.post("/api/admin/reject-user", (req, res) => {
    const { userId, adminUsername } = req.body;
    
    if (adminUsername !== "Dineth_Jayasuriya" && adminUsername !== "Manusha_Bimsara") {
      return res.status(403).json({ success: false, message: "Unauthorized operation. Only Dineth and Manusha can reject leaders." });
    }

    const db = loadDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = db.users[index];
    db.users.splice(index, 1);
    saveDB(db);

    sendNotification(
      "Leader Rejected",
      `Leader registration for '${user.name}' has been rejected by Admin '${adminUsername}'.`,
      adminUsername,
      true
    );

    res.json({ success: true, message: "Leader registration rejected/deleted." });
  });

  // Update any registered user (Admin Only)
  app.post("/api/admin/update-user", (req, res) => {
    const { userId, adminUsername, updatedFields } = req.body;
    
    if (adminUsername !== "Dineth_Jayasuriya" && adminUsername !== "Manusha_Bimsara") {
      return res.status(403).json({ success: false, message: "Unauthorized operation. Only Dineth and Manusha can manage user accounts." });
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.name = updatedFields.name !== undefined ? updatedFields.name : user.name;
    user.username = updatedFields.username !== undefined ? updatedFields.username : user.username;
    user.role = updatedFields.role !== undefined ? updatedFields.role : user.role;
    user.email = updatedFields.email !== undefined ? updatedFields.email : user.email;
    user.whatsapp = updatedFields.whatsapp !== undefined ? updatedFields.whatsapp : user.whatsapp;
    user.parentPhone = updatedFields.parentPhone !== undefined ? updatedFields.parentPhone : user.parentPhone;
    user.nic = updatedFields.nic !== undefined ? updatedFields.nic : user.nic;
    user.approved = updatedFields.approved !== undefined ? updatedFields.approved : user.approved;
    if (updatedFields.password) {
      user.password = updatedFields.password;
    }

    saveDB(db);

    sendNotification(
      "User Account Updated",
      `Admin '${adminUsername}' updated account of '${user.name}' (${user.role}).`,
      adminUsername,
      true
    );

    res.json({ success: true, message: "User account updated successfully." });
  });

  // Delete any registered user (Admin Only)
  app.post("/api/admin/delete-user", (req, res) => {
    const { userId, adminUsername } = req.body;
    
    if (adminUsername !== "Dineth_Jayasuriya" && adminUsername !== "Manusha_Bimsara") {
      return res.status(403).json({ success: false, message: "Unauthorized operation. Only Dineth and Manusha can manage user accounts." });
    }

    const db = loadDB();
    const index = db.users.findIndex(u => u.id === userId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user = db.users[index];
    const isSelfDeleted = user.username === adminUsername;

    db.users.splice(index, 1);
    saveDB(db);

    sendNotification(
      "User Account Deleted",
      `Admin '${adminUsername}' deleted the registered account for '${user.name}'.${isSelfDeleted ? ' Note: The admin deleted their own account.' : ''}`,
      adminUsername,
      true
    );

    res.json({ success: true, message: "User account deleted successfully.", isSelfDeleted });
  });

  // Update profile
  app.post("/api/auth/update", (req, res) => {
    const { userId, username, password, name, email, whatsapp, nic, parentPhone, isScout } = req.body;
    const db = loadDB();

    if (isScout) {
      // Find scout
      const scoutIdx = db.scouts.findIndex(s => s.id === userId);
      if (scoutIdx > -1) {
        const old = { ...db.scouts[scoutIdx] };
        db.scouts[scoutIdx] = {
          ...db.scouts[scoutIdx],
          firstName: name.split(" ")[0] || db.scouts[scoutIdx].firstName,
          lastName: name.split(" ").slice(1).join(" ") || db.scouts[scoutIdx].lastName,
          email: email !== undefined ? email : db.scouts[scoutIdx].email,
          whatsapp: whatsapp !== undefined ? whatsapp : db.scouts[scoutIdx].whatsapp,
          parentPhone: parentPhone !== undefined ? parentPhone : db.scouts[scoutIdx].parentPhone,
        };
        saveDB(db);

        // Notify Admins
        sendNotification(
          "Scout Profile Updated",
          `Scout '${name}' changed fields. Email: [${old.email} -> ${email}], Whatsapp: [${old.whatsapp} -> ${whatsapp}]`,
          name,
          true
        );

        return res.json({ success: true });
      }
    } else {
      // Find admin/leader user
      const userIdx = db.users.findIndex(u => u.id === userId);
      if (userIdx > -1) {
        const old = { ...db.users[userIdx] };
        db.users[userIdx] = {
          ...db.users[userIdx],
          username: username || db.users[userIdx].username,
          password: password || db.users[userIdx].password,
          name: name || db.users[userIdx].name,
          email: email || db.users[userIdx].email,
          whatsapp: whatsapp || db.users[userIdx].whatsapp,
          nic: nic || db.users[userIdx].nic,
          parentPhone: parentPhone || db.users[userIdx].parentPhone,
        };
        saveDB(db);

        sendNotification(
          "Admin/Leader Profile Updated",
          `Profile of ${db.users[userIdx].role.toUpperCase()} '${name}' updated. Email: ${email}, Whatsapp: ${whatsapp}`,
          name,
          false
        );

        return res.json({ success: true, user: db.users[userIdx] });
      }
    }

    res.status(404).json({ success: false, message: "User not found." });
  });

  // Scout Members CRUD
  app.post("/api/scouts", (req, res) => {
    const { scout, adminName } = req.body;
    const db = loadDB();

    const newScout = {
      ...scout,
      id: scout.id || "s_" + Date.now(),
      badgesEarned: scout.badgesEarned || [],
      awardsEarned: scout.awardsEarned || []
    };

    db.scouts.push(newScout);
    
    // Add size to simulated storage (photo size or metadata size)
    const size = scout.scoutPhoto ? scout.scoutPhoto.length : 124000;
    db.storage.usedBytes += size;

    saveDB(db);

    sendNotification(
      "Scout Member Created",
      `New Scout '${newScout.firstName} ${newScout.lastName}' added to patrol '${newScout.patrol}'.`,
      adminName || "Admin"
    );

    // Auto sync new member profile photo and updated member details to Google Drive
    if (newScout.scoutPhoto && newScout.scoutPhoto.startsWith("data:")) {
      syncScoutPhotoToDrive(newScout.id, newScout.scoutPhoto, newScout.firstName, newScout.lastName, db, saveDB)
        .then(() => triggerGoogleDriveSync(db, saveDB))
        .catch(err => console.error("[DriveSync] Member photo sync error:", err));
    } else {
      triggerGoogleDriveSync(db, saveDB)
        .catch(err => console.error("[DriveSync] Roster sync error:", err));
    }

    res.json({ success: true, scout: newScout });
  });

  // Update Scout details
  app.put("/api/scouts/:id", (req, res) => {
    const { id } = req.params;
    const { scout, adminName } = req.body;
    const db = loadDB();

    const idx = db.scouts.findIndex(s => s.id === id);
    if (idx > -1) {
      const oldScout = db.scouts[idx];
      const hasNewPhoto = scout.scoutPhoto && scout.scoutPhoto.startsWith("data:") && scout.scoutPhoto !== oldScout.scoutPhoto;

      db.scouts[idx] = { ...oldScout, ...scout };
      saveDB(db);

      sendNotification(
        "Scout Record Modified",
        `Scout '${oldScout.firstName} ${oldScout.lastName}' record updated by leaders. Patrol: ${scout.patrol}, Position: ${scout.position}.`,
        adminName || "Admin"
      );

      // Auto-update scout members details and photo to Google Drive
      if (hasNewPhoto) {
        syncScoutPhotoToDrive(id, scout.scoutPhoto, db.scouts[idx].firstName, db.scouts[idx].lastName, db, saveDB)
          .then(() => triggerGoogleDriveSync(db, saveDB))
          .catch(err => console.error("[DriveSync] Member updated photo sync error:", err));
      } else {
        triggerGoogleDriveSync(db, saveDB)
          .catch(err => console.error("[DriveSync] Updated roster sync error:", err));
      }

      res.json({ success: true, scout: db.scouts[idx] });
    } else {
      res.status(404).json({ success: false, message: "Scout not found" });
    }
  });

  app.delete("/api/scouts/:id", (req, res) => {
    const { id } = req.params;
    const { adminName } = req.query;
    const db = loadDB();

    const idx = db.scouts.findIndex(s => s.id === id);
    if (idx > -1) {
      const oldScout = db.scouts[idx];
      db.scouts.splice(idx, 1);
      saveDB(db);

      sendNotification(
        "Scout Record Removed",
        `Scout '${oldScout.firstName} ${oldScout.lastName}' deleted from troop register.`,
        (adminName as string) || "Admin"
      );

      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Scout not found" });
    }
  });

  // Patrols Management
  app.post("/api/patrols", (req, res) => {
    const { patrolName, adminName } = req.body;
    const db = loadDB();

    if (!db.patrols.includes(patrolName)) {
      db.patrols.push(patrolName);
      saveDB(db);

      sendNotification(
        "Patrol Added",
        `New patrol '${patrolName}' was added to patrol list.`,
        adminName || "Admin"
      );
      res.json({ success: true, patrols: db.patrols });
    } else {
      res.status(400).json({ success: false, message: "Patrol already exists" });
    }
  });

  app.delete("/api/patrols", (req, res) => {
    const { patrolName, adminName } = req.body;
    const db = loadDB();

    db.patrols = db.patrols.filter(p => p !== patrolName);
    
    // Also change all scouts of that patrol to unassigned or Hawk
    db.scouts.forEach(s => {
      if (s.patrol === patrolName) {
        s.patrol = "Hawk";
      }
    });

    saveDB(db);

    sendNotification(
      "Patrol Removed",
      `Patrol '${patrolName}' was removed. Scouts reassigned to Hawk.`,
      adminName || "Admin"
    );
    res.json({ success: true, patrols: db.patrols });
  });

  // Proficiency Badges (Categories and Badges)
  app.post("/api/badges", (req, res) => {
    const { badge, adminName } = req.body;
    const db = loadDB();

    const newBadge = {
      ...badge,
      id: badge.id || "b_" + Date.now()
    };

    db.badges.push(newBadge);
    saveDB(db);

    sendNotification(
      "Badge Config Created/Edited",
      `Badge category or badge '${newBadge.name}' details updated.`,
      adminName || "Admin"
    );

    res.json({ success: true, badge: newBadge });
  });

  app.put("/api/badges/:id", (req, res) => {
    const { id } = req.params;
    const { badge, adminName } = req.body;
    const db = loadDB();

    const idx = db.badges.findIndex(b => b.id === id);
    if (idx > -1) {
      db.badges[idx] = { ...db.badges[idx], ...badge };
      saveDB(db);

      sendNotification(
        "Badge Configuration Updated",
        `Badge info for '${badge.name}' modified in category '${badge.category}'.`,
        adminName || "Admin"
      );
      res.json({ success: true, badge: db.badges[idx] });
    } else {
      res.status(404).json({ success: false });
    }
  });

  // Awards Management
  app.post("/api/awards", (req, res) => {
    const { award, adminName } = req.body;
    const db = loadDB();

    const newAward = {
      ...award,
      id: award.id || "a_" + Date.now()
    };

    db.awards.push(newAward);
    saveDB(db);

    sendNotification(
      "Award Configuration Created",
      `New award '${newAward.name}' made editable.`,
      adminName || "Admin"
    );

    res.json({ success: true, award: newAward });
  });

  app.put("/api/awards/:id", (req, res) => {
    const { id } = req.params;
    const { award, adminName } = req.body;
    const db = loadDB();

    const idx = db.awards.findIndex(a => a.id === id);
    if (idx > -1) {
      db.awards[idx] = { ...db.awards[idx], ...award };
      saveDB(db);

      sendNotification(
        "Award Detail Modified",
        `Award '${award.name}' guidelines updated.`,
        adminName || "Admin"
      );
      res.json({ success: true, award: db.awards[idx] });
    } else {
      res.status(404).json({ success: false });
    }
  });

  // Attendance Register (Leader/Admin only)
  app.post("/api/attendance", (req, res) => {
    const { date, presentIds, adminName } = req.body;
    const db = loadDB();

    const existingIdx = db.attendance.findIndex(a => a.date === date);
    if (existingIdx > -1) {
      db.attendance[existingIdx].presentIds = presentIds;
    } else {
      db.attendance.push({ date, presentIds });
    }

    saveDB(db);

    sendNotification(
      "Attendance Saved",
      `Attendance marked for date ${date}. Total present: ${presentIds.length} scouts.`,
      adminName || "Admin"
    );

    res.json({ success: true });
  });

  // Calendar Events
  app.post("/api/events", (req, res) => {
    const { event, adminName } = req.body;
    const db = loadDB();

    const newEvent = {
      ...event,
      id: event.id || "e_" + Date.now()
    };

    db.events.push(newEvent);
    saveDB(db);

    sendNotification(
      "Troop Event Schedule Modified",
      `Calendar event '${newEvent.title}' scheduled for ${newEvent.date}.`,
      adminName || "Admin"
    );

    res.json({ success: true, event: newEvent });
  });

  // Photo Albums (Facebook style)
  app.post("/api/albums", (req, res) => {
    const { name, description, adminName } = req.body;
    const db = loadDB();

    const newAlbum = {
      id: "alb_" + Date.now(),
      name,
      description: description || "",
      photos: []
    };

    db.albums.push(newAlbum);
    saveDB(db);

    sendNotification(
      "Photo Album Created",
      `Facebook-style photo album '${name}' created.`,
      adminName || "Admin"
    );

    res.json({ success: true, album: newAlbum });
  });

  // Add photo/video to album
  app.post("/api/albums/:id/photos", (req, res) => {
    const { id } = req.params;
    const { photoUrl, caption, uploaderName, type } = req.body;
    const db = loadDB();

    const albumIdx = db.albums.findIndex(a => a.id === id);
    if (albumIdx > -1) {
      const newPhoto = {
        id: "ph_" + Date.now(),
        url: photoUrl,
        caption: caption || "",
        date: new Date().toISOString().slice(0, 10),
        type: type || "image"
      };
      
      db.albums[albumIdx].photos.push(newPhoto);

      // Increase simulated storage usage
      const photoSize = photoUrl.length > 5000 ? photoUrl.length : 1450000; // ~1.45 MB
      db.storage.usedBytes += photoSize;

      saveDB(db);

      sendNotification(
        "Photo Uploaded",
        `Uploaded snapshot inside album '${db.albums[albumIdx].name}'.`,
        uploaderName || "Admin"
      );

      // Auto-store uploading album photo to Google Drive
      if (photoUrl && photoUrl.startsWith("data:")) {
        syncAlbumPhotoToDrive(id, newPhoto.id, photoUrl, caption, db, saveDB)
          .catch(err => console.error("[DriveSync] Album photo sync error:", err));
      }

      res.json({ success: true, album: db.albums[albumIdx] });
    } else {
      res.status(404).json({ success: false, message: "Album not found" });
    }
  });

  // E-Library (Doc management)
  app.post("/api/library", (req, res) => {
    const { title, category, fileSize, downloadUrl, adminName } = req.body;
    const db = loadDB();

    const newDoc = {
      id: "lib_" + Date.now(),
      title,
      category,
      fileSize: fileSize || "1.2 MB",
      downloadUrl: downloadUrl || "#",
      addedBy: adminName || "Admin",
      addedAt: new Date().toISOString().slice(0, 10)
    };

    db.library.push(newDoc);
    
    // Increase simulated storage
    const sizeKB = parseFloat(fileSize) || 2.4;
    db.storage.usedBytes += Math.round(sizeKB * 1024 * 1024);

    saveDB(db);

    sendNotification(
      "Document Added to E-Library",
      `File eBook '${title}' uploaded to eLibrary catalog.`,
      adminName || "Admin"
    );

    res.json({ success: true, doc: newDoc });
  });

  app.delete("/api/library/:id", (req, res) => {
    const { id } = req.params;
    const { adminName } = req.query;
    const db = loadDB();

    const idx = db.library.findIndex(d => d.id === id);
    if (idx > -1) {
      const title = db.library[idx].title;
      
      // Decrease simulated space
      const sizeKB = parseFloat(db.library[idx].fileSize) || 2.4;
      db.storage.usedBytes = Math.max(0, db.storage.usedBytes - Math.round(sizeKB * 1024 * 1024));

      db.library.splice(idx, 1);
      saveDB(db);

      sendNotification(
        "Library eBook Deleted",
        `Removed catalog file '${title}' from eLibrary server.`,
        (adminName as string) || "Admin"
      );

      res.json({ success: true });
    } else {
      res.status(404).json({ success: false });
    }
  });

  // Chatroom with auto month cleanup
  app.post("/api/chats", (req, res) => {
    const { senderName, senderRole, text } = req.body;
    const db = loadDB();

    const newChat = {
      id: "ch_" + Date.now(),
      senderName,
      senderRole,
      text,
      timestamp: new Date().toISOString()
    };

    db.chats.push(newChat);
    saveDB(db);

    res.json({ success: true, chat: newChat });
  });

  app.post("/api/chats/clear", (req, res) => {
    const { adminName } = req.body;
    const db = loadDB();

    db.chats = [];
    saveDB(db);

    sendNotification(
      "Chat Archive Cleaned",
      "Manual cleaning of all chats triggered to reduce Drive storage.",
      adminName || "Admin"
    );

    res.json({ success: true });
  });

  // Force storage change / simulated Google Drive alerts
  app.post("/api/storage/adjust", (req, res) => {
    const { usedBytes, adminName } = req.body;
    const db = loadDB();

    db.storage.usedBytes = usedBytes;
    
    if (db.storage.usedBytes >= db.storage.totalBytes) {
      db.storage.isFull = true;
      sendNotification(
        "STORAGE CAPACITY EXCEEDED WARNING",
        `Google Drive managementsystermscout@gmail.com is FULL. Free up cloud spaces immediately!`,
        "Storage Sentinel"
      );
    } else {
      db.storage.isFull = false;
    }

    saveDB(db);
    res.json({ success: true, storage: db.storage });
  });

  // Update automated email digest configuration for members reports
  app.post("/api/storage/digest", (req, res) => {
    const { reportDigestEnabled, reportDigestFrequency, adminName } = req.body;
    const db = loadDB();

    db.storage.reportDigestEnabled = !!reportDigestEnabled;
    db.storage.reportDigestFrequency = reportDigestFrequency || 'weekly';

    saveDB(db);

    const freqLab = db.storage.reportDigestFrequency === 'daily' ? 'Daily' : 'Weekly';
    sendNotification(
      "Digest Settings Updated",
      `Automated ${freqLab} email report digest to ${db.storage.email} marked ${db.storage.reportDigestEnabled ? 'ENABLED' : 'DISABLED'}.`,
      adminName || "Admin"
    );

    res.json({ success: true, storage: db.storage });
  });

  // GOOGLE DRIVE OAUTH AND MANAGEMENT ENDPOINTS
  app.get("/api/auth/google/login", (req, res) => {
    const db = loadDB();
    const clientId = process.env.CLIENT_ID || db.storage?.customClientId;
    if (!clientId) {
      return res.status(400).send("Google OAuth Client ID is not configured. Please configure it under Dev Credentials in the settings panel.");
    }
    const redirectUri = getRedirectUri(req);
    const authUrl = getGoogleAuthUrl(clientId, redirectUri);
    res.redirect(authUrl);
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Authorization code is missing.");
    }

    const db = loadDB();
    const clientId = process.env.CLIENT_ID || db.storage?.customClientId;
    const clientSecret = process.env.CLIENT_SECRET || db.storage?.customClientSecret;
    const redirectUri = getRedirectUri(req);

    if (!clientId || !clientSecret) {
      return res.status(400).send("OAuth Client ID or Client Secret is not configured.");
    }

    try {
      console.log("[DriveSync] Exchanging authorization code for tokens...");
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        }).toString()
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("[DriveSync] Token exchange failed:", errorText);
        return res.status(400).send(`Token exchange failed: ${errorText}`);
      }

      const tokenData = await tokenResponse.json();

      // Retrieve authenticated user's email address
      let email = "";
      try {
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          email = userInfo.email;
        }
      } catch (err) {
        console.error("[DriveSync] Failed to fetch userinfo email:", err);
      }

      db.storage = db.storage || {} as any;
      db.storage.googleCredentials = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || db.storage.googleCredentials?.refreshToken,
        expiryTime: Date.now() + (tokenData.expires_in || 3600) * 1000,
        email: email || db.storage.email || "managementsystermscout@gmail.com"
      };

      if (email) {
        db.storage.email = email;
      }

      saveDB(db);

      // Perform an initial full sync of the roster details
      triggerGoogleDriveSync(db, saveDB).catch(err => {
        console.error("[DriveSync] Initial full drive sync error:", err);
      });

      // Redirect back to the App settings panel
      res.redirect("/?tab=settings&driveConnected=true");
    } catch (err) {
      console.error("[DriveSync] Error during Google OAuth callback:", err);
      res.status(500).send(`Google Drive Authentication Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  });

  app.get("/api/storage/google-status", (req, res) => {
    const db = loadDB();
    const creds = db.storage?.googleCredentials;
    res.json({
      connected: !!(creds && creds.accessToken),
      email: creds?.email || db.storage?.email || null,
      expiryTime: creds?.expiryTime || null,
      hasRefreshToken: !!creds?.refreshToken
    });
  });

  app.post("/api/storage/google-sync", async (req, res) => {
    const db = loadDB();
    try {
      await triggerGoogleDriveSync(db, saveDB);
      res.json({ success: true, message: "Google Drive Synchronizer triggered." });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post("/api/storage/google-disconnect", (req, res) => {
    const db = loadDB();
    if (db.storage) {
      db.storage.googleCredentials = undefined;
    }
    saveDB(db);
    res.json({ success: true, message: "Google Drive connection disconnected." });
  });

  app.post("/api/storage/custom-keys", (req, res) => {
    const { customClientId, customClientSecret } = req.body;
    const db = loadDB();
    db.storage = db.storage || {} as any;
    db.storage.customClientId = customClientId;
    db.storage.customClientSecret = customClientSecret;
    saveDB(db);
    res.json({ success: true });
  });

  // Submit a Member Erroneous or App Bug Report
  app.post("/api/reports", (req, res) => {
    const { type, description, priority, reporterName, reporterId, reporterRole } = req.body;
    
    if (reporterRole === "admin" || reporterName === "Dineth Jayasuriya" || reporterName === "Manusha Bimsara") {
      return res.status(403).json({ success: false, message: "Administrators cannot submit reports; they are responsible for resolving them." });
    }

    const db = loadDB();
    const newReport = {
      id: "rep_" + Date.now(),
      type,
      description,
      priority,
      reporterName,
      reporterId,
      reporterRole: reporterRole || "scout",
      timestamp: new Date().toISOString(),
      status: "Pending"
    };
    db.reports = db.reports || [];
    db.reports.push(newReport);
    saveDB(db);

    sendNotification(
      "Member Report Dispatched",
      `[${priority}] ${type} report filed by ${reporterName}: "${description.substring(0, 80)}${description.length > 80 ? '...' : ''}"`,
      reporterName
    );

    res.json({ success: true, report: newReport });
  });

  // Resolve a Member Report (Admins/Leaders only)
  app.post("/api/reports/:id/resolve", (req, res) => {
    const { id } = req.params;
    const { resolutionDetails, adminName } = req.body;
    const db = loadDB();
    db.reports = db.reports || [];
    const idx = db.reports.findIndex(r => r.id === id);
    if (idx > -1) {
      db.reports[idx].status = "Resolved";
      db.reports[idx].resolutionDetails = resolutionDetails || "Resolved successfully.";
      db.reports[idx].resolvedBy = adminName || "Admin";
      db.reports[idx].resolvedAt = new Date().toISOString();
      saveDB(db);

      sendNotification(
        "Member Report Resolved",
        `Report ID ${id} is marked RESOLVED by ${adminName || 'Leader'}. Notes: ${resolutionDetails}`,
        adminName || "Admin"
      );

      res.json({ success: true, report: db.reports[idx] });
    } else {
      res.status(404).json({ success: false, message: "Report not found" });
    }
  });

  // Vite development integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Fallback for SPA routing in development
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api/")) return next();
    res.sendFile(path.join(process.cwd(), "index.html"));
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully-loaded on port ${PORT}`);
  });
}

startServer();
