package repository

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/lib/pq"
	"remdraw.com/server/model"
)

type FileRepository interface {
	Create(context.Context, *model.File) (string, error)
	Exists(context.Context, string) (bool, error)
	GetById(context.Context, string) (*model.File, error)
	Update(context.Context, *model.File) error
	Delete(context.Context, string) error
	ListBySceneId(context.Context, string) ([]model.File, error)
	ListByFileIds(context.Context, []string) ([]model.File, error)
}

type fileRepository struct {
	Conn *sql.DB
}

func NewFileRepository(db *sql.DB) FileRepository {
	return &fileRepository{Conn: db}
}

func (r *fileRepository) Create(ctx context.Context, file *model.File) (string, error) {
	query := `INSERT INTO public.file (id, user_id, scene_id, mime_type, cypher_key_iv, oss_key)
	          VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
	err := r.Conn.QueryRowContext(ctx, query, file.ID, file.UserID, file.SceneID, file.MimeType, file.CypherKeyAndIV, file.OssKey).Scan(&file.ID)
	if err != nil {
		return "", err
	}
	return file.ID, nil
}

func (r *fileRepository) GetById(ctx context.Context, id string) (*model.File, error) {
	query := `SELECT id, user_id, scene_id, mime_type, cypher_key_iv, oss_key, create_ts FROM public.file WHERE id = $1`
	row := r.Conn.QueryRowContext(ctx, query, id)

	var file model.File
	err := row.Scan(&file.ID, &file.UserID, &file.SceneID, &file.MimeType, &file.CypherKeyAndIV, &file.OssKey, &file.CreateTS)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &file, nil
}

func (r *fileRepository) Exists(ctx context.Context, id string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM public.file WHERE id = $1)`
	row := r.Conn.QueryRowContext(ctx, query, id)

	var exists bool
	err := row.Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil

}

func (r *fileRepository) ListBySceneId(ctx context.Context, sceneId string) ([]model.File, error) {
	query := `SELECT id, user_id, scene_id, mime_type, cypher_key_iv, oss_key, create_ts FROM public.file WHERE scene_id = $1`
	rows, err := r.Conn.QueryContext(ctx, query, sceneId)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(rows)

	var files []model.File
	for rows.Next() {
		var file model.File
		err := rows.Scan(&file.ID, &file.UserID, &file.SceneID, &file.MimeType, &file.CypherKeyAndIV, &file.OssKey, &file.CreateTS)
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}

func (r *fileRepository) Update(ctx context.Context, file *model.File) error {
	query := `UPDATE public.file SET user_id = $1, scene_id = $2, mime_type = $3, cypher_key_iv = $4, oss_key = $5, create_ts = $6 WHERE id = $7`
	_, err := r.Conn.ExecContext(ctx, query, file.UserID, file.SceneID, file.MimeType, file.CypherKeyAndIV, file.OssKey, file.CreateTS, file.ID)
	return err
}

func (r *fileRepository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM public.file WHERE id = $1`
	_, err := r.Conn.ExecContext(ctx, query, id)
	return err
}

func (r *fileRepository) ListByFileIds(ctx context.Context, fileIds []string) ([]model.File, error) {
	query := `SELECT id, user_id, scene_id, mime_type, cypher_key_iv, oss_key, create_ts FROM public.file WHERE id = ANY($1)`
	rows, err := r.Conn.QueryContext(ctx, query, pq.Array(fileIds))
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(rows)

	var files []model.File
	for rows.Next() {
		var file model.File
		err := rows.Scan(&file.ID, &file.UserID, &file.SceneID, &file.MimeType, &file.CypherKeyAndIV, &file.OssKey, &file.CreateTS)
		if err != nil {
			return nil, err
		}
		files = append(files, file)
	}
	return files, nil
}
