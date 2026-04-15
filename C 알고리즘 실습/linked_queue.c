#include <stdio.h>
#include <stdlib.h>
#include "queueS.h"
// 연결 방식으로 동작하는 큐의 기본 연산을 구현한 파일
// 공백 순차 큐를 생성하는 연산
QueueType* createQueue() {
	QueueType* Q;
	Q = (QueueType*)malloc(sizeof(QueueType));
	Q->front = NULL; // front 초깃값 설정
	Q->rear = NULL; // rear 초깃값 설정
	return Q;
}
 //순차 큐가 공백 상태인지 검사하는 연산
int isQueueEmpty(QueueType* Q) {
	if (Q->front == NULL) {
		printf(" Queue is empty! \n\t ");
		return 1;
	}
	else return 0;
}
// 순차 큐가 포화 상태인지 검사하는 연산
int isQueueFull(QueueType* Q) {
	if (Q->rear == Q_SIZE - 1) {
		printf(" Queue is full! \n\t ");
		return 1;
	}
	else return 0;
}
// 순차 큐의 rear에 원소를 삽입하는 연산
void enQueue(QueueType* Q, element item) {
	QNode* newNode = (QNode*)malloc(sizeof(QNode));
	newNode->data = item;
	newNode->link = NULL;
	if (Q->front == NULL){// 포화 상태이면, 삽입 연산 중단
			Q->front = newNode;
			Q->rear = newNode;
		}
	else {
		Q->rear->link = newNode;
		Q->rear = newNode;
	}
}
// 순차 큐의 front에서 원소를 삭제하는 연산
element deQueue(QueueType* Q) {
	QNode* old = Q->front;
	element item;
	if (isQueueEmpty(Q)) return; // 공백 상태이면, 삭제 연산 중단
	else {
		item = old->data;
		Q->front = Q->front->link;
		if (Q->front == NULL)
			Q->rear = NULL;
		free(old);
		return item;
	}
}
// 순차 큐의 가장 앞에 있는 원소를 검색하는 연산
element peekQ(QueueType* Q) {
	element item;
	if (isQueueEmpty(Q)) return;// 공백 상태이면 연산 중단
	else {
		item = Q->front->data;
		return item;
	}
}
// 순차 큐의 원소를 출력하는 연산
void printQ(QueueType* Q) {
	QNode* temp = Q->front;
	printf(" Queue : [");
	while (temp) {
		printf("%3c", temp->data);
		temp = temp->link;
	}
	printf("]");}
