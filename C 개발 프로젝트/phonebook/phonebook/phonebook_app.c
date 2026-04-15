#define _CRT_SECURE_NO_WARNINGS
#include <stdio.h>
#include <stdlib.h>
#include <string.h> //strcmp함수가 선언된 헤더 파일

// 메뉴 기반으로 동작하는 전화번호부 프로그램 본문
struct data { //구조체 
    char c[20];
    char n[20];
    char sex[10];
};

int num1; //switch문에 선언
int people = 0; //add 함수에 선언
//int ot;
char c1; // addit 함수에 선언
char d; // delete 함수에 선언
char pa; //phonenumberadd 함수에 선언
char as; // ascend 함수에 선언
char ps[10]; // search 함수에 선언

struct data a[100]; // 구조체 배열 



void add()
{


    printf("몇명을 저장하겠습니까 : ");
    scanf("%d", &people);
    for (int i = 0; i < people; i++)
    {
        printf("이름:");
        scanf("%s", a[i].c);

        printf("전화번호:");
        scanf("%s", &a[i].n);

        printf("성별:");
        scanf("%s", &a[i].sex);

    }
    printf("저장되었습니다.\n");
}

void addit()
{

    int number;

    printf("수정하시겠습니까?");
    scanf("%s", &c1);



    if (c1 == 'Y')
    {
        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }

        printf("몇번째 사람을 수정하시겠습니까?\n");
        scanf("%d번", &number);
        printf("이름:%s\n 전화번호:%s\n 성별:%s\n", a[number - 1].c, a[number - 1].n, a[number - 1].sex);
        scanf("%s %s %s", a[number - 1].c, &a[number - 1].n, &a[number - 1].sex);


        printf("수정된 전화번호부를 다시 출력하겠습니다\n");
        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }
    }

    else if (c1 == 'N')
    {
        return;
    }



}

void delete()
{
    int pd;

    printf("삭제하겠습니까?");
    scanf("%s", &d);

    if (d == 'Y')
    {
        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }

        printf("몇번째 사람을 삭제하겠습니까?\n");
        scanf("%d", &pd);
        for (int i = pd - 1; i < 99; i++)
        {
            strcpy(a[i].c, a[i + 1].c);
            strcpy(a[i].n, a[i + 1].n);
            strcpy(a[i].sex, a[i + 1].sex);
        }
        strcpy(a[people - 1].c, "");//수정
        strcpy(a[people - 1].n, "");
        strcpy(a[people - 1].sex, "");

        printf("%d번째 사람을 삭제했습니다\n", pd);
        people--;
        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }

    }
    else if (d == 'N')
    {
        return;
    }

}

void phonenumberadd()
{
    int phoneadd = 0;

    printf("추가하시겠습니까? ");
    scanf("%s", &pa);

    if (pa == 'Y')
    {
        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }
        for (int i = people; i < 100; i++)
        {
            scanf("%s %s %s", a[i].c, a[i].n, a[i].sex);
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
            people++;
            printf("더 추가하시겠습니까?");
            scanf("%s", &pa);
            if (pa == 'Y')
            {

                continue;
            }

            else if (pa == 'N')
            {
                for (int i = 0; i < people; i++)
                {
                    printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
                    printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
                    printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);

                }


            }
            break;

        }

    }


}

void ascend()
{
    //int phoneascend = 0;

    printf("이름을 오름차순으로 출력하시겠습니까?");
    scanf("%s", &as);

    if (as == 'Y')
    {
        for (int i = 0; i < people; i++)
        {
            for (int j = 0; j < people - i -1; j++)
            {
                if ((strcmp(a[j].c, a[j + 1].c) > 0))
                {
                    char temp1[20] = "";
                    strcpy(temp1, a[j].c);
                    strcpy(a[j].c, a[j + 1].c);
                    strcpy(a[j + 1].c, temp1);

                    char temp2[20] = "";
                    strcpy(temp2, a[j].n);
                    strcpy(a[j].n, a[j + 1].n);
                    strcpy(a[j + 1].n, temp2);

                    char temp3[10] = "";
                    strcpy(temp3, a[j].sex);
                    strcpy(a[j].sex, a[j + 1].sex);
                    strcpy(a[j + 1].sex, temp3);
                }

            }
        }

        for (int i = 0; i < people; i++)
        {
            printf("%d 번째 사람 이름 : %s\n", i + 1, a[i].c);
            printf("%d 번째 사람 전화번호 : %s\n", i + 1, a[i].n);
            printf("%d 번째 사람 성별 : %s\n", i + 1, a[i].sex);
        }

    }
    else if (as == 'N')
    {
        return;
    }

}

void search()
{
    int s = 0;

    for (;;)
    {
        printf("검색 :");
        scanf("%s", ps);
        for (int i = 0; i < people; i++)
        {
            if (strcmp(a[i].c, ps) == 0)
            {
                printf("이름 : %s\n", a[i].c);
                printf("전화번호 : %s\n", a[i].n);
                printf("성별 : %s\n", a[i].sex);
                s = 1;
                break;
            }

        }
        if (s == 0)
        {
            printf("잘못 입력하였습니다. 다시 입력해주세요\n");
            continue;
        }
        else if (s == 1)
        {
            break;
        }
    }

}







void output()
{

    printf("전화번호부를 출력하겠습니다.\n");

    for (int i = 0; i < people; i++) {
        printf("%s\n", a[i].c);
        printf("%s\n", a[i].n);
        printf("%s\n", a[i].sex);
    }
    printf("출력되었습니다.\n");
    printf("종료하겠습니다.\n");
}


int main()
{
    while (1)
    {
        printf("1.입력\n2.수정\n3.삭제\n4.추가\n5.이름 오름차순\n6.검색\n7.출력\n");
        scanf("%d", &num1);
        switch (num1)
        {
        case 1:
            printf("입력\n");
            add();
            continue;

        case 2:
            printf("수정\n");
            addit();
            continue;

        case 3:
            printf("삭제\n");
            delete();
            continue;
        case 4:
            printf("추가\n");
            phonenumberadd();
            continue;
        case 5:
            printf("이름 오름차순\n");
            ascend();
            continue;
        case 6:
            printf("검색\n");
            search();
            continue;
        case 7:
            printf("출력\n");
            output();
            break;
        default:

            return 0;
        }


    }

    return 0;
}
