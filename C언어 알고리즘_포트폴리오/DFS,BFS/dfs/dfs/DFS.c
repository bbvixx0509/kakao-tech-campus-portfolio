#pragma warning(disable:4996)
#define TRUE 1
#define FALSE 0
#define MAX_VERTEX 30
#include <stdio.h>
#include<stdlib.h>
#include "DFS.h"
typedef int element;

// DFS는 재귀 호출을 이용해 한 방향으로 끝까지 탐색한 뒤 되돌아온다.
void createGraph(graphType* g) 
{
	int u;
	int v;
	g->n = 0;
	for (u = 0; u < MAX_VERTEX; u++) 
	{
		for (v = 0; v < MAX_VERTEX; v++) 
		{
			g->vertex[u][v] = 0;
		}
	}
}

void insertEdge(graphType* g, int u, int v)
{
	if (u >= g->n || v >= g->n)
	{
		printf(stderr, "그래프에 존재하지 않는 정점입니다");
		return;
	}
	g->vertex[u][v] = 1;
	g->vertex[u][v] = 1;
}

void insertVertex(graphType* g, int v)
{
	if (((g->n) + 1) > MAX_VERTEX)
	{
		printf(stderr, "그래프에 있는 정점의 갯수를 초과했습니다");
		return;
	}
	g->n++;
}

void print_adjList(graphType* g)
{
	int i, j;
	for (i = 0; i < (g->n); i++)
	{
		for (j = 0; j < (g->n); j++)
			printf("%2d", g->vertex[i][j]);
		printf("\n");
	}
}

void DFS_adjList(graphType* g, int v) 
{
	int u;
	visited[v] = TRUE;
	printf("->%c", v + 65);
	for (u = 0; u < g->n; u++) 
	{
		if (g->vertex[v][u] && !visited[u])
			DFS_adjList(g, u);
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

	printf("\n\n///////////////\n\n깊이 우선 탐색 >> ");
	DFS_adjList(G9, 0);     

	getchar();   return 0;
}
