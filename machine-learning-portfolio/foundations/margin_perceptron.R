# 문제 5
# 마진 퍼셉트론 업데이트 과정 확인

# 입력 데이터
input_data <- matrix(c(
  1.2,  2.5,   # A
  2.0,  1.0,   # B
 -1.5, -2.0,   # C
 -2.2, -1.0,   # D
  0.5,  1.0    # E
), ncol = 2, byrow = TRUE)

# 클래스 레이블
# red = -1, blue = 1
output_data <- c(1, 1, -1, 1, 1)

# 초기 가중치 / 마진
w <- c(0, 0)
gamma <- 1

# 마진 퍼셉트론 업데이트
update_perceptron <- function(w, x, y, gamma) {
  score <- sum(w * x)

  # y * (w^T x)가 gamma보다 작으면 업데이트
  if (y * score < gamma) {
    norm_sq <- sum(x^2)
    tau <- (gamma - y * score) / norm_sq
    w_new <- w + (tau * y * x)
    return(w_new)
  }

  return(w)
}

# 5-1 관측치 A로 w1
w1 <- update_perceptron(w, input_data[1, ], output_data[1], gamma)
cat("(1) 관측치 A 업데이트 후 w(1):", w1, "\n")

# 5-2 관측치 B로 w2
w2 <- update_perceptron(w1, input_data[2, ], output_data[2], gamma)
cat("(2) 관측치 B 업데이트 후 w(2):", w2, "\n")

# 5-3 1 epoch 끝난 뒤 w5
w_curr <- w2
for (i in 3:5) {
  w_curr <- update_perceptron(w_curr, input_data[i, ], output_data[i], gamma)
}

w5 <- w_curr
cat("(3) 1 Epoch (A~E) 종료 후 w(5):", w5, "\n")

# 5-4 전체 데이터 200 epoch
w_final <- c(0, 0)

for (epoch in 1:200) {
  for (i in 1:5) {
    w_final <- update_perceptron(w_final, input_data[i, ], output_data[i], gamma)
  }
}

cat("(4) 200 Epoch 종료 후 w(1000):", w_final, "\n")
