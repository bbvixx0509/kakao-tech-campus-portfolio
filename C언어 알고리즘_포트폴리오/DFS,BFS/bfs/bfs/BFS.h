#pragma once
#define MAX_VERTEX 30					
#define FALSE 0       
#define TRUE 1        
typedef int element;

// 인접 행렬과 원형 큐를 이용한 BFS 실습용 헤더
typedef struct graphType {
	int n;								
	int vertex[MAX_VERTEX][MAX_VERTEX];							
} graphType;

typedef struct {
	element queue[MAX_VERTEX];
	int front, rear;
}QueueType;


int visited[MAX_VERTEX]; 

void error(char* message);
void queue_init(QueueType* q);
int queue_full(QueueType* q);
int queue_empty(QueueType* q);
void enqueue(QueueType* q, element item);
element dequeue(QueueType* q);
void createGraph(graphType* g);
void insertEdge(graphType* g, int u, int v);
void insertVertex(graphType* g, int v);
void print_adjList(graphType* g);
void BFS_adjList(graphType* g, int v);
