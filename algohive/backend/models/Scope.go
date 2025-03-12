package models

type Scope struct {
    ID              string            `gorm:"type:uuid;default:gen_random_uuid();primary_key" json:"id"`
    Name            string            `gorm:"type:varchar(50);unique;not null" json:"name"`
    Description     string            `gorm:"type:varchar(255)" json:"description"`
    Roles           []*Role           `gorm:"many2many:role_scopes;" json:"roles"`
    APIEnvironments []*APIEnvironment `gorm:"many2many:scope_api_environments;" json:"catalogs"`
    Groups          []*Group          `gorm:"foreignKey:ScopeID" json:"groups"`
}