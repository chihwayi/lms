#!/bin/bash
SERVER="root@173.212.195.88"

echo "Copying seed script to server..."
scp seed_courses.sql $SERVER:/tmp/

echo "Executing seed script in Docker..."
ssh $SERVER "docker exec -i eduflow_postgres psql -U eduflow -d eduflow_dev < /tmp/seed_courses.sql"

echo "Done!"
