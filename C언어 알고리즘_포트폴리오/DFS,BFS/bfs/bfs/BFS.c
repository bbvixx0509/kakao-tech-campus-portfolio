#pragma warning(disable:4996)
#define TRUE 1
#define FALSE 0
#include <stdio.h>
#include<stdlib.h>
#include "BFS.h"
typedef int element;

// BFS에서 사용하는 큐와 그래프 기본 연산을 한 파일에 정리했다.
void error(char* message) 
{ 
	printf(stderr, "%s\n", message);
	exit(1);
}

void queue_init(QueueType* q) 
{ 
	q->front = 0;
	q->rear = 0;
}

int queue_full(QueueType* q)
{
	return ((q->rear + 1) % MAX_VERTEX == q->front);
}

int queue_empty(QueueType* q) 
{
	return (q->front == q->rear);
}

void enqueue(QueueType* q, element item) 
{ 
	if (queue_full(q))
		error("큐가 가득 차 있습니다.\n");
	q->rear = (q->rear + 1) % MAX_VERTEX;
	q->queue[q->rear] = item;
}

element dequeue(QueueType* q) 
{ 
	if (queue_empty(q))
		error("큐가 비어있습니다.\n");
	q->front = (q->front + 1) % MAX_VERTEX;
	return q->queue[q->front];
}


void createGraph(graphType* g) 
{
	int u;
	int v;

	g->n = 0;							
	for (u = 0; u < MAX_VERTEX; u++) 
	{
		for (v = 0; v < MAX_VERTEX; v++)
			g->vertex[u][v] = 0;
	}
}

void insertEdge(graphType* g, int u, int v)
{
	if (u >= g->n || v >= g->n)
	{
		printf("\n 그래프에 없는 정점입니다");
		return;
	}
	g->vertex[u][v] = 1;
	g->vertex[v][u] = 1;
}

void insertVertex(graphType* g, int v) 
{
	if (((g->n) + 1) > MAX_VERTEX) 
	{
		printf("\n 그래프 정점의 개수를 초과하였습니다");
		return;
	}
	g->n++;								
}

void print_adjList(graphType* g) 
{
	int i;
	int j;
	for (i = 0; i < (g->n); i++) 
	{
		for (j = 0; j < (g->n); j++)
			printf("%2d", g->vertex[i][j]);
			printf("\n");
	}
}

void BFS_adjList(graphType* g, int v)
{
	int u;
	QueueType q;

	queue_init(&q);
	visited[v] = TRUE;
	printf("%c", v+65);
	enqueue(&q, v);
	while (!queue_empty(&q)) {
		v = dequeue(&q);
		for (u = 0; u < g->n; u++) {
			if (g->vertex[v][u] && !visited[u]) {
				visited[u] = TRUE;
				printf("->%c", u+65);
				enqueue(&q, u);
			}
		}
	}
}

int main(void) {
	int i;
	graphType* G9;
	G9 = (graphType*)malloc(sizeof(graphType));
	createGraph(G9);
	
	for (i = 0; i < 7; i++)
		insertVertex(G9, i);
	insertEdge(G9, 0, 2);
	insertEdge(G9, 0, 1);
	insertEdge(G9, 1, 4);
	insertEdge(G9, 1, 3);
	insertEdge(G9, 1, 0);
	insertEdge(G9, 2, 4);
	insertEdge(G9, 2, 0);
	insertEdge(G9, 3, 6);
	insertEdge(G9, 3, 1);
	insertEdge(G9, 4, 6);
	insertEdge(G9, 4, 2);
	insertEdge(G9, 4, 1);
	insertEdge(G9, 5, 6);
	insertEdge(G9, 6, 5);
	insertEdge(G9, 6, 4);
	insertEdge(G9, 6, 3);
	printf("\n G9의 인접 리스트 ");
	printf("\n");
	print_adjList(G9);  

	printf("\n\n///////////////\n\n너비 우선 탐색 >> ");
	
	BFS_adjList(G9, 0);     
	
	getchar();  return 0;
}
