package models

type ScopeAPIAccess struct {
    APIEnvironmentID string    `gorm:"type:uuid;primary_key"`
    ScopeID          string    `gorm:"type:uuid;primary_key"`
}