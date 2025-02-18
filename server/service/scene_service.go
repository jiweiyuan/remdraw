package service

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/sqids/sqids-go"
	"remdraw.com/server/infra"
	"remdraw.com/server/model"
	"remdraw.com/server/repository"
	"remdraw.com/server/utils"
)

type SceneService interface {
	GetSceneByID(ctx context.Context, id uuid.UUID) (*model.Scene, error)
	GetSceneByKey(ctx context.Context, key string) (*model.Scene, error)
	CreateScene(ctx context.Context, scene *model.Scene) (uuid.UUID, error)
	ListScenes(ctx context.Context, query *model.SceneQuery) ([]model.Scene, int, error)
	UpdateScene(ctx context.Context, scene *model.Scene) (int, error)
	UpdateSceneWithFrames(ctx context.Context, scene *model.Scene, createdFrames []string, deletedFrames []string) (int, error)
	DeleteScene(ctx context.Context, id uuid.UUID) error
	UploadFileToOSS(ctx context.Context, file *model.File) error
	UploadCover(ctx context.Context, sceneId uuid.UUID, userId uuid.UUID, data []byte) error
	GetCover(ctx context.Context, sceneId uuid.UUID) ([]byte, error)
	RenameScene(ctx context.Context, sceneID uuid.UUID, name string) error
}

type sceneService struct {
	sceneRepo      repository.SceneRepository
	sceneCoverRepo repository.SceneCoverRepository
	fileRepo       repository.FileRepository
	sqids          *sqids.Sqids
	usqids         *sqids.Sqids
	oss            infra.OOSClient
}

func NewSceneService(sceneRepository repository.SceneRepository,
	sceneCoverRepository repository.SceneCoverRepository,
	fileRepository repository.FileRepository) SceneService {
	// Don't change the MinLength value
	s, _ := sqids.New(sqids.Options{
		MinLength: 11,
	})

	u, _ := sqids.New(sqids.Options{
		MinLength: 9,
	})

	oss := infra.NewR2Client()
	return &sceneService{
		sceneRepo:      sceneRepository,
		sceneCoverRepo: sceneCoverRepository,
		fileRepo:       fileRepository,
		sqids:          s,
		usqids:         u,
		oss:            oss,
	}
}

func (s sceneService) GetSceneByID(ctx context.Context, id uuid.UUID) (*model.Scene, error) {
	scene, err := s.sceneRepo.GetById(ctx, id)
	if err != nil {
		return nil, err
	}

	files, err := s.fileRepo.ListBySceneId(ctx, fmt.Sprint(scene.ID))
	if err != nil {
		return nil, err
	}
	scene.Files = files
	return scene, nil
}

func (s sceneService) GetSceneByKey(ctx context.Context, key string) (*model.Scene, error) {

	scene, err := s.GetSceneByID(ctx, uuid.Nil)
	if err != nil {
		return nil, err
	}
	return scene, nil
}

func (s sceneService) CreateScene(ctx context.Context, scene *model.Scene) (uuid.UUID, error) {
	id, err := s.sceneRepo.Create(ctx, scene)
	if err != nil {
		return uuid.Nil, err
	}
	return id, nil
}

func (s sceneService) ListScenes(ctx context.Context, query *model.SceneQuery) ([]model.Scene, int, error) {
	scenes, count, err := s.sceneRepo.Query(ctx, query)
	if err != nil {
		return nil, 0, err
	}

	return scenes, count, nil
}

func (s sceneService) UpdateScene(ctx context.Context, scene *model.Scene) (int, error) {
	version, err := s.sceneRepo.SaveScene(ctx, scene)
	if err != nil {
		return version, err
	}
	return version, nil
}

func (s sceneService) UpdateSceneWithFrames(ctx context.Context, scene *model.Scene, createdFrames []string, deletedFrames []string) (int, error) {
	version, err := s.sceneRepo.SaveSceneWithFrames(ctx, scene, createdFrames, deletedFrames)
	if err != nil {
		return version, err
	}
	return version, nil
}

func (s sceneService) DeleteScene(ctx context.Context, id uuid.UUID) error {
	err := s.sceneRepo.Delete(ctx, id)
	if err != nil {
		return err
	}
	return nil
}

func (s sceneService) UploadFileToOSS(ctx context.Context, file *model.File) error {
	userKey, _ := file.UserID.MarshalText()
	objectKey := fmt.Sprint(userKey, "/", file.ID)

	exist, _ := s.fileRepo.Exists(ctx, fmt.Sprint(file.ID))
	if exist {
		return nil
	}

	err := s.oss.PutObject(ctx, objectKey, strings.NewReader(file.DataURL))
	if err != nil {
		return err
	}

	file.OssKey = objectKey
	_, err = s.fileRepo.Create(ctx, file)
	if err != nil {
		return err
	}
	return nil
}

func (s sceneService) UploadCover(ctx context.Context, sceneId uuid.UUID, userID uuid.UUID, data []byte) error {
	etag := utils.CalculateETag(data)
	err := s.sceneCoverRepo.InsertOrUpdateCover(ctx, sceneId, userID, data, etag)

	if err != nil {
		return err
	}
	return nil
}

func (s sceneService) GetCover(ctx context.Context, sceneId uuid.UUID) ([]byte, error) {
	data, err := s.sceneCoverRepo.GetCover(ctx, sceneId)
	if err != nil {
		return nil, err
	}
	return data, nil
}

func (s sceneService) RenameScene(ctx context.Context, sceneID uuid.UUID, name string) error {
	err := s.sceneRepo.RenameScene(ctx, sceneID, name)
	if err != nil {
		return err
	}
	return nil
}
