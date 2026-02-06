// File: test/helpers_test.go
package test

import (
	"database/sql"
	"fmt"
	"os"
	"strings"
	"testing"

	_ "github.com/snowflakedb/gosnowflake"
	"github.com/stretchr/testify/require"
)

type WarehouseProps struct {
	Name    string
	Size    string
	Comment string
}

func openSnowflake(t *testing.T) *sql.DB {
	t.Helper()

	account := mustEnv(t, "SNOWFLAKE_ACCOUNT")
	user := mustEnv(t, "SNOWFLAKE_USER")
	pass := mustEnv(t, "SNOWFLAKE_PASSWORD")

	role := os.Getenv("SNOWFLAKE_ROLE")
	wh := os.Getenv("SNOWFLAKE_WAREHOUSE")
	dbName := os.Getenv("SNOWFLAKE_DATABASE")
	schema := os.Getenv("SNOWFLAKE_SCHEMA")

	base := fmt.Sprintf("%s:%s@%s", user, pass, account)

	path := ""
	if dbName != "" {
		path = "/" + dbName
		if schema != "" {
			path += "/" + schema
		}
	}

	qs := []string{}
	if role != "" {
		qs = append(qs, "role="+urlEncode(role))
	}
	if wh != "" {
		qs = append(qs, "warehouse="+urlEncode(wh))
	}

	dsn := base + path
	if len(qs) > 0 {
		dsn += "?" + strings.Join(qs, "&")
	}

	db, err := sql.Open("snowflake", dsn)
	require.NoError(t, err)
	require.NoError(t, db.Ping())
	return db
}

func warehouseExists(t *testing.T, db *sql.DB, warehouseName string) bool {
	t.Helper()

	q := fmt.Sprintf("SHOW WAREHOUSES LIKE '%s';", escapeLike(warehouseName))
	rows, err := db.Query(q)
	require.NoError(t, err)
	defer func() { _ = rows.Close() }()

	return rows.Next()
}

func fetchWarehouseProps(t *testing.T, db *sql.DB, warehouseName string) WarehouseProps {
	t.Helper()

	show := fmt.Sprintf("SHOW WAREHOUSES LIKE '%s';", escapeLike(warehouseName))

	var queryID string
	err := db.QueryRow(show + " SELECT LAST_QUERY_ID();").Scan(&queryID)
	require.NoError(t, err)

	q := fmt.Sprintf(`
		SELECT
			"name"   AS name,
			"size"   AS size,
			"comment" AS comment
		FROM TABLE(RESULT_SCAN('%s'))
		LIMIT 1;
	`, queryID)

	var name, size, comment sql.NullString
	err = db.QueryRow(q).Scan(&name, &size, &comment)
	require.NoError(t, err)

	require.True(t, name.Valid, "Warehouse name not returned from SHOW WAREHOUSES")
	return WarehouseProps{
		Name:    name.String,
		Size:    size.String,
		Comment: comment.String,
	}
}

func mustEnv(t *testing.T, key string) string {
	t.Helper()
	v := strings.TrimSpace(os.Getenv(key))
	require.NotEmpty(t, v, "Missing required environment variable %s", key)
	return v
}

func escapeLike(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

func urlEncode(s string) string {
	r := strings.NewReplacer(
		" ", "%20",
		"&", "%26",
		"=", "%3D",
		"+", "%2B",
	)
	return r.Replace(s)
}
