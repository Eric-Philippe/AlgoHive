package models

type UserGroup struct {
    UserID  string    `gorm:"type:uuid;primary_key"`
    GroupID string    `gorm:"type:uuid;primary_key"`
}