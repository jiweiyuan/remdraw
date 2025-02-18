package infra

import "github.com/open-spaced-repetition/go-fsrs"

func NewFSRS() *fsrs.Parameters {
	param := fsrs.DefaultParam()
	return &param
}
