#pragma once

// 점수 기준으로 정렬된 학생 목록을 다루는 연결 리스트 헤더
typedef struct ListNode {
	int score;
	char name[10];
	struct ListNode* link;
} listNode;

typedef struct {
	listNode* head;
} linkedList_h;

linkedList_h* createLinkedList_h(void);
void freeLinkedList_h(linkedList_h* L);
void printList(linkedList_h* L);
void printRangedList(linkedList_h* L, int lowscore, int highscore);
void insertNode(linkedList_h* L, int score, char* name);
void deleteNode(linkedList_h* L, char* name);
int searchbyName(linkedList_h* L, char* name);
int searchbyScore(linkedList_h* L, int score);
int findLowScore(linkedList_h* L);
int findMidScore(linkedList_h* L);
double calAve(linkedList_h* L);
void changeScorebyName(linkedList_h* L, int score, char* name);
