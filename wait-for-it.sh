#!/bin/sh
set -e

host="$1"
shift
cmd="$@"

until nc -z "$host" 5432; do
  echo "Waiting for database at $host:5432..."
  sleep 1
done

exec $cmd