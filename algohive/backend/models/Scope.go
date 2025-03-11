package models

type Scope struct {
    ID              string            `gorm:"type:uuid;default:gen_random_uuid();primary_key"`
    Name            string            `gorm:"type:varchar(50);unique;not null"`
    Description     string            `gorm:"type:varchar(255)"`
    Roles           []*Role           `gorm:"many2many:role_scopes;"`
    APIEnvironments []*APIEnvironment `gorm:"many2many:scope_api_environments;"`
    Groups          []*Group          `gorm:"foreignKey:ScopeID"`
}