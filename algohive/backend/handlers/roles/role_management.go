package roles

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateRole crée un nouveau rôle
// @Summary Create a new Role
// @Description Create a new Role
// @Tags Roles
// @Accept json
// @Produce json
// @Param role body CreateRoleRequest true "Role Profile"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Router /roles [post]
// @Security Bearer
func CreateRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionCreate)
		return
	}

	var createRoleRequest CreateRoleRequest
	if err := c.ShouldBindJSON(&createRoleRequest); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Si des scopes sont spécifiés, les récupérer
	var scopePointers []*models.Scope
	if len(createRoleRequest.ScopesIds) > 0 {
		var scopes []models.Scope
		if err := database.DB.Where("id IN (?)", createRoleRequest.ScopesIds).Find(&scopes).Error; err != nil {
			log.Printf("Error finding scopes: %v", err)
			respondWithError(c, http.StatusBadRequest, "Invalid scope IDs")
			return
		}
		
		for i := range scopes {
			scopePointers = append(scopePointers, &scopes[i])
		}
	}

	// Créer le rôle
	role := models.Role{
		Name:        createRoleRequest.Name,
		Permissions: createRoleRequest.Permission,
		Scopes:      scopePointers,
	}

	if err := database.DB.Create(&role).Error; err != nil {
		log.Printf("Error creating role: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to create role")
		return
	}

	c.JSON(http.StatusCreated, role)
}

// GetAllRoles récupère tous les rôles
// @Summary Get all Roles
// @Description Get all Roles
// @Tags Roles
// @Accept json
// @Produce json
// @Success 200 {array} models.Role
// @Router /roles [get]
// @Security Bearer
func GetAllRoles(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var roles []models.Role
	if err := database.DB.Preload("Users").Preload("Scopes").Find(&roles).Error; err != nil {
		log.Printf("Error getting all roles: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to fetch roles")
		return
	}
	
	c.JSON(http.StatusOK, roles)
}

// GetRoleByID récupère un rôle par son ID
// @Summary Get a Role by ID
// @Description Get a Role by ID
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Role
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [get]
// @Security Bearer
func GetRoleByID(c *gin.Context) {
	roleID := c.Param("role_id")

	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}

	c.JSON(http.StatusOK, role)
}

// UpdateRoleByID met à jour un rôle par son ID
// @Summary Update a Role by ID
// @Description Update a Role by ID
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Param role body models.Role true "Role Profile"
// @Success 200 {object} models.Role
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [put]
// @Security Bearer
func UpdateRoleByID(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
	if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionUpdate)
		return
	}

	roleID := c.Param("role_id")

	var role models.Role
	if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
		return
	}

	// Mettre à jour le rôle avec les nouvelles valeurs
	if err := c.ShouldBindJSON(&role); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := database.DB.Save(&role).Error; err != nil {
		log.Printf("Error updating role: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to update role")
		return
	}

	c.JSON(http.StatusOK, role)
}

// DeleteRole supprime un rôle et ses associations
// @Summary delete a role
// @Description delete a role and cascade first to roles_scopes and user_roles
// @Tags Roles
// @Accept json
// @Produce json
// @Param role_id path string true "Role ID"
// @Success 200 {object} models.Role
// @Failure 404 {object} map[string]string
// @Router /roles/{role_id} [delete]
// @Security Bearer
func DeleteRole(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier les permissions
    if !permissions.RolesHavePermission(user.Roles, permissions.ROLES) {
        respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDelete)
        return
    }

	roleID := c.Param("role_id")

    var role models.Role
    if err := database.DB.Where("id = ?", roleID).First(&role).Error; err != nil {
        respondWithError(c, http.StatusNotFound, ErrRoleNotFound)
        return
    }

    // Commencer une transaction pour assurer l'atomicité des opérations
    tx := database.DB.Begin()

    // Supprimer le rôle de tous les utilisateurs qui l'ont (user_roles)
    if err := tx.Exec("DELETE FROM user_roles WHERE role_id = ?", roleID).Error; err != nil {
        tx.Rollback()
        log.Printf("Error removing role from users: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedRoleUserRemove)
        return
    }

    // Supprimer toutes les associations avec les scopes (role_scopes)
    if err := tx.Exec("DELETE FROM role_scopes WHERE role_id = ?", roleID).Error; err != nil {
        tx.Rollback()
        log.Printf("Error removing role from scopes: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedRoleScopeRemove)
        return
    }

    // Enfin, supprimer le rôle lui-même
    if err := tx.Delete(&role).Error; err != nil {
        tx.Rollback()
        log.Printf("Error deleting role: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedRoleDelete)
        return
    }

    // Valider la transaction
    if err := tx.Commit().Error; err != nil {
        log.Printf("Error committing transaction: %v", err)
        respondWithError(c, http.StatusInternalServerError, ErrFailedTxCommit)
        return
    }

    c.JSON(http.StatusOK, role)
}
