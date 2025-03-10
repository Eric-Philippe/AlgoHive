package models

type Competition struct {
    ID               string `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Title            string    `gorm:"type:varchar(100);unique;not null"`
    Description      string    `gorm:"type:text;not null"`
    Finished         bool      `gorm:"not null"`
    Show             bool      `gorm:"not null"`
    APITheme         string    `gorm:"type:varchar(50);not null"`
    APIEnvironmentID string `gorm:"type:uuid;not null"`
    Groups           []*Group   `gorm:"many2many:competition_groups;"`
}