package handler

import (
	"github.com/gin-gonic/gin"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
	"remdraw.com/server/utils"
)

type UserHandler interface {
	GetUser(context *gin.Context)
	JoinWaitlist(context *gin.Context)
}

type userHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) UserHandler {
	return &userHandler{userService: userService}
}

func (*userHandler) GetUser(context *gin.Context) {
	context.JSON(200, "user")
}

func (h *userHandler) JoinWaitlist(context *gin.Context) {
	var waitlist model.Waitlist
	if err := context.ShouldBindJSON(&waitlist); err != nil {
		context.JSON(400, gin.H{"error": err.Error()})
		return
	}
	if !utils.VaildEmail(waitlist.Email) {
		context.JSON(400, gin.H{"error": "please provide a valid email"})
		return
	}
	// parse ip address
	waitlist.IPAddress = context.ClientIP()

	// join waitlist
	err := h.userService.JoinWaitlist(context, &waitlist)
	if err != nil {
		context.JSON(400, gin.H{"error": err.Error()})
		return
	}

	context.JSON(200, gin.H{"message": "joined waitlist successfully"})
}
