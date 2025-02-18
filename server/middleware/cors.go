package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "https://remdraw.com", "https://remdraw-app.pages.dev"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization", "If-Match", "If-None-Match"},
		AllowCredentials: true,
	}

	return cors.New(corsConfig)
}
