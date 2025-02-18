package handler

import "github.com/gin-gonic/gin"

type HealthzHandler interface {
	Healthz(ctx *gin.Context)
}

type healthzHandler struct {
}

func NewHealthzHandler() HealthzHandler {
	return &healthzHandler{}
}

func (h *healthzHandler) Healthz(ctx *gin.Context) {
	ctx.JSON(200, gin.H{"message": "ok"})
}
