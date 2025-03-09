package models

type CompetitionAccessibleTo struct {
    GroupID        string `gorm:"type:uuid;primary_key"`
    CompetitionID  string `gorm:"type:uuid;primary_key"`
}