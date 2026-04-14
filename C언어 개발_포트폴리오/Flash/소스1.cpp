#include "header.h"

int main() {
	a = (struct Flash*)malloc(sizeof(struct Flash) * 100);
	int num;
	while (1) {
		printf("1.복원\n2.읽기\n3.쓰기\n4.지우기\n");
		scanf("%d", &num);
		switch (num) {
		case 1:
			printf("복원");
			init(a);
			break;

			/*case 2:
				printf("읽기");
				Flash_read();
				continue;

			case 3:
				printf("쓰기");
				Flash_write();
				continue;

			case 4:
				printf("지우기");
				Flash_erase();
				break;*/
		default:
			return 0;
		}
	}

	return 0;
}