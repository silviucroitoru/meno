-- Questionnaire definitions (keyed by language)
CREATE TABLE questionnaires (
  language TEXT PRIMARY KEY,
  questionnaire JSONB NOT NULL
);

-- Submissions (replaces DynamoDB MenoScoreResponses)
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  language TEXT NOT NULL DEFAULT 'EN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ
);

-- Reports (replaces DynamoDB MenoReports)
CREATE TABLE reports (
  submission_id INTEGER PRIMARY KEY REFERENCES submissions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  menopause_report JSONB NOT NULL
);

-- Allow edge functions (service role) full access
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON questionnaires FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON reports FOR ALL USING (true) WITH CHECK (true);
