#include "header.h"

// 프로그램 시작 시 회원과 비디오 데이터를 메모리에 올린 뒤 메뉴를 실행한다.
int main()
{
    a = (struct login*)malloc(sizeof(struct login) * 100);// 파일을  usernumber 동적할당에 저장
    b = (struct vedio*)malloc(sizeof(struct vedio) * 100);// 파일을 vedionumber 동적할당에 저장
    int video_number = init_video(b);// video_number == 비디오 갯수;
    int user_number = init_user(a); // user_number == 사용자 인원수;
    
    int answer;//기능을 출력하기전에 대답 여부를 받기 위해 변수 선언
    int login_index=0;//while문 안에 로그인한 사용자의 고유 인덱스 login_index를 받기 위해 변수로 선언
    while (1) 
    {//무한 반복
        printf("1. 회원가입 2. 로그인\n");
        scanf("%d", &answer);
        if (answer == 1) {
            if (!input_user(user_number++, a)) user_number--;//회원가입을 할때 원치 않는 답이 나오는걸 방지하고 그 답을 삭제하기 위해 if (!input_user(user_number++, a)) user_number-- 선언
        }
        else if (answer == 2) {
            login_index = login(user_number, a);
            break;//무한 반복을 벗어나기 위해 break를 선언
        }
    }

    int num;//switch문 기능을 출력하기 위해 변수 선언
    while (1)//메뉴 무한반복 
    {   
        printf("*********************\n");
        printf("비디오 대여 프로그램\n");
        printf("*********************\n");

        printf("***********************\n");
        printf("1.가입자 검색\n2.비디오 정보\n3.비디오 대여\n4.비디오 대여 정보\n5.비디오 반납\n6.비디오 입고\n7.가입자 목록\n8.프로그램 종료\n");
        printf("***********************\n");
        scanf("%d", &num);
        switch (num)//switch 함수에 전역변수 num을 사용하여 숫자를 입력받아 그 숫자에 해당하는 기능을 출력
        {
        case 1:
            printf("가입자 검색\n");
            search_user(login_index, user_number, a);//가입자 검색 함수(로그인한 사용자의 고유 인덱스, 사람 수, 구조체 login a)
            continue;

        case 2: 
            printf("비디오 정보\n");
            show_videos(video_number, b);//비디오 목록 함수(비디오 수, video 구조체 b)
            continue;

        case 3:
            printf("비디오 대여\n");
            rent_video(login_index, video_number, a, b);//비디오 대여 함수(로그인한 사용자의 고유 인덱스, 비디오 수, login 구조체 a, video 구조체 b)
            continue;

        case 4:
            printf("비디오 대여 정보\n");
            rent_if(login_index, video_number, a, b);//비디오 대여 정보 함수(로그인한 사용자의 고유 인덱스, 비디오 수, login 구조체 a, video 구조체 b)
            continue;

        case 5:
            printf("비디오 반납\n");
            video_return(login_index, video_number, a, b);//비디오 반납 함수(로그인한 사용자의 고유 인덱스, 비디오 수, login 구조체 a, video 구조체 b)
            continue;

        case 6:
            printf("비디오 입고\n");
            if(!input_video(video_number++, b))video_number--;//비디오 입고 함수(사용자가 원치 않는 값이 나오면 삭제하기 위해 if문을 사용하여! 한후 삭제하기 위해 video_number--)
            continue;

        case 7:
            printf("가입자 목록\n");
            user_list(user_number, a);//가입자 목록 함수(사람 수, login 구조체 a)
            continue;

        case 8:
            printf("프로그램 종료\n");//프로그램 종료 
            save_u_data(user_number, a);//회원가입 한 정보들을 파일을 생성하여 저장 
            save_v_data(video_number, b); //종료 후 비디오 추가 한것을 기존에 있는 파일로 저장 돼 있는 비디오 목록 안에 저장
            free(a);//메모리 해제
            free(b);//메모리 해제
            return 0;
        default:

            return 0;
        }

    }
    free(a);
    free(b);
    return 0;
}
