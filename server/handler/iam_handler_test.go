package handler

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"remdraw.com/server/model"
)

func TestRegister(t *testing.T) {
	r := SetupHandler()

	email := time.Now().Format("20060102150405") + "@example.com"

	t.Run("successful register a user", func(t *testing.T) {

		user := model.User{
			Email:    email,
			Password: "123456",
		}

		jsonValue, _ := json.Marshal(user)
		req, _ := http.NewRequest("POST", "/api/v1/register", bytes.NewReader(jsonValue))

		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusCreated, w.Code)
	})

	t.Run("register a user with duplicate email(fail)", func(t *testing.T) {

		user := model.User{
			Email:    email,
			Password: "123456",
		}

		jsonValue, _ := json.Marshal(user)
		req, _ := http.NewRequest("POST", "/api/v1/register", bytes.NewReader(jsonValue))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})

}

func TestLogin(t *testing.T) {
	r := SetupHandler()

	t.Run("successful login", func(t *testing.T) {

		user := model.User{
			Email:    "jiweiyuan@example.com",
			Password: "123456",
		}

		jsonValue, _ := json.Marshal(user)
		req, _ := http.NewRequest("POST", "/api/v1/login", bytes.NewReader(jsonValue))
		w := httptest.NewRecorder()
		r.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
	})
}
