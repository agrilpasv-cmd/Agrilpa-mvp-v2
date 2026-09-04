import fs from 'fs'
import path from 'path'

export interface AdminSeenRecord {
  conversationId: string;
  seenAt: string;
  isUnseenManual?: boolean;
}

const DATA_DIR = path.join(process.cwd(), 'data')
const SEEN_FILE = path.join(DATA_DIR, 'admin_conversations_seen.json')

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('[Admin Chat Seen] Error creating data directory:', err)
  }
}

export function getAllAdminSeen(): Record<string, AdminSeenRecord> {
  try {
    ensureDir()
    if (fs.existsSync(SEEN_FILE)) {
      const raw = fs.readFileSync(SEEN_FILE, 'utf8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('[Admin Chat Seen] Error reading seen file:', err)
  }
  return {}
}

export function markConversationAdminSeen(conversationId: string, seen = true): AdminSeenRecord {
  ensureDir()
  const all = getAllAdminSeen()

  const record: AdminSeenRecord = {
    conversationId,
    seenAt: seen ? new Date().toISOString() : '1970-01-01T00:00:00.000Z',
    isUnseenManual: !seen
  }

  all[conversationId] = record

  try {
    fs.writeFileSync(SEEN_FILE, JSON.stringify(all, null, 2), 'utf8')
  } catch (err) {
    console.error('[Admin Chat Seen] Error saving seen record:', err)
  }

  return record
}

export function isConversationSeenByAdmin(conversationId: string, lastMessageDate?: string | null): boolean {
  const all = getAllAdminSeen()
  const record = all[conversationId]

  // If manually marked as unseen:
  if (record?.isUnseenManual) {
    return false
  }

  // If never seen:
  if (!record || !record.seenAt) {
    return false
  }

  // If there are messages and the last message was created after the admin last viewed it:
  if (lastMessageDate) {
    const lastMsgTime = new Date(lastMessageDate).getTime()
    const seenTime = new Date(record.seenAt).getTime()
    if (lastMsgTime > seenTime) {
      return false
    }
  }

  return true
}
