package model

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Scene struct {
	ID          uuid.UUID       `json:"id" db:"id"`
	UserID      uuid.UUID       `json:"user_id" db:"user_id"`
	Name        string          `json:"name" db:"name"`
	Key         string          `json:"key" db:"key"`
	Version     int             `json:"version" db:"version"`
	Elements    json.RawMessage `json:"elements" db:"elements"` // JSONB can be handled as string or a custom type
	AppState    json.RawMessage `json:"app_state" db:"app_state"`
	Files       []File          `json:"files"`
	CoverOSSKey string          `json:"cover_oss_key" db:"cover"`
	LastVisited time.Time       `json:"last_visited" db:"last_visited"`
	CreateTS    time.Time       `json:"create_ts" db:"create_ts"`
	UpdateTS    time.Time       `json:"update_ts" db:"update_ts"`
	CoverEtag   string          `json:"cover_etag" db:"cover_etag"`
}

type SceneRenameRequest struct {
	ID   uuid.UUID `json:"id" db:"id"`
	Name string    `json:"name" db:"name"`
}

type SceneUpdateRequest struct {
	ID            uuid.UUID       `json:"id" db:"id"`
	UserID        uuid.UUID       `json:"user_id" db:"user_id"`
	Name          string          `json:"name" db:"name"`
	Elements      json.RawMessage `json:"elements" db:"elements"`
	AppState      json.RawMessage `json:"app_state" db:"app_state"`
	Version       int             `json:"version" db:"version"`
	CreatedFrames []string        `json:"created_frames"`
	DeletedFrames []string        `json:"deleted_frames"`
}

type File struct {
	ID             string    `json:"id" db:"id"`
	UserID         uuid.UUID `json:"user_id" db:"user_id"`
	SceneID        uuid.UUID `json:"scene_id" db:"scene_id"`
	MimeType       string    `json:"mimeType" db:"mime_type"`
	CypherKeyAndIV string    `json:"cypher_key_iv" db:"cypher_key_iv"`
	OssKey         string    `json:"oss_key" db:"oss_key"`
	DataURL        string    `json:"dataURL"`
	CreateTS       time.Time `json:"create_ts" db:"create_ts"`
}

type SceneQuery struct {
	UserID uuid.UUID `json:"user_id" form:"user_id"`
	Name   string    `json:"name" form:"name"`
}
