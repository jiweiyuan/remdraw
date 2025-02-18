package handler

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"remdraw.com/server/middleware"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
)

type SceneHandler interface {
	GetSceneById(context *gin.Context)
	GetSceneByKey(context *gin.Context)
	CreateScene(context *gin.Context)
	ListScenes(context *gin.Context)
	RenameScene(context *gin.Context)
	UpdateScene(context *gin.Context)
	DeleteScene(context *gin.Context)
	UploadFile(context *gin.Context)
	UploadCover(context *gin.Context)
	DownloadCover(context *gin.Context)
}

func NewSceneHandler(sceneService service.SceneService) SceneHandler {
	return &sceneHandler{sceneService: sceneService}
}

type sceneHandler struct {
	sceneService service.SceneService
}

func (s sceneHandler) GetSceneById(context *gin.Context) {
	idString := context.Param("id")
	id, err := uuid.Parse(idString)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scene id"})
		return
	}

	scene, err := s.sceneService.GetSceneByID(context, id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if scene == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "Scene not found"})
		return
	}

	context.JSON(http.StatusOK, scene)
}

func (s sceneHandler) GetSceneByKey(context *gin.Context) {
	key := context.Param("key")
	scene, err := s.sceneService.GetSceneByKey(context, key)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if scene == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "Scene not found"})
		return
	}

	context.JSON(http.StatusOK, scene)
}

func (s sceneHandler) CreateScene(context *gin.Context) {
	var scene model.Scene
	if err := context.ShouldBindJSON(&scene); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := middleware.GetUserID(context)
	scene.UserID = id
	scene.Elements = json.RawMessage(`[]`)
	scene.AppState = json.RawMessage(`{}`)
	scene.Version = 1

	id, err := s.sceneService.CreateScene(context, &scene)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"id": id})
}

func (s sceneHandler) ListScenes(context *gin.Context) {
	var query model.SceneQuery
	if err := context.ShouldBindQuery(&query); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// get the userId
	userId := middleware.GetUserID(context)
	query.UserID = userId

	scenes, count, err := s.sceneService.ListScenes(context, &query)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"count": count, "scenes": scenes, "query": query})
}

func (s sceneHandler) UpdateScene(context *gin.Context) {
	var request model.SceneUpdateRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	idString := context.Param("id")
	id, err := uuid.Parse(idString)
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scene id"})
		return
	}
	request.ID = id
	request.UserID = middleware.GetUserID(context)

	var scene model.Scene
	scene.ID = request.ID
	scene.UserID = request.UserID
	scene.Name = request.Name
	scene.Elements = request.Elements
	scene.AppState = request.AppState
	scene.Version = request.Version

	version, err := s.sceneService.UpdateSceneWithFrames(context, &scene, request.CreatedFrames, request.DeletedFrames)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Scene updated", "version": version})
}

func (s sceneHandler) DeleteScene(context *gin.Context) {
	id, err := uuid.Parse(context.Param("id"))
	err = s.sceneService.DeleteScene(context, id)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Scene deleted"})
}

func (s sceneHandler) UploadFile(context *gin.Context) {
	var file model.File

	if err := context.ShouldBindJSON(&file); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := middleware.GetUserID(context)
	file.UserID = id
	sceneId, _ := uuid.Parse(context.Param("id"))
	file.SceneID = sceneId

	err := s.sceneService.UploadFileToOSS(context, &file)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"result": "File uploaded"})
}

func (s sceneHandler) UploadCover(context *gin.Context) {
	userId := middleware.GetUserID(context)

	sceneID, err := uuid.Parse(context.Param("id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scene_id"})
		return
	}

	coverData, err := io.ReadAll(context.Request.Body)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read cover data"})
		return
	}

	err = s.sceneService.UploadCover(context, sceneID, userId, coverData)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	context.JSON(http.StatusCreated, gin.H{"message": "Cover uploaded successfully"})
}

func (s sceneHandler) DownloadCover(context *gin.Context) {
	sceneID, err := uuid.Parse(context.Param("id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scene_id"})
		return
	}

	coverData, err := s.sceneService.GetCover(context, sceneID)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if coverData == nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "Cover not found"})
		return
	}

	context.Header("Cache-Control", "no-cache")
	context.Data(http.StatusOK, "application/octet-stream", coverData)
}

func (s sceneHandler) RenameScene(context *gin.Context) {
	var request model.SceneRenameRequest
	if err := context.ShouldBindJSON(&request); err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id, err := uuid.Parse(context.Param("id"))
	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": "Invalid scene_id"})
		return
	}

	err = s.sceneService.RenameScene(context, id, request.Name)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	context.JSON(http.StatusOK, gin.H{"message": "Scene renamed successfully"})
}
