# 문제 7
# 2층 신경망에서 오차역전파로 가중치 갱신

# 초기 가중치 / 편향
W1 <- matrix(c(7, 0.7,
               0.78, -2.5), nrow = 2, byrow = TRUE)

W2 <- matrix(c(-2, 7), nrow = 1)

bias_1 <- matrix(c(5, 2), nrow = 2)
bias_2 <- matrix(6)

# 입력값 / 목표값 / 학습률
input_x <- matrix(c(3, 11.2), nrow = 2)
y_target <- 0.27
learning_rate <- 0.18

# 활성함수
activation_1 <- function(z) tanh(z)           # 은닉층
activation_2 <- function(z) 1 / (1 + exp(-z)) # 출력층

# 315번 학습
for (i in 1:315) {
  # 순전파
  z1 <- (W1 %*% input_x) + bias_1
  a1 <- activation_1(z1)

  z2 <- (W2 %*% a1) + bias_2
  y_hat <- activation_2(z2)

  # 출력층 오차
  delta_2 <- (y_hat - y_target) * y_hat * (1 - y_hat)

  # 은닉층 오차
  delta_1 <- (t(W2) * delta_2) * (1 - a1^2)

  # 가중치 / 편향 갱신
  W2 <- W2 - learning_rate * (delta_2 %*% t(a1))
  bias_2 <- bias_2 - learning_rate * delta_2

  W1 <- W1 - learning_rate * (delta_1 %*% t(input_x))
  bias_1 <- bias_1 - learning_rate * delta_1
}

cat("315회 학습 후 출력값(y_hat):", y_hat, "\n")
