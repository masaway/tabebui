#!/bin/bash

echo "Swagger UIを起動しています..."
echo "URL: http://localhost:8080"

cd src && docker compose up swagger-ui -d

echo "起動完了！"
echo "ブラウザで http://localhost:8080 にアクセスしてSwagger UIを確認してください"