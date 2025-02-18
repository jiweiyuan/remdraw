package utils

import (
	"github.com/gin-gonic/gin"
)

var (
	userIdContexKey = "uid"
)

func GetUserID(ctx *gin.Context) string {
	return ctx.GetString(userIdContexKey)
}
