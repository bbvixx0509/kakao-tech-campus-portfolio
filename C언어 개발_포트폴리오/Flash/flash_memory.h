#pragma once
#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>//동적할당을 위해 헤드선언
#include <string.h>//strtok, strcmp를 위해 헤드선언
#pragma warning(disable:4996)

// Flash 메모리 실습에서 공통으로 사용하는 구조체와 함수 원형을 모아둔 헤더
typedef struct Flash {//Flash 구조체 
	char* spareblock;//미리 spareblock 변수 선언
	char* sparearea;
	char* sector;
	int allsector;
	int* lsn;
	int* psn;
};

struct Flash* a;//Flash 구조체를 a로 별명 지정

FILE* fs; // 파일 변수 

struct Flash* init(struct Flash*);//초기화 함수(Flash 구조체)
struct Flash* Flash_write(struct Flash*);//플레시 메모리 쓰기 함수 (Flash 구조체)
struct Flash* Flash_read(struct Flash*);//플레시 메모리 읽기 함수 (Flash 구조체)
struct Flash* Flash_erase(struct Flash*);//플레시 메모리 지우기 함수 (Flash 구조체)
