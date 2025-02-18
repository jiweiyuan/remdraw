package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"remdraw.com/server/middleware"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
)

type CollectionHandler interface {
	ListCollections(context *gin.Context)
	CreateCollection(context *gin.Context)
	RenameCollection(context *gin.Context)
	AddSceneToCollection(context *gin.Context)
	DeleteCollection(context *gin.Context)
}

type collectionHandler struct {
	collectionService service.CollectionService
}

func (h collectionHandler) AddSceneToCollection(context *gin.Context) {
	userID := middleware.GetUserID(context)
	collection := context.Param("id")
	// parse collection id to int
	collectionID, err := uuid.Parse(collection)
	if err != nil {
		context.JSON(400, gin.H{"error": "Invalid collection id "})
		return
	}
	scene := context.Param("sceneId")
	// parse scene id to int
	sceneID, err := uuid.Parse(scene)
	if err != nil {
		context.JSON(400, gin.H{"error": "Invalid scene id"})
		return
	}

	if err := h.collectionService.AddSceneToCollection(context, userID, collectionID, sceneID); err != nil {
		context.JSON(500, gin.H{"error": err.Error()})
		return
	}
	context.JSON(200, gin.H{"message": "Scene added to collection"})
}

func NewCollectionHandler(collectionService service.CollectionService) CollectionHandler {
	return &collectionHandler{collectionService: collectionService}
}

func (h collectionHandler) ListCollections(context *gin.Context) {
	userID := middleware.GetUserID(context)
	collections, err := h.collectionService.ListCollectionByUserID(context, userID)
	if err != nil {
		context.JSON(500, gin.H{"error": err.Error()})
		return
	}
	context.JSON(200, gin.H{"collections": collections})
}

func (h collectionHandler) CreateCollection(context *gin.Context) {
	userID := middleware.GetUserID(context)
	var collection model.Collection
	if err := context.BindJSON(&collection); err != nil {
		context.JSON(400, gin.H{"error": err.Error()})
		return
	}
	collection.UserID = userID
	if err := h.collectionService.CreateCollection(context, &collection); err != nil {
		context.JSON(500, gin.H{"error": err.Error()})
		return
	}
	context.JSON(200, gin.H{"message": "Collection created", "collection": collection})
}

func (h collectionHandler) RenameCollection(context *gin.Context) {
	userID := middleware.GetUserID(context)
	collectionID := context.Param("id")
	// parse collection id to int
	id, err := uuid.Parse(collectionID)
	if err != nil {
		context.JSON(400, gin.H{"error": "Invalid collection id"})
		return
	}
	var collection model.Collection
	if err := context.BindJSON(&collection); err != nil {
		context.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if err := h.collectionService.RenameCollection(context, userID, id, collection.Name); err != nil {
		context.JSON(500, gin.H{"error": err.Error()})
		return
	}
	context.JSON(200, gin.H{"message": "Collection updated"})
}

func (h collectionHandler) DeleteCollection(context *gin.Context) {
	userID := middleware.GetUserID(context)
	collectionID := context.Param("id")
	// parse collection id to int
	id, err := uuid.Parse(collectionID)
	if err != nil {
		context.JSON(400, gin.H{"error": "Invalid collection id"})
		return
	}
	if err := h.collectionService.DeleteCollection(context, userID, id); err != nil {
		context.JSON(500, gin.H{"error": err.Error()})
		return
	}
	context.JSON(200, gin.H{"message": "Collection deleted"})
}
