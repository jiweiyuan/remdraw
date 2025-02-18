package service

import (
	"context"

	"github.com/google/uuid"
	"remdraw.com/server/model"
	"remdraw.com/server/repository"
)

type CollectionService interface {
	ListCollectionByUserID(ctx context.Context, userID uuid.UUID) ([]model.Collection, error)
	CreateCollection(ctx context.Context, collection *model.Collection) error
	RenameCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID, name string) error
	AddSceneToCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID, sceneID uuid.UUID) error
	DeleteCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID) error
}

type collectionService struct {
	collectionRepo repository.CollectionRepository
}

func NewCollectionService(collectionRepository repository.CollectionRepository) CollectionService {
	return &collectionService{collectionRepo: collectionRepository}
}

func (s collectionService) ListCollectionByUserID(ctx context.Context, userID uuid.UUID) ([]model.Collection, error) {
	return s.collectionRepo.ListCollectionByUserID(ctx, userID)
}

func (s collectionService) CreateCollection(ctx context.Context, collection *model.Collection) error {
	return s.collectionRepo.Create(ctx, collection)
}

func (s collectionService) RenameCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID, name string) error {
	return s.collectionRepo.UpdateName(ctx, userID, collectionID, name)
}

func (s collectionService) AddSceneToCollection(ctx context.Context, userId uuid.UUID, collectionID uuid.UUID, sceneID uuid.UUID) error {
	return s.collectionRepo.AddSceneToCollection(ctx, userId, collectionID, sceneID)
}

func (s collectionService) DeleteCollection(ctx context.Context, userID uuid.UUID, collectionID uuid.UUID) error {
	return s.collectionRepo.Delete(ctx, userID, collectionID)
}
