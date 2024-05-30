import socket
import threading
import json

# Configuration
DNS_SERVER_HOST = '127.0.0.1'
DNS_SERVER_PORT = 5353
C_SERVER_HOSTS = [('127.0.0.1', 8083), ('127.0.0.1', 8084), ('127.0.0.1', 8085)]  # C server addresses
UDP_IP = "127.0.0.1"  # Listen on all available interfaces
UDP_PORT = 8485  # Change to the port you used in the C server

# Define a global stop event
stop_event = threading.Event()

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

def handle_client(client_socket, c_servers):
    try:
        while not stop_event.is_set():
            chunks = []
            while True:
                chunk = client_socket.recv(4096)
                if not chunk:
                    break
                chunks.append(chunk)
                if len(chunk) < 4096:
                    break
            message = b''.join(chunks).decode('utf-8')
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
                        
                        # Read the response from the C server
                        response_chunks = []
                        while True:
                            response_chunk = server.recv(4096)
                            if not response_chunk:
                                break
                            response_chunks.append(response_chunk)
                            if len(response_chunk) < 4096:
                                break
                        response = b''.join(response_chunks).decode('utf-8')
                        print(f"Received response from C server: {response}")

                        # Send the C server's response back to the client
                        client_socket.sendall(response.encode('utf-8'))
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

# Start the UDP server
def start_udp_server():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    
    print(f"Listening for UDP messages on {UDP_IP}:{UDP_PORT}...")
    
    while not stop_event.is_set():
        sock.settimeout(1)
        try:
            data, addr = sock.recvfrom(1024)  # Buffer size is 1024 bytes
            if data:
                print(f"Received message: {data.decode()} from {addr}")
                # If a UDP message is received, signal all threads to stop
                print("UDP message received, terminating DNS server.")
                stop_event.set()
        except socket.timeout:
            continue
    sock.close()

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
        while not stop_event.is_set():
            server_socket.settimeout(1)
            try:
                client_socket, addr = server_socket.accept()
                print(f"Accepted connection from {addr}")

                # Handle client in a new thread
                client_handler = threading.Thread(
                    target=handle_client,
                    args=(client_socket, c_servers)
                )
                client_handler.start()
            except socket.timeout:
                continue
    except Exception as e:
        print(f"Server error: {e}")
    finally:
        server_socket.close()

if __name__ == "__main__":
    # Start DNS server in a separate thread
    dns_thread = threading.Thread(target=start_dns_server)
    dns_thread.start()

    # Start UDP server in the main thread
    start_udp_server()

    # Wait for DNS thread to finish
    dns_thread.join()
