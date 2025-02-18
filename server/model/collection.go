package model

import (
	"github.com/google/uuid"
	"time"
)

type Collection struct {
	ID        uuid.UUID   `json:"id"`
	UserID    uuid.UUID   `json:"user_id"`
	Name      string      `json:"name"`
	Order     int         `json:"order"`
	SceneList []uuid.UUID `json:"scene_list"`
	CreateAt  time.Time   `json:"create_at"`
	UpdateAt  time.Time   `json:"update_at"`
}
