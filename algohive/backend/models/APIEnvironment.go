package models

type APIEnvironment struct {
    ID     string     `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Address string    `gorm:"type:varchar(255);not null"`
    Name    string    `gorm:"type:varchar(100);unique;not null"`
}