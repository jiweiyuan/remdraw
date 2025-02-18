package utils

import "testing"

func TestHashPassword(t *testing.T) {
	plainPwd := "123456"

	hash, err := HashPassword(plainPwd)
	if err != nil {
		t.Fatalf("HashPassword failed: %v", err)
	}

	if len(hash) == 0 {
		t.Fatalf("Expected non-empty hash")
	}

	println(hash)
}
