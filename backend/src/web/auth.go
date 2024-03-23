package web

import (
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
)

// ================================================================================================
//
//	Global Types
//
// ================================================================================================

// ================================================================================================
//
//	Local Types
//
// ================================================================================================

// ================================================================================================
//
//	Global Variables
//
// ================================================================================================

// ================================================================================================
//
//	Local Variables
//
// ================================================================================================
var jwtKey = []byte("6540a5dc8816255260adf23ba88fd238")

// ================================================================================================
//
//	Global Functions
//
// ================================================================================================

// ================================================================================================
//
//	Local Functions
//
// ================================================================================================
func generateJwtToken(username string) string {
	claims := jwt.MapClaims{}
	claims["username"] = username
	claims["timestamp"] = time.Now().Unix()
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		logger.Println("Error generating Jwt token:", err)
		return ""
	}

	return tokenString
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authorizationHeader := c.GetHeader("Authorization")
		if authorizationHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized to see this page! Please login/register!"})
			c.Abort()
			return
		}

		tokenString := strings.Split(authorizationHeader, " ")[1]
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			c.Abort()
			return
		}

		usernameRoute := c.Param("username")
		usernameToken := claims["username"].(string)
		if usernameRoute != usernameToken {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized to see this page! Please login/register!"})
			c.Abort()
			return
		}

		timestamp := int64(claims["timestamp"].(float64))
		tokenCreationTime := time.Unix(timestamp, 0)
		expirationTime := tokenCreationTime.Add(time.Hour)

		if time.Now().After(expirationTime) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token has expired"})
			c.Abort()
			return
		}

		c.Next()
	}
}
