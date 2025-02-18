package handler

import (
	"github.com/gin-gonic/gin"
	"remdraw.com/server/infra"
	"remdraw.com/server/middleware"
	"remdraw.com/server/repository"
	"remdraw.com/server/service"
)

func SetupHandler() *gin.Engine {
	var engine = gin.Default()
	engine.Use(middleware.CORSMiddleware())

	// set up the database
	config := infra.GetPostgresConfig()

	// set up the infrastructure
	db := infra.NewDB(config)
	userRepository := repository.NewUserRepository(db)
	sceneRepository := repository.NewSceneRepository(db)
	sceneCoverRepository := repository.NewSceneCoverRepository(db)
	fileRepository := repository.NewFileRepository(db)
	frameRepository := repository.NewFrameRepository(db)
	collectionRepository := repository.NewCollectionRepository(db)

	// set up Services
	userService := service.NewUserService(userRepository)
	sceneService := service.NewSceneService(sceneRepository, sceneCoverRepository, fileRepository)
	frameService := service.NewFrameService(frameRepository)
	reviewService := service.NewReviewService(frameRepository, fileRepository)
	collectionService := service.NewCollectionService(collectionRepository)

	// set up the controller
	iamController := NewIAMHandler(userService)
	userController := NewUserHandler(userService)
	sceneController := NewSceneHandler(sceneService)
	frameController := NewFrameHandler(frameService)
	reviewController := NewReviewHandler(reviewService)
	collectionController := NewCollectionHandler(collectionService)
	healthzHandler := NewHealthzHandler()

	v1 := engine.Group("/api/v1")
	v1.Use(middleware.IAMMiddleware())
	{
		v1.GET("/healthz", healthzHandler.Healthz)
		v1.POST("/waitlist", userController.JoinWaitlist)

		v1.POST("/register", iamController.Register)
		v1.POST("/login", iamController.Login)
		v1.GET("/user/:id", userController.GetUser)

		v1.GET("/scene/:id", sceneController.GetSceneById)
		v1.GET("/scene/k/:key", sceneController.GetSceneByKey)
		v1.POST("/scene", sceneController.CreateScene)
		v1.GET("/scene", sceneController.ListScenes)
		v1.PUT("/scene/:id", sceneController.UpdateScene)
		v1.PUT("/scene/:id/rename", sceneController.RenameScene)
		v1.DELETE("/scene/:id", sceneController.DeleteScene)
		v1.POST("/scene/:id/file", sceneController.UploadFile)
		v1.POST("/scene/:id/cover", sceneController.UploadCover)
		v1.GET("/scene/:id/cover", sceneController.DownloadCover)

		v1.GET("/scene/:id/frame", frameController.ListBySceneId)
		v1.POST("/scene/:id/frame", frameController.AddFrame)
		v1.DELETE("/scene/:id/frame/:frameId", frameController.RemoveFrame)
		v1.GET("/scene/:id/frame/:frameId/elements", frameController.GetFrameData)

		v1.GET("/review", reviewController.ListReviews)
		v1.GET("/review/:id", reviewController.GetReview)
		v1.POST("/review/:id/repeat", reviewController.RepeatReview)

		v1.GET("/collection", collectionController.ListCollections)
		v1.POST("/collection", collectionController.CreateCollection)
		v1.DELETE("/collection/:id", collectionController.DeleteCollection)
		v1.PUT("/collection/:id", collectionController.RenameCollection)
		v1.PUT("/collection/:id/category/:sceneId", collectionController.AddSceneToCollection)
	}

	return engine
}
