package repository

import (
	"context"
	"database/sql"
	"errors"
	"github.com/google/uuid"
)

type SceneCoverRepository interface {
	InsertOrUpdateCover(ctx context.Context, sceneID uuid.UUID, userID uuid.UUID, coverData []byte, etag string) error
	GetCover(ctx context.Context, sceneID uuid.UUID) ([]byte, error)
}

type sceneCoverRepository struct {
	DB *sql.DB
}

func NewSceneCoverRepository(db *sql.DB) SceneCoverRepository {
	return &sceneCoverRepository{DB: db}
}

func (repo *sceneCoverRepository) InsertOrUpdateCover(ctx context.Context, sceneID uuid.UUID, userID uuid.UUID, coverData []byte, etag string) error {
	_, err := repo.DB.ExecContext(ctx, "INSERT INTO public.scene_cover (scene_id, user_id, data, etag) VALUES ($1, $2, $3, $4) ON CONFLICT (scene_id) DO UPDATE SET data = EXCLUDED.data, etag = EXCLUDED.etag", sceneID, userID, coverData, etag)
	return err
}

func (repo *sceneCoverRepository) GetCover(ctx context.Context, sceneID uuid.UUID) ([]byte, error) {
	var coverData []byte
	err := repo.DB.QueryRowContext(ctx, "SELECT data FROM scene_cover WHERE scene_id = $1", sceneID).Scan(&coverData)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return coverData, nil
}
