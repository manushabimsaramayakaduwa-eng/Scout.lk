import path from "path";

// Helper to get Google Drive OAuth Authorization URL
export function getGoogleAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent"
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// Get Redirect URI matching AI Studio's dynamic runtime port configurations
export function getRedirectUri(req: any): string {
  if (process.env.APP_URL) {
    const base = process.env.APP_URL.replace(/\/$/, "");
    return `${base}/api/auth/google/callback`;
  }
  const host = req.get("host");
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  return `${protocol}://${host}/api/auth/google/callback`;
}

// Refresh Google Drive OAuth Access Token if expired
export async function getValidGoogleToken(db: any, saveDBCallback: (db: any) => void): Promise<string | null> {
  const creds = db.storage?.googleCredentials;
  if (!creds || !creds.accessToken) {
    return null;
  }

  // Token is still valid (with 1-minute buffer), return it
  if (creds.expiryTime && Date.now() < creds.expiryTime - 60000) {
    return creds.accessToken;
  }

  // If we have a refresh token, auto-refresh it
  if (creds.refreshToken) {
    try {
      const clientId = process.env.CLIENT_ID || db.storage.customClientId;
      const clientSecret = process.env.CLIENT_SECRET || db.storage.customClientSecret;
      if (!clientId || !clientSecret) {
        console.error("[DriveSync] Missing OAuth client credentials to refresh token");
        return null;
      }

      console.log("[DriveSync] Access token expired, refreshing via Google OAuth token endpoint...");
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: creds.refreshToken,
          grant_type: "refresh_token"
        }).toString()
      });

      if (response.ok) {
        const data = await response.json();
        creds.accessToken = data.access_token;
        if (data.expires_in) {
          creds.expiryTime = Date.now() + data.expires_in * 1000;
        }
        db.storage.googleCredentials = creds;
        saveDBCallback(db);
        console.log("[DriveSync] Token refresh successful. Google Drive connection is active.");
        return data.access_token;
      } else {
        const errText = await response.text();
        console.error("[DriveSync] Failed to refresh Google Drive access token:", errText);
      }
    } catch (err) {
      console.error("[DriveSync] Error while refreshing Google Drive token:", err);
    }
  }

  return null;
}

