cd /opt/zubriq

git pull

# Перезбудуй і перезапусти тільки бота
docker compose -f docker-compose.prod.yml up -d --build bot

# Оновлення лендінгу
cp /opt/zubriq/landing/index.html /var/www/zubriq/

cp -r /opt/zubriq/html/images /var/www/zubriq/

# Логи бота в реальному часі
docker compose -f docker-compose.prod.yml logs -f bot

# Статус всіх сервісів
docker compose -f docker-compose.prod.yml ps

# Перезапуск бота
docker compose -f docker-compose.prod.yml restart bot

# Зайти в БД
docker compose -f docker-compose.prod.yml exec postgres psql -U zubriq

# Бекап БД
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U zubriq zubriq > backup_$(date +%Y%m%d).sql

# Скільки диску використовується
df -h
docker system df