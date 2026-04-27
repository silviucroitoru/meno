-- Clone the Romanian questionnaire into Serbian (SR) as a starting point.
-- This keeps SR content identical to RO until translated.

INSERT INTO questionnaires (language, questionnaire)
SELECT 'SR', q.questionnaire
FROM questionnaires q
WHERE q.language = 'RO'
ON CONFLICT (language) DO NOTHING;

