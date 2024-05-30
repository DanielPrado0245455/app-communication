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
#include <fcntl.h> // For fcntl
#include <sys/time.h> // For struct timeval

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

char *extractHeaders(const char *response, size_t responseSize) {
    char *headersEnd = strstr(response, "\r\n\r\n");
    if (!headersEnd) {
        return NULL;
    }

    size_t headersLength = headersEnd - response + 4; // Including the "\r\n\r\n"
    char *headers = malloc(headersLength + 1);
    if (!headers) {
        perror("malloc");
        return NULL;
    }

    strncpy(headers, response, headersLength);
    headers[headersLength] = '\0'; // Null-terminate the headers string

    return headers;
}

char *extractBody(const char *response, size_t responseSize) {
    char *headersEnd = strstr(response, "\r\n\r\n");
    if (!headersEnd) {
        return NULL;
    }

    size_t headersLength = headersEnd - response + 4; // Including the "\r\n\r\n"
    size_t bodyLength = responseSize - headersLength;

    char *body = malloc(bodyLength + 1);
    if (!body) {
        perror("malloc");
        return NULL;
    }

    strncpy(body, response + headersLength, bodyLength);
    body[bodyLength] = '\0'; // Null-terminate the body string

    return body;
}

int setupDjangoSocket(){
    int djangoSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (djangoSocket == -1) {
        perror("socket");
        return NULL;
    }

    // Set the socket to non-blocking mode
    int flags = fcntl(djangoSocket, F_GETFL, 0);
    if (flags == -1) {
        perror("fcntl(F_GETFL)");
        close(djangoSocket);
        return NULL;
    }

    if (fcntl(djangoSocket, F_SETFL, flags | O_NONBLOCK) == -1) {
        perror("fcntl(F_SETFL)");
        close(djangoSocket);
        return NULL;
    }

    struct sockaddr_in djangoAddress;
    memset(&djangoAddress, 0, sizeof(djangoAddress));
    djangoAddress.sin_family = AF_INET;
    djangoAddress.sin_addr.s_addr = inet_addr("127.0.0.1");
    djangoAddress.sin_port = htons(8000);

    if (connect(djangoSocket, (struct sockaddr *)&djangoAddress, sizeof(djangoAddress)) == -1) {
        if (errno != EINPROGRESS) {
            perror("connect");
            close(djangoSocket);
            return NULL;
        }
    }
    return djangoSocket;
}

char *forwardMessageToDjango(const char *message) {
    int djangoSocket = setupDjangoSocket();

    sendMessage(djangoSocket, message);

    size_t bufferSize = 2048;
    size_t responseSize = 0;
    char *response = malloc(bufferSize);
    if (!response) {
        perror("malloc");
        close(djangoSocket);
        return NULL;
    }

    ssize_t bytesReceived = 0;
    int headersReceived = 0;
    int contentLength = -1;

    // Set a timeout for recv
    struct timeval tv;
    tv.tv_sec = 5;  // 5 seconds timeout
    tv.tv_usec = 0;
    setsockopt(djangoSocket, SOL_SOCKET, SO_RCVTIMEO, (const char*)&tv, sizeof(tv));

    while (1) {
        bytesReceived = recv(djangoSocket, response + responseSize, bufferSize - responseSize - 1, 0);
        if (bytesReceived == -1) {
            if (errno == EWOULDBLOCK || errno == EAGAIN) {
                // No data available right now, continue waiting
                continue;
            } else {
                perror("recv");
                free(response);
                close(djangoSocket);
                return NULL;
            }
        } else if (bytesReceived == 0) {
            // Connection closed
            break;
        }

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

        // Null-terminate the response for parsing
        response[responseSize] = '\0';

        // Check if we have received the headers
        if (!headersReceived) {
            char *headers = extractHeaders(response, responseSize);
            if (headers) {
                headersReceived = 1;
                printf("Headers: %s\n", headers);
                free(headers);

                // Find the Content-Length header
                char *contentLengthStr = strstr(response, "Content-Length:");
                if (contentLengthStr) {
                    sscanf(contentLengthStr, "Content-Length: %d", &contentLength);
                }
            }
        }

        // If headers have been received and we have the Content-Length
        if (headersReceived && contentLength != -1) {
            // Calculate the body length received so far
            int bodyLengthReceived = responseSize - (strstr(response, "\r\n\r\n") + 4 - response);
            if (bodyLengthReceived >= contentLength) {
                break;
            }
        }
    }

    // Ensure the response string is null-terminated
    response[responseSize] = '\0';
    printf("%s\n", response);


    close(djangoSocket);
    return response;
}

char *processResponse(char *response, void (*cipherFunc)(char *, int), int key) {
    // Extract headers and body
    char *headers = extractHeaders(response, strlen(response));
    char *body = extractBody(response, strlen(response));

    if (!headers || !body) {
        free(headers);
        free(body);
        return response; // Return original response if extraction fails
    }

    // Apply the cipher/decipher function to the body
    cipherFunc(body, key);

    // Reconstruct the HTTP response with the modified body
    size_t newResponseSize = strlen(headers) + strlen(body) + 1;
    char *newResponse = malloc(newResponseSize);
    if (!newResponse) {
        perror("malloc");
        free(headers);
        free(body);
        return response; // Return original response if memory allocation fails
    }

    snprintf(newResponse, newResponseSize, "%s%s", headers, body);

    free(headers);
    free(body);

    return newResponse; // Return modified response
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
            // Process the request to apply the decipher function
            char *modifiedRequest = processResponse(buffer, decipher, 0); // Using 0 as the key to decipher

            char *response = forwardMessageToDjango(modifiedRequest);
            if (response) {
                // Process the response to apply the cipher/decipher function
                char *modifiedResponse = processResponse(response, decipher, 1); // Using 0 as the key to decipher

                // Send the modified response back to the client
                sendMessage(clientSocket, modifiedResponse);

                if (modifiedResponse != response) {
                    free(modifiedResponse);
                }

                free(response);
            } else {
                sendMessage(clientSocket, "Failed to connect to Django server.");
            }

            if (modifiedRequest != buffer) {
                free(modifiedRequest);
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
    const char *port = "8088";

    setupServer(ipAddress, port);

    printf("Server closed.\n");

    return 0;
}
