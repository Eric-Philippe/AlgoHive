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

// hasCompetitionPermission vérifie si l'utilisateur a une permission spécifique
func hasCompetitionPermission(user models.User, permission int) bool {
	return permissions.IsStaff(user) || permissions.RolesHavePermission(user.Roles, permission)
}

// GetAllCompetitions récupère toutes les compétitions
// @Summary Get all competitions
// @Description Get all competitions, only accessible to users with the COMPETITIONS permission
// @Tags Competitions
// @Accept json
// @Produce json
// @Success 200 {array} models.Competition
// @Failure 401 {object} map[string]string
// @Router /competitions [get]
// @Security Bearer
func GetAllCompetitions(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) && !permissions.IsOwner(user) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var competitions []models.Competition
	if err := database.DB.Preload("ApiEnvironment").Preload("Groups").Find(&competitions).Error; err != nil {
		log.Printf("Error getting all competitions: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedFetchCompetitions)
		return
	}

	c.JSON(http.StatusOK, competitions)
}

// GetUserCompetitions récupère toutes les compétitions accessibles à l'utilisateur
// @Summary Get user accessible competitions
// @Description Get all competitions accessible to the current user through their groups
// @Tags Competitions
// @Accept json
// @Produce json
// @Success 200 {array} models.Competition
// @Failure 401 {object} map[string]string
// @Router /competitions/user [get]
// @Security Bearer
func GetUserCompetitions(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	// Si l'utilisateur a la permission COMPETITIONS ou est OWNER, il voit toutes les compétitions
	if hasCompetitionPermission(user, permissions.COMPETITIONS) || permissions.IsOwner(user) {
		GetAllCompetitions(c)
		return
	}

	var competitions []models.Competition
	// Récupérer les compétitions accessibles via les groupes de l'utilisateur
	if err := database.DB.Raw(`
		SELECT DISTINCT c.*
		FROM competitions c
		JOIN competition_accessible_to cat ON c.id = cat.competition_id
		JOIN user_groups ug ON cat.group_id = ug.group_id
		WHERE ug.user_id = ? AND c.show = true
	`, user.ID).Scan(&competitions).Error; err != nil {
		log.Printf("Error getting user competitions: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedFetchCompetitions)
		return
	}

	// Charger les associations
	for i := range competitions {
		database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competitions[i], competitions[i].ID)
	}

	c.JSON(http.StatusOK, competitions)
}

// GetCompetition récupère une compétition par ID
// @Summary Get a competition by ID
// @Description Get a competition by ID
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Success 200 {object} models.Competition
// @Failure 404 {object} map[string]string
// @Router /competitions/{id} [get]
// @Security Bearer
func GetCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")
	var competition models.Competition

	if err := database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	// Vérifier si l'utilisateur a accès à cette compétition
	hasAccess := hasCompetitionPermission(user, permissions.COMPETITIONS) || 
				permissions.IsOwner(user) ||
				userHasAccessToCompetition(user.ID, competitionID)

	if !hasAccess {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	c.JSON(http.StatusOK, competition)
}

// CreateCompetition crée une nouvelle compétition
// @Summary Create a competition
// @Description Create a new competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param competition body CreateCompetitionRequest true "Competition to create"
// @Success 201 {object} models.Competition
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /competitions [post]
// @Security Bearer
func CreateCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionCreate)
		return
	}

	var req CreateCompetitionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, ErrInvalidRequest)
		return
	}

	// Vérifier que l'environnement API existe
	var apiEnv models.Catalog
	if err := database.DB.First(&apiEnv, "id = ?", req.ApiEnvironmentID).Error; err != nil {
		respondWithError(c, http.StatusBadRequest, ErrCatalogNotFound)
		return
	}

	// Créer la compétition
	competition := models.Competition{
		Title:           req.Title,
		Description:     req.Description,
		ApiTheme:        req.ApiTheme,
		ApiEnvironmentID: req.ApiEnvironmentID,
		Finished:        false,
		Show:            req.Show,
	}

	// Transaction pour assurer l'atomicité des opérations
	tx := database.DB.Begin()

	if err := tx.Create(&competition).Error; err != nil {
		tx.Rollback()
		log.Printf("Error creating competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedCreateCompetition)
		return
	}

	// Ajouter les groupes si spécifiés
	if len(req.GroupIds) > 0 {
		var groups []models.Group
		if err := database.DB.Where("id IN ?", req.GroupIds).Find(&groups).Error; err != nil {
			tx.Rollback()
			respondWithError(c, http.StatusBadRequest, ErrGroupNotFound)
			return
		}

		if err := tx.Model(&competition).Association("Groups").Append(groups); err != nil {
			tx.Rollback()
			log.Printf("Error attaching groups to competition: %v", err)
			respondWithError(c, http.StatusInternalServerError, ErrFailedAddGroup)
			return
		}
	}

	tx.Commit()

	// Recharger la compétition avec ses associations
	database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competition, competition.ID)

	c.JSON(http.StatusCreated, competition)
}

