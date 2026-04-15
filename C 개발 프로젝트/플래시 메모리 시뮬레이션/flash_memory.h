#pragma once
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#pragma warning(disable:4996)

typedef struct Flash {
	char* spareblock;
	char* sparearea;
	char* sector;
	int allsector;
	int* lsn;
	int* psn;
};

struct Flash* a;

FILE* fs;

struct Flash* init(struct Flash*);
struct Flash* Flash_write(struct Flash*);
struct Flash* Flash_read(struct Flash*);
struct Flash* Flash_erase(struct Flash*);