// Get existing folder or create a new one in Google Drive
export async function getOrCreateFolder(accessToken: string, folderName: string, parentId?: string): Promise<string | null> {
  try {
    let q = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }

    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`;
    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (searchResponse.ok) {
      const data = await searchResponse.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create the folder
    const metadata: any = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder"
    };
    if (parentId) {
      metadata.parents = [parentId];
    }

    const createResponse = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(metadata)
    });

    if (createResponse.ok) {
      const data = await createResponse.json();
      console.log(`[DriveSync] Created directory: "${folderName}" (ID: ${data.id})`);
      return data.id;
    } else {
      const errText = await createResponse.text();
      console.error(`[DriveSync] Failed to create directory "${folderName}":`, errText);
    }
  } catch (err) {
    console.error(`[DriveSync] Error in getOrCreateFolder for "${folderName}":`, err);
  }
  return null;
}

// Ensure the main folder and subfolders structure in Google Drive
export async function ensureDriveFolderStructure(accessToken: string) {
  const mainFolderId = await getOrCreateFolder(accessToken, "TroopTrack Colombo Scouts");
  if (!mainFolderId) return null;

  const memberPhotosFolderId = await getOrCreateFolder(accessToken, "Member Profile Photos", mainFolderId);
  const albumsFolderId = await getOrCreateFolder(accessToken, "Photo Albums", mainFolderId);

  return {
    mainFolderId,
    memberPhotosFolderId: memberPhotosFolderId || mainFolderId,
    albumsFolderId: albumsFolderId || mainFolderId
  };
}

// Upload a generic file using Google Drive Multipart API
export async function googleDriveUploadFile({
  accessToken,
  fileName,
  mimeType,
  parentFolderId,
  contentBuffer
}: {
  accessToken: string;
  fileName: string;
  mimeType: string;
  parentFolderId?: string;
  contentBuffer: Buffer;
}): Promise<string | null> {
  try {
    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = "-------314159265358979323846";
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelim = `\r\n--${boundary}--`;

    const metadataPart = JSON.stringify(metadata);
    const base64Body = contentBuffer.toString("base64");

    const payloadHeader = 
      `${delimiter}` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${metadataPart}` +
      `${delimiter}` +
      `Content-Type: ${mimeType}\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n`;

    const payloadFooter = `${closeDelim}`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(payloadHeader, "utf-8"),
      Buffer.from(base64Body, "utf-8"),
      Buffer.from(payloadFooter, "utf-8")
    ]);

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: bodyBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[DriveSync] Upload failed for ${fileName}:`, errText);
      return null;
    }

    const fileData = await response.json();
    console.log(`[DriveSync] File uploaded successfully: "${fileName}" (ID: ${fileData.id})`);
    return fileData.id;
  } catch (err) {
    console.error(`[DriveSync] Error during direct file upload:`, err);
    return null;
  }
}

// Search for a file in Google Drive by its name and parent ID
export async function getFileIdByName(accessToken: string, fileName: string, parentId: string): Promise<string | null> {
  try {
    const q = `name = '${fileName}' and trashed = false and '${parentId}' in parents`;
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }
  } catch (err) {
    console.error(`[DriveSync] Error search file by name:`, err);
  }
  return null;
}

// Update existing file content on Google Drive (overwrites)
export async function googleDriveUpdateFileContent(accessToken: string, fileId: string, mimeType: string, contentBuffer: Buffer): Promise<boolean> {
  try {
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": mimeType
      },
      body: contentBuffer
    });
    if (res.ok) {
      console.log(`[DriveSync] File content updated: File ID ${fileId}`);
      return true;
    } else {
      const errText = await res.text();
      console.error(`[DriveSync] Failed to patch file content for ID ${fileId}:`, errText);
    }
  } catch (err) {
    console.error(`[DriveSync] Error patching file contents:`, err);
  }
  return false;
}

// Sync all Scout members roster database to Google Drive files
export async function triggerGoogleDriveSync(db: any, saveDBCallback: (db: any) => void) {
  const token = await getValidGoogleToken(db, saveDBCallback);
  if (!token) return;

  try {
    const folders = await ensureDriveFolderStructure(token);
    if (!folders) return;

    // 1. Generate Scout Members JSON
    const scoutsJson = JSON.stringify(db.scouts, null, 2);
    const scoutsJsonBuffer = Buffer.from(scoutsJson, "utf-8");

    const jsonFileId = await getFileIdByName(token, "Scout_Members_Details.json", folders.mainFolderId);
    if (jsonFileId) {
      await googleDriveUpdateFileContent(token, jsonFileId, "application/json", scoutsJsonBuffer);
    } else {
      await googleDriveUploadFile({
        accessToken: token,
        fileName: "Scout_Members_Details.json",
        mimeType: "application/json",
        parentFolderId: folders.mainFolderId,
        contentBuffer: scoutsJsonBuffer
      });
    }

    // 2. Generate printable/readable roster list
    let readableRoster = `========================================================================\n`;
    readableRoster += `             COLOMBO 51ST SCOUT TROOP - REGISTER ROSTER DATA            \n`;
    readableRoster += `         Auto-Synced to Google Drive: ${new Date().toISOString()}\n`;
    readableRoster += `========================================================================\n\n`;

    db.scouts.forEach((scout: any, idx: number) => {
      readableRoster += `${idx + 1}. ${scout.firstName.toUpperCase()} ${scout.lastName.toUpperCase()}\n`;
      readableRoster += `   - ID/Membership : ${scout.id} / ${scout.membershipNo || "N/A"}\n`;
      readableRoster += `   - Patrol/Unit   : ${scout.patrol}\n`;
      readableRoster += `   - Position      : ${scout.position || "Member"}\n`;
      readableRoster += `   - DOB           : ${scout.dob}\n`;
      readableRoster += `   - Parent Info   : ${scout.parentName || "N/A"} (${scout.parentPhone || "N/A"})\n`;
      readableRoster += `   - Contacts      : Whatsapp: ${scout.whatsapp || "N/A"} | Email: ${scout.email || "N/A"}\n`;
      readableRoster += `   - Badges Earned : ${scout.badgesEarned ? scout.badgesEarned.join(", ") : "None"}\n`;
      readableRoster += `   - Awards Earned : ${scout.awardsEarned ? scout.awardsEarned.join(", ") : "None"}\n`;
      readableRoster += `   --------------------------------------------------------------------\n\n`;
    });

    const readableBuffer = Buffer.from(readableRoster, "utf-8");
    const txtFileId = await getFileIdByName(token, "Scout_Members_Details_Printable.txt", folders.mainFolderId);
    if (txtFileId) {
      await googleDriveUpdateFileContent(token, txtFileId, "text/plain", readableBuffer);
    } else {
      await googleDriveUploadFile({
        accessToken: token,
        fileName: "Scout_Members_Details_Printable.txt",
        mimeType: "text/plain",
        parentFolderId: folders.mainFolderId,
        contentBuffer: readableBuffer
      });
    }

    // Capture success in Audit Logs without duplicating sync
    db.auditLogs.push({
      id: "log_" + Date.now(),
      action: "Drive Sync: Member Roster",
      details: "Auto-synchronized Member Details JSON and text roster to Google Drive.",
      timestamp: new Date().toISOString(),
      user: "Google Drive Sync",
      notifiedEmail: false,
      notifiedWhatsapp: false
    });
    saveDBCallback(db);

    console.log("[DriveSync] Scout database successfully synchronized to Google Drive.");
  } catch (err) {
    console.error("[DriveSync] Failed to sync scout members roster to Google Drive:", err);
  }
}

// Sync uploaded Member Profile Photo to Google Drive
export async function syncScoutPhotoToDrive(
  scoutId: string,
  photoBase64: string,
  firstName: string,
  lastName: string,
  db: any,
  saveDBCallback: (db: any) => void
) {
  const token = await getValidGoogleToken(db, saveDBCallback);
  if (!token) return;

  try {
    const folders = await ensureDriveFolderStructure(token);
    if (!folders) return;

    // Check if the photo is actually base64
    const matches = photoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
      return; // Not a base64 string
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const contentBuffer = Buffer.from(base64Data, "base64");

    // File name extension selection
    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("jpeg")) ext = "jpeg";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("webp")) ext = "webp";

    const fileName = `${firstName}_${lastName}_photo_${scoutId}.${ext}`;

    const fileId = await googleDriveUploadFile({
      accessToken: token,
      fileName,
      mimeType,
      parentFolderId: folders.memberPhotosFolderId,
      contentBuffer
    });

    if (fileId) {
      // Record info in audit logs
      db.auditLogs.push({
        id: "log_" + Date.now(),
        action: "Drive Sync: Member Photo",
        details: `Profile picture for member '${firstName} ${lastName}' successfully saved to Google Drive.`,
        timestamp: new Date().toISOString(),
        user: "Google Drive Sync",
        notifiedEmail: false,
        notifiedWhatsapp: false
      });

      // Update the scout entry in DB to store Google Drive File ID
      const scoutIdx = db.scouts.findIndex((s: any) => s.id === scoutId);
      if (scoutIdx > -1) {
        db.scouts[scoutIdx].drivePhotoId = fileId;
      }
      saveDBCallback(db);
    }
  } catch (err) {
    console.error(`[DriveSync] Error syncing profile photo for ${firstName}:`, err);
  }
}

// Sync uploaded Album Photo to Google Drive
export async function syncAlbumPhotoToDrive(
  albumId: string,
  photoId: string,
  photoUrl: string,
  caption: string,
  db: any,
  saveDBCallback: (db: any) => void
) {
  const token = await getValidGoogleToken(db, saveDBCallback);
  if (!token) return;

  try {
    const folders = await ensureDriveFolderStructure(token);
    if (!folders) return;

    const album = db.albums.find((a: any) => a.id === albumId);
    if (!album) return;

    // Check if the photo is actually base64
    const matches = photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
      return; // Not base64
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const contentBuffer = Buffer.from(base64Data, "base64");

    let ext = "jpg";
    if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("jpeg")) ext = "jpeg";
    else if (mimeType.includes("gif")) ext = "gif";
    else if (mimeType.includes("webp")) ext = "webp";

    const safeAlbumName = album.name.replace(/[^a-zA-Z0-9_ -]/g, "");
    const albumFolderId = await getOrCreateFolder(token, safeAlbumName, folders.albumsFolderId);
    if (!albumFolderId) return;

    const sanitizedCaption = caption ? caption.slice(0, 30).replace(/[^a-zA-Z0-9_ -]/g, "") : "";
    const fileName = sanitizedCaption 
      ? `${sanitizedCaption}_${photoId}.${ext}`
      : `photo_${photoId}.${ext}`;

    const fileId = await googleDriveUploadFile({
      accessToken: token,
      fileName,
      mimeType,
      parentFolderId: albumFolderId,
      contentBuffer
    });

    if (fileId) {
      db.auditLogs.push({
        id: "log_" + Date.now(),
        action: "Drive Sync: Album Photo",
        details: `Saved snapshot to Album directory "${safeAlbumName}" inside Google Drive.`,
        timestamp: new Date().toISOString(),
        user: "Google Drive Sync",
        notifiedEmail: false,
        notifiedWhatsapp: false
      });

      // Update photo record
      const albumIdx = db.albums.findIndex((a: any) => a.id === albumId);
      if (albumIdx > -1) {
        const photoIdx = db.albums[albumIdx].photos.findIndex((p: any) => p.id === photoId);
        if (photoIdx > -1) {
          db.albums[albumIdx].photos[photoIdx].driveFileId = fileId;
        }
      }
      saveDBCallback(db);
    }
  } catch (err) {
    console.error(`[DriveSync] Error syncing photo to Album ${albumId}:`, err);
  }
}
