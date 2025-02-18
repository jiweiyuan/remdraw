package utils

import "net/mail"

func VaildEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}
