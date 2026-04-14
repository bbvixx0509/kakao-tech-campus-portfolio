#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include"linkedList.h"

// 이름과 점수를 함께 관리하는 연결 리스트 구현
linkedList_h* createLinkedList_h(void) {
	linkedList_h* L;
	L = (linkedList_h*)malloc(sizeof(linkedList_h));
	L->head = NULL; 
	return L;
}

void freeLinkedList_h(linkedList_h* L) {
	listNode* p;
	while (L->head != NULL) {
		p = L->head;
		L->head = L->head->link;
		free(p);
		p = NULL;
	}
}

void printList(linkedList_h* L) {
	listNode* p;
	printf("L = (");
	p = L->head;
	while (p != NULL) {
		printf("%s : %d", p->name, p->score);
		p = p->link;
		if (p != NULL) printf(", ");
	}
	printf(") \n");
}

void printRangedList(linkedList_h* L, int lowscore, int highscore) {
	listNode* p;
	p = L->head;
	while (p != NULL) {
		if (p->score >= lowscore && p->score <= highscore)
			printf("%s", p->name);
		p = p->link;
		
	}
}

void insertNode(linkedList_h* L, int score, char* name)
{
	listNode* newNode;
	listNode* p;
	listNode* q;

	p = L->head;
	q = NULL;

	newNode = (listNode*)malloc(sizeof(listNode));
	newNode->score = score;
	strcpy(newNode->name, name);

	if (L->head == NULL) // L이 빈공간일때
	{
		newNode->link = NULL;
		L->head = newNode;
		return;
	}
	else if (p->link == NULL) //L이 노드가 하나만 있을 떄  p->link
	{
		if (p->score < score)
		{
			newNode->link = p;
			L->head = newNode;
			return;
		}
		else if (p->score == score)
		{
			if (strcmp(newNode->name, p->name) < 0)
			{
				newNode->link = p;
				L->head = newNode;
				return;
			}
			else if (strcmp(newNode->name, p->name) == 0)
			{
				printf("이름이 같으므로 추가할 수 없습니다.\n");
				return;
			}
			else if (strcmp(newNode->name, p->name) > 0)
			{
				p->link = newNode;
				newNode->link = NULL;
				return;
			}
		}
		else if (p->score > score)
		{
			p->link = newNode;
			newNode->link = NULL;
			return;
		}
	}
	else
	{
		while (p != NULL) //temp->link != NULL를  1로 바꿈
		{
			if (p->score < score)
			{
				if (q == NULL)
				{
					newNode->link = p;
					L->head = newNode;
					break;
				}
				else
				{
					newNode->link = p;
					q->link = newNode;
					break;
				}
			}
			else if (p->score == score)
			{
				if (strcmp(newNode->name, p->name) < 0)
				{
					if (q == NULL)
					{
						newNode->link = p;
						L->head = newNode;
						break;
					}
					else
					{
						newNode->link = p;
						q->link = newNode;
						break;
					}
				}
				else if (strcmp(newNode->name, p->name) > 0)
				{
					if (p->link == NULL)
					{
						newNode->link = NULL;
						p->link = newNode;
						break;
					}
					else if (q == NULL)
					{
						newNode->link = p->link;
						p->link = newNode;
						break;
					}
					else
					{
						newNode->link = p->link;
						p->link = newNode;
						break;
					}
				}
			}
			else if (p->score > score)
			{
				if (p->link == NULL)
				{
					newNode->link = NULL;
					p->link = newNode;
					break;
				}
				else
				{
					q = p;
					p = p->link;
				}
			}
		}
	}
}

void deleteNode(linkedList_h* L, char* name) {
	listNode* p;
	listNode* q;
	p = L->head;
	q = NULL;

		if (p == NULL) {
			return;
		}
		else if (p->link == NULL) {
			if (strcmp(p->name, name) == 0) {
				free(p);
				L->head = NULL;
			}
		}
		else {
			while (p != NULL) {
				if (strcmp(p->name, name) == 0) {
					if (q == NULL) {
						L->head = p->link;
						free(p);
						return;
					}
					else if (p->link == NULL) {
						q->link = NULL;
						free(p);
						return;
					}
					else {
						q->link = p->link;
						free(p);
						return;
					}
				}
				else {
					q = p;
					p = p->link;
				}
			}
		}
}

int searchbyName(linkedList_h* L, char* name) {
	listNode* p;
	p = L->head;
	int s = 1;
	while (p != NULL) {
		if (strcmp(p->name, name) == 0) {
			return s;
		}
		s++;
		p = p->link;
	}
	return -1;
}
	

int searchbyScore(linkedList_h* L, int score) {
	listNode* p;
	p = L->head;
	int s = 1;
	while (p != NULL) {
		if (p->score== score) {
			return s;
		}
		s++;
		p = p->link;
	}
	return -1;
}

int findLowScore(linkedList_h* L) {
	listNode* p;
	p = L->head;
	while (p != NULL) {
		if (p->link == NULL) {
			return p->score;
		}
		p = p->link;
	}
}

int findMidScore(linkedList_h* L) {
	listNode* p;
	p = L->head;
	int count = 1;
	int index = 1;

	while (p != NULL) {
		count++;
		p = p->link;
	}
	p = L->head;
	if (count % 2 == 0) {
		count = count / 2;
	}
	else if (count % 2 != 0) {
		count = count / 2 + 1;
	}
	while (p != NULL) {
		index++;
		p = p->link;
		if (count == index) {
			return p->score; 
		}
	}
}

double calAve(linkedList_h* L) {
	listNode* p;
	p = L->head;
	int sum = 0;
	int num = 1;

	while (p != NULL) {
		sum += p->score;
		num++;
		p = p->link;
	}
	return (double)sum / num;
}

void changeScorebyName(linkedList_h* L, int score, char* name) {
	listNode* p;
	p = L->head;
	if(p == NULL) {
		return;
	}
	else {
		while (p != NULL) {
			if (strcmp(p->name, name) == 0) {
				deleteNode(L, name);
				insertNode(L, score, name);
				break;
			}
			p = p->link;
		}
	}
}
