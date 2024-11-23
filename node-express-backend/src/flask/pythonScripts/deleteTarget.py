import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def delete_target(target_id):
    path = '/run/gvmd/gvmd.sock'  # Path to Unix socket
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with actual credentials
    password = 'admin'  # Replace with actual credentials

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            gmp.authenticate(username, password)
            delete_response = gmp.delete_target(target_id)
            
            # Check if deletion was successful
            status = delete_response.get('status')
            status_text = delete_response.get('status_text')
            if status == '200':
                print(f"Target with ID {target_id} deleted successfully.")
            else:
                print(f"Failed to delete target with ID {target_id}. Status: {status_text}")
                
    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 delete_target.py <target_id>")
        sys.exit(1)

    target_id = sys.argv[1]
    delete_target(target_id)
