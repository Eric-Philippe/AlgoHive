package models

type UserRole struct {
    UserID string    `gorm:"type:uuid;primary_key"`
    RoleID string    `gorm:"type:uuid;primary_key"`
}