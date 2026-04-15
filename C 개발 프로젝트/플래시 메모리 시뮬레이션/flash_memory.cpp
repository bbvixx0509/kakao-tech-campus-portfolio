#include "flash_memory.h"

// 초기화, 쓰기, 읽기, 삭제 기능을 나누어 플래시 메모리 동작을 실습한 파일
struct Flash* init(struct Flash* a) {
	int Fs = 0;// MB를 입력하기 위해 변수 선언

	FILE* fs;
	fs = fopen("flashmemory.txt", "w");

	printf("\n저장할 용량 MB를 입력해주세요 :");
	scanf("%d", &Fs);//몇MB으로 입력할지 위해 scanf 사용
	a->allsector = Fs * 1024 * 1024 / 512;//MB*1024*1024/512 = 총 섹터수
	printf("%dMB의 섹터 수 입니다. :%d\n", Fs, a->allsector);
	a->sparearea = (char*)malloc(sizeof(char) * a->allsector);//sparearea 동적할당 
	a->sector = (char*)malloc(sizeof(char) * a->allsector);// sector 동적할당
	a->lsn = (int*)malloc(sizeof(int) * a->allsector);// lsn 동적할당
	a->psn = (int*)malloc(sizeof(int) * a->allsector);// psn 동적할당

	for (int i = 0; i < a->allsector; i++)
	{
		fputs("0", fs);
		a->sparearea[i] = '0';//여분 공간을 0으로 선언
		a->sector[i] = '0';// sector를 0으로 지정
		a->lsn[i] = i;//lsn을 변수 i로 지정
		a->psn[i] = a->allsector - (i + 1);// psn은 lsn의 역순이기 때문에 총섹터수 - (i + 1)를 지정 
		if (feof(fs))break;//파일이 끝까지 도달했을 경우 break
	}
	fclose(fs);//파일 닫기 
	return a;//구조체 반환 
}

struct Flash* Flash_write(struct Flash* a) {

	int flash_psn = 0;// 파일 몇줄에 쓸지 지정하기 위해 변수 선언 
	char flash_i; // 지정한 줄의 정보를 넣기 위해 선언

	FILE* fs;// 파일 변수 fs
	fs = fopen("flashmemory.txt", "r+");// 파일을 오픈한 후 flashmemory.txt라는 텍스트 파일에 총 섹터수가 써져 있기 때문에 정보를 입력하여 저장 돼 있는 정보의 특정 부분에 쓰기 위해 r+ 선언 
	printf("psn등 정보를 입력해주세요. :");
	scanf("%d %c", &flash_psn, &flash_i);// 어느 줄에 입력하고 그 줄에 정보를 넣기 위해 scanf 안에 (flash_lsn, flash_i)를 넣어줌 
	a->sector[flash_psn] = flash_i;//주소를 입력받고 그 주소에 입력 받은 내용을 sector에 저장
	fseek(fs,flash_psn, SEEK_SET);// 어느 줄에 입력하기 위해 선언한 flash_psn의 줄을 찾아서 파일 안에 넣기 위해 fseek를 선언 fseek를 간단하게 말하자면 열린 파일에 파일 포인터의 위치를 설정함.,파일 포인터 위치를 psn 주소로 옮김
	fprintf(fs, "%c", flash_i);//정보를 입력한 값을 지정한 부분에 넣기 위해 fprintf를 선언

