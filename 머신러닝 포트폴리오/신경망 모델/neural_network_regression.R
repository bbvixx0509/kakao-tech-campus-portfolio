# 문제 6
# 선형회귀 / 직접 구현한 신경망 비교

rm(list = ls())

load("P6.RData")

# -----------------------------
# 6-1 선형회귀
# -----------------------------
train_df <- na.omit(P6_train)

reg_model <- lm(medv ~ ., data = train_df)
cat("선형회귀 모델 결정계수 (R^2):",
    summary(reg_model)$r.squared, "\n")

# -----------------------------
# 6-2 직접 구현한 신경망
# -----------------------------

# Min-Max 정규화
normalize_data <- function(data) {
  max_v <- apply(data, 2, max)
  min_v <- apply(data, 2, min)

  normalized <- scale(data, center = min_v, scale = max_v - min_v)

  list(
    data = as.data.frame(normalized),
    max = max_v,
    min = min_v
  )
}

# 순전파 함수
forward_pass <- function(input, weights, biases, act_func) {
  n_layers <- length(weights)
  activations <- list()
  z_values <- list()

  current_input <- input

  for (k in 1:n_layers) {
    z <- current_input %*% weights[[k]] +
      matrix(rep(biases[[k]], each = nrow(current_input)),
             nrow = nrow(current_input))

    a <- act_func(z)

    z_values[[k]] <- z
    activations[[k]] <- a
    current_input <- a
  }

  list(
    out = activations[[n_layers]],
    acts = activations,
    zs = z_values
  )
}

# 결측치 제거 후 정규화
norm_result <- normalize_data(train_df)
scaled_df <- norm_result$data

features <- as.matrix(scaled_df[, names(scaled_df) != "medv"])
target <- as.matrix(scaled_df$medv)

# 활성함수
linear_act <- function(x) 1.7 * x
linear_act_grad <- function(x) 1.7 + 0 * x

# 네트워크 구조
layer_sizes <- c(ncol(features), 5, 5, 1)
eta <- 0.34
total_iter <- 20000
N <- nrow(features)

# 가중치 초기화
set.seed(1234)
wts <- list()
bs <- list()

for (k in 1:(length(layer_sizes) - 1)) {
  wts[[k]] <- matrix(
    rnorm(layer_sizes[k] * layer_sizes[k + 1], 0, 0.001),
    nrow = layer_sizes[k],
    ncol = layer_sizes[k + 1]
  )

  bs[[k]] <- matrix(0, 1, layer_sizes[k + 1])
}

# 그래디언트 클리핑
bound_grad <- function(x) pmax(pmin(x, 5), -5)

# 학습 루프
for (iter in 1:total_iter) {
  fwd <- forward_pass(features, wts, bs, linear_act)

  output <- fwd$out
  hidden_acts <- fwd$acts
  hidden_zs <- fwd$zs

  delta <- (output - target) / N
  grad_w <- list()
  grad_b <- list()

  # 출력층
  prev_act <- hidden_acts[[2]]
  grad_w[[3]] <- bound_grad(t(prev_act) %*% delta)
  grad_b[[3]] <- bound_grad(colSums(delta))

  # 은닉층 2
  delta <- (delta %*% t(wts[[3]])) * linear_act_grad(hidden_zs[[2]])
  prev_act <- hidden_acts[[1]]
  grad_w[[2]] <- bound_grad(t(prev_act) %*% delta)
  grad_b[[2]] <- bound_grad(colSums(delta))

  # 은닉층 1
  delta <- (delta %*% t(wts[[2]])) * linear_act_grad(hidden_zs[[1]])
  grad_w[[1]] <- bound_grad(t(features) %*% delta)
  grad_b[[1]] <- bound_grad(colSums(delta))

  for (k in 1:3) {
    wts[[k]] <- wts[[k]] - eta * grad_w[[k]]
    bs[[k]] <- bs[[k]] - eta * grad_b[[k]]
  }
}

# 최종 예측
final_pred <- forward_pass(features, wts, bs, linear_act)$out

# 원래 스케일로 복원
actual_vals <- train_df$medv
pred_original <- final_pred *
  (norm_result$max["medv"] - norm_result$min["medv"]) +
  norm_result$min["medv"]

sse <- sum((actual_vals - pred_original)^2)
sst <- sum((actual_vals - mean(actual_vals))^2)
r2_neural <- 1 - (sse / sst)

cat("인공신경망 모델 결정계수 (R^2):", r2_neural, "\n")
