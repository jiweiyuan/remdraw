package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/open-spaced-repetition/go-fsrs"
	"remdraw.com/server/middleware"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
)

type ReviewHandler interface {
	ListReviews(ctx *gin.Context)
	GetReview(ctx *gin.Context)
	RepeatReview(ctx *gin.Context)
}

type reviewHandler struct {
	reviewService service.ReviewService
}

func NewReviewHandler(reviewService service.ReviewService) ReviewHandler {
	return &reviewHandler{reviewService: reviewService}
}

func (h *reviewHandler) ListReviews(ctx *gin.Context) {
	// get user id
	userId := middleware.GetUserID(ctx)

	// list today's reviews
	frames, err := h.reviewService.ListTodayReviews(ctx, userId)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{
		"frames": frames,
		"count":  len(frames),
	})
}

func (h *reviewHandler) GetReview(ctx *gin.Context) {
	frameID := ctx.Param("id")

	review, err := h.reviewService.GetReview(ctx, frameID)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, review)
}

func (h *reviewHandler) RepeatReview(ctx *gin.Context) {

	// get scheduling information
	frameID := ctx.Param("id")
	var frame model.Frame
	frame.ID = frameID
	frame.UserID = middleware.GetUserID(ctx)

	var schedulingInfo fsrs.SchedulingInfo
	if err := ctx.ShouldBindJSON(&schedulingInfo); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	err := h.reviewService.RepeatReview(ctx, &frame, schedulingInfo)
	if err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(200, gin.H{
		"message": "repeat review",
		"success": true,
	})
}
