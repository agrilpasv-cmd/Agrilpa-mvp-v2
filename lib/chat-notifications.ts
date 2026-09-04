import fs from 'fs'
import path from 'path'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendChatNotificationEmail, sendUnreadChatReminderEmail } from '@/lib/email'

interface UserPresence {
  lastSeen: number;
  inMessagesPage: boolean;
}

interface QueuedChatEmail {
  conversationId: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  productName: string;
  messageCount: number;
  firstMessageAt: number;
  scheduledSendAt: number;
  lastMessageSnippet: string;
}

interface ReminderRecord {
  conversationId: string;
  recipientId: string;
  lastReminderSentAt: number;
  reminderCount: number;
}

const DATA_DIR = path.join(process.cwd(), 'data')
const STATE_FILE = path.join(DATA_DIR, 'chat_notifications_state.json')

// In-memory caches with persistent disk backing
const userPresenceMap = new Map<string, UserPresence>()
const pendingEmailQueue = new Map<string, QueuedChatEmail>()
const reminderRecordsMap = new Map<string, ReminderRecord>()
const activeTimers = new Map<string, NodeJS.Timeout>()

// Helper to ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('[Chat Notifications] Error creating data directory:', err)
  }
}

// Save state to disk
function saveStateToDisk() {
  try {
    ensureDataDir()
    const state = {
      presences: Array.from(userPresenceMap.entries()),
      queuedEmails: Array.from(pendingEmailQueue.entries()),
      reminders: Array.from(reminderRecordsMap.entries()),
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8')
  } catch (err) {
    console.error('[Chat Notifications] Error saving state to disk:', err)
  }
}

// Load state from disk on startup
function loadStateFromDisk() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = fs.readFileSync(STATE_FILE, 'utf8')
      const state = JSON.parse(raw)
      if (Array.isArray(state.presences)) {
        state.presences.forEach(([k, v]: [string, UserPresence]) => userPresenceMap.set(k, v))
      }
      if (Array.isArray(state.queuedEmails)) {
        state.queuedEmails.forEach(([k, v]: [string, QueuedChatEmail]) => {
          pendingEmailQueue.set(k, v)
          // Re-schedule timers for pending jobs if still in the future
          const remainingMs = Math.max(5000, v.scheduledSendAt - Date.now())
          scheduleDebounceExecution(k, remainingMs)
        })
      }
      if (Array.isArray(state.reminders)) {
        state.reminders.forEach(([k, v]: [string, ReminderRecord]) => reminderRecordsMap.set(k, v))
      }
    }
  } catch (err) {
    console.error('[Chat Notifications] Error loading state from disk:', err)
  }
}

// Initialize on module load
loadStateFromDisk()

/**
 * Record a heartbeat from a user on the platform
 */
export function recordUserPresence(userId: string, inMessagesPage: boolean = false) {
  if (!userId) return
  userPresenceMap.set(userId, {
    lastSeen: Date.now(),
    inMessagesPage: Boolean(inMessagesPage),
  })
}

/**
 * Check if a user is considered actively online on the platform
 * (Active if heartbeat was received within the last 2.5 minutes)
 */
export function isUserActive(userId: string): boolean {
  if (!userId) return false
  const presence = userPresenceMap.get(userId)
  if (!presence) return false
  const ACTIVE_WINDOW_MS = 2.5 * 60 * 1000 // 2.5 minutes
  return Date.now() - presence.lastSeen < ACTIVE_WINDOW_MS
}

/**
 * Check if user is currently inside the Messages Dashboard
 */
export function isUserInMessagesPage(userId: string): boolean {
  if (!userId) return false
  const presence = userPresenceMap.get(userId)
  if (!presence) return false
  return presence.inMessagesPage && isUserActive(userId)
}

/**
 * Cancel any pending email for a conversation (e.g. when messages are read)
 */
export function cancelPendingChatEmail(conversationId: string, recipientId?: string) {
  for (const [key, job] of pendingEmailQueue.entries()) {
    if (job.conversationId === conversationId && (!recipientId || job.recipientId === recipientId)) {
      console.log(`[Chat Notifications] Cancelling queued email for conversation ${conversationId} (messages read/opened)`)
      const timer = activeTimers.get(key)
      if (timer) {
        clearTimeout(timer)
        activeTimers.delete(key)
      }
      pendingEmailQueue.delete(key)
    }
  }
  saveStateToDisk()
}

