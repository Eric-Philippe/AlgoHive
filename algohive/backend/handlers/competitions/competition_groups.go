package competitions

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AddGroupToCompetition ajoute un groupe à une compétition
// @Summary Add a group to a competition
// @Description Allow users in a group to access a competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param group_id path string true "Group ID"
// @Success 200 {object} models.Competition
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/groups/{group_id} [post]
// @Security Bearer
func AddGroupToCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionManageGroups)
		return
	}

	competitionID := c.Param("id")
	groupID := c.Param("group_id")

	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	var group models.Group
	if err := database.DB.First(&group, "id = ?", groupID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrGroupNotFound)
		return
	}

	// Ajouter le groupe à la compétition
	if err := database.DB.Exec("INSERT INTO competition_accessible_to (group_id, competition_id) VALUES (?, ?) ON CONFLICT DO NOTHING", 
		groupID, competitionID).Error; err != nil {
		log.Printf("Error adding group to competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedAddGroup)
		return
	}

	// Recharger la compétition avec ses associations
	database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competition, competition.ID)

	c.JSON(http.StatusOK, competition)
}

// RemoveGroupFromCompetition supprime un groupe d'une compétition
// @Summary Remove a group from a competition
// @Description Remove group access to a competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param group_id path string true "Group ID"
// @Success 200 {object} models.Competition
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/groups/{group_id} [delete]
// @Security Bearer
func RemoveGroupFromCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionManageGroups)
		return
	}

	competitionID := c.Param("id")
	groupID := c.Param("group_id")

	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	var group models.Group
	if err := database.DB.First(&group, "id = ?", groupID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrGroupNotFound)
		return
	}

	// Supprimer le groupe de la compétition
	if err := database.DB.Exec("DELETE FROM competition_accessible_to WHERE group_id = ? AND competition_id = ?", 
		groupID, competitionID).Error; err != nil {
		log.Printf("Error removing group from competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedRemoveGroup)
		return
	}

	// Recharger la compétition avec ses associations
	database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competition, competition.ID)

	c.JSON(http.StatusOK, competition)
}

// GetCompetitionGroups récupère tous les groupes ayant accès à une compétition
// @Summary Get all groups with access to a competition
// @Description Get all groups that have access to the specified competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Success 200 {array} models.Group
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/groups [get]
// @Security Bearer
func GetCompetitionGroups(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionManageGroups)
		return
	}

	competitionID := c.Param("id")
	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	var groups []models.Group
	if err := database.DB.Joins("JOIN competition_accessible_to cat ON cat.group_id = groups.id").
		Where("cat.competition_id = ?", competitionID).
		Find(&groups).Error; err != nil {
		log.Printf("Error fetching competition groups: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to fetch groups")
		return
	}

	c.JSON(http.StatusOK, groups)
}
