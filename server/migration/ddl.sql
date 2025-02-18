DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "scene" CASCADE;
DROP TABLE IF EXISTS "scene_cover";
DROP TABLE IF EXISTS "file";
DROP TABLE IF EXISTS "frame" CASCADE;
DROP TABLE IF EXISTS "frame_review_log";
DROP TABLE IF EXISTS "collection";

CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role SMALLINT, /* 1: admin, 2: unverified, 3: free, 4: premium */
    create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_ts TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_user_email ON "user"(email);

CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_ts = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER user_update_ts
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp_column();

CREATE TABLE IF NOT EXISTS "scene" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    elements JSONB NOT NULL,
    app_state JSONB NOT NULL,
    last_visited TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_name ON scene(name);
CREATE INDEX idx_scene_user_id ON scene(user_id);
CREATE TRIGGER whiteboard_update_ts
    BEFORE UPDATE ON "scene"
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE TABLE IF NOT EXISTS "scene_cover" (
    scene_id UUID PRIMARY KEY REFERENCES "scene"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id),
    data BYTEA NOT NULL,
    etag VARCHAR(255),
    create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scene_cover_user_id ON scene_cover(user_id);
CREATE TRIGGER scene_cover_update_ts
    BEFORE UPDATE ON "scene_cover"
    FOR EACH ROW
EXECUTE FUNCTION update_timestamp_column();

CREATE TABLE IF NOT EXISTS "file" (
  id VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES "user"(id),
  scene_id UUID NOT NULL REFERENCES "scene"(id) ON DELETE CASCADE,
  mime_type VARCHAR(255) NOT NULL,
  cypher_key_iv TEXT NOT NULL,
  oss_key TEXT NOT NULL,
  create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_file_user_id ON file(user_id);
CREATE INDEX idx_file_scene_id ON file(scene_id);

CREATE TABLE IF NOT EXISTS "frame" (
    id VARCHAR(255) PRIMARY KEY,
    scene_id UUID NOT NULL REFERENCES "scene"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id),
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    card_due TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    card_stability DOUBLE PRECISION NOT NULL DEFAULT 0,
    card_difficulty DOUBLE PRECISION NOT NULL DEFAULT 0,
    card_reps INTEGER NOT NULL DEFAULT 0,
    card_lapses INTEGER NOT NULL DEFAULT 0,
    card_state SMALLINT NOT NULL DEFAULT 0,
    card_last_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_frame_scene_id ON frame(scene_id);
CREATE INDEX idx_frame_user_id ON frame(user_id);
CREATE Trigger frame_update_ts
    BEFORE UPDATE ON "frame"
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

CREATE TABLE IF NOT EXISTS "frame_review_log" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id VARCHAR(255) NOT NULL REFERENCES "frame"(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    card_rating INTEGER,
    card_scheduled_days INTEGER,
    card_elapsed_days INTEGER,
    card_review TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    card_state SMALLINT
);
CREATE INDEX idx_frame_review_log_frame_id ON frame_review_log(frame_id);
CREATE INDEX idx_frame_review_log_user_id ON frame_review_log(user_id);

CREATE TABLE IF NOT EXISTS "collection" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    collection_order INT,
    scene_array UUID ARRAY DEFAULT '{}',
    create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    update_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_collection_user_id ON collection(user_id);
CREATE TRIGGER collection_update_ts
    BEFORE UPDATE ON "collection"
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();

DROP TABLE IF EXISTS "waitlist";
CREATE TABLE IF NOT EXISTS "waitlist" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(255),
  create_ts TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_ip_address ON waitlist(ip_address);
