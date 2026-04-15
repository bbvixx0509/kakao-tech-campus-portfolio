# Play 데이터 예제로 정보이득 계산
# 어떤 변수가 분류에 더 중요한지 확인

library(FSelector)

# 예제 데이터 직접 입력
Outlook <- c("Sunny", "Sunny", "Overcast", "Rainy", "Rainy", "Rainy", "Overcast",
             "Sunny", "Sunny", "Rainy", "Sunny", "Overcast", "Overcast", "Rainy")

Temperature <- c("hot", "hot", "hot", "mild", "cool", "cool", "cool",
                 "mild", "cool", "mild", "mild", "mild", "hot", "mild")

Humidity <- c("high", "high", "high", "high", "normal", "normal", "normal",
              "high", "normal", "normal", "normal", "high", "normal", "high")

Wind <- c("FALSE", "TRUE", "FALSE", "FALSE", "FALSE", "TRUE", "TRUE",
          "FALSE", "FALSE", "FALSE", "TRUE", "TRUE", "FALSE", "TRUE")

Play <- c("No", "No", "Yes", "Yes", "Yes", "No", "Yes",
          "No", "Yes", "Yes", "Yes", "Yes", "Yes", "No")

# 데이터프레임 생성
df <- data.frame(Outlook, Temperature, Humidity, Wind, Play)

# 범주형 데이터라 factor로 변환
df[] <- lapply(df, as.factor)

# 데이터 구성 확인
print("---- 데이터 요약 확인 ----")
print(summary(df))

# 정보이득 계산
# unit = "log2" 로 엔트로피 계산 기준 지정
all_ig <- FSelector::information.gain(Play ~ ., data = df, unit = "log2")

# 결과 출력
print(all_ig)
