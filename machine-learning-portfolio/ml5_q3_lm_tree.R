# 문제 3
# 선형회귀 / 의사결정나무 회귀 비교

library(rpart)
library(rpart.plot)

load("P3.RData")

# -----------------------------
# 3-1 절편 없는 선형회귀
# -----------------------------
lm_model <- lm(y ~ . - 1, data = P3_train)

y_hat_lm <- predict(lm_model, newdata = P3_test)
mse_lm <- mean((P3_test$y - y_hat_lm)^2)

cat("1. 선형회귀분석 모델 MSE:", mse_lm, "\n")

# -----------------------------
# 3-2 회귀 의사결정나무
# -----------------------------
ctrl <- rpart.control(cp = 0.013)

dt_model <- rpart(
  y ~ .,
  data = P3_train,
  method = "anova",
  control = ctrl
)

rpart.plot(dt_model)

y_hat_dt <- predict(dt_model, newdata = P3_test)
mse_dt <- mean((P3_test$y - y_hat_dt)^2)

cat("2. 의사결정나무 모델 MSE:", mse_dt, "\n")
