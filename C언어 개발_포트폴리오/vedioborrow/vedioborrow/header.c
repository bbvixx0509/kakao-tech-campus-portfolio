#include "header.h"

// 회원 정보와 비디오 목록을 파일과 메모리 사이에서 관리하는 함수 모음
int num;// mian 함수에 숫자를 입력받기 위해 선언
char coustumer;//회원가입 대답여부를 받기 위해 선언
char vediorental;//비디오 대여 대답여부를 받기 위해 선언
char vr;//비디오 반납 대답여부를 받기 위해 선언

int people_a = 0;// =10 오류나면 복구 , 회원가입을 하기 위해 선언
int loginindex;// 회원을 loginindex에 넣어 그 회원으로 비디오 대여, 반납 정보를 받기 위해 선언

void eliminate(char* str, char ch) { //출력될때 enter키로 인해 공배이 생기는 것을 방지 하기 위해 함수 선언
    unsigned len = strlen(str) + 1;
    for (; *str != '\0'; str++, len--) //종료 문자를 만날 떄까지 반복
    {
        if (*str == ch)
        {
            strcpy_s(str, len, str + 1);
            str--;
        }
    }
}

void save_v_data(int count,struct vedio* b) //비디오 저장 함수(비디오 수,비디오 구조체)
{
    fs1 = fopen("video.txt", "w");//test.txt 파일을 열기 위해 fopen 선언
    if (fs1 == NULL) { //만약 파일이 없다면
        printf("NONE");//none으로 출력 예외조건
        return; 
    }
    for (int i = 0; i < count;i++) 
    { 
        fputs(b[i].title, fs1);//비디오 구조체의 제목을 파일에 저장 
        fputs("\n", fs1);//공백을 없애기 위해 선언
        fputs(b[i].company, fs1);//비디오 구조체의 비디오 제작사를 파일에 저장
        fputs("\n", fs1);//공백을 없애기 위해 선언
        fputs(b[i].genre, fs1);//비디오 구조체의 비디오 장르를 파일에 저장
        fputs("\n", fs1);//공백을 없애기 위해 선언
    }
    fclose(fs1);//파일 닫기
    return;
}

void save_u_data(int count,struct login* a) // 사용자 저장 함수(사용자 인원수,사용자 구조체)
    {
    fs2 = fopen("user.txt", "w");//test2.txt 파일을 열기 위해 선언
    if (fs2 == NULL) {//만약 파일이 없다면 
        printf("NONE");//NONE을 출력 예외조건
        return;
    }
    for (int i = 0; i < count; i++) 
    {
        fputs(a[i].name, fs2);//사용자 구조체 안에 입력한 사용자 이름을 저장하여 저장 된 사용자 이름을 파일에 저장 
        fputs("\n", fs2);//공백을 없애기 위해 선언
        fputs(a[i].number, fs2);//사용자 구조체 안에 입력한 사용자 전화번호를 저장하여 저장 된 사용자 전화번호를 파일에 저장
        fputs("\n", fs2);//공백을 없애기 위해 선언
        fputs(a[i].id, fs2);//사용자 구조체 안에 입력한 사용자 아이디를 저장하여 저장 된 사용자 아이디를 파일에 저장 
        fputs("\n", fs2);//공백을 없애기 위해 선언
        fputs(a[i].pw, fs2);//사용자 구조체 안에 입력한 사용자 비밀번호를 저장하여 저장 된 사용자 비밀번호를 파일에 저장 
        fputs("\n", fs2);//공백을 없애기 위해 선언
        fputs(a[i].reve, fs2);
        fputs("\n", fs2);
    }
    fclose(fs2);//파일 닫기 
    return;
}

