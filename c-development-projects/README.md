# C 개발 프로젝트

C와 C++로 작성한 콘솔 프로그램 모음입니다.  
파일 저장, 메뉴 구성, 구조체 활용처럼 기본 구현 역량을 확인할 수 있는 결과물을 담았습니다.

## 포함 프로젝트

- `Flash`: 플래시 메모리 초기화, 쓰기, 읽기, 삭제 흐름을 실습한 프로젝트
- `phonebook`: 전화번호 저장, 수정, 삭제, 검색, 정렬 기능이 있는 전화번호부 프로그램
- `vedioborrow`: 회원가입, 로그인, 비디오 대여와 반납 기능을 포함한 콘솔 프로그램

## 보면 좋은 부분

- 데이터를 파일에 저장하고 다시 불러오는 방식
- 메뉴 선택에 따라 프로그램 흐름을 나눈 방식
- 구조체와 함수 분리로 기능을 정리한 방식

## 대표 파일

- `Flash/flash_console.cpp`
- `Flash/flash_memory.cpp`
- `phonebook/phonebook/phonebook_app.c`
- `vedioborrow/vedioborrow/video_rental_app.c`
- `vedioborrow/vedioborrow/video_rental_data.c`

## 실행 예시

### phonebook
```text
1.입력
2.수정
3.삭제
4.추가
5.이름 오름차순
6.검색
7.출력
```

전화번호부 프로젝트는 메뉴 기반으로 기능이 분리되어 있어서, 콘솔 환경에서도 흐름을 따라가며 기능을 확인할 수 있습니다.

## 사용 환경

- `C`, `C++`
- `Visual Studio`
