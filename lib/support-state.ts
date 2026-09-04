import fs from 'fs'
import path from 'path'

export interface SupportTicketMeta {
  conversationId: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority?: 'low' | 'medium' | 'high';
  adminNotes?: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'data')
const META_FILE = path.join(DATA_DIR, 'support_tickets_meta.json')

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('[Support Meta] Error creating data directory:', err)
  }
}

export function getAllTicketMeta(): Record<string, SupportTicketMeta> {
  try {
    ensureDir()
    if (fs.existsSync(META_FILE)) {
      const raw = fs.readFileSync(META_FILE, 'utf8')
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('[Support Meta] Error loading ticket meta:', err)
  }
  return {}
}

export function getTicketMeta(conversationId: string): SupportTicketMeta {
  const all = getAllTicketMeta()
  return all[conversationId] || {
    conversationId,
    status: 'open',
    priority: 'medium',
    updatedAt: new Date().toISOString()
  }
}

export function updateTicketMeta(conversationId: string, updates: Partial<SupportTicketMeta>): SupportTicketMeta {
  ensureDir()
  const all = getAllTicketMeta()
  const current = all[conversationId] || {
    conversationId,
    status: 'open',
    priority: 'medium',
    updatedAt: new Date().toISOString()
  }

  const updated: SupportTicketMeta = {
    ...current,
    ...updates,
    conversationId,
    updatedAt: new Date().toISOString()
  }

  all[conversationId] = updated

  try {
    fs.writeFileSync(META_FILE, JSON.stringify(all, null, 2), 'utf8')
  } catch (err) {
    console.error('[Support Meta] Error saving ticket meta:', err)
  }

  return updated
}
