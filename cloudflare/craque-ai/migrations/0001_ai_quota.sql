-- Sem historico de perguntas ou de cartas.
CREATE TABLE IF NOT EXISTS ai_quota (
  bucket TEXT PRIMARY KEY NOT NULL,
  reserved_micro_usd INTEGER NOT NULL DEFAULT 0 CHECK(reserved_micro_usd >= 0),
  calls INTEGER NOT NULL DEFAULT 0 CHECK(calls >= 0),
  updated_at TEXT NOT NULL
);
