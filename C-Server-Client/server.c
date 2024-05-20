#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <arpa/inet.h>
#include <sys/socket.h>

#include <unistd.h>
#include <signal.h>

#define bufferSize 2048
#define MAX_USERS 100

typedef struct User {
    char *user;
    char *password;
} User;

User users[MAX_USERS];
int user_count = 0;

volatile sig_atomic_t shutdown_server = 0;

int serverSocket;

void terminate(int sig) {
    shutdown_server = 1;
    close(serverSocket);
}

int authenticate(const char *username, const char *password) {
    for (int i = 0; i < user_count; i++) {
        if (strcmp(users[i].user, username) == 0 && strcmp(users[i].password, password) == 0) {
            return 1; // autenticado
        }
    }
    return 0;
}

void parse_users() {
    FILE *file = fopen("users.csv", "r");
    if (!file) {
        perror("Failed to open user databse");
        exit(1);
    }

    char line[1024];
    while (fgets(line, sizeof(line), file) && user_count < MAX_USERS) {
        // Le hace strip al salto de linea en linux
        line[strcspn(line, "\r\n")] = 0;
        users[user_count].user = strdup(strtok(line, ","));
        users[user_count].password = strdup(strtok(NULL, ","));
        user_count++;
    }

    fclose(file);
}

void sendMessage(int socket, const char *message) {
    send(socket, message, strlen(message), 0);
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

            char buffer[2048];
            int bytes_read = recv(clientSocket, buffer, sizeof(buffer), 0);
            if (bytes_read > 0) {
                buffer[bytes_read] = '\0';

                printf("\nRecieved: ");
                printf("%s", buffer);
                decipher(buffer, 5);
                printf("\nDeciphered: ");
                printf("%s", buffer);

                if (strcmp(buffer, "closed") == 0) {
                    kill(getppid(), SIGINT);
                    sendMessage(clientSocket, "\nServer is shutting down.\n");
                } else {
                    char *username = strtok(buffer, ",");
                    char *password = strtok(NULL, ",");

                    int auth_result = authenticate(username, password);

                    if (auth_result) {
                        sendMessage(clientSocket, "\n1");
                    } else {
                        sendMessage(clientSocket, "\n0");
                    }
                }
            }

            close(clientSocket);
            exit(0);
        } else {
            close(clientSocket);
        }
    }

    close(serverSocket);
}

int main() {

    parse_users();
    const char *ipAddress = "127.0.0.1";
    const char *port = "8080";
    setupServer(ipAddress, port);

    for (int i = 0; i < user_count; i++) {
        free(users[i].user);
        free(users[i].password);
    }

    printf("Server closed.\n");

    return 0;
}
