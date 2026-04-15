# 문제 2
# 특성 확장 후 선형 커널 SVM 적용

library(e1071)
library(caret)

load("P2.RData")

# 학습 데이터
trainData <- data.frame(
  x1 = c(-3, 3, -3, 3, 0, -1, 1, -1, 1),
  x2 = c(-3, 3, 3, -3, 0, 1, 1, -1, -1),
  y = factor(c("red", "red", "red", "red", "red",
               "blue", "blue", "blue", "blue"))
)

# 비선형 분리를 위해 특성 확장
add_kernel <- function(df) {
  df$f1 <- df$x1
  df$f2 <- df$x2
  df$f3 <- df$x1^2
  df$f4 <- df$x2^2
  df$f5 <- df$x1 * df$x2
  df$f6 <- df$x1^2 + df$x2^2
  df
}

train_mapped <- add_kernel(trainData)
test_mapped <- add_kernel(P2_test)

# 선형 커널 SVM
svm_model <- svm(
  y ~ f1 + f2 + f3 + f4 + f5 + f6,
  data = train_mapped,
  kernel = "linear",
  cost = 1,
  scale = FALSE
)

# 예측 및 혼동행렬
y_hat <- predict(svm_model, newdata = test_mapped)
y_test <- test_mapped$y

conf_mat <- confusionMatrix(y_hat, y_test)
print(conf_mat)
print(conf_mat$table)
