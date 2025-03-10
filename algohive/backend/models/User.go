package models

import (
	"time"
)

type User struct {
    ID            string    `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Firstname     string    `gorm:"type:varchar(50);not null"`
    Lastname      string    `gorm:"type:varchar(50);not null"`
    Email         string    `gorm:"type:varchar(255);unique;not null"`
    Password      string    `gorm:"type:varchar(255);not null"`
    LastConnected time.Time
    Blocked       bool `gorm:"not null"`
}