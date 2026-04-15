# 퍼셉트론 학습 코드
# 입력값 9개를 이용해서 1 또는 -1 분류

x1 <- x2 <- x3 <- x4 <- x5 <- x6 <- x7 <- x8 <- x9 <- 0:1

X_grid <- expand.grid(x1, x2, x3, x4, x5, x6, x7, x8, x9)

X <- cbind(1, X_grid)
X <- as.matrix(X)  # 연산 편하게 matrix로 변환

# x1~x9 합이 5 이상이면 1, 아니면 -1
row_sums <- rowSums(X_grid)
y <- ifelse(row_sums >= 5, 1, -1)

w <- rep(0, 10)   # 초기 가중치 (w0 ~ w9)
lr <- 0.1         # 학습률
epoch <- 0

repeat {
  epoch <- epoch + 1
  error_count <- 0

  # 전체 데이터 한 번씩 학습
  for (i in 1:nrow(X)) {
    y_hat <- ifelse(sum(X[i, ] * w) >= 0, 1, -1)  # 현재 예측값

    if (y[i] != y_hat) {
      w <- w + lr * (y[i] - y_hat) * X[i, ]  # 오차 나면 가중치 조정
      error_count <- error_count + 1
    }
  }

  cat("Epoch:", epoch, "오차 개수:", error_count, "\n")

  # 현재 가중치로 전체 데이터 다시 확인
  y_hat_final <- ifelse(X %*% w >= 0, 1, -1)

  # 전부 맞추면 종료
  if (all(y == y_hat_final)) {
    cat("학습 완료 (Total Epochs:", epoch, ")\n")
    cat("최종 가중치(w):\n")
    print(w)
    break
  }
}