/**
 * Internal helper to schedule the timer for a queued email
 */
function scheduleDebounceExecution(queueKey: string, delayMs: number) {
  const existingTimer = activeTimers.get(queueKey)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  const timer = setTimeout(async () => {
    activeTimers.delete(queueKey)
    const job = pendingEmailQueue.get(queueKey)
    if (!job) return

    try {
      const adminClient = createAdminClient()

      // 1. Check if recipient has read the messages in DB
      const { count: unreadCount, error } = await adminClient
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', job.conversationId)
        .neq('sender_id', job.recipientId)
        .is('read_at', null)

      if (error) {
        console.error('[Chat Notifications] Error verifying unread count before send:', error)
      }

      if (!unreadCount || unreadCount === 0) {
        console.log(`[Chat Notifications] Debounce timeout reached for ${job.recipientEmail}, but messages were already read. Cancelling email.`)
        pendingEmailQueue.delete(queueKey)
        saveStateToDisk()
        return
      }

      // 2. Check if recipient is active on the platform now
      if (isUserActive(job.recipientId)) {
        console.log(`[Chat Notifications] Debounce timeout reached, but recipient ${job.recipientId} is currently active on the platform. Cancelling email.`)
        pendingEmailQueue.delete(queueKey)
        saveStateToDisk()
        return
      }

      // 3. User is still offline and messages are still unread -> Send ONE consolidated email!
      console.log(`[Chat Notifications] Sending 1 consolidated email to ${job.recipientEmail} (${job.messageCount} unread message(s)) after debounce.`)
      await sendChatNotificationEmail({
        recipientEmail: job.recipientEmail,
        recipientName: job.recipientName,
        senderName: job.senderName,
        productName: job.productName,
      })

      // Remove from queue
      pendingEmailQueue.delete(queueKey)
      saveStateToDisk()
    } catch (err) {
      console.error('[Chat Notifications] Error executing debounced email send:', err)
      pendingEmailQueue.delete(queueKey)
      saveStateToDisk()
    }
  }, delayMs)

  activeTimers.set(queueKey, timer)
}

/**
 * Queue or skip an email notification based on user online presence and 7-minute debounce rule
 */
export async function handleChatMessageNotification({
  conversationId,
  recipientId,
  recipientEmail,
  recipientName,
  senderName,
  productName,
  content,
}: {
  conversationId: string;
  recipientId: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  productName: string;
  content: string;
}) {
  // Condition A: If recipient is currently active/online on the platform, DO NOT send email!
  if (isUserActive(recipientId)) {
    console.log(`[Chat Notifications] Recipient ${recipientId} (${recipientEmail}) is currently ACTIVE/ONLINE. Skipping email notification to avoid spam.`)
    return { status: 'skipped_user_online' }
  }

  // Condition B: If recipient is offline, debounce for 7 minutes (between 5 and 10 minutes)
  const DEBOUNCE_DELAY_MS = 7 * 60 * 1000 // 7 minutes
  const queueKey = `${conversationId}_${recipientId}`
  const existingJob = pendingEmailQueue.get(queueKey)

  if (existingJob) {
    // Increment message count and keep debounce active
    existingJob.messageCount += 1
    existingJob.lastMessageSnippet = content
    console.log(`[Chat Notifications] Debouncing email: added message #${existingJob.messageCount} for ${recipientEmail}. Will send 1 consolidated email if unread in ~7 minutes.`)
  } else {
    // Create new debounce job
    const newJob: QueuedChatEmail = {
      conversationId,
      recipientId,
      recipientEmail,
      recipientName,
      senderName,
      productName,
      messageCount: 1,
      firstMessageAt: Date.now(),
      scheduledSendAt: Date.now() + DEBOUNCE_DELAY_MS,
      lastMessageSnippet: content,
    }
    pendingEmailQueue.set(queueKey, newJob)
    scheduleDebounceExecution(queueKey, DEBOUNCE_DELAY_MS)
    console.log(`[Chat Notifications] Recipient ${recipientEmail} is offline. Scheduled consolidated email in 7 minutes if not read.`)
  }

  saveStateToDisk()
  return { status: 'queued_debounced', sendAt: Date.now() + DEBOUNCE_DELAY_MS }
}

