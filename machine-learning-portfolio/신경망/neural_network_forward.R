# 간단한 신경망 순전파 계산
# 가중치, 편향, 활성함수 적용 후 예측값과 loss 확인

# 1. 입력값 설정
x <- matrix(c(1.2, 5.9, 2.3, 0.2), ncol = 1)
y <- 13

# 2. 가중치(w)와 편향(b) 설정

# Layer 1 (입력 -> 은닉1)
# 초록색 화살표: 0.6 / 파란색 화살표: 1.2
W1 <- matrix(0.6, nrow = 4, ncol = 4)
b1 <- matrix(1.2, nrow = 4, ncol = 1)

# Layer 2 (은닉1 -> 은닉2)
W2 <- matrix(0.6, nrow = 4, ncol = 4)
b2 <- matrix(1.2, nrow = 4, ncol = 1)

# Layer 3 (은닉2 -> 출력)
# 분홍색 화살표: 2.7 / 파란색 화살표: 1.2
W3 <- matrix(2.7, nrow = 1, ncol = 4)
b3 <- matrix(1.2, nrow = 1, ncol = 1)

# 3. 활성함수
f1 <- function(z) { 1 / (1 + exp(-z)) }   # sigmoid
f2 <- function(z) { tanh(z) }             # tanh
f3 <- function(z) { pmax(0.1 * z, z) }    # leaky ReLU

# 4. 순전파 계산

# Layer 1
z1 <- b1 + W1 %*% x
a1 <- f1(z1)

# Layer 2
z2 <- b2 + W2 %*% a1
a2 <- f2(z2)

# Layer 3
z3 <- b3 + W3 %*% a2
y_hat <- f3(z3)

# 5. loss 계산
loss <- 0.5 * (y - y_hat)^2

# 6. 결과 출력
cat("예측값(y_hat):", y_hat, "\n")
cat("Loss값:", loss, "\n")
