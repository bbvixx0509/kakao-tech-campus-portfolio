# 문제 1
# 다중 로지스틱 회귀 / 마할라노비스 거리 KNN 비교

library(caret)
library(nnet)
library(dplyr)

load("P1.RData")

# -----------------------------
# 1-1 다중 로지스틱 회귀
# -----------------------------
model_logit <- multinom(y ~ x1 + x2 + x3, data = P1_train)

pred_logit <- predict(model_logit, newdata = P1_test, type = "class")
test_y <- P1_test$y

acc_logit <- sum(pred_logit == test_y) / length(test_y)
cat("[로지스틱 회귀] 분류 정확도:",
    sprintf("%.2f%%", acc_logit * 100), "\n")

# -----------------------------
# 1-2 마할라노비스 거리 KNN
# -----------------------------
X_train <- as.matrix(P1_train[, 1:3])
X_test <- as.matrix(P1_test[, 1:3])
label_train <- P1_train$y

S <- cov(X_train)

mahal_dist <- function(a, b, S) {
  sqrt((a - b) %*% solve(S) %*% t(a - b))
}

k_val <- 17

pred_knn <- sapply(1:nrow(X_test), function(i) {
  query_pt <- X_test[i, ]

  all_dist <- apply(X_train, 1, function(row) {
    mahal_dist(query_pt, row, S)
  })

  top_k_labels <- label_train[order(all_dist)[1:k_val]]
  names(sort(table(top_k_labels), decreasing = TRUE))[1]
})

acc_knn <- sum(pred_knn == test_y) / length(test_y)
cat("[마할라노비스 KNN] 분류 정확도:",
    sprintf("%.2f%%", acc_knn * 100), "\n")
