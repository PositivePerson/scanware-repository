import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def get_target_scans(target_id):
    path = '/run/gvmd/gvmd.sock'
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'
    password = 'admin'

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with gvmd
            gmp.authenticate(username, password)

            # Get all tasks (scans) associated with the target by `target_id`
            tasks = gmp.get_tasks(filter_string=f'target_id={target_id}')
            task_list = []
            for task in tasks.xpath('task'):
                task_name = task.find('name').text
                task_status = task.find('status').text
                task_list.append({'name': task_name, 'status': task_status})

            if not task_list:
                return f"No scans found for target ID: {target_id}"

            return task_list

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return f"Error: {e}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 get_target_scans.py <target_id>")
        sys.exit(1)

    target_id = sys.argv[1]
    result = get_target_scans(target_id)
    print(result)
