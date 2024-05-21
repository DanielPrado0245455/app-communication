#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h> // For close function
#include <arpa/inet.h> // For inet_addr, htons
#include <sys/socket.h> // For socket functions
#include <netinet/in.h> // For sockaddr_in

#define bufferSize 2048

int clientSocketClient;
struct sockaddr_in serverAddressClient;

void setupClient(const char *ipAddress, const char *port) {
    clientSocketClient = socket(AF_INET, SOCK_STREAM, 0);
    if (clientSocketClient == -1) {
        perror("socket");
        exit(1);
    }

    serverAddressClient.sin_family = AF_INET;
    serverAddressClient.sin_addr.s_addr = inet_addr(ipAddress);
    serverAddressClient.sin_port = htons(atoi(port));

    int maxRetries = 5;  // Maximum number of connection retries
    int retries = 0;
    while (retries < maxRetries) {
        if (connect(clientSocketClient, (struct sockaddr *)&serverAddressClient, sizeof(serverAddressClient)) == -1) {
            perror("connect");
            retries++;
            sleep(1);  // Wait for 1 second before retrying
        } else {
            return;
        }
    }
}

void sendMessageToServer(const char *msg) {
    int sent;
    if ((sent = send(clientSocketClient, msg, strlen(msg), 0)) == -1) {
        perror("send");
        exit(1);
    }
}

char* receiveMessageFromServer() {
    char buffer[bufferSize];
    int n = recv(clientSocketClient, buffer, sizeof(buffer), 0);
    if (n == -1) {
        perror("recv");
        exit(1);
    }
    buffer[n] = '\0';
    char *message = strdup(buffer);
    return message;
}


void closeConnection() {
    close(clientSocketClient);
}

void cipher(char msg[], int key){
    int length = strlen(msg);

    if(key > 255){
        key = 255;
    }

    char character;
    int asciiCoded;
    char displacedChar;

    for(int i = 0; i < length; i++){
        character = msg[i];
        asciiCoded = ((int)character) + key;
        displacedChar = (char)asciiCoded;

        msg[i] = displacedChar;
    }
}

int main() {

    const char *ipAddress = "127.0.0.1";
    const char *port = "8080";           

    char userMessage[bufferSize];

    setupClient(ipAddress, port);
    printf("Client connected to server at %s:%s\n", ipAddress, port);

    printf("\nEnter the following options with the format [instruction],[username],[extraData]:\n\n1. "
           "authenticate,username,password\n2. createGroup,username,groupName\n\n");
    fgets(userMessage, sizeof(userMessage), stdin);
    userMessage[strcspn(userMessage, "\n")] = 0;

    cipher(userMessage, 5);

    sendMessageToServer(userMessage);
    printf("User sent to server: %s\n", userMessage);

    char *response = receiveMessageFromServer();
    printf("Response from server: %s\n", response);

    closeConnection();
    printf("Connection closed.\n");

    return 0;
}