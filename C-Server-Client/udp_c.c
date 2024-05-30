#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

#define PING_INTERVAL 10  // Ping interval in seconds
#define HTTP_SERVER_IP "127.0.0.1"  // Change to your Django server IP
#define HTTP_SERVER_PORT 8000  // Change to your Django server port
#define UDP_SERVER_IP "127.0.0.1"  // Change to your UDP server IP
#define UDP_SERVER_PORT 8485  // Change to your UDP server port


void send_udp_message(const char *message) {
    int sockfd;
    struct sockaddr_in server_addr;

    // Create UDP socket
    if ((sockfd = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
        perror("Socket creation failed");
        exit(EXIT_FAILURE);
    }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(UDP_SERVER_PORT);
    server_addr.sin_addr.s_addr = inet_addr(UDP_SERVER_IP);

    // Send UDP message
    sendto(sockfd, message, strlen(message), 0, (const struct sockaddr *)&server_addr, sizeof(server_addr));
    close(sockfd);
}

int ping_http_server() {
    int sockfd;
    struct sockaddr_in server_addr;
    char request[] = "GET / HTTP/1.1\r\nHost: " HTTP_SERVER_IP "\r\nConnection: close\r\n\r\n";
    char buffer[1024];

    // Create socket
    if ((sockfd = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        perror("Socket creation failed");
        return -1;
    }

    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(HTTP_SERVER_PORT);
    server_addr.sin_addr.s_addr = inet_addr(HTTP_SERVER_IP);

    // Connect to server
    if (connect(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Connection failed");
        close(sockfd);
        return -1;
    }

    // Send HTTP GET request
    send(sockfd, request, strlen(request), 0);

    // Read response
    int n = read(sockfd, buffer, sizeof(buffer) - 1);
    if (n < 0) {
        perror("Read failed");
        close(sockfd);
        return -1;
    }
    buffer[n] = '\0';

    // Print response (optional)
    printf("Response:\n%s\n", buffer);

    close(sockfd);
    return 0;
}

int main() {
    while (1) {
        if (ping_http_server() != 0) {
            send_udp_message("HTTP server is down");
        }
        sleep(PING_INTERVAL);
    }

    return 0;
}
