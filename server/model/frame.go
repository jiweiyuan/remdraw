package model

import (
	"encoding/json"
	"github.com/google/uuid"
	"github.com/open-spaced-repetition/go-fsrs"
	"time"
)

type Frame struct {
	ID             string     `json:"id"`
	SceneID        uuid.UUID  `json:"scene_id"`
	UserID         uuid.UUID  `json:"user_id"`
	CardDue        time.Time  `json:"card_due,omitempty"`
	CardStability  float64    `json:"card_stability,omitempty"`
	CardDifficulty float64    `json:"card_difficulty,omitempty"`
	CardReps       uint64     `json:"card_reps,omitempty"`
	CardLapses     uint64     `json:"card_lapses,omitempty"`
	CardState      fsrs.State `json:"card_state,omitempty"`
	CardLastReview time.Time  `json:"card_last_review,omitempty"`
	CreateTs       time.Time  `json:"create_ts,omitempty"`
	Now            time.Time  `json:"now,omitempty"`
}

type FrameData struct {
	ID       string          `json:"id"`
	SceneID  uuid.UUID       `json:"scene_id"`
	Elements json.RawMessage `json:"elements"`
	Files    []File          `json:"files"`
}

type FrameLog struct {
	ID                uuid.UUID  `json:"id"`
	FrameID           string     `json:"frame_id"`
	UserID            uuid.UUID  `json:"user_id"`
	CardRating        int        `json:"card_rating"`
	CardScheduledDays uint64     `json:"card_scheduled_days"`
	CardElapsedDays   uint64     `json:"card_elapsed_days"`
	CardReview        time.Time  `json:"card_review"`
	CardState         fsrs.State `json:"state"`
}

type FrameQuery struct {
	UserID int
	Goal   string
	Limit  int
	Offset int
}

type TaggingRequest struct {
	Text  string   `json:"text"`
	Model string   `json:"model"`
	Tags  []string `json:"tags"`
}

type FrameReviewResponse struct {
	Frame      *Frame                              `json:"frame"`
	Elements   json.RawMessage                     `json:"elements"`
	Scheduling map[fsrs.Rating]fsrs.SchedulingInfo `json:"scheduling"`
	Files      []File                              `json:"files"`
}