// UpdateCompetition met à jour une compétition existante
// @Summary Update a competition
// @Description Update an existing competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param competition body UpdateCompetitionRequest true "Updated competition data"
// @Success 200 {object} models.Competition
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id} [put]
// @Security Bearer
func UpdateCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionUpdate)
		return
	}

	competitionID := c.Param("id")
	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	var req UpdateCompetitionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, ErrInvalidRequest)
		return
	}

	// Mettre à jour les champs fournis
	updateData := make(map[string]interface{})
	
	if req.Title != "" {
		updateData["title"] = req.Title
	}
	if req.Description != "" {
		updateData["description"] = req.Description
	}
	if req.ApiTheme != "" {
		updateData["api_theme"] = req.ApiTheme
	}
	if req.ApiEnvironmentID != "" {
		// Vérifier que l'environnement API existe
		var apiEnv models.Catalog
		if err := database.DB.First(&apiEnv, "id = ?", req.ApiEnvironmentID).Error; err != nil {
			respondWithError(c, http.StatusBadRequest, ErrCatalogNotFound)
			return
		}
		updateData["api_environment_id"] = req.ApiEnvironmentID
	}
	if req.Finished != nil {
		updateData["finished"] = *req.Finished
	}
	if req.Show != nil {
		updateData["show"] = *req.Show
	}

	if err := database.DB.Model(&competition).Updates(updateData).Error; err != nil {
		log.Printf("Error updating competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedUpdateCompetition)
		return
	}

	// Recharger la compétition avec ses associations
	database.DB.Preload("ApiEnvironment").Preload("Groups").First(&competition, competition.ID)

	c.JSON(http.StatusOK, competition)
}

// DeleteCompetition supprime une compétition
// @Summary Delete a competition
// @Description Delete a competition and all related data
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Success 204 {object} string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id} [delete]
// @Security Bearer
func DeleteCompetition(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	if !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionDelete)
		return
	}

	competitionID := c.Param("id")
	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	// Transaction pour assurer l'atomicité des opérations
	tx := database.DB.Begin()

	// Supprimer d'abord les essais liés à cette compétition
	if err := tx.Where("competition_id = ?", competitionID).Delete(&models.Try{}).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting tries for competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedDeleteCompetition)
		return
	}

	// Supprimer les associations avec les groupes
	if err := tx.Exec("DELETE FROM competition_accessible_to WHERE competition_id = ?", competitionID).Error; err != nil {
		tx.Rollback()
		log.Printf("Error removing group associations for competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedDeleteCompetition)
		return
	}

	// Supprimer la compétition
	if err := tx.Delete(&competition).Error; err != nil {
		tx.Rollback()
		log.Printf("Error deleting competition: %v", err)
		respondWithError(c, http.StatusInternalServerError, ErrFailedDeleteCompetition)
		return
	}

	tx.Commit()

	c.Status(http.StatusNoContent)
}

// userHasAccessToCompetition vérifie si un utilisateur a accès à une compétition via ses groupes
func userHasAccessToCompetition(userID string, competitionID string) bool {
	var count int64
	err := database.DB.Raw(`
		SELECT COUNT(*)
		FROM competition_accessible_to cat
		JOIN user_groups ug ON cat.group_id = ug.group_id
		WHERE ug.user_id = ? AND cat.competition_id = ? AND (
			SELECT show FROM competitions WHERE id = ?
		) = true
	`, userID, competitionID, competitionID).Count(&count).Error

	if err != nil {
		log.Printf("Error checking user access to competition: %v", err)
		return false
	}

	return count > 0
}
