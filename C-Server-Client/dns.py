import socket
import threading
import json

# Configuration
DNS_SERVER_HOST = '127.0.0.1'
DNS_SERVER_PORT = 5353
C_SERVER_HOSTS = [('127.0.0.1', 8080), ('127.0.0.1', 8081), ('127.0.0.1', 8082)]  # C server addresses

# Helper function to check connection to C servers
def check_c_servers():
    connections = {}
    for host, port in C_SERVER_HOSTS:
        try:
            s = socket.create_connection((host, port), timeout=5)
            connections[(host, port)] = s
            print(f"Connected to {host}:{port}")
        except Exception as e:
            print(f"Failed to connect to C server {host}:{port} - {e}")
    return connections

# Handle individual client connections
def handle_client(client_socket, c_servers):
    try:
        while True:
            message = client_socket.recv(1024).decode('utf-8')
            if not message:
                break
            print(f"Received message from client: {message}")

            # Check if we have valid connections to C servers
            if c_servers:
                sent = False
                for address, server in c_servers.items():
                    try:
                        server.sendall(message.encode('utf-8'))
                        print(f"Successfully sent message to {address}")
                        #confirmation = server.recv(1024).decode('utf-8')
                        #print(f"Received confirmation from C server: {confirmation}")

                        # Send confirmation back to the React client
                        client_socket.sendall("Message successful".encode('utf-8'))
                        sent = True

                        server.close()
                        del c_servers[address]
                        try:
                            new_server = socket.create_connection(address, timeout=5)
                            c_servers[address] = new_server
                            print(f"Reconnected to C server {address}")
                        except Exception as e:
                            print(f"Failed to reconnect to C server {address} - {e}")

                        break
                    except Exception as e:
                        print(f"Error communicating with C server {address}: {e}")
                        server.close()
                        del c_servers[address]
                        try:
                            new_server = socket.create_connection(address, timeout=5)
                            c_servers[address] = new_server
                            print(f"Reconnected to C server {address}")
                        except Exception as e:
                            print(f"Failed to reconnect to C server {address} - {e}")

                if not sent:
                    error_message = "No valid C server connections."
                    client_socket.sendall(error_message.encode('utf-8'))
            else:
                error_message = "No valid C server connections."
                client_socket.sendall(error_message.encode('utf-8'))
    except Exception as e:
        print(f"Error handling client: {e}")
    finally:
        client_socket.close()

# Start the DNS server
def start_dns_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((DNS_SERVER_HOST, DNS_SERVER_PORT))
    server_socket.listen(5)
    print(f"DNS server listening on {DNS_SERVER_HOST}:{DNS_SERVER_PORT}")

    # Check and establish connections to C servers
    c_servers = check_c_servers()
    if not c_servers:
        print("No valid C server connections. Exiting.")
        return

    try:
        while True:
            client_socket, addr = server_socket.accept()
            print(f"Accepted connection from {addr}")

            # Handle client in a new thread
            client_handler = threading.Thread(
                target=handle_client,
                args=(client_socket, c_servers)
            )
            client_handler.start()
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    start_dns_server()
