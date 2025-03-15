package competitions

import (
	"api/database"
	"api/middleware"
	"api/models"
	"api/utils/permissions"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// CreateTryRequest modèle pour créer un essai
type CreateTryRequest struct {
	PuzzleID    string `json:"puzzle_id" binding:"required"`
	PuzzleIndex int    `json:"puzzle_index" binding:"required"`
	PuzzleLvl   string `json:"puzzle_lvl" binding:"required"`
	Step        int    `json:"step" binding:"required"`
}

// UpdateTryRequest modèle pour mettre à jour un essai
type UpdateTryRequest struct {
	EndTime  string  `json:"end_time" binding:"required"`
	Attempts int     `json:"attempts" binding:"required"`
	Score    float64 `json:"score" binding:"required"`
}

// StartCompetitionTry démarre un essai pour une compétition
// @Summary Start a competition try
// @Description Start a new try for a puzzle in a competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param try body CreateTryRequest true "Try details"
// @Success 201 {object} models.Try
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/tries [post]
// @Security Bearer
func StartCompetitionTry(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")
	
	// Vérifier si l'utilisateur a accès à la compétition
	if !userHasAccessToCompetition(user.ID, competitionID) && !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	// Vérifier si la compétition est terminée
	if competition.Finished {
		respondWithError(c, http.StatusBadRequest, "Competition is already finished")
		return
	}

	var req CreateTryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, ErrInvalidRequest)
		return
	}

	// Créer un nouveau try
	now := time.Now()
	try := models.Try{
		PuzzleID:      req.PuzzleID,
		PuzzleIndex:   req.PuzzleIndex,
		PuzzleLvl:     req.PuzzleLvl,
		Step:          req.Step,
		StartTime:     now.Format(time.RFC3339),
		Attempts:      0,
		Score:         0,
		CompetitionID: competitionID,
		UserID:        user.ID,
	}

	if err := database.DB.Create(&try).Error; err != nil {
		log.Printf("Error creating try: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to create try")
		return
	}

	c.JSON(http.StatusCreated, try)
}

// FinishCompetitionTry termine un essai pour une compétition
// @Summary Finish a competition try
// @Description Complete an ongoing try for a puzzle in a competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param try_id path string true "Try ID"
// @Param try body UpdateTryRequest true "Try details"
// @Success 200 {object} models.Try
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/tries/{try_id} [put]
// @Security Bearer
func FinishCompetitionTry(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")
	tryID := c.Param("try_id")

	var try models.Try
	if err := database.DB.Where("id = ? AND competition_id = ? AND user_id = ?", 
		tryID, competitionID, user.ID).First(&try).Error; err != nil {
		respondWithError(c, http.StatusNotFound, "Try not found")
		return
	}

	// Vérifier si l'essai est déjà terminé
	if try.EndTime != nil {
		respondWithError(c, http.StatusBadRequest, "Try is already finished")
		return
	}

	var req UpdateTryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, ErrInvalidRequest)
		return
	}

	// Mettre à jour l'essai
	try.EndTime = &req.EndTime
	try.Attempts = req.Attempts
	try.Score = req.Score

	if err := database.DB.Save(&try).Error; err != nil {
		log.Printf("Error updating try: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to update try")
		return
	}

	c.JSON(http.StatusOK, try)
}

// GetCompetitionTries récupère tous les essais d'une compétition
// @Summary Get all tries for a competition
// @Description Get all tries for the specified competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Success 200 {array} models.Try
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/tries [get]
// @Security Bearer
func GetCompetitionTries(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")

	// Vérifier si l'utilisateur a la permission de voir tous les essais ou seulement les siens
	var tries []models.Try
	if hasCompetitionPermission(user, permissions.COMPETITIONS) {
		// Les administrateurs peuvent voir tous les essais
		if err := database.DB.Where("competition_id = ?", competitionID).
			Preload("User").Find(&tries).Error; err != nil {
			log.Printf("Error fetching competition tries: %v", err)
			respondWithError(c, http.StatusInternalServerError, "Failed to fetch tries")
			return
		}
	} else {
		// Les utilisateurs normaux peuvent voir seulement leurs essais
		if err := database.DB.Where("competition_id = ? AND user_id = ?", 
			competitionID, user.ID).Find(&tries).Error; err != nil {
			log.Printf("Error fetching user competition tries: %v", err)
			respondWithError(c, http.StatusInternalServerError, "Failed to fetch tries")
			return
		}
	}

	c.JSON(http.StatusOK, tries)
}

