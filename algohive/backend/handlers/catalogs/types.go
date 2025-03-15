package catalogs

import (
	"github.com/gin-gonic/gin"
)

// Constantes pour les messages d'erreur
const (
	ErrCatalogNotFound    = "API not found"
	ErrAPIReachFailed     = "Error while reaching the API"
	ErrDecodeResponseFailed = "Error while decoding the response"
	ErrNoPermissionView   = "User does not have permission to view Catalogs"
)

// PuzzleResponse représente la réponse d'un puzzle de l'API
type PuzzleResponse struct {
	Author          string `json:"author"`
	Cipher          string `json:"cipher"`
	CompressedSize  int    `json:"compressedSize"`
	CreatedAt       string `json:"createdAt"`
	Difficulty      string `json:"difficulty"`
	ID              string `json:"id"`
	Language        string `json:"language"`
	Name            string `json:"name"`
	Obscure         string `json:"obscure"`
	UncompressedSize int   `json:"uncompressedSize"`
	UpdatedAt       string `json:"updatedAt"`
}

// ThemeResponse représente la réponse d'un thème de l'API
type ThemeResponse struct {
	EnigmesCount int             `json:"enigmes_count"`
	Name         string          `json:"name"`
	Puzzles      []PuzzleResponse `json:"puzzles"`
	Size         int             `json:"size"`
}

// respondWithError envoie une réponse d'erreur standardisée
func respondWithError(c *gin.Context, status int, message string) {
	c.JSON(status, gin.H{"error": message})
}
