package utils

import (
	"api/models"
)

// convertRoles converts []*models.Role to []models.Role
func ConvertRoles(roles []*models.Role) []models.Role {
    var result []models.Role
    for _, role := range roles {
        result = append(result, *role)
    }
    return result
}

// convertGroups converts []*models.Group to []models.Group
func ConvertGroups(groups []*models.Group) []models.Group {
    var result []models.Group
    for _, group := range groups {
        result = append(result, *group)
    }
    return result
}

// convertAPIEnvironments converts []*models.APIEnvironment to []models.APIEnvironment
func ConvertAPIEnvironments(environments []*models.APIEnvironment) []models.APIEnvironment {
	var result []models.APIEnvironment
	for _, environment := range environments {
		result = append(result, *environment)
	}
	return result
}

func ContainsScope(scopes []models.Scope, scopeId string) bool {
	for _, s := range scopes {
		if s.ID == scopeId {
			return true
		}
	}
	return false
}