import os
import time
from django.db import connections
from django.db.utils import OperationalError

def wait_for_db():
    db_conn = connections['default']
    max_retries = 30
    for i in range(max_retries):
        try:
            db_conn.cursor()
            print("Подключение к БД успешно!")
            return
        except OperationalError:
            print(f"БД недоступна, попытка {i+1}/{max_retries}...")
            time.sleep(2)
    raise Exception("Не удалось подключиться к БД")

if __name__ == "__main__":
    wait_for_db()