int init_video(struct vedio* b)  // 비디오 초기화 함수(비디오 구조체)
{
    int vedio_plus = 0;
    //FILE* fs1; //FILE 포인터 임시변수 선언
    char str_company[MAX];//비디오 제작사 받아올 변수
    char str_genre[MAX];//비디오 장르 받아올 변수
    char str_title[MAX];//비디오 제목 받아올 변수

    //fopen_s(&fs1, "test.txt", "r");//저장 돼 있던 텍스트 파일을 코드 안으로 출력
    fs1 = fopen("video.txt", "r");//저장 돼 있던 텍스트 파일을 코드 안으로 출력
    /*printf("비디오 정보들을 보여드리겠습니다.\n");*/

    if (fs1 == NULL)// 만약 fs1 파일이 없다는 예외조건
    {
        printf("open 실패\n");
        return 0;
    }

    while (1)//무한 반복
    {
        fgets(str_title, sizeof(str_title), fs1);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_company, sizeof(str_company), fs1);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_genre, sizeof(str_genre), fs1);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.

        eliminate(str_title, '\n');//enter키로 인해 공백 생긴 것을 없애기 위해 선언
        eliminate(str_company, '\n');//enter키로 인해 공백 생긴 것을 없애기 위해 선언
        eliminate(str_genre, '\n');//enter키로 인해 공백 생긴 것을 없애기 위해 선언

        strcpy(b[vedio_plus].title, str_title);//비디오 제목의 문자열 전체를 위치에 복사 
        strcpy(b[vedio_plus].company, str_company);//비디오 제작사의 문자열 전체를 위치에 복사
        strcpy(b[vedio_plus].genre, str_genre);//비디오 제작사의 문자열 전체를 위치에 복사
        //fgets(str, MAX, fs1);//파일 안에 있는 글자들을 갖고오기 위해 fgets를 선언
        if (feof(fs1)) break;//파일 끝까지 도달했는지 여부 도달했으면 break후 무한반복 벗어남
        vedio_plus++;
    }
    //vedio_plus /= 3;
    fclose(fs1);//파일 닫기
    return vedio_plus;//비디오 총 갯수가 반환이 됨
}

int init_user(struct login* a) // 사용자 초기화 함수(사용자 구조체) 
{
    int user_number = 0;
    char str_name[10];//사용자 이름 받아올 변수
    char str_number[20];//사용자 전화번호 받아올 변수
    char str_id[30];//사용자 아이디 받아올 변수
    char str_pw[20];//사용자 비밀번호 받아올 변수
    char str_rene[20];//NULL값 받아올 변수
    fs2 = fopen("user.txt", "r");//저장 돼 있는 파일을 읽어오기 위해 


    if (fs2 == NULL)// 만약 fs1 파일이 없다는 예외조건
    {
        printf("open 실패\n");
        return 0;
    }
    while (1)//무한반복
    {
        fgets(str_name, sizeof(str_name), fs2);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_number, sizeof(str_number), fs2);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_id, sizeof(str_id), fs2);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_pw, sizeof(str_pw), fs2);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.
        fgets(str_rene, sizeof(str_rene), fs2);//파일 안에 있는 문자열을 한줄씩 갖고와서 문자열 크기만큼 지정후 갖고온다.

        eliminate(str_name, '\n');//공백을 없애기 위해 선언
        eliminate(str_number, '\n');
        eliminate(str_id, '\n');
        eliminate(str_pw, '\n');
        eliminate(str_rene, '\n');

        strcpy(a[user_number].name, str_name);//사용자 이름의 문자열 전체를 위치에 복사
        strcpy(a[user_number].number, str_number);//사용자 비밀번호의 문자열 전체를 위치에 복사
        strcpy(a[user_number].id, str_id);//사용자 아이디의 문자열 전체를 위치에 복사
        strcpy(a[user_number].pw, str_pw);//사용자 비밀번호의 문자열 전체를 위치에 복사 
        strcpy(a[user_number].reve, str_rene);//NULL값을 위치에 복사 

        if (feof(fs2)) break;//파일 끝까지 도달했는지 여부 도달하면 break후 무한반복 나옴
        user_number++;

    }
    fclose(fs2);//파일 닫음
    return user_number;
}

