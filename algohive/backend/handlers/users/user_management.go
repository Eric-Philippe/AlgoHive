package users

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// createUser crée un nouvel utilisateur avec les informations de base
// firstName, lastName, email: informations de base de l'utilisateur
// retourne: l'utilisateur créé et une erreur éventuelle
func createUser(firstName, lastName, email string) (*models.User, error) {
	var user models.User
	user.Firstname = firstName
	user.Lastname = lastName
	user.Email = email
	
	// Générer un mot de passe par défaut
	hashedPassword, err := utils.CreateDefaultPassword()
	if err != nil {
		return nil, err
	}
	user.Password = hashedPassword
	
	// Créer l'utilisateur
	if err := database.DB.Create(&user).Error; err != nil {
		return nil, err
	}
	
	return &user, nil
}

// GetUsers récupère tous les utilisateurs accessibles à l'utilisateur authentifié
// @Summary Get All users that the curren user has access to 
// @Description Get all users that the current user has access to from his roles -> scopes -> groups
// @Tags Users
// @Success 200 {object} []models.User
// @Router /user/ [get]
// @Security Bearer
func GetUsers(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	var users []models.User
	
	// Les propriétaires peuvent voir tous les utilisateurs
	if permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		if err := database.DB.Preload("Roles").Preload("Groups").Find(&users).Error; err != nil {
			log.Printf("Error getting all users: %v", err)
			respondWithError(c, http.StatusInternalServerError, ErrFailedToGetUsers)
			return
		}
	} else {
		// Pour les utilisateurs sans rôles, uniquement ceux dans les mêmes groupes
		if len(user.Roles) == 0 {
			if err := getUsersInSameGroups(user.ID, &users); err != nil {
				log.Printf("Error getting users in same groups: %v", err)
				respondWithError(c, http.StatusInternalServerError, ErrFailedToGetUsers)
				return
			}
		} else {
			// Pour les utilisateurs avec des rôles, utiliser la hiérarchie role->scope->group
			if err := getUsersFromRoleScopes(user.ID, &users); err != nil {
				log.Printf("Error getting users from role scopes: %v", err)
				respondWithError(c, http.StatusInternalServerError, ErrFailedToGetUsers)
				return
			}
		}
	}

	c.JSON(http.StatusOK, users)
}

// getUsersInSameGroups récupère tous les utilisateurs qui sont dans les mêmes groupes que l'utilisateur
// userID: ID de l'utilisateur
// users: pointeur vers la slice d'utilisateurs à remplir
// retourne: une erreur éventuelle
func getUsersInSameGroups(userID string, users *[]models.User) error {
	return database.DB.Raw(`
		SELECT DISTINCT u.*
			FROM users u
			JOIN user_groups ug ON u.id = ug.user_id
			JOIN groups g ON ug.group_id = g.id
			JOIN user_groups aug ON g.id = aug.group_id
			JOIN users au ON aug.user_id = au.id
			WHERE au.id = ?
	`, userID).Scan(users).Error
}

// getUsersFromRoleScopes récupère tous les utilisateurs accessibles via les rôles->scopes->groupes
// userID: ID de l'utilisateur
// users: pointeur vers la slice d'utilisateurs à remplir
// retourne: une erreur éventuelle
func getUsersFromRoleScopes(userID string, users *[]models.User) error {
	var userIDs []string
	if err := database.DB.Raw(`
		SELECT DISTINCT u.id
			FROM users u
			JOIN user_groups ug ON u.id = ug.user_id
			JOIN groups g ON ug.group_id = g.id
			JOIN scopes s ON g.scope_id = s.id
			JOIN role_scopes rs ON s.id = rs.scope_id
			JOIN roles r ON rs.role_id = r.id
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = ?
	`, userID).Pluck("id", &userIDs).Error; err != nil {
		return err
	}
	
	// Si aucun utilisateur n'est trouvé, retourner une slice vide
	if len(userIDs) == 0 {
		*users = []models.User{}
		return nil
	}
	
	// Récupérer les utilisateurs avec leurs associations
	return database.DB.Preload("Roles").Preload("Groups").Where("id IN ?", userIDs).Find(users).Error
}

// DeleteUser supprime un utilisateur par ID
// @Summary Delete User
// @Description Delete a user by ID, if user isStaff, required ownership permission
// @Tags Users
// @Param id path string true "User ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/{id} [delete]
// @Security Bearer
func DeleteUser(c *gin.Context) {
    user, err := middleware.GetUserFromRequest(c)
    if err != nil {
        return
    }

    userID := c.Param("id")
    var targetUser models.User
    
    // Vérifier que l'utilisateur cible existe
    if err := database.DB.Where("id = ?", userID).First(&targetUser).Error; err != nil {
        respondWithError(c, http.StatusNotFound, ErrNotFound)
        return
    }

    // Vérifier les permissions
    if !HasPermissionForUser(user, targetUser.ID, permissions.OWNER) {
        respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDelete)
        return
    }

    // Commencer une transaction pour assurer l'atomicité des opérations
    tx := database.DB.Begin()

    // Supprimer les associations d'abord
    if err := tx.Model(&targetUser).Association("Roles").Clear(); err != nil {
        tx.Rollback()
        log.Printf("Error clearing user roles: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedAssociationRoles)
        return
    }
    
    if err := tx.Model(&targetUser).Association("Groups").Clear(); err != nil {
        tx.Rollback()
        log.Printf("Error clearing user groups: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedAssociationGroups)
        return
    }

    // Supprimer l'utilisateur
    if err := tx.Delete(&targetUser).Error; err != nil {
        tx.Rollback()
        log.Printf("Error deleting user: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedToDeleteUser)
        return
    }

    // Valider la transaction
    tx.Commit()
    
    c.Status(http.StatusNoContent)
}

// ToggleBlockUser change le statut de blocage d'un utilisateur
// @Summary Toggle block user
// @Description Toggle the block status of a user
// @Tags Users
// @Param id path string true "User ID"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/block/{id} [put]
// @Security Bearer
func ToggleBlockUser(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	userID := c.Param("id")
	var targetUser models.User
	
	// Vérifier que l'utilisateur cible existe
	if err := database.DB.Where("id = ?", userID).First(&targetUser).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrNotFound)
		return
	}

	// Vérifier les permissions
	if !HasPermissionForUser(user, targetUser.ID, permissions.OWNER) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionBlock)
		return
	}

	// Inverser le statut de blocage
	targetUser.Blocked = !targetUser.Blocked
	if err := database.DB.Save(&targetUser).Error; err != nil {
		log.Printf("Error toggling user block status: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to update user")
		return
	}

	c.JSON(http.StatusOK, targetUser)
}
