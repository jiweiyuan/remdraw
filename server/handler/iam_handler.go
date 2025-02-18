package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"remdraw.com/server/model"
	"remdraw.com/server/service"
	"remdraw.com/server/utils"
)

type IAMHandler interface {
	Login(ctx *gin.Context)
	Register(ctx *gin.Context)
}

type iamHandler struct {
	userService service.UserService
}

func NewIAMHandler(userService service.UserService) IAMHandler {
	return &iamHandler{userService: userService}
}

func (h *iamHandler) Login(ctx *gin.Context) {
	var loginRequest model.LoginRequest
	if err := ctx.ShouldBindJSON(&loginRequest); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if loginRequest.Email == "" || loginRequest.Password == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	user, err := h.userService.GetUserByEmail(ctx, loginRequest.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if !utils.VerifyPassword(loginRequest.Password, user.Password) {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	jwt := utils.NewJWT()
	token, err := jwt.CreateToken(user.ID, user.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": true,
		"message": "login successfully", "token": token, "user": user})
}

func (h *iamHandler) Register(ctx *gin.Context) {
	// get email and password from request
	var user model.User
	if err := ctx.ShouldBindJSON(&user); err != nil {
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	user.Role = model.FREEUSER
	hashPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	user.Password = hashPassword

	// create user
	err = h.userService.CreateUser(ctx, &user)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"message": "user created successfully"})
}