/**
 * 24-Hour Unread Message Reminder Job
 * Checks for conversations where the last message was sent over 24 hours ago and has not been read.
 * Sends a reminder email every 24 hours until the recipient reads the message.
 */
export async function checkAndSend24HourReminders(): Promise<{ sentCount: number; checkedCount: number }> {
  console.log('[Chat Reminders] Running 24-hour unread messages reminder check...')
  let sentCount = 0
  let checkedCount = 0

  try {
    const adminClient = createAdminClient()

    // 1. Fetch conversations with their last updated time
    const { data: convos, error: convError } = await adminClient
      .from('conversations')
      .select('id, product_id, buyer_id, seller_id, updated_at')
      .order('updated_at', { ascending: false })

    if (convError || !convos) {
      console.error('[Chat Reminders] Error fetching conversations:', convError)
      return { sentCount: 0, checkedCount: 0 }
    }

    checkedCount = convos.length
    const ONE_DAY_MS = 24 * 60 * 60 * 1000

    for (const conv of convos) {
      // Fetch the latest message in this conversation
      const { data: lastMsg } = await adminClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!lastMsg) continue

      // If last message has ALREADY been read, clean up any reminder record and continue
      if (lastMsg.read_at) {
        if (reminderRecordsMap.has(conv.id)) {
          reminderRecordsMap.delete(conv.id)
        }
        continue
      }

      // Check how long ago the unread message was sent
      const messageAgeMs = Date.now() - new Date(lastMsg.created_at).getTime()
      if (messageAgeMs < ONE_DAY_MS) {
        // Less than 24 hours old, skip
        continue
      }

      // The unread message is older than 24 hours!
      const recipientId = lastMsg.sender_id === conv.buyer_id ? conv.seller_id : conv.buyer_id
      const senderId = lastMsg.sender_id

      // Check if we already sent a reminder in the last 24 hours for this conversation
      const reminderKey = conv.id
      const existingReminder = reminderRecordsMap.get(reminderKey)
      if (existingReminder && Date.now() - existingReminder.lastReminderSentAt < ONE_DAY_MS) {
        // Already sent a reminder within the last 24 hours, skip until another 24 hours pass
        continue
      }

      // Fetch recipient, sender and product information
      const { data: recipientUser } = await adminClient
        .from('users')
        .select('id, email, full_name, company_name')
        .eq('id', recipientId)
        .maybeSingle()

      const { data: senderUser } = await adminClient
        .from('users')
        .select('id, full_name, company_name')
        .eq('id', senderId)
        .maybeSingle()

      const { data: productData } = await adminClient
        .from('user_products')
        .select('title')
        .eq('id', conv.product_id)
        .maybeSingle()

      if (!recipientUser?.email) continue

      const recipientName = recipientUser.company_name || recipientUser.full_name || "Usuario"
      const senderName = senderUser?.company_name || senderUser?.full_name || "Un usuario de Agrilpa"
      const productName = productData?.title || "Producto de interés"
      const hoursWaiting = Math.floor(messageAgeMs / (1000 * 60 * 60))

      console.log(`[Chat Reminders] Sending 24h reminder to ${recipientUser.email} for unread message from ${senderName} (${hoursWaiting}h waiting).`)

      await sendUnreadChatReminderEmail({
        recipientEmail: recipientUser.email,
        recipientName,
        senderName,
        productName,
        hoursWaiting,
      })

      // Update reminder state
      reminderRecordsMap.set(reminderKey, {
        conversationId: conv.id,
        recipientId,
        lastReminderSentAt: Date.now(),
        reminderCount: (existingReminder?.reminderCount || 0) + 1,
      })

      sentCount++
    }

    saveStateToDisk()
    console.log(`[Chat Reminders] Completed check: ${sentCount} reminders sent out of ${checkedCount} conversations inspected.`)
  } catch (err) {
    console.error('[Chat Reminders] Error during 24h reminders execution:', err)
  }

  return { sentCount, checkedCount }
}

// Automatically start background interval for 24h reminder checks (every 30 minutes)
if (typeof globalThis !== 'undefined' && !(globalThis as any).__agrilpaReminderInterval) {
  const CHECK_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes
  ;(globalThis as any).__agrilpaReminderInterval = setInterval(() => {
    checkAndSend24HourReminders().catch(err => {
      console.error('[Chat Reminders] Background interval error:', err)
    })
  }, CHECK_INTERVAL_MS)
}