// GetCompetitionStatistics récupère les statistiques d'une compétition
// @Summary Get competition statistics
// @Description Get statistics for the specified competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Success 200 {object} CompetitionStatsResponse
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/statistics [get]
// @Security Bearer
func GetCompetitionStatistics(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")

	// Vérifier si l'utilisateur a accès à la compétition
	if !userHasAccessToCompetition(user.ID, competitionID) && !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionView)
		return
	}

	var competition models.Competition
	if err := database.DB.First(&competition, "id = ?", competitionID).Error; err != nil {
		respondWithError(c, http.StatusNotFound, ErrCompetitionNotFound)
		return
	}

	// Calculer les statistiques
	var totalUsers int64
	var activeUsers int64
	var completionRate float64
	var averageScore float64
	var highestScore float64

	// Nombre total d'utilisateurs qui ont au moins un essai
	database.DB.Model(&models.Try{}).
		Select("COUNT(DISTINCT user_id)").
		Where("competition_id = ?", competitionID).
		Count(&totalUsers)

	// Nombre d'utilisateurs actifs (qui ont au moins un essai terminé)
	database.DB.Model(&models.Try{}).
		Select("COUNT(DISTINCT user_id)").
		Where("competition_id = ? AND end_time IS NOT NULL", competitionID).
		Count(&activeUsers)

	// Calcul du taux de complétion, de la moyenne des scores et du score le plus élevé
	if totalUsers > 0 {
		completionRate = float64(activeUsers) / float64(totalUsers) * 100
		
		// Score moyen
		database.DB.Model(&models.Try{}).
			Select("COALESCE(AVG(score), 0)").
			Where("competition_id = ? AND end_time IS NOT NULL", competitionID).
			Scan(&averageScore)
		
		// Score le plus élevé
		database.DB.Model(&models.Try{}).
			Select("COALESCE(MAX(score), 0)").
			Where("competition_id = ? AND end_time IS NOT NULL", competitionID).
			Scan(&highestScore)
	}

	stats := CompetitionStatsResponse{
		CompetitionID:  competitionID,
		Title:          competition.Title,
		TotalUsers:     int(totalUsers),
		ActiveUsers:    int(activeUsers),
		CompletionRate: completionRate,
		AverageScore:   averageScore,
		HighestScore:   highestScore,
	}

	c.JSON(http.StatusOK, stats)
}

// GetUserCompetitionTries récupère tous les essais d'un utilisateur pour une compétition
// @Summary Get user tries for a competition
// @Description Get all tries for a specific user in the specified competition
// @Tags Competitions
// @Accept json
// @Produce json
// @Param id path string true "Competition ID"
// @Param user_id path string true "User ID"
// @Success 200 {array} models.Try
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /competitions/{id}/users/{user_id}/tries [get]
// @Security Bearer
func GetUserCompetitionTries(c *gin.Context) {
	user, err := middleware.GetUserFromRequest(c)
	if err != nil {
		return
	}

	competitionID := c.Param("id")
	targetUserID := c.Param("user_id")

	// Vérifier si l'utilisateur a la permission de voir les essais des autres
	if user.ID != targetUserID && !hasCompetitionPermission(user, permissions.COMPETITIONS) {
		respondWithError(c, http.StatusUnauthorized, ErrNoPermissionViewTries)
		return
	}

	var tries []models.Try
	if err := database.DB.Where("competition_id = ? AND user_id = ?", 
		competitionID, targetUserID).Find(&tries).Error; err != nil {
		log.Printf("Error fetching user competition tries: %v", err)
		respondWithError(c, http.StatusInternalServerError, "Failed to fetch tries")
		return
	}

	c.JSON(http.StatusOK, tries)
}
