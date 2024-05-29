#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <signal.h>
#include <sys/wait.h>

volatile sig_atomic_t shutdown_server = 0;

int serverSocket;

void terminate(int sig) {
    shutdown_server = 1;
    close(serverSocket);
}

void decipher(char msg[], int key){
    int length = strlen(msg);

    if(key > 255){
        key = 255;
    }

    char character;
    int asciiCoded;
    char displacedChar;

    for(int i = 0; i < length; i++){
        character = msg[i];
        asciiCoded = ((int)character) - key;
        displacedChar = (char)asciiCoded;

        msg[i] = displacedChar;
    }
}

void sendMessage(int socket, const char *message) {
    size_t length = strlen(message);
    size_t totalSent = 0;
    ssize_t sent;

    while (totalSent < length) {
        sent = send(socket, message + totalSent, length - totalSent, 0);
        if (sent == -1) {
            perror("send");
            return;
        }
        totalSent += sent;
    }
}

char *forwardMessageToDjango(const char *message) {
    int djangoSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (djangoSocket == -1) {
        perror("socket");
        return NULL;
    }

    struct sockaddr_in djangoAddress;
    memset(&djangoAddress, 0, sizeof(djangoAddress));
    djangoAddress.sin_family = AF_INET;
    djangoAddress.sin_addr.s_addr = inet_addr("127.0.0.1");
    djangoAddress.sin_port = htons(8000);

    if (connect(djangoSocket, (struct sockaddr *)&djangoAddress, sizeof(djangoAddress)) == -1) {
        perror("connect");
        close(djangoSocket);
        return NULL;
    }

    sendMessage(djangoSocket, message);

    size_t bufferSize = 2048;
    size_t responseSize = 0;
    char *response = malloc(bufferSize);
    if (!response) {
        perror("malloc");
        close(djangoSocket);
        return NULL;
    }

    struct timeval tv;
    tv.tv_sec = 2;  // 2 seconds timeout
    tv.tv_usec = 0;
    setsockopt(djangoSocket, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof tv);

    ssize_t bytesReceived;
    printf("Response from Django server: ");
    while ((bytesReceived = recv(djangoSocket, response + responseSize, bufferSize - responseSize - 1, 0)) > 0) {
        responseSize += bytesReceived;
        if (responseSize >= bufferSize - 1) {
            bufferSize *= 2;
            response = realloc(response, bufferSize);
            if (!response) {
                perror("realloc");
                close(djangoSocket);
                return NULL;
            }
        }
    }
    if (bytesReceived == -1 && errno != EWOULDBLOCK) {
        perror("recv");
        free(response);
        close(djangoSocket);
        return NULL;
    }
    response[responseSize] = '\0';
    printf("%s\n", response);

    close(djangoSocket);
    return response;
}

void handleClient(int clientSocket) {
    char buffer[2048];
    int bytes_read = recv(clientSocket, buffer, sizeof(buffer), 0);
    if (bytes_read > 0) {
        buffer[bytes_read] = '\0';

        if (strcmp(buffer, "closed") == 0) {
            kill(getppid(), SIGINT);
            sendMessage(clientSocket, "\nServer is shutting down.\n");
        } else {
            printf("%s", buffer);
            char *response = forwardMessageToDjango(buffer);
            if (response) {
                sendMessage(clientSocket, response);
                free(response);
            } else {
                sendMessage(clientSocket, "Failed to connect to Django server.");
            }
        }
    }

    close(clientSocket);
    exit(0);
}

void setupServer(const char *ipAddress, const char *port) {
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == -1) {
        perror("socket");
        exit(1);
    }

    struct sockaddr_in serverAddress;
    memset(&serverAddress, 0, sizeof(serverAddress));
    serverAddress.sin_family = AF_INET;
    serverAddress.sin_addr.s_addr = inet_addr(ipAddress);
    serverAddress.sin_port = htons(atoi(port));

    if (bind(serverSocket, (struct sockaddr *)&serverAddress, sizeof(serverAddress)) == -1) {
        perror("bind");
        exit(1);
    }

    if (listen(serverSocket, 5) == -1) {
        perror("listen");
        exit(1);
    }

    signal(SIGINT, terminate);

    while (!shutdown_server) {
        struct sockaddr_in clientAddress;
        socklen_t addressLength = sizeof(clientAddress);
        int clientSocket = accept(serverSocket, (struct sockaddr *)&clientAddress, &addressLength);
        if (clientSocket == -1) {
            if (shutdown_server) break;
            perror("accept");
            continue;
        }

        pid_t pid = fork();
        if (pid == -1) {
            perror("fork");
            close(clientSocket);
        } else if (pid == 0) {
            close(serverSocket);
            handleClient(clientSocket);
        } else {
            close(clientSocket);
            while (waitpid(-1, NULL, WNOHANG) > 0);
        }
    }

    close(serverSocket);
}

int main() {
    const char *ipAddress = "127.0.0.1";
    const char *port = "8080";

    setupServer(ipAddress, port);

    printf("Server closed.\n");

    return 0;
}
