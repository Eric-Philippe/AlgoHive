package models

type Competition struct {
    ID               string  `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
    Title            string  `gorm:"type:varchar(100);unique;not null" json:"title"`
    Description      string  `gorm:"type:text;not null" json:"description"`
    Finished         bool    `gorm:"not null" json:"finished"`
    Show             bool    `gorm:"not null" json:"show"`
    APITheme         string  `gorm:"type:varchar(50);not null" json:"api_theme"`
    CatalogId        string  `gorm:"type:uuid;not null" json:"catalog_id"`
    Groups           []*Group `gorm:"many2many:competition_groups;" json:"groups"`
}