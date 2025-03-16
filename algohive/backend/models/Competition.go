package models

type Competition struct {
	ID              string    `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
	Title           string    `gorm:"type:varchar(100);not null;unique" json:"title"`
	Description     string    `gorm:"type:text;not null" json:"description"`
	Finished        bool      `gorm:"not null" json:"finished"`
	Show            bool      `gorm:"not null" json:"show"`
	ApiTheme        string    `gorm:"type:varchar(50);not null;column:api_theme" json:"api_theme"`
	ApiEnvironmentID string    `gorm:"type:uuid;not null;column:api_environment_id" json:"api_environment_id"`
	ApiEnvironment  *Catalog   `gorm:"foreignKey:ApiEnvironmentID" json:"api_environment,omitempty"`
	Groups         []*Group   `gorm:"many2many:competition_groups;" json:"groups,omitempty"`
	Tries          []*Try     `gorm:"foreignKey:CompetitionID" json:"tries,omitempty"`
}