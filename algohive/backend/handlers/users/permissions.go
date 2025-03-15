package users

import (
	"api/database"
	"api/models"
	"api/utils/permissions"
	"log"
)

// UserOwnsTargetGroups vérifie si l'utilisateur authentifié possède au moins un groupe
// auquel appartient l'utilisateur cible
// userID: ID de l'utilisateur authentifié
// targetUserID: ID de l'utilisateur cible
// retourne: true si l'utilisateur authentifié possède au moins un groupe de l'utilisateur cible
func UserOwnsTargetGroups(userID string, targetUserID string) bool {
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
    `, targetUserID, userID).Count(&count).Error

    if err != nil {
        log.Printf("Error checking if user owns target groups: %v", err)
        return false
    }
    
    return count > 0
}

// hasPermissionForUser vérifie si l'utilisateur a les permissions nécessaires pour agir sur l'utilisateur cible
// user: l'utilisateur authentifié
// targetUserID: ID de l'utilisateur cible
// requiredPermission: permission requise si l'utilisateur n'est pas propriétaire du groupe
func HasPermissionForUser(user models.User, targetUserID string, requiredPermission int) bool {
    // Les propriétaires ont toutes les permissions
    if permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
        return true
    }
    
    // Sinon vérifier si l'utilisateur possède un groupe de l'utilisateur cible
    return UserOwnsTargetGroups(user.ID, targetUserID) || 
           permissions.RolesHavePermission(user.Roles, requiredPermission)
}
