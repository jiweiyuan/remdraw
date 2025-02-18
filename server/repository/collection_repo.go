package repository

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/lib/pq"
	"remdraw.com/server/model"
)

type CollectionRepository interface {
	ListCollectionByUserID(ctx context.Context, userID uuid.UUID) ([]model.Collection, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Collection, error)
	Create(ctx context.Context, collection *model.Collection) error
	UpdateName(ctx context.Context, userID uuid.UUID, id uuid.UUID, name string) error
	AddSceneToCollection(ctx context.Context, userID uuid.UUID, id uuid.UUID, sceneID uuid.UUID) error
	UpdateSceneList(ctx context.Context, collection *model.Collection) error
	Delete(ctx context.Context, userId uuid.UUID, id uuid.UUID) error
}

type collectionRepository struct {
	Conn *sql.DB
}

func NewCollectionRepository(db *sql.DB) CollectionRepository {
	return &collectionRepository{Conn: db}
}

func (r *collectionRepository) ListCollectionByUserID(ctx context.Context, userID uuid.UUID) ([]model.Collection, error) {
	rows, err := r.Conn.QueryContext(ctx, "SELECT id, user_id, name, collection_order, scene_array, create_ts, update_ts FROM collection WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			return
		}
	}(rows)

	var collections []model.Collection
	for rows.Next() {
		var collection model.Collection
		var x []uuid.UUID
		err := rows.Scan(&collection.ID, &collection.UserID, &collection.Name, &collection.Order, pq.Array(&x), &collection.CreateAt, &collection.UpdateAt)
		if err != nil {
			return nil, err
		}
		// Convert []sql.NullInt64 to []int
		for _, v := range x {
			collection.SceneList = append(collection.SceneList, v)
		}
		collections = append(collections, collection)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	return collections, nil
}

func (r *collectionRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Collection, error) {
	row := r.Conn.QueryRowContext(ctx, "SELECT id, user_id, name, collection_order, scene_array, create_ts, update_ts FROM collection WHERE id = $1", id)
	var collection model.Collection
	collection.SceneList = make([]uuid.UUID, 0)
	err := row.Scan(&collection.ID, &collection.UserID, &collection.Name, &collection.Order, &collection.SceneList, &collection.CreateAt, &collection.UpdateAt)
	if err != nil {
		return nil, err
	}
	return &collection, nil
}

func (r *collectionRepository) Create(ctx context.Context, collection *model.Collection) error {
	_, err := r.Conn.ExecContext(ctx,
		"INSERT INTO collection (user_id, name, collection_order) VALUES ($1, $2, $3)",
		collection.UserID, collection.Name, collection.Order)
	if err != nil {
		return err
	}
	return nil
}

func (r *collectionRepository) UpdateName(ctx context.Context, userID uuid.UUID, id uuid.UUID, name string) error {
	_, err := r.Conn.ExecContext(ctx,
		"UPDATE collection SET name = $1 WHERE id = $2 AND user_id = $3",
		name, id, userID)
	if err != nil {
		return err
	}
	return nil
}

func (r *collectionRepository) AddSceneToCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID, sceneID uuid.UUID) error {

	tx, err := r.Conn.Begin()
	if err != nil {
		return err
	}
	defer func(tx *sql.Tx) {
		err := tx.Rollback()
		if err != nil {
			return
		}
	}(tx)

	// Step 1: Search and remove the sceneID from all collections for the specific user
	queryRemove := `
		UPDATE "collection"
		SET scene_array = array_remove(scene_array, $1)
		WHERE user_id = $2 AND $1 = ANY(scene_array);
	`
	_, err = tx.ExecContext(ctx, queryRemove, sceneID, userID)
	if err != nil {
		return err
	}

	// Step 2: Add the sceneID to the specific collection's scene_array for the specific user
	queryAdd := `
		UPDATE "collection"
		SET scene_array = array_append(scene_array, $1), update_ts = CURRENT_TIMESTAMP
		WHERE id = $2 AND user_id = $3;
	`
	_, err = tx.ExecContext(ctx, queryAdd, sceneID, collectionID, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *collectionRepository) UpdateSceneList(ctx context.Context, collection *model.Collection) error {
	_, err := r.Conn.ExecContext(ctx,
		"UPDATE collection SET scene_array = $1 WHERE id = $2",
		pq.Array(collection.SceneList), collection.ID)
	if err != nil {
		return err
	}
	return nil
}

func (r *collectionRepository) Delete(ctx context.Context, userId uuid.UUID, id uuid.UUID) error {
	_, err := r.Conn.ExecContext(ctx,
		"DELETE FROM collection WHERE id = $1 AND user_id = $2",
		id, userId)
	if err != nil {
		return err
	}
	return nil
}
