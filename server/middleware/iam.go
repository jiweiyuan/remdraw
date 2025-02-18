package middleware

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"remdraw.com/server/utils"
)

var (
	userIdContexKey = "uid"
)

var whiteList = []string{
	"/api/v1/login",
	"/api/v1/register",
	"/api/v1/healthz",
	"/api/v1/waitlist",
}

func needAccessControl(path string) bool {
	for _, whiteListURL := range whiteList {
		if path == whiteListURL {
			return false
		}
	}

	return true
}

func IAMMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		path := ctx.Request.URL.Path

		if needAccessControl(path) {
			j := utils.NewJWT()
			token := ctx.GetHeader("Authorization")
			if token == "" {
				ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
				return
			}

			claims, err := j.ParseToken(token)
			if errors.Is(err, jwt.ErrSignatureInvalid) {
				ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			} else if errors.Is(err, jwt.ErrTokenExpired) {
				ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized, token has expired"})
			} else if errors.Is(err, jwt.ErrInvalidType) {
				ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized, token not valid yet"})
			} else if err != nil {
				ctx.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			}

			ctx.Set(userIdContexKey, claims.ID)
			ctx.Set(userRoleContexKey, claims.Role)
		}

		ctx.Next()
	}
}

func GetUserID(ctx *gin.Context) uuid.UUID {
	id, _ := ctx.Get(userIdContexKey)
	return id.(uuid.UUID)
}
