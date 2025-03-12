package models

import (
	"time"
)

type Try struct {
    ID             string    `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
    PuzzleID       string    `gorm:"type:varchar(50);not null" json:"puzzle_id"`
    PuzzleIndex    int       `gorm:"not null" json:"puzzle_index"`
    PuzzleLvl      string    `gorm:"type:varchar(50);not null" json:"puzzle_lvl"`
    Step           int       `gorm:"not null" json:"step"`
    StartTime      time.Time `gorm:"not null" json:"start_time"`
    EndTime        time.Time `json:"end_time"` 
    Attempts       int       `gorm:"not null" json:"attempts"`
    Score          float64   `gorm:"type:numeric(15,2);not null" json:"score"`
    CompetitionID  string    `gorm:"type:uuid;not null" json:"competition_id"` 
    UserID         string    `gorm:"type:uuid;not null" json:"user_id"`
}