int input_user(int count,struct login* a) //사용자 회원가입 함수(사용자 인원수,사용자 구조체)
{
    int success = 0;//성공 여부 변수
    char str_name[10];//사용자 이름 받아올 변수
    char str_number[20];//사용자 전화번호 받아올 변수
    char str_id[30];//사용자 아이디 받아올 변수 
    char str_pw[20];//사용자 비밀번호 받아올 변수 
    printf("이름:");
    scanf(" %s", &str_name);
    printf("전화번호:");
    scanf("%s", &str_number);
    printf("ID:");
    scanf(" %s", &str_id);
    printf("PW:");
    scanf(" %s", &str_pw);

    for (int i = 0; i < count; i++) {
        if (strcmp(a[i].id, str_id) == 0) {//strcmp를 사용하여 구조체 안에 있는 아이디와 입력한 아이디를 비교 같다면
            success = 1;//실패 
            printf("이미 등록되어있습니다.\n");
            return 0; //중복
        }
    }
    if (success == 0) {//성공
        strcpy(a[count].name, str_name);//사용자 이름의 문자열 전체를 위치에 복사 
        strcpy(a[count].number, str_number);//사용자 전화번호의 문자열 전체를 위치에 복사
        strcpy(a[count].id, str_id);//사용자 아이디의 문자열 전체를 위치에 복사
        strcpy(a[count].pw, str_pw);//사용자 비밀번호의 문자열 전체를 위치에 복사 
        strcpy(a[count].reve, "NULL");//NULL값을 위치에 복사 
        printf("************\n");
        printf("등록완료\n");
        printf("************\n");
        return 1; //성공
    }
}
int search_user(int login_index,int count, struct login* a) //사용자 검색 함수(로그인한 사용자의 고유 인덱스, 사용자 인원수. 구조체 login a)
{
    int success = 0;//성공 여부 변수 
    char check[3];//대답 여부를 받기 위한 변수 
    char str_sh[20];//사용자 이름을 받아올 변수 

    printf("검색하시겠습니까?");
    scanf("%s", &check);
    if (strcmp(check, "y") == 0)//strcmp로 입력한 값과 y를 비교
    {
        printf("검색할 이름을 입력해주세요.\n");
        printf("이름 :");
        scanf("%s", str_sh);
        for (int i = 0; i < count; i++)
        {
            if (strcmp(str_sh, a[i].name) == 0)//strcmp로 입력한 이름과 구조체 안에 있는 이름을 비교
            {
                success = 1;//성공
                printf("이름 :%s\n", a[i].name);//구조체 안에 있는 이름 출력
                printf("전화번호 :%s\n", a[i].number);//구조체 안에 있는 전화번호 출력
                printf("ID :%s\n", a[i].id);//구조체 안에 있는 아이디 출력
                printf("PW :%s\n", a[i].pw);//구조체 안에 있는 비밀번호 출력
                printf("검색 완료했습니다.\n");
                return;
            }
        }
        if (success = 0);//실패 
        {
            printf("가입된 정보가 없습니다.\n");
            return;
        }
    }
    else if(strcmp(check, "n") == 0)//임시
    {
        printf("메뉴로 돌아가겠습니다.\n");
        return;
    }

    
}
void user_list(int count,struct login* a) //사용자 목록(사람 인원수, 구조체 login a)
{
    for (int i = 0; i < count; i++) {
        printf("이름 : %s\n",a[i].name);
        printf("전화번호 : %s\n",a[i].number);
        printf("ID : %s\n",a[i].id);
        printf("PW : %s\n",a[i].pw);
        printf("REVE : %s\n", a[i].reve);
    }//회원가입 한 정보들이 출력
}

