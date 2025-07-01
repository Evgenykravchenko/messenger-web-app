#!/usr/bin/env bash
set -e

# Запускаем mongod в фоне
mongod --replSet rs0 --bind_ip_all --fork --logpath /var/log/mongodb.log

# Ждём, пока база станет доступна
until mongosh --eval "db.adminCommand('ping')" &> /dev/null; do
  echo "waiting for mongod..."
  sleep 1
done

# Инициализируем replica set, если не инициализирован
if [ "$(mongosh --quiet --eval "rs.status().ok")" != "1" ]; then
  echo "initiating replica set..."
  mongosh --eval "rs.initiate({ _id: 'rs0', members:[{ _id:0, host:'mongo:27017' }] })"
else
  echo "replica set already initialized"
fi

# Лог в stdout
tail -n +1 -f /var/log/mongodb.log
