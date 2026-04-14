#define _CRT_SECURE_NO_WARNINGS
#define MAX 100
#include <stdio.h>
#include <stdlib.h>// 동적할당 선언에 의해 선언한 헤더파일
#include <string.h>// strcmp 선언에 의해 선언한 헤더파일

// 회원 정보와 비디오 정보를 분리해 관리하기 위해 구조체를 사용했다.
struct login { //사용자 구조체
    char name[10]; // 사용자 이름
    char number[20]; // 사용자 전화번호
    char id[50]; // 사용자 로그인 아이디
    char pw[50]; // 사용자 로그인 패스워드
    char reve[20]; // 비디오 대여시 비교값
};

struct vedio { //비디오 구조체
    char title[20]; // 비디오 타이틀
    char company[10]; // 비디오 제작사
    char genre[10]; // 비디오 장르
};

struct login* a; //회원 동적할당하기 위해 선언
struct vedio* b; // 비디오 동적할당하기 위해 선언

FILE* fs1; // 파일 변수 fs1
FILE* fs2;// 파일 변수 fs2

void eliminate(char*, char);//공백을 없애기 위해 함수로 선언
int init_video(struct vedio*);//비디오 초기화 함수 
int init_user(struct login*);//사용자 초기화 함수 
int input_user(int, struct login* a);//회원가입 함수 
void rent_video(int, int, struct login*, struct vedio*);//비디오 대여 함수
int search_user(int, int, struct login* a);//가입자 검색
int login(int, struct login*);//로그인 함수 
void show_videos(int);//비디오 목록 함수
void rent_if(int , int , struct login* , struct vedio* );//비디오 정보 확인 함수
void video_return(int, int, struct login*, struct vedio*);//비디오 반납 함수
int input_video(int, struct vedio*);// 비디오 입고 함수
void user_list(int, struct login*);//가입자 목록 함수
void save_v_data(int,struct vedio* b);//비디오 저장 함수
void save_u_data(int,struct login* a);//사용자 저장 함수




