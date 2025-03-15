package groups

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAllGroups récupère tous les groupes
// @Summary Get all groups
// @Description Get all groups, only accessible to users with the GROUPS permission
// @Tags Groups
// @Accept json
// @Produce json
// @Success 200 {array} models.Group
// @Failure 401 {object} map[string]string
// @Router /groups [get]
// @Security Bearer
func GetAllGroups(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !permissions.RolesHavePermission(user.Roles, permissions.GROUPS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var groups []models.Group
	if err := database.DB.Find(&groups).Error; err != nil {
		log.Printf("Error getting all groups: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFetchingGroups)
		return
	}
	
	c.JSON(http.StatusOK, groups)
}

// GetGroup récupère un groupe par ID
// @Summary Get a group
// @Description Get a group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Success 200 {object} models.Group
// @Failure 400 {object} map[string]string
// @Router /groups/{group_id} [get]
// @Security Bearer
func GetGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	if err := database.DB.Where("id = ?", groupID).Preload("Users").Preload("Competitions").First(&group).Error; err != nil {
		respondWithError(c, http.StatusBadRequest, ErrGroupNotFound)
		return
	}

	if !userCanManageGroup(user.ID, &group) && !permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionViewGroup)
		return
	}

	c.JSON(http.StatusOK, group)
}

// CreateGroup crée un nouveau groupe
// @Summary Create a group
// @Description Create a group, only accessible to users with the GROUPS permission
// @Tags Groups
// @Accept json
// @Produce json
// @Param group body CreateGroupRequest true "Group to create"
// @Success 201 {object} models.Group
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups [post]
// @Security Bearer
func CreateGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Vérifier que l'utilisateur est staff
	if !permissions.IsStaff(user) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionCreate)
		return
	}

	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Vérifier que le scope existe
	var scopes []models.Scope
	if err := database.DB.Where("id = ?", req.ScopeId).Find(&scopes).Error; err != nil {
		log.Printf("Error finding scope: %v", err)
		respondWithError(c, http.StatusBadRequest, ErrInvalidScopeIDs)
		return
	}
	
	if len(scopes) == 0 {
		respondWithError(c, http.StatusBadRequest, ErrInvalidScopeIDs)
		return
	}

	// Créer le groupe
	group := models.Group{
		Name:        req.Name,
		Description: req.Description,
		ScopeID:     req.ScopeId,
	}
	
	if err := database.DB.Create(&group).Error; err != nil {
		log.Printf("Error creating group: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to create group")
		return
	}
	
	c.JSON(http.StatusCreated, group)
}

// DeleteGroup supprime un groupe et tous ses utilisateurs et compétitions
// @Summary Delete a group and cascade delete all users and competitions associated with the group
// @Description Delete a group and cascade delete all users and competitions associated with the group
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id} [delete]
// @Security Bearer
func DeleteGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	if err := database.DB.Where("id = ?", groupID).Preload("Users").Preload("Competitions").First(&group).Error; err != nil {
		respondWithError(c, http.StatusBadRequest, ErrGroupNotFound)
		return
	}

	if !userCanManageGroup(user.ID, &group) && !permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDelete)
		return
	}

	// Supprimer le groupe
	tx := database.DB.Begin()
	
	// Supprimer les associations d'abord
	if err := tx.Model(&group).Association("Users").Clear(); err != nil {
		tx.Rollback()
		log.Printf("Error clearing group users: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to clear group associations")
		return
	}
	
	if err := tx.Model(&group).Association("Competitions").Clear(); err != nil {
		tx.Rollback()
		log.Printf("Error clearing group competitions: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to clear group competitions")
		return
	}
	
	if err := tx.Delete(&group).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting group: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to delete group")
		return
	}
	
	tx.Commit()
	c.Status(http.StatusNoContent)
}

// UpdateGroup met à jour un groupe
// @Summary Update a group name and description
// @Description Update a group name and description
// @Tags Groups
// @Accept json
// @Produce json
// @Param group_id path string true "Group ID"
// @Param group body UpdateGroupRequest true "Group to update"
// @Success 204 {object} string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /groups/{group_id} [put]
// @Security Bearer
func UpdateGroup(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	groupID := c.Param("group_id")
	var group models.Group
	if err := database.DB.Where("id = ?", groupID).First(&group).Error; err != nil {
		respondWithError(c, http.StatusBadRequest, ErrGroupNotFound)
		return
	}

	if !userCanManageGroup(user.ID, &group) && !permissions.RolesHavePermission(user.Roles, permissions.OWNER) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionUpdate)
		return
	}

	var req UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, err.Error())
		return
	}

	// Mettre à jour uniquement les champs non vides
	updates := models.Group{}
	if req.Name != "" {
		updates.Name = req.Name
	}
	if req.Description != "" {
		updates.Description = req.Description
	}

	if err := database.DB.Model(&group).Updates(updates).Error; err != nil {
		log.Printf("Error updating group: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to update group")
		return
	}
	
	c.Status(http.StatusNoContent)
}

// GetGroupsFromScope récupère tous les groupes d'un scope
// @Summary Get all the groups from a given scope
// @Description Get all the groups from a given scope and list the users in each group
// @Tags Groups
// @Accept json
// @Produce json
// @Param scope_id path string true "Scope ID"
// @Success 200 {array} models.Group
// @Failure 400 {object} map[string]string
// @Router /groups/scope/{scope_id} [get]
func GetGroupsFromScope(c *gin.Context) {
	_, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	scopeID := c.Param("scope_id")
	var scope models.Scope
	if err := database.DB.Where("id = ?", scopeID).First(&scope).Error; err != nil {
		respondWithError(c, http.StatusBadRequest, ErrScopeNotFound)
		return
	}

	var groups []models.Group
	if err := database.DB.Where("scope_id = ?", scopeID).Preload("Users").Find(&groups).Error; err != nil {
		log.Printf("Error fetching groups from scope: %v", err)
		respondWithError(c, http.StatusBadRequest, ErrFetchingGroups)
		return
	}

	c.JSON(http.StatusOK, groups)
}