int login(int count,struct login* a) {//로그인 함수(사용자 인원수,사용자 구조체)
    char str_id[30];//사용자 아이디 받아올 변수 
    char str_pw[20];//사용자 비밀번호 받아올 변수
    int success = 0;//성공 여부 변수
    while (1) //무한반복
    {
        printf("ID를 입력해주세요 :");
        scanf("%s", &str_id);//사용자 아이디 입력
        for (int i = 0; i < count; i++)
        {
            if (strcmp(str_id, a[i].id) == 0) //strcmp로 입력한 아이디와 구조체 안에 있는 아이디를 비교
            {
                printf("PW를 입력해주세요 :");
                scanf("%s", &str_pw);
                if (strcmp(str_pw, a[i].pw) == 0)//strcmp로 입력한 비밀번호와 구조체 안에 있는 비밀번호를 비교
                {
                    printf("%s님 환영합니다.\n", a[i].id);
                    success = 1;//성공
                    return i;
                }
            }
        }
    }
}

void show_videos(int count) //비디오 출력함수(비디오 갯수)
{
    for (int i = 0; i < count; i++) 
    {
        printf("**************************************\n");
        printf("비디오 제목 : %s\n", b[i].title);//구조체 안에 있는 비디오 제목 출력 
        printf("비디오 제작사 : %s\n", b[i].company);//구조체 안에 있는 비디오 제작사 출력
        printf("비디오 장르 : %s\n", b[i].genre);//구조체 안에 있는 비디오 장르 출력
        printf("**************************************\n");
    }
}

void rent_video(int login_index, int count, struct login* a, struct vedio* b) //비디오 대여함수(로그인한 사용자의 고유 인덱스,비디오갯수,사용자 구조체,비디오구조체)
{
    char check[3];//대답 여부를 받기 위한 변수
    char str_video[30];// 비디오 제목을 받아올 변수
    int c = 0; // 비디오 검색시 찾았는지 여부를 확인하기 위한 변수

    if (strcmp(a[login_index].reve, "NULL") != 0)//사용자의 고유 인덱스 안에 대여할 비디오 정보들이 있다면 이미 대여중이라고 출력(예외조건)
    {
        printf("이미 대여중입니다. 메뉴로 돌아갑니다.\n");
        return;     
    }
    else 
    {
        printf("비디오를 대여하시겠습니까?(y,n) :");
        scanf("%s", &check);
        if (strcmp(check, "y") == 0)
        {
            printf("대여할 비디오의 제목을 입력해주세요. :");
            scanf("%s", &str_video);
            for (int i = 0; i < count; i++) {
                if (strcmp(str_video, b[i].title) == 0)//strcmp로 입력한 비디오 제목과 구조체 안에 있는 비디오 제목을 비교 
                {
                    printf("비디오 제목 : %s\n", b[i].title);//같다면  구조체 안에 있는 비디오 제목 출력
                    printf("비디오 제작사 : %s\n", b[i].company);//구조체 안에 있는 비디오 제작사 출력
                    printf("비디오 장르 : %s\n", b[i].genre);//구조체 안에 있는 비디오 장르 출력
                    strcpy(a[login_index].reve, b[i].title);//비디오 제목 문자열 전체를 복사하여 위치에 복사
                    printf("대여 완료\n");
                    c = 1;//성공
                    return;
                }
            }
        }
    }
    if (strcmp(check, "n") == 0) 
    {
        printf("메뉴로 돌아가겠습니다.\n");//비디오 제목을 입력하면 비디오를 찾을 수 없다고 출력
        return;
    }
    //else if(strcmp(check, "n")==0)
    //{//n입력시 메뉴로 돌아감
    //    printf("메뉴로 돌아가겠습니다.\n");
    //    return;
    //}
}

void rent_if(int login_index, int count, struct login* a, struct vedio* b) //대여 정보 출력함수(로그인 한 사용자의 고유 인덱스,비디오 갯수,사용자 구조체,비디오 구조체)
{
    int c = 0; //대여 여부 확인 변수
    printf("대여정보를 확인해드리겠습니다.\n");
    for (int i = 0; i < count; i++) {
        if (strcmp(a[login_index].reve, b[i].title) == 0) {//strcmp로 로그인한 아이디의 빌린 비디오 제목과 구조체 안에 있는 비디오 제목을 비교
            c = 1;//같아서 성공하면
            printf("비디오 제목 : %s\n", b[i].title);//구조체 안에 있는 비디오 제목을 출력
            printf("비디오 제작사 : %s\n", b[i].company);//구조체 안에 있는 비디오 제작사를 출력
            printf("비디오 장르 : %s\n", b[i].genre);//구조체 안에 있는 비디오 장르를 출력
        }
    }
    if (c == 0) {//대여를 안 했는데 대여정보 확인 기능을 실행한다면 대여중인 비디오가 없다고 출력
        printf("대여중인 비디오가 없습니다\n");
    }
}

