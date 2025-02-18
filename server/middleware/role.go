package middleware

import (
	"github.com/gin-gonic/gin"
	"remdraw.com/server/model"
	"strconv"
)

var (
	userRoleContexKey = "urole"
)

func getUserRole(ctx *gin.Context) model.UserRole {
	roleString := ctx.GetString(userRoleContexKey)
	role, _ := strconv.Atoi(roleString)
	return model.UserRole(role)
}

func PremiumMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := getUserRole(ctx)
		if role != model.PREMIUMUSER && role != model.ADMIN {
			ctx.AbortWithStatusJSON(403, gin.H{"error": "Forbidden"})
		} else {
			ctx.Next()
		}

	}
}

func AdminMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		role := getUserRole(ctx)
		if role != model.ADMIN {
			ctx.AbortWithStatusJSON(403, gin.H{"error": "Forbidden"})
		} else {
			ctx.Next()
		}
	}
}
