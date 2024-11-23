import os
import time
from gvm.connections import UnixSocketConnection
from gvm.protocols.gmp import Gmp

path = '/run/gvmd/gvmd.sock'

# Check if the socket exists before connecting
while not os.path.exists(path):
    print(f"Waiting for gvmd to create socket at {path}")
    time.sleep(1)

connection = UnixSocketConnection(path=path)

try:
    with Gmp(connection=connection) as gmp:
        response = gmp.get_version()
        print(response)
except Exception as e:
    print(f"Error connecting to gvmd: {e}")


# from gvm.connections import UnixSocketConnection
# from gvm.protocols.gmp import Gmp

# # Path to UNIX socket within the container
# path = '/run/gvmd/gvmd.sock'

# # docker exec -it <container-name> /bin/bash

# connection = UnixSocketConnection(path=path)

# # using the with statement to automatically connect and disconnect to gvmd
# with Gmp(connection=connection) as gmp:
#     # get the response message returned as a utf-8 encoded string
#     response = gmp.get_version()

#     # print the response message
#     print(response)