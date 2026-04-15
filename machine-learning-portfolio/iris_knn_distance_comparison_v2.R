# iris 데이터로 k-NN 분류
# 거리 방식별 결과 비교
# 유클리드 / 맨해튼 / 마할라노비스

library(caret)
library(class)
library(kknn)

data(iris)

set.seed(123)  # 분할 결과 고정

# 7:3으로 train / test 나누기
samp <- createDataPartition(iris$Species, p = 0.7, list = FALSE)

# 마지막 열 Species는 정답값이라 따로 분리
iris_train <- iris[samp, -5]
iris_train_label <- iris[samp, 5]

iris_test <- iris[-samp, -5]
iris_test_label <- iris[-samp, 5]

# 분할된 데이터 개수 확인
cat("훈련 데이터 개수:", nrow(iris_train), "\n")
cat("테스트 데이터 개수:", nrow(iris_test), "\n")


# -----------------------------
# 1. 유클리드 거리
# class 패키지 knn 기본 방식
# -----------------------------
euclidean_pred <- knn(
  train = iris_train,
  test = iris_test,
  cl = iris_train_label,
  k = 5   # 가까운 5개 기준으로 예측
)

# 결과 확인
euclidean_result <- confusionMatrix(euclidean_pred, iris_test_label)
print(euclidean_result)


# -----------------------------
# 2. 맨해튼 거리
# distance = 1
# -----------------------------

# kknn은 학습 데이터에 정답 열이 같이 있어야 해서 다시 붙임
iris_train_kknn <- data.frame(iris_train, Species = iris_train_label)

manhattan_model <- kknn(
  Species ~ .,
  train = iris_train_kknn,
  test = iris_test,
  k = 5,
  distance = 1,
  kernel = "rectangular"   # 단순 다수결
)

# 예측값만 뽑기
manhattan_pred <- fitted(manhattan_model)

# 결과 확인
manhattan_result <- confusionMatrix(manhattan_pred, iris_test_label)
print(manhattan_result)


# -----------------------------
# 3. 마할라노비스 거리
# 공분산까지 반영
# -----------------------------

# train 데이터 기준 공분산 역행렬
inv_sigma <- solve(cov(iris_train))

# 두 점 사이 마할라노비스 거리 계산 함수
MahD <- function(point1, point2, cov_matrix) {
  diff <- as.numeric(point1 - point2)
  distance <- sqrt(t(diff) %*% cov_matrix %*% diff)
  return(distance)
}

# 테스트 데이터 예측값 저장용
mahalanobis_pred <- character(nrow(iris_test))

# test 한 개씩 보면서 train 전체와 거리 계산
for (i in 1:nrow(iris_test)) {
  test_point <- iris_test[i, ]

  distances <- apply(
    iris_train,
    1,
    MahD,
    point2 = test_point,
    cov_matrix = inv_sigma
  )

  # 가까운 순서대로 5개 선택
  nearest_idx <- order(distances)[1:5]
  nearest_labels <- iris_train_label[nearest_idx]

  # 가장 많이 나온 품종으로 예측
  mahalanobis_pred[i] <- names(sort(table(nearest_labels), decreasing = TRUE))[1]
}

# 실제 정답 형식이랑 맞추기
mahalanobis_pred <- factor(mahalanobis_pred, levels = levels(iris$Species))

# 결과 확인
mahalanobis_result <- confusionMatrix(mahalanobis_pred, iris_test_label)
print(mahalanobis_result)


# -----------------------------
# 정확도 비교
# -----------------------------
cat("\n유클리드 거리 정확도     :", euclidean_result$overall["Accuracy"], "\n")
cat("맨해튼 거리 정확도       :", manhattan_result$overall["Accuracy"], "\n")
cat("마할라노비스 거리 정확도 :", mahalanobis_result$overall["Accuracy"], "\n")
