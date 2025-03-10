package models

type Group struct {
    ID          string    `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Name        string    `gorm:"type:varchar(50);unique;not null"`
    Description string    `gorm:"type:varchar(255)"`
    ScopeID     string    `gorm:"type:uuid;not null"`
}