void video_return(int login_index, int count, struct login* a, struct vedio* b) //비디오 반납 함수(로그인한 사용자의 고유 인덱스,비디오갯수,사용자 구조체,비디오 구조체)
{
    char check[3]; // 반납 여부를 확인할 변수
    char str_video[30];
    if (strcmp(a[login_index].reve, "NULL") == 0)//strcmp로 로그인한 아이디의 빌린 비디오 제목이 없다면 대여중인 비디오가 없다고 출력
    {
        printf("대여중인 비디오가 없습니다.\n");
        return;
    }
    else
    {
        printf("반납하시겠습니까?(y/n)\n");
        scanf("%s", &check);
        if (strcmp(check, "y") == 0)
        {
            printf("반납할 비디오 제목을 입력해주세요. :");
            scanf("%s", &str_video);
            for (int i = 0; i < count; i++) 
            {
                if (strcmp(a[login_index].reve, b[i].title) == 0) //strcmp로 로그인한 아이디의 비디오 제목과 구조체 안에 있는 비디오 제목을 비교
                {
                    printf("비디오 제목 : %s\n", b[i].title);//구조체 안에 있는 비디오 제목을 출력
                    printf("비디오 제작사: %s\n", b[i].company);//구조체 안에 있는 비디오 제작사를 출력
                    printf("비디오 장르: %s\n", b[i].genre);//구조체 안에 있는 비디오 장르를 출력
                    strcpy(a[login_index].reve, "NULL");//NULL 값을 로그인 한 아이디에 복사 
                    printf("반납완료\n");
                    return;
                }
            }
        }
    }
        if (strcmp(check, "n") == 0)
        {
        printf("메뉴로 돌아가겠습니다.\n");
        return;
        }
}

int input_video(int count, struct vedio* b) //비디오 추가함수(비디오 갯수,비디오 구조체)
{
    int success = 0; //비교해서 사용할 변수
    char str_title[30];//비디오 제목을 받아올 변수
    char str_company[30];//비디오 제작사 받아올 변수
    char str_genre[30];//비디오 장르 받아올 변수 
    char check[3];//대답 여부 변수 
    printf("비디오를 입고하시겠습니까?");
    scanf("%s", &check);
    if (strcmp(check, "y") == 0) {
        printf("비디오 제목 :");
        scanf("%s", &str_title);
        printf("비디오 제작사 :");
        scanf("%s", &str_company);
        printf("비디오 장르 :");
        scanf("%s", &str_genre);
        for (int i = 0; i < count; i++) {
            if (strcmp(str_title, b[i].title) == 0) {//strcmp로 입력한 비디오 제목과 구조체 안에 있는 비디오 제목을 비교
                printf("이미 등록되어있는 비디오 입니다.\n");//비교하여 서로 제목이 같다면 이미 등록되어 있는 비디오라고 출력 (예외조건)
                success = 1;//실패
                return 0;
            }
        }
        if (success == 0) {
            strcpy(b[count].title, str_title);//비디오 제목 문자열 전체를 위치에 복사
            strcpy(b[count].company, str_company);//비디오 제작사 문자열 전체를 위치에 복사
            strcpy(b[count].genre, str_genre);//비디오 장르 문자열 전체를 위치에 복사 
            return 1;
        }
    }
    else if (strcmp(check, "n") == 0)
    {
        printf("메뉴로 돌아가겠습니다.\n");
        return;
    }
    /*else return 0;*/
}
