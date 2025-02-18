package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"remdraw.com/server/model"
)

type SceneRepository interface {
	Create(context.Context, *model.Scene) (uuid.UUID, error)
	GetById(context.Context, uuid.UUID) (*model.Scene, error)
	SaveScene(context.Context, *model.Scene) (int, error)
	SaveSceneWithFrames(context.Context, *model.Scene, []string, []string) (int, error)
	Delete(context.Context, uuid.UUID) error
	Query(context.Context, *model.SceneQuery) ([]model.Scene, int, error)
	RenameScene(context.Context, uuid.UUID, string) error
}

type sceneRepository struct {
	Conn *sql.DB
}

func NewSceneRepository(db *sql.DB) SceneRepository {
	return &sceneRepository{Conn: db}
}

func (s *sceneRepository) Create(ctx context.Context, scene *model.Scene) (uuid.UUID, error) {
	var id uuid.UUID
	query := `INSERT INTO public.scene (user_id, name, elements, app_state, version) 
	          VALUES ($1, $2, $3, $4, $5) RETURNING id`
	err := s.Conn.QueryRowContext(ctx, query, scene.UserID, scene.Name, scene.Elements, scene.AppState, scene.Version).Scan(&id)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (s *sceneRepository) GetById(ctx context.Context, id uuid.UUID) (*model.Scene, error) {
	query := `SELECT id, user_id, name, elements, app_state, version, last_visited, create_ts 
	          FROM public.scene WHERE id = $1`
	row := s.Conn.QueryRowContext(ctx, query, id)
	scene := &model.Scene{}
	err := row.Scan(&scene.ID, &scene.UserID, &scene.Name, &scene.Elements, &scene.AppState, &scene.Version,
		&scene.LastVisited, &scene.CreateTS)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return scene, nil
}
func (s *sceneRepository) SaveScene(ctx context.Context, scene *model.Scene) (int, error) {
	if scene == nil {
		return 0, errors.New("scene cannot be nil")
	}
	if scene.ID == uuid.Nil || scene.Version == 0 || scene.Elements == nil {
		return 0, errors.New("scene ID, version, and elements must be set")
	}

	// Convert json.RawMessage to string to ensure correct JSON input syntax
	elements := string(scene.Elements)
	appState := string(scene.AppState)

	// Prepare the query with optimistic concurrency control
	query := `UPDATE public.scene 
	          SET elements = $1, app_state = $2, version = $3
	          WHERE id = $4 AND version = $5`

	// Execute the query with the raw JSON fields passed as strings
	result, err := s.Conn.ExecContext(ctx, query, elements, appState, scene.Version+1, scene.ID, scene.Version)
	if err != nil {
		return 0, err
	}

	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return 0, err
	}

	if rowsAffected == 0 {
		return 0, errors.New("failed to update scene: version conflict or scene does not exist")
	}

	// Update the version of the scene
	scene.Version++
	return scene.Version, nil
}

func (s *sceneRepository) SaveSceneWithFrames(ctx context.Context, scene *model.Scene, createdFrames []string, deletedFrames []string) (int, error) {
	if scene == nil {
		return 0, errors.New("scene cannot be nil")
	}
	if scene.ID == uuid.Nil || scene.Version == 0 || scene.Elements == nil {
		return 0, errors.New("scene ID, version, and elements must be set")
	}

	// Convert json.RawMessage to string to ensure correct JSON input syntax
	elements := string(scene.Elements)
	appState := string(scene.AppState)

	// Start a transaction
	tx, err := s.Conn.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}

	// Prepare the query with optimistic concurrency control
	query := `UPDATE public.scene 
	          SET elements = $1, app_state = $2, version = $3
	          WHERE id = $4 AND version = $5`

	// Execute the query with the raw JSON fields passed as strings
	result, err := tx.ExecContext(ctx, query, elements, appState, scene.Version+1, scene.ID, scene.Version)
	if err != nil {
		err := tx.Rollback()
		if err != nil {
			return 0, err
		}
		return 0, err
	}
	// Check if any rows were affected
	rowsAffected, err := result.RowsAffected()
	if err != nil || rowsAffected == 0 {
		err := tx.Rollback()
		if err != nil {
			return 0, err
		}
		return 0, errors.New("failed to update scene: version conflict or scene does not exist")
	}

	if len(deletedFrames) > 0 {
		delQuery := `UPDATE public.frame SET deleted = TRUE WHERE scene_id = $1 AND id = ANY($2)`
		_, err = tx.ExecContext(ctx, delQuery, scene.ID, pq.Array(deletedFrames))
		if err != nil {
			err := tx.Rollback()
			if err != nil {
				return 0, err
			}
			return 0, err
		}
	}

	if len(createdFrames) > 0 {
		delQuery := `UPDATE public.frame SET deleted = FALSE WHERE scene_id = $1 AND id = ANY($2)`
		_, err = tx.ExecContext(ctx, delQuery, scene.ID, pq.Array(createdFrames))
		if err != nil {
			err := tx.Rollback()
			if err != nil {
				return 0, err
			}
			return 0, err
		}
	}

	// Commit the transaction
	err = tx.Commit()
	if err != nil {
		return 0, err
	}

	// Update the version of the scene
	scene.Version++
	return scene.Version, nil
}

func (s *sceneRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM scene WHERE id = $1`
	_, err := s.Conn.ExecContext(ctx, query, id)
	return err
}

func (s *sceneRepository) Query(ctx context.Context, query *model.SceneQuery) ([]model.Scene, int, error) {
	var scenes []model.Scene
	baseQuery := `SELECT id, scene.user_id, name, last_visited, scene.create_ts, scene.update_ts
	              FROM scene LEFT JOIN scene_cover ON scene.id = scene_cover.scene_id
	              WHERE scene.user_id = $1 AND scene.name LIKE $2`
	countQuery := `SELECT COUNT(*) FROM scene WHERE user_id = $1 AND name LIKE $2`
	var count int
	err := s.Conn.QueryRowContext(ctx, countQuery, query.UserID, fmt.Sprintf("%%%s%%", query.Name)).Scan(&count)
	if err != nil {
		return nil, 0, err
	}

	rows, err := s.Conn.QueryContext(ctx, baseQuery, query.UserID, fmt.Sprintf("%%%s%%", query.Name))
	if err != nil {
		return nil, 0, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println(err)
		}
	}(rows)

	for rows.Next() {
		scene := model.Scene{}
		err := rows.Scan(&scene.ID, &scene.UserID, &scene.Name,
			&scene.LastVisited, &scene.CreateTS, &scene.UpdateTS)
		if err != nil {
			return nil, 0, err
		}
		scenes = append(scenes, scene)
	}
	return scenes, count, nil
}

func (s *sceneRepository) RenameScene(ctx context.Context, id uuid.UUID, name string) error {
	query := `UPDATE scene SET name = $1 WHERE id = $2`
	_, err := s.Conn.ExecContext(ctx, query, name, id)
	return err
}
