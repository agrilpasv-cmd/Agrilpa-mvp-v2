-- =====================================================
-- Table: account_deletion_reports
-- Stores deletion reason when a user deletes their account
-- =====================================================
CREATE TABLE IF NOT EXISTS public.account_deletion_reports (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,                          -- nullable, user is deleted immediately after
    user_email      TEXT NOT NULL,
    reason          TEXT NOT NULL,                 -- predefined label or "Otra razón"
    custom_reason   TEXT,                          -- free-text if reason = "Otra razón"
    deleted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for dashboard queries
CREATE INDEX IF NOT EXISTS idx_deletion_reports_deleted_at
    ON public.account_deletion_reports (deleted_at DESC);

-- Row level security (admin-only read)
ALTER TABLE public.account_deletion_reports ENABLE ROW LEVEL SECURITY;

-- Policy: only service role / admin can read/insert (API uses service role via admin client)
CREATE POLICY "Admin full access on deletion reports"
    ON public.account_deletion_reports
    USING (true)
    WITH CHECK (true);
