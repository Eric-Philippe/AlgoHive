package groups

import (
	"api/database"
	"api/models"
	"api/utils/permissions"
)

// userCanManageGroup vérifie si au moins un des rôles de l'utilisateur possède un scope qui contient le groupe spécifié
// userID: ID de l'utilisateur
// group: pointeur vers le groupe à vérifier
// retourne: true si l'utilisateur peut gérer le groupe, false sinon
func userCanManageGroup(userID string, group *models.Group) bool {
	// Récupérer la cascade user -> roles -> scopes -> groups depuis la base de données
	var user models.User
	if err := database.DB.Where("id = ?", userID).Preload("Roles.Scopes.Groups").First(&user).Error; err != nil {
		return false
	}
	
	for _, role := range user.Roles {
		for _, scope := range role.Scopes {
			for _, g := range scope.Groups {
				if g.ID == group.ID {
					return true
				}
			}
		}
	}
	
	return false
}

// UserOwnsTargetGroups vérifie si l'utilisateur authentifié possède au moins un groupe
// auquel appartient l'utilisateur cible ou le groupe cible
// userID: ID de l'utilisateur authentifié
// targetID: ID de l'utilisateur cible ou du groupe cible
// retourne: true si l'utilisateur authentifié possède au moins un groupe contenant la cible
func UserOwnsTargetGroups(userID string, targetID string) bool {
    var count int64
    err := database.DB.Raw(`
        SELECT COUNT(DISTINCT g1.id) 
        FROM groups g1
        JOIN user_groups ug ON g1.id = ug.group_id
        WHERE ug.user_id = ? 
        AND g1.id IN (
            SELECT DISTINCT g2.id
            FROM groups g2
            JOIN scopes s ON g2.scope_id = s.id
            JOIN role_scopes rs ON s.id = rs.scope_id
            JOIN roles r ON rs.role_id = r.id
            JOIN user_roles ur ON r.id = ur.role_id
            WHERE ur.user_id = ?
        )
    `, targetID, userID).Count(&count).Error

    if err != nil {
        return false
    }
    
    return count > 0
}

// checkGroupPermission vérifie si l'utilisateur a les permissions nécessaires sur le groupe
// userID: ID de l'utilisateur
// groupID: ID du groupe
// retourne: le groupe et un booléen indiquant si l'utilisateur a les permissions
func checkGroupPermission(userID string, groupID string) (*models.Group, bool) {
	var group models.Group
	if err := database.DB.Where("id = ?", groupID).First(&group).Error; err != nil {
		return nil, false
	}
	
	return &group, userCanManageGroup(userID, &group)
}

// hasGroupPermission vérifie si l'utilisateur a une permission spécifique
// user: utilisateur à vérifier
// permission: permission requise
// retourne: true si l'utilisateur a la permission
func hasGroupPermission(user models.User, permission int) bool {
	return permissions.IsStaff(user) || permissions.RolesHavePermission(user.Roles, permission)
}
