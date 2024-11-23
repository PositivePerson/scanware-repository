from gvm.connections import UnixSocketConnection
from gvm.errors import GvmError
from gvm.protocols.gmp import Gmp
from gvm.transforms import EtreeCheckCommandTransform

def get_all_targets():
    path = '/run/gvmd/gvmd.sock'  # Path to Unix socket
    connection = UnixSocketConnection(path=path)
    transform = EtreeCheckCommandTransform()

    username = 'admin'  # Replace with your actual username
    password = 'admin'  # Replace with your actual password

    try:
        with Gmp(connection=connection, transform=transform) as gmp:
            # Authenticate with GVM
            gmp.authenticate(username, password)

            # Fetch all targets
            targets = gmp.get_targets()

            # Parse target details
            target_list = []
            for target in targets.xpath('target'):
                target_id = target.get('id')
                target_name = target.find('name').text
                target_in_use = target.find('in_use').text
                
                # Correctly retrieve hosts as a single string
                target_hosts_element = target.find('hosts')
                
                # Ensure hosts are joined correctly
                target_hosts = (
                    ''.join(target_hosts_element.itertext()) if target_hosts_element is not None else "N/A"
                )

                target_list.append({
                    'id': target_id,
                    'name': target_name,
                    'in_use': target_in_use,
                    'hosts': target_hosts
                })

            # Return as dictionary for printing or as API response
            return {"targets": target_list}

    except GvmError as e:
        return {"error": str(e)}

if __name__ == "__main__":
    result = get_all_targets()
    print(result)  # Prints as a dictionary
