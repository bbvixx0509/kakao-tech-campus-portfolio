#include "flash_memory.h"

int main() {
	a = (struct Flash*)malloc(sizeof(struct Flash) * 100);
	int num;
	while (1) {
		printf("1.����\n2.�б�\n3.����\n4.�����\n");
		scanf("%d", &num);
		switch (num) {
		case 1:
			printf("����");
			init(a);
			break;

			/*case 2:
				printf("�б�");
				Flash_read();
				continue;

			case 3:
				printf("����");
				Flash_write();
				continue;

			case 4:
				printf("�����");
				Flash_erase();
				break;*/
		default:
			return 0;
		}
	}

	return 0;
}