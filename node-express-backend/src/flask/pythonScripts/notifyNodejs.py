import sys
import requests

def notify_nodejs(task_name):
    # TODO CHANGE IP ADDRESS IN ANOTHER NETWORK
    url = f'http://192.168.0.160:4000/api/greenbone/notify-completion-from-api?task_id={task_name}'
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an error for HTTP codes 4xx or 5xx
        print(f"Successfully notified Node.js server of task completion: {task_name}")
    except requests.exceptions.RequestException as e:
        print(f"Error notifying Node.js server: {e}")

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python3 notifyNodejs.py <task_name>")
        sys.exit(1)

    task_name = sys.argv[1]
    notify_nodejs(task_name)
