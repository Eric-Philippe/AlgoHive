package models

import (
	"time"
)

type Try struct {
    ID             string    `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    PuzzleID       string    `gorm:"type:varchar(50);not null"`
    PuzzleIndex    int       `gorm:"not null"`
    PuzzleLvl      string    `gorm:"type:varchar(50);not null"`
    Step           int       `gorm:"not null"`
    StartTime      time.Time `gorm:"not null"`
    EndTime        time.Time
    Attempts       int       `gorm:"not null"`
    Score          float64   `gorm:"type:numeric(15,2);not null"`
    CompetitionID  string    `gorm:"type:uuid;not null"`
    UserID         string    `gorm:"type:uuid;not null"`
}