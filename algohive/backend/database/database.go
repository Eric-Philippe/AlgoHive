package database

import (
	"fmt"
	"log"
	"os"

	"api/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }

    host := os.Getenv("POSTGRES_HOST")
    port := os.Getenv("POSTGRES_PORT")
    dbname := os.Getenv("POSTGRES_DB")
    user := os.Getenv("POSTGRES_USER")
    password := os.Getenv("POSTGRES_PASSWORD")

    dsn := fmt.Sprintf("host=%s port=%s user=%s dbname=%s password=%s sslmode=disable TimeZone=Europe/Paris", host, port, user, dbname, password)
    DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        log.Fatal("failed to connect database: ", err)
    }

    err = DB.AutoMigrate(
        &models.User{},
        &models.Role{},
        &models.Input{},
        &models.APIEnvironment{},
        &models.Scope{},
        &models.Group{},
        &models.Competition{},
        &models.Try{},
        &models.ScopeAPIAccess{},
        &models.CompetitionAccessibleTo{},
        &models.UserGroup{},
        &models.UserRole{},
    )
    if err != nil {
        log.Fatal("failed to migrate database: ", err)
    }
}