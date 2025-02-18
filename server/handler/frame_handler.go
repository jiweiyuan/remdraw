package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"remdraw.com/server/middleware"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
)

type FrameController interface {
	AddFrame(ctx *gin.Context)
	RemoveFrame(ctx *gin.Context)
	ListBySceneId(ctx *gin.Context)
	GetFrameData(ctx *gin.Context)
}

type frameHandler struct {
	frameService service.FrameService
}

func NewFrameHandler(frameService service.FrameService) FrameController {
	return &frameHandler{frameService: frameService}
}

func (h *frameHandler) AddFrame(ctx *gin.Context) {
	var frame model.Frame
	if err := ctx.ShouldBindJSON(&frame); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	userId := middleware.GetUserID(ctx)
	frame.UserID = userId

	id, err := h.frameService.Create(ctx, &frame)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"message": "frame created successfully", "id": id})
}

func (h *frameHandler) RemoveFrame(ctx *gin.Context) {
	var frame model.Frame

	sceneId, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	frame.SceneID = sceneId
	frame.ID = ctx.Param("frameId")
	usrID := middleware.GetUserID(ctx)
	frame.UserID = usrID

	err = h.frameService.Delete(ctx, &frame)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(204, gin.H{"success": true, "message": "frame removed successfully"})
}

func (h *frameHandler) ListBySceneId(ctx *gin.Context) {
	sceneId := ctx.Param("id")
	id, err := uuid.Parse(sceneId)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	frames, err := h.frameService.ListBySceneId(ctx, id)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"frames": frames})
}

func (h *frameHandler) GetFrameData(ctx *gin.Context) {
	var frame model.Frame
	sceneId, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}
	frame.SceneID = sceneId
	frame.ID = ctx.Param("frameId")
	usrID := middleware.GetUserID(ctx)
	frame.UserID = usrID

	frameData, err := h.frameService.GetFrameData(ctx, &frame)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{"frameData": frameData})
}
