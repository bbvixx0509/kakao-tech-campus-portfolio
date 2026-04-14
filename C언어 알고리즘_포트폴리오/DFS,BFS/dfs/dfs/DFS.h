#pragma once
#define MAX_VERTEX 30					
#define FALSE 0       
#define TRUE 1        
typedef int element;

// 인접 행렬 기반 DFS 실습에서 사용하는 구조체와 함수 원형
typedef struct graphType {
	int n;								
	int vertex[MAX_VERTEX][MAX_VERTEX];							
} graphType;

int visited[MAX_VERTEX]; 

void createGraph(graphType* g);
void insertEdge(graphType* g, int start, int end);
void insertVertex(graphType* g, int v);
void print_adjList(graphType* g);
void DFS_adjList(graphType* g, int v);
