package models

type Role struct {
    ID   string    `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Name string    `gorm:"type:varchar(50);unique;not null"`
}