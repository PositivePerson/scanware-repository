import sys
from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def create_target(target_name, target_host):
    path = '/run/gvmd/gvmd.sock'  # Replace with your actual socket path
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your actual username
    password = 'admin'  # Replace with your actual password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)
            
            # Use a valid Port List ID; replace with the correct one if needed
            port_list_id = '33d0cd82-57c6-11e1-8ed1-406186ea4fc5'  # Example Port List ID for "All TCP and UDP"
            
            # Create a new target with the specified port list
            response = gmp.create_target(
                name=target_name,
                hosts=[target_host],  # Hosts should be passed as a list
                port_list_id=port_list_id
            )
            target_id = response.get('id')

            if target_id:
                print(f"Target created successfully with ID: {target_id}")
                return target_id
            else:
                print("Failed to create target.")
                return None

    except GvmError as e:
        print(f"An error occurred: {e}", file=sys.stderr)
        return None

# Main entry point for command-line testing
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 createTarget.py <target_name> <target_host>")
        sys.exit(1)
    
    target_name = sys.argv[1]
    target_host = sys.argv[2]
    create_target(target_name, target_host)
