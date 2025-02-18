package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"remdraw.com/server/model"
)

type FrameRepository interface {
	Create(ctx context.Context, frame *model.Frame) (string, error)
	GetByID(ctx context.Context, id string) (*model.Frame, error)
	ListTodayReviewFrames(ctx context.Context, userID uuid.UUID) ([]model.Frame, error)
	ListBySceneID(ctx context.Context, sceneID uuid.UUID) ([]model.Frame, error)
	GetFrameData(ctx context.Context, frame *model.Frame) (*model.FrameData, error)
	Delete(ctx context.Context, frame *model.Frame) error
	UpdateSchedule(ctx context.Context, frame *model.Frame, frameLog *model.FrameLog) error
}

type frameRepository struct {
	Conn *sql.DB
}

func NewFrameRepository(db *sql.DB) FrameRepository {
	return &frameRepository{Conn: db}
}

func (r *frameRepository) Create(ctx context.Context, frame *model.Frame) (string, error) {
	query := `INSERT INTO public.frame (id, scene_id, user_id, card_state)
	          VALUES ($1, $2, $3, $4) RETURNING id`
	err := r.Conn.QueryRowContext(ctx, query, frame.ID, frame.SceneID, frame.UserID, frame.CardState).Scan(&frame.ID)
	if err != nil {
		return "", err
	}
	return frame.ID, nil
}

func (r *frameRepository) ListBySceneID(ctx context.Context, sceneID uuid.UUID) ([]model.Frame, error) {
	query := `SELECT id, scene_id, user_id, card_due, card_stability, card_difficulty, card_reps, frame.card_lapses, card_state, card_last_review, create_ts
	          FROM public.frame WHERE scene_id = $1`
	rows, err := r.Conn.QueryContext(ctx, query, sceneID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Println(err)
		}
	}(rows)

	var frames []model.Frame
	for rows.Next() {
		var frame model.Frame
		err = rows.Scan(&frame.ID, &frame.SceneID, &frame.UserID, &frame.CardDue, &frame.CardStability, &frame.CardDifficulty, &frame.CardReps, &frame.CardLapses, &frame.CardState, &frame.CardLastReview, &frame.CreateTs)
		if err != nil {
			return nil, err
		}
		frames = append(frames, frame)
	}
	return frames, nil

}

func (r *frameRepository) GetByID(ctx context.Context, id string) (*model.Frame, error) {
	query := `SELECT id, scene_id, user_id, card_due, card_stability, card_difficulty, card_reps,card_lapses, card_state, card_last_review, create_ts, NOW()
	          FROM public.frame WHERE id = $1`
	var frame model.Frame
	err := r.Conn.QueryRowContext(ctx, query, id).Scan(&frame.ID, &frame.SceneID, &frame.UserID, &frame.CardDue, &frame.CardStability, &frame.CardDifficulty, &frame.CardReps, &frame.CardLapses, &frame.CardState, &frame.CardLastReview, &frame.CreateTs, &frame.Now)
	if err != nil {
		return nil, err
	}
	return &frame, nil
}

func (r *frameRepository) GetFrameData(ctx context.Context, frame *model.Frame) (*model.FrameData, error) {
	query := `
        SELECT jsonb_agg(elems)
        FROM (
            SELECT jsonb_array_elements(elements) AS elems
            FROM scene
            WHERE id = $1 AND user_id = $2
        ) AS sub
        WHERE elems->>'frameId' = $3;
    `
	var jsonbData json.RawMessage
	err := r.Conn.QueryRowContext(ctx, query, frame.SceneID, frame.UserID, frame.ID).Scan(&jsonbData)
	if err != nil {
		return nil, err
	}
	return &model.FrameData{ID: frame.ID, SceneID: frame.SceneID, Elements: jsonbData}, nil
}

func (r *frameRepository) Delete(ctx context.Context, frame *model.Frame) error {
	query := `DELETE FROM public.frame WHERE id = $1 AND scene_id = $2 AND user_id = $3`
	_, err := r.Conn.ExecContext(ctx, query, frame.ID, frame.SceneID, frame.UserID)
	if err != nil {
		return err
	}
	return nil
}

func (r *frameRepository) ListTodayReviewFrames(ctx context.Context, userID uuid.UUID) ([]model.Frame, error) {
	query := `SELECT id, scene_id, user_id, card_due, card_stability, card_difficulty, card_reps, card_state, create_ts
	          FROM public.frame
	          WHERE user_id = $1
	            AND deleted = FALSE
	            AND card_due <= NOW()`
	rows, err := r.Conn.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Println(err)
		}
	}(rows)

	var frames []model.Frame
	for rows.Next() {
		var frame model.Frame
		err = rows.Scan(&frame.ID, &frame.SceneID, &frame.UserID, &frame.CardDue, &frame.CardStability, &frame.CardDifficulty, &frame.CardReps, &frame.CardState, &frame.CreateTs)
		if err != nil {
			return nil, err
		}
		frames = append(frames, frame)
	}
	return frames, nil
}

func (r *frameRepository) UpdateSchedule(ctx context.Context, frame *model.Frame, frameLog *model.FrameLog) error {
	tx, err := r.Conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func(tx *sql.Tx) {
		err := tx.Rollback()
		if err != nil {
			log.Println(err)
		}
	}(tx)

	query := `UPDATE public.frame
	          SET card_due = $1, card_stability = $2, card_difficulty = $3, card_reps = $4, card_lapses = $5, card_state = $6, card_last_review = $7
	          WHERE id = $8 AND user_id = $9`
	_, err = tx.ExecContext(ctx, query, frame.CardDue, frame.CardStability, frame.CardDifficulty, frame.CardReps, frame.CardLapses, frame.CardState, frame.CardLastReview, frame.ID, frame.UserID)
	if err != nil {
		return err
	}

	query = `INSERT INTO public.frame_review_log (frame_id, user_id, card_rating, card_scheduled_days, card_elapsed_days, card_review, card_state)
	          VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err = tx.ExecContext(ctx, query, frameLog.FrameID, frameLog.UserID, frameLog.CardRating, frameLog.CardScheduledDays, frameLog.CardElapsedDays, frameLog.CardReview, frameLog.CardState)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}
	return nil
}
