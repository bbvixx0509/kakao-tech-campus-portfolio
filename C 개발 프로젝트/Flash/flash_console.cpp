#include "flash_memory.h"

// 명령어 형태로 init, write, read, erase 기능을 호출하는 진입점
int main() {
	a = (struct Flash*)malloc(sizeof(struct Flash));
	char fl_number;
	int flash_number = 0;

	fs = fopen("flashmemory.txt", "r");

	if (fs != NULL)
	{
		while (1) {
			fl_number = fgetc(fs);
			if (feof(fs)) break;
			flash_number++;
		}
		a->allsector = flash_number;
		fclose(fs);

		a->sparearea = (char*)malloc(sizeof(char) * a->allsector);
		a->sector = (char*)malloc(sizeof(char) * a->allsector);
		a->lsn = (int*)malloc(sizeof(int) * a->allsector);
		a->psn = (int*)malloc(sizeof(int) * a->allsector);

		fs = fopen("flashmemory.txt", "r");
		for (int i = 0; i < a->allsector; i++)
		{
			a->sparearea[i] = '0';
			a->sector[i] = fgetc(fs);
			a->lsn[i] = i;
			a->psn[i] = a->allsector - (i + 1);
			if (feof(fs))break;
		}
		fclose(fs);
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
	while (1) {
		printf("기능:");
		gets_s(str);
		char* temp = strtok(str, " ");
		char* temp2 = strtok(str, " ");
		char* temp3 = strtok(str, " ");
		while (temp != NULL) {
			if (strcmp(temp, "init") == 0) {
				temp = strtok(NULL, " ");
				a = init(a);
				continue;
			}
			else if (strcmp(temp, "W") == 0) {
				temp = strtok(NULL, " ");
				temp2 = strtok(NULL, " ");
				temp3 = strtok(NULL, " ");
				a = Flash_write(a);
				continue;
			}
			else if (strcmp(temp, "R") == 0) {
				temp = strtok(NULL, " ");
				temp2 = strtok(NULL, " ");
				a = Flash_read(a);
				continue;
			}
			else if (strcmp(temp, "E") == 0) {
				temp = strtok(NULL, " ");
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