	fclose(fs);//파일 닫기 
	return a;//구조체 반환
}

 struct Flash* Flash_read(struct Flash* a) {
	int read_psn;//저장한 정보의 줄을 입력 받기 위해 선언

	FILE* fs;
	fs = fopen("flashmemory.txt", "r");
	printf("\n읽기 기능을 시작하겠습니다.\n");
	printf("psn을 입력해주세요. :");
	scanf("%d", &read_psn);
	fseek(fs, read_psn, SEEK_SET);//주소를 입력받고 그 주소에 입력 받은 내용을 읽어오기 위해 fseek를 선언,파일 포인터 위치를 psn 주소로 옮김
	printf("%c\n", a->sector[read_psn]);//지정한 줄의 정보를 출력 
	fclose(fs);//파일 닫기 
	return a;//구조체 반환 
}

 struct Flash* Flash_erase(struct Flash* a) {
	 int delet_pbn;//해당하는 블럭을 삭제하기 위해 선언
	 int sector = 32;//하나의 블럭의 32개 섹터
	
	 fs = fopen("flashmemory.txt", "w");//파일에 쓰기 위해 w선언

	 printf("\n삭제를 시작하겠습니다.\n");
	 printf("삭제하실 pbn을 입력해주세요. :");
	 scanf("%d", &delet_pbn);
	 printf("해당한 블럭의 섹터들을 삭제하겠습니다.\n");
	 //int block_number = a->psn[a->lsn[delet]] / sector;
	 
	 for (int i = 0; i < sector; i++) {//블럭 하나 안에 있는 32개의 섹터들을 지워야할려면 32개의 섹터들을 0으로 반복시켜서 출력이 되야하기 때문에 선언
		 a->sector[sector*delet_pbn + i] = '0';//해당하는 블럭의 섹터배열들을 0으로 변경
	 }
	 for (int i = 0; i <a->allsector; i++) {
		 fprintf(fs, "%c", a->sector[i]);//해당하는 블럭 섹터들을 0으로 변경하여 파일에 저장
	 }
	 fclose(fs);//파일 닫기
	 return(a);//구조체 반환
}

 int main() {
	 a = (struct Flash*)malloc(sizeof(struct Flash));//동적할당한 Flash 구조체를 별명 a로 지정
	 char fl_number;
	 int flash_number = 0;

	 fs = fopen("flashmemory.txt", "r");

	 if (fs != NULL)// 파일이 있을 경우
	 {
		 while (1) { // 무한반복
			 fl_number = fgetc(fs);//파일 안의 정보들을 하나씩 읽어옴
			 if (feof(fs)) break;//파일이 끝까지 도달했을 경우 break
			 flash_number++;//1씩 증가
		 }
		 a->allsector = flash_number;
		 fclose(fs);//파일 닫음

		 a->sparearea = (char*)malloc(sizeof(char) * a->allsector);
		 a->sector = (char*)malloc(sizeof(char) * a->allsector);
		 a->lsn = (int*)malloc(sizeof(int) * a->allsector);
		 a->psn = (int*)malloc(sizeof(int) * a->allsector);

		 fs = fopen("flashmemory.txt", "r");//다시 파일을 오픈
		 for (int i = 0; i < a->allsector; i++)//총 섹터수를 반복시켜서 출력하기 위해 반복문 선언
		 {
			 a->sparearea[i] = '0';//여분 공간을 0으로 선언
			 a->sector[i] = fgetc(fs);//파일 안에 있는 정보들을 하나씩 읽어옴
			 a->lsn[i] = i;//lsn을 변수 i로 지정
			 a->psn[i] = a->allsector - (i + 1);//psn 역순 
			 if (feof(fs))break;//파일이 끝까지 도달했을 경우 break
		 }
		 fclose(fs);//파일 닫기 
	 }

	 /*while (1) {
		 printf("1.복원\n2.쓰기\n3.읽기\n4.지우기\n5.종료\n");
		 scanf("%d", &num);
		 switch (num) {
		 case 1:
			 printf("복원");
			 init(a);
			 continue;

		 case 2:
			 printf("쓰기");
			 Flash_write(a);
			 continue;

		 case 3:
			 printf("읽기");
			 Flash_read(a);
			 continue;

		 case 4:
			 printf("지우기");
			 Flash_erase(a);
			 continue;
		 case 5:
			 printf("종료");
			 return 0;
		 default:
			 return 0;
		 }
	 }

	 return 0;*/
	 char str[100];
	 char* temp = strtok(str, " ");
	 char* temp2 = strtok(NULL, " ");
	 char* temp3 = strtok(NULL, " ");
	 while (1) {
		 while (temp != NULL) {
			 printf("기능:");
			 rewind(stdin);
			 gets_s(str);
			 if (strcmp(temp, "init") == 0) {
				 temp = strtok(str, " ");
				 a = init(a);
				 continue;
			 }
			 else if (strcmp(temp, "W") == 0) {
				 temp = strtok(str, " ");
				 temp2 = strtok(NULL, " ");
				 temp3 = strtok(NULL, " ");
				 a = Flash_write(a);
				 continue;
			 }
			 else if (strcmp(temp, "R") == 0) {
				 temp = strtok(str, " ");
				 temp2 = strtok(NULL, " ");
				 a = Flash_read(a);
				 continue;
			 }
			 else if (strcmp(temp, "E") == 0) {
				 temp = strtok(str, " ");
				 a = Flash_erase(a);
				 break;
			 }
			 else if (strcmp(temp, "exit") == 0) {
				 return 0;
			 }
		 }
	 }
	 return 0;
 }

